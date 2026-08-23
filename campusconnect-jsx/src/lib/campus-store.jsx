import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { io } from "socket.io-client";
import { toast } from "sonner";

import { currentStudent } from "./campus-data";

const StoreContext = createContext(null);

const KEY = "campusconnect.state.v1";

const API_URL =
  "http://localhost:5000/api/notifications";

const SOCKET_URL =
  "http://localhost:5000";

/* =====================================================
   INITIALS
===================================================== */

function initials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "ST";
  }

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

/* =====================================================
   PROVIDER
===================================================== */

export function CampusProvider({ children }) {
  const [user, setUser] = useState(null);

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [notifications, setNotifications] =
    useState([]);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [theme, setTheme] =
    useState("light");

  const [registered, setRegistered] =
    useState(["e-2"]);

  const [joinedClubs, setJoinedClubs] =
    useState(["c-1", "c-5"]);

  const [bookings, setBookings] =
    useState([]);

  const [bookmarks, setBookmarks] =
    useState(["nt-3"]);

  const [
    acceptedRequests,
    setAcceptedRequests,
  ] = useState([]);

  const [
    declinedRequests,
    setDeclinedRequests,
  ] = useState([]);

  const [joinedTeams, setJoinedTeams] =
    useState(["tm-3"]);

  const [appliedJobs, setAppliedJobs] =
    useState([]);

  const [savedJobs, setSavedJobs] =
    useState(["pl-2"]);

  const [hydrated, setHydrated] =
    useState(false);

  /* =====================================================
     LOAD SAVED STATE
  ===================================================== */

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(KEY);

      if (raw) {
        const saved = JSON.parse(raw);

        if (saved.user) {
          setUser(saved.user);
        }

        if (saved.theme) {
          setTheme(saved.theme);
        }

        if (Array.isArray(saved.registered)) {
          setRegistered(saved.registered);
        }

        if (Array.isArray(saved.joinedClubs)) {
          setJoinedClubs(saved.joinedClubs);
        }

        if (Array.isArray(saved.bookings)) {
          setBookings(saved.bookings);
        }

        if (Array.isArray(saved.bookmarks)) {
          setBookmarks(saved.bookmarks);
        }

        if (
          Array.isArray(
            saved.acceptedRequests
          )
        ) {
          setAcceptedRequests(
            saved.acceptedRequests
          );
        }

        if (
          Array.isArray(
            saved.declinedRequests
          )
        ) {
          setDeclinedRequests(
            saved.declinedRequests
          );
        }

        if (Array.isArray(saved.joinedTeams)) {
          setJoinedTeams(saved.joinedTeams);
        }

        if (Array.isArray(saved.appliedJobs)) {
          setAppliedJobs(saved.appliedJobs);
        }

        if (Array.isArray(saved.savedJobs)) {
          setSavedJobs(saved.savedJobs);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load CampusConnect state:",
        error
      );
    }

    setHydrated(true);
  }, []);

  /* =====================================================
     SAVE STATE
  ===================================================== */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(
      KEY,
      JSON.stringify({
        user,
        theme,
        registered,
        joinedClubs,
        bookings,
        bookmarks,
        acceptedRequests,
        declinedRequests,
        joinedTeams,
        appliedJobs,
        savedJobs,
      })
    );
  }, [
    user,
    theme,
    registered,
    joinedClubs,
    bookings,
    bookmarks,
    acceptedRequests,
    declinedRequests,
    joinedTeams,
    appliedJobs,
    savedJobs,
    hydrated,
  ]);

  /* =====================================================
     THEME
  ===================================================== */

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
  }, [theme]);

  /* =====================================================
     SIGN IN
  ===================================================== */

  const signIn = useCallback(
    (
      userOrEmail,
      role = "student",
      profile = {}
    ) => {
      if (
        typeof userOrEmail === "object" &&
        userOrEmail !== null
      ) {
        const incoming = userOrEmail;

        const name = String(
          incoming.name ||
            incoming.fullName ||
            currentStudent.name ||
            "Student"
        ).trim();

        const email = String(
          incoming.email || ""
        )
          .trim()
          .toLowerCase();

        const userRole =
          incoming.role || "student";

        const isAdmin =
          userRole === "admin" ||
          email.startsWith("admin");

        if (isAdmin) {
          const backendId =
            incoming._id ||
            incoming.id ||
            "u-admin";

          setUser({
            ...currentStudent,
            ...incoming,

            id: backendId,

            _id: backendId,

            name:
              name || "Administrator",

            email,

            role: "admin",

            major:
              incoming.major ||
              "Student Affairs",

            year:
              incoming.year ||
              "Faculty",

            initials:
              incoming.initials ||
              initials(name),

            avatar:
              incoming.avatar ||
              incoming.picture ||
              "",

            bio:
              incoming.bio ||
              "Platform administrator for campus engagement.",
          });

          return;
        }

        /* =================================================
           STUDENT LOGIN
        ================================================= */

        const backendId =
          incoming._id ||
          incoming.id ||
          `u-${Date.now()}`;

        setUser({
          ...currentStudent,
          ...incoming,

          /*
             Keep both fields pointing to the
             SAME backend user ID.

             This is important because:
             MongoDB -> _id
             Socket.IO -> user-${id}
          */

          id: backendId,

          _id: backendId,

          name,

          email,

          role: "student",

          initials:
            incoming.initials ||
            initials(name),

          avatar:
            incoming.avatar ||
            incoming.picture ||
            "",

          bio:
            incoming.bio ||
            currentStudent.bio,

          major:
            incoming.major ||
            currentStudent.major,

          year:
            incoming.year ||
            currentStudent.year,
        });

        return;
      }

      /* =====================================================
         OLD LOGIN STYLE
      ===================================================== */

      const normalizedEmail =
        String(userOrEmail || "")
          .trim()
          .toLowerCase();

      const admin =
        role === "admin" ||
        normalizedEmail.startsWith("admin");

      const displayName =
        String(profile.name || "").trim();

      if (admin) {
        const name =
          displayName ||
          "Dr. Elena Voss";

        setUser({
          ...currentStudent,

          id: "u-0",

          _id: "u-0",

          name,

          email: normalizedEmail,

          role: "admin",

          major: "Student Affairs",

          year: "Faculty",

          initials: initials(name),

          avatar:
            profile.picture ||
            profile.avatar ||
            "",

          bio:
            "Platform administrator for campus engagement.",
        });

        return;
      }

      const name =
        displayName ||
        currentStudent.name;

      const id = `u-${Date.now()}`;

      setUser({
        ...currentStudent,

        id,

        _id: id,

        name,

        email: normalizedEmail,

        role: "student",

        initials: initials(name),

        avatar:
          profile.picture ||
          profile.avatar ||
          "",
      });
    },
    []
  );

  /* =====================================================
     SIGN UP
  ===================================================== */

  const signUp = useCallback(
    (nameOrUser, email) => {
      if (
        typeof nameOrUser === "object" &&
        nameOrUser !== null
      ) {
        const incoming = nameOrUser;

        const name = String(
          incoming.name || "Student"
        ).trim();

        const id =
          incoming._id ||
          incoming.id ||
          `u-${Date.now()}`;

        setUser({
          ...currentStudent,
          ...incoming,

          id,

          _id: id,

          name,

          email: String(
            incoming.email || ""
          )
            .trim()
            .toLowerCase(),

          role: "student",

          initials:
            incoming.initials ||
            initials(name),

          avatar:
            incoming.avatar ||
            incoming.picture ||
            "",

          bio:
            incoming.bio ||
            "New to CampusConnect.",
        });

        return;
      }

      const name = String(
        nameOrUser || "Student"
      ).trim();

      const id = `u-${Date.now()}`;

      setUser({
        ...currentStudent,

        id,

        _id: id,

        name,

        email: String(email || "")
          .trim()
          .toLowerCase(),

        role: "student",

        initials: initials(name),

        avatar: "",

        bio: "New to CampusConnect.",
      });
    },
    []
  );

  /* =====================================================
     NOTIFICATION FETCH
  ===================================================== */

  const fetchNotifications =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          "campusconnect_token"
        );

      if (!token) {
        setNotifications([]);
        return;
      }

      try {
        setNotificationLoading(true);

        const response =
          await fetch(API_URL, {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          });

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Notification fetch failed:",
            data.message
          );

          return;
        }

        setNotifications(
          Array.isArray(
            data.notifications
          )
            ? data.notifications
            : []
        );
      } catch (error) {
        console.error(
          "Notification fetch error:",
          error
        );
      } finally {
        setNotificationLoading(false);
      }
    }, []);

  /* =====================================================
     REAL-TIME SOCKET
  ===================================================== */

  useEffect(() => {
    /*
      Always use the backend MongoDB user ID.

      The backend emits to:

        user-${student._id}

      Therefore the frontend MUST join the
      exact same room.
    */

    const userId =
      user?._id ||
      user?.id;

    if (!userId) {
      console.log(
        "Notification socket skipped: no user ID"
      );

      return;
    }

    const normalizedUserId =
      String(userId);

    console.log(
      "========================================"
    );

    console.log(
      "Starting notification socket"
    );

    console.log(
      "User ID:",
      normalizedUserId
    );

    console.log(
      "Socket URL:",
      SOCKET_URL
    );

    console.log(
      "Notification room:",
      `user-${normalizedUserId}`
    );

    console.log(
      "========================================"
    );

    /*
      IMPORTANT:
      Do NOT force websocket only.

      Socket.IO can now use its normal
      connection negotiation and fallback.
    */

    const socket = io(
      SOCKET_URL,
      {
        transports: [
          "polling",
          "websocket",
        ],

        withCredentials: true,

        reconnection: true,

        reconnectionAttempts: 10,

        reconnectionDelay: 1000,
      }
    );

    /* =================================================
       CONNECT
    ================================================= */

    socket.on("connect", () => {
      console.log(
        "========================================"
      );

      console.log(
        "Notification socket connected"
      );

      console.log(
        "Socket ID:",
        socket.id
      );

      console.log(
        "Joining room:",
        `user-${normalizedUserId}`
      );

      console.log(
        "========================================"
      );

      /*
        Join exactly the same room used
        by the backend event controller.
      */

      socket.emit(
        "join-user",
        normalizedUserId
      );
    });

    /* =================================================
       ROOM JOIN CONFIRMATION
    ================================================= */

    socket.on(
      "notification-room-joined",
      (data) => {
        console.log(
          "Notification room joined:",
          data
        );
      }
    );

    /* =================================================
       NEW NOTIFICATION
    ================================================= */

    socket.on(
      "new-notification",
      (notification) => {
        console.log(
          "========================================"
        );

        console.log(
          "NEW NOTIFICATION RECEIVED"
        );

        console.log(
          notification
        );

        console.log(
          "========================================"
        );

        if (!notification) {
          return;
        }

        const notificationId =
          notification._id ||
          notification.id ||
          `notification-${Date.now()}`;

        setNotifications(
          (previous) => {
            /*
              Prevent duplicate notifications.
            */

            const alreadyExists =
              previous.some(
                (item) =>
                  String(
                    item._id ||
                      item.id
                  ) ===
                  String(
                    notificationId
                  )
              );

            if (alreadyExists) {
              return previous;
            }

            const newNotification = {
              ...notification,

              _id:
                notificationId,

              read: false,
            };

            return [
              newNotification,
              ...previous,
            ];
          }
        );

        /*
          Show toast immediately.
        */

        toast(
          notification.title ||
            "New notification",
          {
            description:
              notification.message ||
              "",
          }
        );
      }
    );

    /* =================================================
       DISCONNECT
    ================================================= */

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          "Notification socket disconnected:",
          reason
        );
      }
    );

    /* =================================================
       CONNECT ERROR
    ================================================= */

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "========================================"
        );

        console.error(
          "NOTIFICATION SOCKET CONNECTION ERROR"
        );

        console.error(
          error
        );

        console.error(
          "========================================"
        );
      }
    );

    /* =================================================
       RECONNECT
    ================================================= */

    socket.io.on(
      "reconnect",
      (attempt) => {
        console.log(
          "Notification socket reconnected after attempt:",
          attempt
        );

        /*
          Rejoin the user room after reconnect.
        */

        socket.emit(
          "join-user",
          normalizedUserId
        );
      }
    );

    /* =================================================
       CLEANUP
    ================================================= */

    return () => {
      console.log(
        "Closing notification socket:",
        socket.id
      );

      socket.off(
        "connect"
      );

      socket.off(
        "new-notification"
      );

      socket.off(
        "disconnect"
      );

      socket.off(
        "connect_error"
      );

      socket.off(
        "notification-room-joined"
      );

      socket.disconnect();
    };
  }, [
    user?._id,
    user?.id,
  ]);

  /* =====================================================
     LOAD NOTIFICATIONS AFTER LOGIN
  ===================================================== */

  useEffect(() => {
    const userId =
      user?._id ||
      user?.id;

    if (userId) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [
    user?._id,
    user?.id,
    fetchNotifications,
  ]);

  /* =====================================================
     UNREAD COUNT
  ===================================================== */

  const unreadNotificationCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  /* =====================================================
     MARK ONE AS READ
  ===================================================== */

  const markNotificationAsRead =
    useCallback(async (id) => {
      const token =
        localStorage.getItem(
          "campusconnect_token"
        );

      if (!token || !id) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/${id}/read`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Mark notification failed:",
            data.message
          );

          return;
        }

        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                String(
                  notification._id ||
                    notification.id
                ) ===
                String(id)
                  ? {
                      ...notification,
                      read: true,
                    }
                  : notification
            )
        );
      } catch (error) {
        console.error(
          "Mark notification error:",
          error
        );
      }
    }, []);

  /* =====================================================
     MARK ALL AS READ
  ===================================================== */

  const markAllNotificationsAsRead =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          "campusconnect_token"
        );

      if (!token) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/read-all`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Mark all notifications failed:",
            data.message
          );

          toast.error(
            data.message ||
              "Failed to mark notifications."
          );

          return;
        }

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            )
        );

        toast.success(
          "All notifications marked as read"
        );
      } catch (error) {
        console.error(
          "Mark all notifications error:",
          error
        );

        toast.error(
          "Cannot connect to backend."
        );
      }
    }, []);

  /* =====================================================
     SIGN OUT
  ===================================================== */

  const signOut =
    useCallback(() => {
      setUser(null);
      setNotifications([]);
    }, []);

  /* =====================================================
     STORE VALUE
  ===================================================== */

  const value = useMemo(
    () => ({
      /* USER */

      user,

      signIn,

      signUp,

      signOut,

      hydrated,

      /* NOTIFICATIONS */

      notifications,

      notificationLoading,

      unreadNotificationCount,

      fetchNotifications,

      markNotificationAsRead,

      markAllNotificationsAsRead,

      /* THEME */

      theme,

      toggleTheme: () =>
        setTheme((current) =>
          current === "dark"
            ? "light"
            : "dark"
        ),

      /* EVENTS */

      registered,

      toggleEvent: (id) =>
        setRegistered(
          (current) =>
            current.includes(id)
              ? current.filter(
                  (item) =>
                    item !== id
                )
              : [
                  ...current,
                  id,
                ]
        ),

      /* CLUBS */

      joinedClubs,

      toggleClub: (id) =>
        setJoinedClubs(
          (current) =>
            current.includes(id)
              ? current.filter(
                  (item) =>
                    item !== id
                )
              : [
                  ...current,
                  id,
                ]
        ),

      /* BOOKINGS */

      bookings,

      addBooking: (booking) =>
        setBookings(
          (current) => [
            ...current,
            booking,
          ]
        ),

      cancelBooking: (id) =>
        setBookings(
          (current) =>
            current.filter(
              (booking) =>
                booking.id !== id
            )
        ),

      /* BOOKMARKS */

      bookmarks,

      toggleBookmark: (id) =>
        setBookmarks(
          (current) =>
            current.includes(id)
              ? current.filter(
                  (item) =>
                    item !== id
                )
              : [
                  ...current,
                  id,
                ]
        ),

      /* PEER LEARNING */

      acceptedRequests,

      setAcceptedRequests,

      declinedRequests,

      setDeclinedRequests,

      /* TEAMS */

      joinedTeams,

      toggleTeam: (id) =>
        setJoinedTeams(
          (current) =>
            current.includes(id)
              ? current.filter(
                  (item) =>
                    item !== id
                )
              : [
                  ...current,
                  id,
                ]
        ),

      /* JOBS */

      appliedJobs,

      toggleAppliedJob: (id) =>
        setAppliedJobs(
          (current) =>
            current.includes(id)
              ? current.filter(
                  (item) =>
                    item !== id
                )
              : [
                  ...current,
                  id,
                ]
        ),

      savedJobs,

      toggleSavedJob: (id) =>
        setSavedJobs(
          (current) =>
            current.includes(id)
              ? current.filter(
                  (item) =>
                    item !== id
                )
              : [
                  ...current,
                  id,
                ]
        ),
    }),
    [
      user,
      signIn,
      signUp,
      signOut,
      hydrated,

      notifications,
      notificationLoading,
      unreadNotificationCount,
      fetchNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,

      theme,

      registered,
      joinedClubs,
      bookings,
      bookmarks,

      acceptedRequests,
      declinedRequests,

      joinedTeams,

      appliedJobs,
      savedJobs,
    ]
  );

  return (
    <StoreContext.Provider
      value={value}
    >
      {children}
    </StoreContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export function useCampus() {
  const context =
    useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useCampus must be used inside CampusProvider"
    );
  }

  return context;
}
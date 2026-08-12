import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { currentStudent } from "./campus-data";

const StoreContext = createContext(null);

const KEY = "campusconnect.state.v1";

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

export function CampusProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

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
        const saved =
          JSON.parse(raw);

        if (saved.user) {
          setUser(saved.user);
        }

        if (saved.theme) {
          setTheme(saved.theme);
        }

        if (
          Array.isArray(
            saved.registered
          )
        ) {
          setRegistered(
            saved.registered
          );
        }

        if (
          Array.isArray(
            saved.joinedClubs
          )
        ) {
          setJoinedClubs(
            saved.joinedClubs
          );
        }

        if (
          Array.isArray(
            saved.bookings
          )
        ) {
          setBookings(
            saved.bookings
          );
        }

        if (
          Array.isArray(
            saved.bookmarks
          )
        ) {
          setBookmarks(
            saved.bookmarks
          );
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

        if (
          Array.isArray(
            saved.joinedTeams
          )
        ) {
          setJoinedTeams(
            saved.joinedTeams
          );
        }

        if (
          Array.isArray(
            saved.appliedJobs
          )
        ) {
          setAppliedJobs(
            saved.appliedJobs
          );
        }

        if (
          Array.isArray(
            saved.savedJobs
          )
        ) {
          setSavedJobs(
            saved.savedJobs
          );
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

     Supports:

     signIn({
       name: "Samruddhi",
       email: "...",
       avatar: "",
       role: "student"
     })

     AND old style:

     signIn(email, role, profile)
  ===================================================== */

  const signIn = useCallback(
    (
      userOrEmail,
      role = "student",
      profile = {}
    ) => {
      /* ================================================
         NEW LOGIN STYLE
         signIn(userObject)
      ================================================ */

      if (
        typeof userOrEmail ===
          "object" &&
        userOrEmail !== null
      ) {
        const incoming =
          userOrEmail;

        const name =
          String(
            incoming.name ||
              incoming.fullName ||
              currentStudent.name ||
              "Student"
          ).trim();

        const email =
          String(
            incoming.email || ""
          )
            .trim()
            .toLowerCase();

        const userRole =
          incoming.role ||
          "student";

        const isAdmin =
          userRole === "admin" ||
          email.startsWith(
            "admin"
          );

        if (isAdmin) {
          setUser({
            ...currentStudent,
            ...incoming,

            id:
              incoming.id ||
              "u-admin",

            name:
              name ||
              "Administrator",

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

        /*
          Student login
        */
        setUser({
          ...currentStudent,
          ...incoming,

          id:
            incoming.id ||
            `u-${Date.now()}`,

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

          /*
            Preserve logged-in user's
            custom profile values.
          */
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

      /* ================================================
         OLD LOGIN STYLE
         signIn(email, role, profile)
      ================================================ */

      const normalizedEmail =
        String(
          userOrEmail || ""
        )
          .trim()
          .toLowerCase();

      const admin =
        role === "admin" ||
        normalizedEmail.startsWith(
          "admin"
        );

      const displayName =
        String(
          profile.name || ""
        ).trim();

      if (admin) {
        const name =
          displayName ||
          "Dr. Elena Voss";

        setUser({
          ...currentStudent,

          id: "u-0",

          name,

          email:
            normalizedEmail,

          role: "admin",

          major:
            "Student Affairs",

          year: "Faculty",

          initials:
            initials(name),

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

      setUser({
        ...currentStudent,

        name,

        email:
          normalizedEmail,

        role: "student",

        initials:
          initials(name),

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
    (
      nameOrUser,
      email
    ) => {
      /*
        Allows:

        signUp("Samruddhi", "email")

        OR

        signUp({
          name: "Samruddhi",
          email: "..."
        })
      */

      if (
        typeof nameOrUser ===
          "object" &&
        nameOrUser !== null
      ) {
        const incoming =
          nameOrUser;

        const name =
          String(
            incoming.name ||
              "Student"
          ).trim();

        setUser({
          ...currentStudent,
          ...incoming,

          id:
            incoming.id ||
            `u-${Date.now()}`,

          name,

          email:
            String(
              incoming.email ||
                ""
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

      const name =
        String(
          nameOrUser ||
            "Student"
        ).trim();

      setUser({
        ...currentStudent,

        id: `u-${Date.now()}`,

        name,

        email:
          String(email || "")
            .trim()
            .toLowerCase(),

        role: "student",

        initials:
          initials(name),

        avatar: "",

        bio:
          "New to CampusConnect.",
      });
    },
    []
  );

  /* =====================================================
     SIGN OUT
  ===================================================== */

  const signOut =
    useCallback(() => {
      setUser(null);

      /*
        State saving effect will update
        localStorage automatically.
      */
    }, []);

  /* =====================================================
     STORE VALUE
  ===================================================== */

  const value = useMemo(
    () => ({
      user,

      signIn,

      signUp,

      signOut,

      hydrated,

      theme,

      toggleTheme: () =>
        setTheme((current) =>
          current === "dark"
            ? "light"
            : "dark"
        ),

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

      bookings,

      addBooking: (
        booking
      ) => {
        const id =
          `bk-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`;

        setBookings(
          (previous) => [
            {
              ...booking,
              id,
            },

            ...previous,
          ]
        );

        return id;
      },

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

      acceptedRequests,

      declinedRequests,

      acceptRequest: (
        id
      ) => {
        setDeclinedRequests(
          (current) =>
            current.filter(
              (item) =>
                item !== id
            )
        );

        setAcceptedRequests(
          (current) =>
            current.includes(id)
              ? current
              : [
                  ...current,
                  id,
                ]
        );
      },

      declineRequest: (
        id
      ) => {
        setAcceptedRequests(
          (current) =>
            current.filter(
              (item) =>
                item !== id
            )
        );

        setDeclinedRequests(
          (current) =>
            current.includes(id)
              ? current
              : [
                  ...current,
                  id,
                ]
        );
      },

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

      appliedJobs,

      applyJob: (id) =>
        setAppliedJobs(
          (current) =>
            current.includes(id)
              ? current
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
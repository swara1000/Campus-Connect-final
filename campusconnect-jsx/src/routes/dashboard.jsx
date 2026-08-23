import {
  Navigate,
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  GraduationCap,
  Briefcase,
  MessagesSquare,
  ArrowUpRight,
  CalendarDays,
  Video,
  MapPin,
  Bell,
  Users,
  Star,
  RefreshCw,
} from "lucide-react";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { useCampus } from "@/lib/campus-store";

/* =====================================================
   ROUTE
===================================================== */

export const Route = createFileRoute(
  "/dashboard"
)({
  head: () => ({
    meta: [
      {
        title:
          "Student Dashboard — CampusConnect",
      },
      {
        name: "description",
        content:
          "Live CampusConnect student dashboard.",
      },
    ],
  }),

  component: Dashboard,
});

/* =====================================================
   API
===================================================== */

const API_URL =
  "http://localhost:5000/api";

/* =====================================================
   HELPERS
===================================================== */

async function fetchJson(
  url,
  options = {}
) {
  try {
    const response =
      await fetch(url, options);

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      `API error: ${url}`,
      error
    );

    return null;
  }
}

/* =====================================================
   TIME FORMATTER
===================================================== */

function formatTime(date) {
  if (!date) {
    return "";
  }

  const value =
    new Date(date);

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const diff =
    now.getTime() -
    value.getTime();

  const minutes =
    Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return value.toLocaleDateString();
}

/* =====================================================
   EVENT DATE
===================================================== */

function formatEventDate(date) {
  if (!date) {
    return "Date not available";
  }

  const parsed =
    new Date(date);

  if (
    !Number.isNaN(
      parsed.getTime()
    )
  ) {
    return parsed.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  return date;
}

/* =====================================================
   MODE ICON
===================================================== */

function ModeIcon({ mode }) {
  if (
    String(mode)
      .toLowerCase()
      .includes("online")
  ) {
    return (
      <Video className="size-3" />
    );
  }

  return (
    <MapPin className="size-3" />
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  const {
    user,
    hydrated,

    notifications,
    notificationLoading,
    unreadNotificationCount,
    markNotificationAsRead,

    appliedJobs,
  } = useCampus();

  /* ===================================================
     LIVE DATA
  =================================================== */

  const [events, setEvents] =
    useState([]);

  const [clubs, setClubs] =
    useState([]);

  const [materials, setMaterials] =
    useState([]);

  const [peerRequests, setPeerRequests] =
    useState([]);

  const [unreadMessages, setUnreadMessages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  /* ===================================================
     LOAD LIVE DATA
  =================================================== */

  const loadDashboardData =
    useCallback(
      async () => {
        const token =
          localStorage.getItem(
            "campusconnect_token"
          );

        const authHeaders =
          token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {};

        const [
          eventData,
          clubData,
          materialData,
          peerData,
          messageData,
        ] = await Promise.all([
          fetchJson(
            `${API_URL}/events`
          ),

          fetchJson(
            `${API_URL}/clubs`
          ),

          fetchJson(
            `${API_URL}/study-materials`
          ),

          token
            ? fetchJson(
                `${API_URL}/peer-learning`,
                {
                  headers:
                    authHeaders,
                }
              )
            : Promise.resolve(
                null
              ),

          token
            ? fetchJson(
                `${API_URL}/chat/unread-count`,
                {
                  headers:
                    authHeaders,
                }
              )
            : Promise.resolve(
                null
              ),
        ]);

        if (eventData?.events) {
          setEvents(
            eventData.events
          );
        }

        if (clubData?.clubs) {
          setClubs(
            clubData.clubs
          );
        }

        if (materialData?.materials) {
          setMaterials(
            materialData.materials
          );
        }

        if (peerData?.requests) {
          setPeerRequests(
            peerData.requests
          );
        }

        if (
          typeof messageData?.unreadCount ===
          "number"
        ) {
          setUnreadMessages(
            messageData.unreadCount
          );
        }

        setLastUpdated(
          new Date()
        );

        setLoading(false);
      },
      []
    );

  /* ===================================================
     INITIAL LOAD + AUTO REFRESH
  =================================================== */

  useEffect(() => {
    if (!hydrated || !user) {
      return;
    }

    loadDashboardData();

    /*
      Refresh live dashboard information
      every 10 seconds.
    */

    const interval =
      setInterval(
        loadDashboardData,
        10000
      );

    return () =>
      clearInterval(interval);
  }, [
    hydrated,
    user,
    loadDashboardData,
  ]);

  /* ===================================================
     AUTH LOADING
  =================================================== */

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">

          <div className="mx-auto size-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading CampusConnect...
          </p>

        </div>
      </div>
    );
  }

  /* ===================================================
     LOGIN PROTECTION
  =================================================== */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ===================================================
     LIVE DATA DERIVED VALUES
  =================================================== */

  const upcomingEvents =
    events
      .filter(
        (event) =>
          event.status !==
          "Completed"
      )
      .slice(0, 3);

  const activeClubs =
    clubs
      .filter(
        (club) =>
          club.status !==
          "Inactive"
      )
      .slice(0, 4);

  const recentMaterials =
    [...materials]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      )
      .slice(0, 3);

  /*
    Accepted requests are treated as
    actual upcoming peer sessions.
  */

  const studySessions =
    peerRequests
      .filter(
        (request) =>
          request.status ===
          "Accepted"
      )
      .slice(0, 4);

  /*
    Open requests are shown in the
    Learning Requests card.
  */

  const openRequests =
    peerRequests
      .filter(
        (request) =>
          request.status ===
          "Open"
      )
      .slice(0, 3);

  /*
    Number of actual applications in
    the current CampusConnect store.
  */

  const applicationCount =
    Array.isArray(appliedJobs)
      ? appliedJobs.length
      : 0;

  /*
    Total counts from backend.
  */

  const liveStats = [
    {
      label: "Study materials",
      value:
        materials.length,
      icon: BookOpen,
      to: "/materials",
    },

    {
      label: "Peer requests",
      value:
        peerRequests.length,
      icon: GraduationCap,
      to: "/peer-learning",
    },

    {
      label: "Applications",
      value:
        applicationCount,
      icon: Briefcase,
      to: "/placements",
    },

    {
      label: "Unread messages",
      value:
        unreadMessages,
      icon: MessagesSquare,
      to: "/chat",
    },
  ];

  /*
    Extra live overview data.
  */

  const overviewStats = [
    {
      label: "Upcoming events",
      value:
        events.filter(
          (event) =>
            event.status !==
            "Completed"
        ).length,
      icon: CalendarDays,
    },

    {
      label: "Active clubs",
      value:
        clubs.filter(
          (club) =>
            club.status !==
            "Inactive"
        ).length,
      icon: Users,
    },

    {
      label: "Open requests",
      value:
        peerRequests.filter(
          (request) =>
            request.status ===
            "Open"
        ).length,
      icon: GraduationCap,
    },

    {
      label: "Unread notifications",
      value:
        unreadNotificationCount,
      icon: Bell,
    },
  ];

  /*
    Latest real notifications.
  */

  const dashboardNotifications =
    notifications.slice(0, 4);

  return (
    <AppShell
      title="Welcome to CampusConnect"
      subtitle="Live campus information at a glance."
      action={
        <div className="flex items-center gap-2">

          {lastUpdated && (
            <span className="hidden text-xs text-muted-foreground xl:block">
              Updated{" "}
              {formatTime(
                lastUpdated
              )}
            </span>
          )}

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl bg-card/60"
            onClick={
              loadDashboardData
            }
            title="Refresh dashboard"
          >
            <RefreshCw className="size-4" />
          </Button>

          <Link
            to="/assistant"
            className="hidden sm:block"
          >
            <Button
              size="sm"
              className="rounded-xl"
            >
              Ask AI assistant
            </Button>
          </Link>

        </div>
      }
    >
      <div className="space-y-6">

        {/* =================================================
            LIVE OVERVIEW
        ================================================= */}

        <GlassCard>

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <Badge
                variant="secondary"
                className="rounded-lg"
              >
                Live dashboard
              </Badge>

              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
                Campus activity
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                This dashboard is connected to your
                current CampusConnect data. Events,
                clubs, study materials and peer
                learning requests refresh automatically.
              </p>

            </div>

            <div className="text-right">

              <p className="text-xs text-muted-foreground">
                Data source
              </p>

              <p className="text-sm font-semibold">
                CampusConnect backend
              </p>

            </div>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {overviewStats.map(
              (item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/60 bg-card/70 p-4"
                >

                  <span className="grid size-10 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">

                    <item.icon className="size-5" />

                  </span>

                  <p className="mt-4 font-display text-2xl font-extrabold">
                    {item.value}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {item.label}
                  </p>

                </div>
              )
            )}

          </div>

        </GlassCard>

        {/* =================================================
            LIVE STAT CARDS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {liveStats.map(
            (stat) => (
              <Link
                key={stat.label}
                to={stat.to}
              >
                <GlassCard className="group h-full transition-transform hover:-translate-y-0.5">

                  <div className="flex items-start justify-between gap-3">

                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">

                      <stat.icon className="size-5" />

                    </span>

                    <ArrowUpRight className="size-4 text-muted-foreground" />

                  </div>

                  <p className="mt-4 font-display text-3xl font-extrabold">
                    {loading ? (
                      <span className="inline-block h-9 w-10 animate-pulse rounded bg-muted" />
                    ) : (
                      stat.value
                    )}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>

                </GlassCard>
              </Link>
            )
          )}

        </div>

        {/* =================================================
            STUDY SESSIONS + LEARNING REQUESTS
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-3">

          {/* =================================================
              STUDY SESSIONS
          ================================================= */}

          <GlassCard className="xl:col-span-2">

            <div className="mb-4 flex items-center justify-between gap-3">

              <div>

                <h2 className="text-base font-bold">
                  Upcoming study sessions
                </h2>

                <p className="text-xs text-muted-foreground">
                  Accepted peer-learning sessions
                </p>

              </div>

              <Link
                to="/peer-learning"
                className="text-sm font-medium text-primary hover:underline"
              >
                Peer learning
              </Link>

            </div>

            {loading ? (
              <div className="space-y-3">

                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-2xl bg-muted/40"
                    />
                  )
                )}

              </div>
            ) : studySessions.length > 0 ? (
              <div className="space-y-3">

                {studySessions.map(
                  (session) => {

                    const partner =
                      session.acceptedBy
                        ?.name ||
                      session.requestedBy
                        ?.name ||
                      "Student";

                    return (
                      <div
                        key={
                          session._id
                        }
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                      >

                        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xs font-bold text-primary-foreground">

                          {partner
                            .split(" ")
                            .map(
                              (part) =>
                                part[0]
                            )
                            .join("")
                            .slice(
                              0,
                              2
                            )
                            .toUpperCase()}

                        </span>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {session.title}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {partner}
                            {" · "}
                            {session.subject}
                            {" · "}
                            {session.preferredTime ||
                              "Flexible"}
                          </p>

                        </div>

                        <Badge
                          variant="secondary"
                          className="shrink-0 gap-1 rounded-lg"
                        >

                          <ModeIcon
                            mode={
                              session.preferredMode
                            }
                          />

                          {session.preferredMode}

                        </Badge>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card/70 py-10 text-center">

                <GraduationCap className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-2 text-sm font-semibold">
                  No accepted study sessions
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Accept a peer-learning request to see
                  your session here.
                </p>

              </div>
            )}

          </GlassCard>

          {/* =================================================
              OPEN LEARNING REQUESTS
          ================================================= */}

          <GlassCard>

            <div className="mb-4 flex items-center justify-between gap-3">

              <div>

                <h2 className="text-base font-bold">
                  Learning requests
                </h2>

                <p className="text-xs text-muted-foreground">
                  Live open requests
                </p>

              </div>

              <Link
                to="/peer-learning"
                className="text-sm font-medium text-primary hover:underline"
              >
                All
              </Link>

            </div>

            {openRequests.length > 0 ? (
              <div className="space-y-3">

                {openRequests.map(
                  (request) => (
                    <Link
                      key={
                        request._id
                      }
                      to="/peer-learning"
                      className="block rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                    >

                      <p className="truncate text-sm font-semibold">
                        {request.title}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {request.requestedBy
                          ?.name ||
                          "Student"}
                        {" · "}
                        {request.subject}
                        {" · "}
                        {request.preferredMode}
                      </p>

                    </Link>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card/70 py-10 text-center">

                <GraduationCap className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-2 text-sm font-semibold">
                  No open requests
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  New peer-learning requests will
                  appear here.
                </p>

              </div>
            )}

          </GlassCard>

        </div>

        {/* =================================================
            MATERIALS + EVENTS + CLUBS
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-3">

          {/* =================================================
              RECENT STUDY MATERIALS
          ================================================= */}

          <GlassCard>

            <div className="mb-4 flex items-center justify-between gap-3">

              <div>

                <h2 className="text-base font-bold">
                  Recent notes
                </h2>

                <p className="text-xs text-muted-foreground">
                  From the study materials database
                </p>

              </div>

              <Link
                to="/materials"
                className="text-sm font-medium text-primary hover:underline"
              >
                Library
              </Link>

            </div>

            {recentMaterials.length > 0 ? (
              <div className="space-y-3">

                {recentMaterials.map(
                  (material) => (
                    <Link
                      key={
                        material._id
                      }
                      to="/materials"
                      className="block rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                    >

                      <p className="truncate text-sm font-semibold">
                        {material.title}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">

                        <span>
                          {material.subject}
                        </span>

                        {typeof material.rating ===
                          "number" &&
                          material.rating >
                            0 && (
                            <>
                              <span>
                                ·
                              </span>

                              <Star className="size-3 fill-primary text-primary" />

                              <span>
                                {material.rating}
                              </span>
                            </>
                          )}

                      </div>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatTime(
                          material.createdAt
                        )}
                      </p>

                    </Link>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card/70 py-10 text-center">

                <BookOpen className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-2 text-sm font-semibold">
                  No study materials
                </p>

              </div>
            )}

          </GlassCard>

          {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

          <GlassCard>

            <div className="mb-4 flex items-center justify-between gap-3">

              <div>

                <h2 className="text-base font-bold">
                  Upcoming events
                </h2>

                <p className="text-xs text-muted-foreground">
                  Live events from the backend
                </p>

              </div>

              <Link
                to="/events"
                className="text-sm font-medium text-primary hover:underline"
              >
                All
              </Link>

            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">

                {upcomingEvents.map(
                  (event) => (
                    <Link
                      key={
                        event._id
                      }
                      to="/events"
                      className="block rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                    >

                      <p className="truncate text-sm font-semibold">
                        {event.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">

                        <CalendarDays className="mr-1 inline size-3" />

                        {formatEventDate(
                          event.date
                        )}
                        {" · "}
                        {event.venue ||
                          "Venue TBA"}

                      </p>

                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {event.club ||
                          "Campus event"}
                      </p>

                    </Link>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card/70 py-10 text-center">

                <CalendarDays className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-2 text-sm font-semibold">
                  No upcoming events
                </p>

              </div>
            )}

          </GlassCard>

          {/* =================================================
              ACTIVE CLUBS
          ================================================= */}

          <GlassCard>

            <div className="mb-4 flex items-center justify-between gap-3">

              <div>

                <h2 className="text-base font-bold">
                  Active clubs
                </h2>

                <p className="text-xs text-muted-foreground">
                  Live clubs from the backend
                </p>

              </div>

              <Link
                to="/clubs"
                className="text-sm font-medium text-primary hover:underline"
              >
                All
              </Link>

            </div>

            {activeClubs.length > 0 ? (
              <div className="space-y-2">

                {activeClubs.map(
                  (club) => (
                    <Link
                      key={
                        club._id
                      }
                      to="/clubs"
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                    >

                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">

                        <Users className="size-4" />

                      </span>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold">
                          {club.name}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {club.membersCount ||
                            0}
                          {" members · "}
                          {club.category ||
                            "General"}
                        </p>

                      </div>

                    </Link>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card/70 py-10 text-center">

                <Users className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-2 text-sm font-semibold">
                  No active clubs
                </p>

              </div>
            )}

          </GlassCard>

        </div>

        {/* =================================================
            NOTIFICATIONS + APPLICATIONS
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-2">

          {/* =================================================
              REAL NOTIFICATIONS
          ================================================= */}

          <GlassCard>

            <div className="mb-4 flex items-center justify-between gap-2">

              <div className="flex items-center gap-2">

                <Bell className="size-4 text-primary" />

                <h2 className="text-base font-bold">
                  Notifications
                </h2>

                {unreadNotificationCount >
                  0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {
                      unreadNotificationCount
                    }
                  </span>
                )}

              </div>

              <Link
                to="/notifications"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>

            </div>

            {notificationLoading ? (
              <div className="flex justify-center py-8">

                <div className="size-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

              </div>
            ) : dashboardNotifications.length >
              0 ? (
              <div className="space-y-2">

                {dashboardNotifications.map(
                  (notification) => (
                    <button
                      key={
                        notification._id ||
                        notification.id
                      }
                      type="button"
                      className="block w-full text-left"
                      onClick={() => {
                        const id =
                          notification._id ||
                          notification.id;

                        if (
                          id &&
                          !notification.read
                        ) {
                          markNotificationAsRead(
                            id
                          );
                        }
                      }}
                    >

                      <div
                        className={`
                          rounded-2xl
                          border
                          border-border/60
                          bg-card/70
                          p-3
                          transition-colors
                          hover:bg-accent/50

                          ${
                            notification.read
                              ? "opacity-60"
                              : ""
                          }
                        `}
                      >

                        <div className="flex items-start gap-3">

                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">

                            <Bell className="size-4" />

                          </span>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold">
                              {
                                notification.title
                              }
                            </p>

                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {
                                notification.message
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatTime(
                                notification.createdAt
                              )}
                            </p>

                          </div>

                          {!notification.read && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                          )}

                        </div>

                      </div>

                    </button>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card/70 py-10 text-center">

                <Bell className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-2 text-sm font-semibold">
                  No notifications yet
                </p>

              </div>
            )}

            <Link to="/notifications">
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full rounded-xl bg-card/60"
              >
                Open notifications
              </Button>
            </Link>

          </GlassCard>

          {/* =================================================
              APPLICATIONS
          ================================================= */}

          <GlassCard>

            <div className="mb-4 flex items-center justify-between gap-3">

              <div>

                <h2 className="text-base font-bold">
                  Placement activity
                </h2>

                <p className="text-xs text-muted-foreground">
                  Your current application activity
                </p>

              </div>

              <Link
                to="/placements"
                className="text-sm font-medium text-primary hover:underline"
              >
                Placements
              </Link>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-2xl border border-border/60 bg-card/70 p-4">

                <Briefcase className="size-5 text-primary" />

                <p className="mt-3 font-display text-2xl font-extrabold">
                  {applicationCount}
                </p>

                <p className="text-xs text-muted-foreground">
                  Applied jobs
                </p>

              </div>

              <div className="rounded-2xl border border-border/60 bg-card/70 p-4">

                <Bell className="size-5 text-primary" />

                <p className="mt-3 font-display text-2xl font-extrabold">
                  {
                    unreadNotificationCount
                  }
                </p>

                <p className="text-xs text-muted-foreground">
                  Unread notifications
                </p>

              </div>

            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Placement listings are currently managed
              from the Placements section. Application
              counts shown here come from your current
              CampusConnect activity rather than fixed
              demo numbers.
            </p>

          </GlassCard>

        </div>

      </div>
    </AppShell>
  );
}

export default Dashboard;
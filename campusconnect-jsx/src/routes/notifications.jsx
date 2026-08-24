import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import {
  Bell,
  CalendarDays,
  Users,
  MessagesSquare,
  Settings2,
  CheckCheck,
  Briefcase,
} from "lucide-react";

import { AppShell, GlassCard } from "@/components/AppShell";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useCampus } from "@/lib/campus-store";

export const Route = createFileRoute(
  "/notifications"
)({
  head: () => ({
    meta: [
      {
        title:
          "Notifications — CampusConnect",
      },
    ],
  }),

  component: NotificationsPage,
});

/* =====================================================
   ICONS
===================================================== */

const iconFor = {
  event: CalendarDays,
  club: Users,
  chat: MessagesSquare,
  placement: Briefcase,
  system: Settings2,
};

/* =====================================================
   TABS
===================================================== */

const tabs = [
  "All",
  "Events",
  "Clubs",
  "Placements",
  "Mentions",
];

/* =====================================================
   PAGE
===================================================== */

function NotificationsPage() {
  const [tab, setTab] =
    useState("All");

  const [readingId, setReadingId] =
    useState(null);

  const {
    notifications,
    notificationLoading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationCount,
  } = useCampus();

  /* =====================================================
     FILTER NOTIFICATIONS
  ===================================================== */

  const filtered =
    notifications.filter(
      (notification) => {
        if (tab === "Events") {
          return (
            notification.type ===
            "event"
          );
        }

        if (tab === "Clubs") {
          return (
            notification.type ===
            "club"
          );
        }

        if (tab === "Placements") {
          return (
            notification.type ===
            "placement"
          );
        }

        if (tab === "Mentions") {
          return (
            notification.type ===
            "chat"
          );
        }

        return true;
      }
    );

  /* =====================================================
     MARK ONE AS READ
  ===================================================== */

  const handleNotificationClick =
    async (notification) => {
      const notificationId =
        notification._id ||
        notification.id;

      if (
        !notificationId ||
        notification.read
      ) {
        return;
      }

      try {
        setReadingId(
          String(notificationId)
        );

        console.log(
          "Marking notification as read:",
          notificationId
        );

        await markNotificationAsRead(
          notificationId
        );

        console.log(
          "Notification marked as read:",
          notificationId
        );
      } catch (error) {
        console.error(
          "Unable to mark notification as read:",
          error
        );
      } finally {
        setReadingId(null);
      }
    };

  /* =====================================================
     MARK ALL AS READ
  ===================================================== */

  const handleMarkAllRead =
    async () => {
      if (
        unreadNotificationCount === 0
      ) {
        return;
      }

      try {
        await markAllNotificationsAsRead();
      } catch (error) {
        console.error(
          "Unable to mark all notifications as read:",
          error
        );
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <AppShell
      title="Notifications"
      subtitle={`${unreadNotificationCount} unread`}
      action={
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl bg-card/60"
          onClick={
            handleMarkAllRead
          }
          disabled={
            unreadNotificationCount === 0
          }
        >
          <CheckCheck className="size-4" />

          <span className="hidden sm:inline">
            Mark all read
          </span>
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-4">

        {/* =============================================
            TABS
        ============================================= */}

        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setTab(item)
              }
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",

                tab === item
                  ? "bg-gradient-brand text-primary-foreground"
                  : "glass-soft text-muted-foreground hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {/* =============================================
            LOADING
        ============================================= */}

        {notificationLoading && (
          <GlassCard className="py-14 text-center">
            <p className="text-sm text-muted-foreground">
              Loading notifications...
            </p>
          </GlassCard>
        )}

        {/* =============================================
            NOTIFICATIONS
        ============================================= */}

        {!notificationLoading &&
          filtered.map(
            (notification) => {
              const Icon =
                iconFor[
                  notification.type
                ] || Bell;

              const notificationId =
                notification._id ||
                notification.id;

              const isReading =
                String(readingId) ===
                String(notificationId);

              return (
                <button
                  key={notificationId}
                  type="button"
                  disabled={isReading}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  className={cn(
                    "block w-full text-left transition-opacity",

                    isReading &&
                      "pointer-events-none opacity-70"
                  )}
                >
                  <GlassCard
                    className={cn(
                      "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 transition-all",

                      !notification.read &&
                        "cursor-pointer hover:scale-[1.005]",

                      notification.read &&
                        "opacity-60"
                    )}
                  >
                    {/* ICON */}

                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                      <Icon className="size-4" />
                    </span>

                    {/* CONTENT */}

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {notification.title}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTime(
                          notification.createdAt
                        )}
                      </p>
                    </div>

                    {/* UNREAD DOT */}

                    {!notification.read && (
                      <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                    )}

                    {/* READ INDICATOR */}

                    {notification.read && (
                      <CheckCheck className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    )}
                  </GlassCard>
                </button>
              );
            }
          )}

        {/* =============================================
            EMPTY
        ============================================= */}

        {!notificationLoading &&
          filtered.length === 0 && (
            <GlassCard className="py-14 text-center">
              <Bell className="mx-auto size-9 text-muted-foreground" />

              <p className="mt-3 text-sm text-muted-foreground">
                Nothing here right now.
              </p>
            </GlassCard>
          )}
      </div>
    </AppShell>
  );
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

  const now = new Date();

  const difference =
    now.getTime() -
    value.getTime();

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return value.toLocaleDateString();
}
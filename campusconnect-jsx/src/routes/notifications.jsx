import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Users,
  MessagesSquare,
  Settings2,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { notices } from "@/lib/campus-data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      {
        title: "Notifications — CampusConnect",
      },
      {
        name: "description",
        content:
          "Event confirmations, club updates, mentions and booking reminders.",
      },
      {
        property: "og:title",
        content: "Notifications — CampusConnect",
      },
      {
        property: "og:description",
        content: "Everything that needs your attention on campus.",
      },
    ],
  }),
  component: NotificationsPage,
});
const iconFor = {
  event: CalendarDays,
  club: Users,
  chat: MessagesSquare,
  system: Settings2,
};
const tabs = ["All", "Events", "Clubs", "Mentions"];
function NotificationsPage() {
  const [read, setRead] = useState([]);
  const [tab, setTab] = useState("All");
  const filtered = notices.filter((n) => {
    if (tab === "Events") return n.kind === "event";
    if (tab === "Clubs") return n.kind === "club";
    if (tab === "Mentions") return n.kind === "chat";
    return true;
  });
  return (
    <AppShell
      title="Notifications"
      subtitle={`${notices.length - read.length} unread`}
      action={
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl bg-card/60"
          onClick={() => {
            setRead(notices.map((n) => n.id));
            toast("All notifications marked as read");
          }}
        >
          <CheckCheck className="size-4" />{" "}
          <span className="hidden sm:inline">Mark all read</span>
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                tab === t
                  ? "bg-gradient-brand text-primary-foreground"
                  : "glass-soft text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.map((n) => {
          const Icon = iconFor[n.kind];
          const isRead = read.includes(n.id);
          return (
            <button
              key={n.id}
              onClick={() => setRead((r) => (isRead ? r : [...r, n.id]))}
              className="block w-full text-left"
            >
              <GlassCard
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4",
                  isRead && "opacity-60",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                </div>
                {!isRead && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </GlassCard>
            </button>
          );
        })}

        {filtered.length === 0 && (
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

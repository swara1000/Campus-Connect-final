import { Navigate } from "@tanstack/react-router";
import { useCampus } from "@/lib/campus-store";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  MessagesSquare,
  ArrowUpRight,
  Flame,
  CalendarDays,
  Video,
  MapPin,
  Bell,
  Users,
  Star,
} from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { events, clubs, notices } from "@/lib/campus-data";
import {
  notes,
  learningRequests,
  learningProgress,
  studySessions,
  placements,
} from "@/lib/learning-data";
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Student Dashboard — CampusConnect",
      },
      {
        name: "description",
        content:
          "Your learning progress, upcoming peer sessions, notes, events and placements in one view.",
      },
      {
        property: "og:title",
        content: "Student Dashboard — CampusConnect",
      },
      {
        property: "og:description",
        content:
          "AI-powered student collaboration and peer learning dashboard.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: Dashboard,
});
function Dashboard() {
  const {
    user,
    joinedClubs,
    acceptedRequests,
    hydrated,
  } = useCampus();

  /* =========================================
     WAIT FOR LOCAL STORAGE
  ========================================= */

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading CampusConnect...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     PROTECT DASHBOARD
  ========================================= */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const openRequests = learningRequests
    .filter(
      (r) =>
        !acceptedRequests.includes(r.id)
    )
    .slice(0, 3);
  const stats = [
    {
      label: "Notes shared",
      value: 12,
      icon: BookOpen,
      to: "/materials",
    },
    {
      label: "Peer sessions",
      value: 24,
      icon: GraduationCap,
      to: "/peer-learning",
    },
    {
      label: "Applications",
      value: 3,
      icon: Briefcase,
      to: "/placements",
    },
    {
      label: "Unread messages",
      value: 6,
      icon: MessagesSquare,
      to: "/chat",
    },
  ];
  return (
    <AppShell
  title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Student"}`}
  subtitle="Hereno th's your learning day at a glance."
  action={
        <Link to="/assistant" className="hidden sm:block">
          <Button size="sm" className="rounded-xl">
            Ask AI assistant
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <GlassCard className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <Badge variant="secondary" className="gap-1 rounded-lg">
              <Flame className="size-3 text-primary" /> 30-day learning streak
            </Badge>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
              You're <span className="text-gradient-brand">78%</span> through
              today's study goal
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Two peer sessions scheduled, three notes waiting for review, and
              one placement deadline this week.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/peer-learning">
                <Button size="sm" className="rounded-xl">
                  Broadcast a request
                </Button>
              </Link>
              <Link to="/materials">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl bg-card/60"
                >
                  Browse materials
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-80">
            {learningProgress.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-border/60 bg-card/70 p-3"
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  {p.label}
                </p>
                <p className="mt-1 font-display text-xl font-extrabold">
                  {p.value}%
                </p>
                <Progress value={p.value} className="mt-2 h-1.5" />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {p.target}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} to={s.to}>
              <GlassCard className="group h-full transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-4 font-display text-3xl font-extrabold">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </GlassCard>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <GlassCard className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold">Upcoming study sessions</h2>
              <Link
                to="/peer-learning"
                className="text-sm font-medium text-primary hover:underline"
              >
                Peer learning
              </Link>
            </div>
            <div className="space-y-3">
              {studySessions.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xs font-bold text-primary-foreground">
                    {s.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.topic}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.time}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 gap-1 rounded-lg"
                  >
                    {s.mode === "Online" ? (
                      <Video className="size-3" />
                    ) : (
                      <MapPin className="size-3" />
                    )}{" "}
                    {s.mode}
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold">Learning requests</h2>
              <Link
                to="/peer-learning"
                className="text-sm font-medium text-primary hover:underline"
              >
                All
              </Link>
            </div>
            <div className="space-y-3">
              {openRequests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border/60 bg-card/70 p-3"
                >
                  <p className="truncate text-sm font-semibold">{r.topic}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.student} · {r.subject} · {r.mode}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <GlassCard>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold">Recent notes</h2>
              <Link
                to="/materials"
                className="text-sm font-medium text-primary hover:underline"
              >
                Library
              </Link>
            </div>
            <div className="space-y-3">
              {notes.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  to="/materials"
                  className="block rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                >
                  <p className="truncate text-sm font-semibold">{n.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-muted-foreground">
                    {n.subject} ·{" "}
                    <Star className="size-3 fill-primary text-primary" />{" "}
                    {n.rating}
                  </p>
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold">Upcoming events</h2>
              <Link
                to="/events"
                className="text-sm font-medium text-primary hover:underline"
              >
                All
              </Link>
            </div>
            <div className="space-y-3">
              {events.slice(0, 3).map((e) => (
                <Link
                  key={e.id}
                  to="/events/$eventId"
                  params={{
                    eventId: e.id,
                  }}
                  className="block rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                >
                  <p className="truncate text-sm font-semibold">{e.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <CalendarDays className="mr-1 inline size-3" />
                    {e.date} · {e.venue}
                  </p>
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold">Placements</h2>
              <Link
                to="/placements"
                className="text-sm font-medium text-primary hover:underline"
              >
                All
              </Link>
            </div>
            <div className="space-y-3">
              {placements.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to="/placements"
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                    {p.logo}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.role}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.company} · {p.deadline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h2 className="text-base font-bold">Active clubs</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {clubs
                .filter((c) => joinedClubs.includes(c.id))
                .map((c) => (
                  <Link
                    key={c.id}
                    to="/clubs/$clubId"
                    params={{
                      clubId: c.id,
                    }}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-accent/50"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                      {c.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.members} members
                      </p>
                    </div>
                  </Link>
                ))}
              {joinedClubs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  You haven't joined a club yet.
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              <h2 className="text-base font-bold">Notifications</h2>
            </div>
            <div className="space-y-3">
              {notices.slice(0, 4).map((n) => (
                <div key={n.id} className="min-w-0">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {n.body}
                  </p>
                </div>
              ))}
            </div>
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
        </div>
      </div>
    </AppShell>
  );
}

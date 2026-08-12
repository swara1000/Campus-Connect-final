import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  CalendarDays,
  Building2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { events, clubs, rooms } from "@/lib/campus-data";
export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      {
        title: "Admin Dashboard — CampusConnect",
      },
      {
        name: "description",
        content:
          "Oversee campus events, clubs, bookings and student engagement.",
      },
      {
        property: "og:title",
        content: "Admin Dashboard — CampusConnect",
      },
      {
        property: "og:description",
        content: "Operations overview for campus administrators.",
      },
    ],
  }),
  component: AdminHome,
});
function AdminHome() {
  const stats = [
    {
      label: "Active students",
      value: "4,218",
      icon: Users,
    },
    {
      label: "Published events",
      value: String(events.length),
      icon: CalendarDays,
    },
    {
      label: "Registered clubs",
      value: String(clubs.length),
      icon: TrendingUp,
    },
    {
      label: "Bookable rooms",
      value: String(rooms.length),
      icon: Building2,
    },
  ];
  return (
    <AppShell title="Admin Dashboard" subtitle="Campus operations at a glance.">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <GlassCard key={s.label}>
              <s.icon className="size-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-extrabold">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <GlassCard>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-base font-bold">
                Events needing review
              </h2>
              <Link to="/admin/events">
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5 rounded-xl bg-card/60"
                >
                  Manage <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {events.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.date} · {e.venue}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 rounded-lg">
                    {e.taken} going
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-base font-bold">Quick actions</h2>
            <div className="mt-3 space-y-2">
              <Link to="/admin/events" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl bg-card/60"
                >
                  Manage events
                </Button>
              </Link>
              <Link to="/admin/analytics" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl bg-card/60"
                >
                  View analytics
                </Button>
              </Link>
              <Link to="/settings" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl bg-card/60"
                >
                  Platform settings
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

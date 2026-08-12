import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { events as seedEvents } from "@/lib/campus-data";
export const Route = createFileRoute("/admin/events")({
  head: () => ({
    meta: [
      {
        title: "Manage Events — CampusConnect",
      },
      {
        name: "description",
        content: "Create, publish and monitor capacity for every campus event.",
      },
      {
        property: "og:title",
        content: "Manage Events — CampusConnect",
      },
      {
        property: "og:description",
        content: "Event operations and capacity monitoring for admins.",
      },
    ],
  }),
  component: ManageEvents,
});
function ManageEvents() {
  const [list, setList] = useState(seedEvents);
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const filtered = list.filter((e) =>
    e.title.toLowerCase().includes(q.toLowerCase()),
  );
  const create = () => {
    const name = title.trim().slice(0, 90);
    if (!name) return;
    setList((l) => [
      {
        id: `e-${Date.now()}`,
        title: name,
        club: "Student Affairs",
        date: "To be scheduled",
        time: "TBC",
        venue: "TBC",
        category: "Campus",
        seats: 100,
        taken: 0,
        summary: "Draft event created from the admin console.",
        details: "Add a description, venue and schedule before publishing.",
      },
      ...l,
    ]);
    setTitle("");
    toast.success("Draft event created");
  };
  return (
    <AppShell
      title="Manage Events"
      subtitle={`${list.length} events in the catalogue`}
    >
      <div className="space-y-6">
        <GlassCard>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={title}
              maxLength={90}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New event title"
              className="rounded-xl bg-card/70"
            />
            <Button
              className="gap-2 rounded-xl"
              onClick={create}
              disabled={!title.trim()}
            >
              <Plus className="size-4" /> Create draft
            </Button>
          </div>
        </GlassCard>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events"
            className="rounded-xl bg-card/70 pl-9"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((e) => (
            <GlassCard key={e.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-bold">
                    {e.title}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.club} · {e.date} · {e.venue}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-lg">
                  {e.category}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Capacity</span>
                  <span>
                    {e.taken}/{e.seats}
                  </span>
                </div>
                <Progress
                  value={(e.taken / e.seats) * 100}
                  className="mt-1.5 h-2"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl bg-card/60"
                  onClick={() => toast("Event updated")}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl bg-card/60 text-destructive"
                  onClick={() => {
                    setList((l) => l.filter((x) => x.id !== e.id));
                    toast("Event removed");
                  }}
                >
                  Remove
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

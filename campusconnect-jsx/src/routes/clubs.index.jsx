import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clubs } from "@/lib/campus-data";
import { useCampus } from "@/lib/campus-store";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/clubs/")({
  head: () => ({
    meta: [
      {
        title: "Campus Clubs — CampusConnect",
      },
      {
        name: "description",
        content:
          "Discover and join student societies across engineering, arts, business and community.",
      },
      {
        property: "og:title",
        content: "Campus Clubs — CampusConnect",
      },
      {
        property: "og:description",
        content: "Discover and join student societies on campus.",
      },
    ],
  }),
  component: ClubsPage,
});
const cats = [
  "All",
  "Engineering",
  "Academic",
  "Arts",
  "Business",
  "Community",
];
function ClubsPage() {
  const { joinedClubs, toggleClub } = useCampus();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const list = clubs.filter(
    (c) =>
      (cat === "All" || c.category === cat) &&
      c.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AppShell
      title="Clubs"
      subtitle={`${clubs.length} societies currently recruiting`}
    >
      <div className="space-y-6">
        <GlassCard className="grid gap-3 md:grid-cols-[minmax(0,22rem)_1fr] md:items-center">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              maxLength={80}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clubs"
              className="rounded-xl bg-card/70 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  cat === c
                    ? "bg-gradient-brand text-primary-foreground"
                    : "border border-border bg-card/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const joined = joinedClubs.includes(c.id);
            return (
              <GlassCard key={c.id} className="flex flex-col">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl">
                      {c.emoji}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-bold">
                        {c.name}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">
                        Lead: {c.lead}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 rounded-lg">
                    {c.category}
                  </Badge>
                </div>
                <p className="mt-4 flex-1 text-sm text-muted-foreground">
                  {c.blurb}
                </p>
                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-3.5 shrink-0" /> {c.members} members
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to="/clubs/$clubId"
                    params={{
                      clubId: c.id,
                    }}
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-xl bg-card/60"
                    >
                      Details
                    </Button>
                  </Link>
                  <Button
                    className="w-full rounded-xl"
                    variant={joined ? "secondary" : "default"}
                    onClick={() => {
                      toggleClub(c.id);
                      toast(joined ? `Left ${c.name}` : `Joined ${c.name}`);
                    }}
                  >
                    {joined ? "Joined" : "Join"}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UsersRound, Plus, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCampus } from "@/lib/campus-store";
import { teams as seed, skills as mySkills } from "@/lib/learning-data";
export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      {
        title: "Team Finder — CampusConnect",
      },
      {
        name: "description",
        content:
          "Find project teammates by skill, join hackathon squads or recruit for coursework projects.",
      },
      {
        property: "og:title",
        content: "Team Finder — CampusConnect",
      },
      {
        property: "og:description",
        content: "Skill-matched project recruitment for students.",
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
  component: TeamsPage,
});
function TeamsPage() {
  const { joinedTeams, toggleTeam } = useCampus();
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    projectType: "Hackathon",
    skills: "",
    slots: "3",
    blurb: "",
  });
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (t) =>
        !q ||
        `${t.name} ${t.projectType} ${t.skills.join(" ")}`
          .toLowerCase()
          .includes(q),
    );
  }, [items, query]);
  const create = () => {
    if (!form.name.trim()) return;
    setItems((i) => [
      {
        id: `tm-${Date.now()}`,
        name: form.name.trim(),
        projectType: form.projectType,
        lead: "Aisha Rahman",
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        members: [
          {
            name: "Aisha Rahman",
            initials: "AR",
          },
        ],
        slots: Number(form.slots) || 1,
        blurb:
          form.blurb.trim() || "New project team looking for collaborators.",
      },
      ...i,
    ]);
    setForm({
      name: "",
      projectType: "Hackathon",
      skills: "",
      slots: "3",
      blurb: "",
    });
    setOpen(false);
    toast.success("Team created");
  };
  const match = (t) => {
    const hits = t.skills.filter((s) =>
      mySkills.some((m) => m.toLowerCase() === s.toLowerCase()),
    ).length;
    return Math.round((hits / Math.max(t.skills.length, 1)) * 100);
  };
  return (
    <AppShell
      title="Team Finder"
      subtitle="Match with teammates by skill and project type."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-xl">
              <Plus className="size-4" />{" "}
              <span className="hidden sm:inline">Create team</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a project team</DialogTitle>
              <DialogDescription>
                Describe the project and the skills you need.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Team name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 rounded-xl"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Project type</Label>
                  <select
                    value={form.projectType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        projectType: e.target.value,
                      })
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-card/70 px-3 text-sm"
                  >
                    <option>Hackathon</option>
                    <option>Coursework</option>
                    <option>Research</option>
                    <option>Interview Prep</option>
                    <option>Startup</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Open slots</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.slots}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slots: e.target.value,
                      })
                    }
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">
                  Skills needed (comma separated)
                </Label>
                <Input
                  value={form.skills}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      skills: e.target.value,
                    })
                  }
                  placeholder="React, Python, UI Design"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">About the project</Label>
                <Textarea
                  rows={3}
                  value={form.blurb}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      blurb: e.target.value,
                    })
                  }
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="rounded-xl"
                onClick={create}
                disabled={!form.name.trim()}
              >
                Publish team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-5">
        <GlassCard className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams, project types or skills"
              className="rounded-xl bg-card/70 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Your skills:
            </span>
            {mySkills.slice(0, 4).map((s) => (
              <Badge key={s} variant="secondary" className="rounded-lg">
                {s}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => {
            const joined = joinedTeams.includes(t.id);
            const pct = match(t);
            return (
              <GlassCard
                key={t.id}
                className="flex h-full flex-col transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                    <UsersRound className="size-5" />
                  </span>
                  <Badge variant="secondary" className="shrink-0 rounded-lg">
                    {t.projectType}
                  </Badge>
                </div>
                <p className="mt-3 font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">Led by {t.lead}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {t.blurb}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.skills.map((s) => (
                    <Badge key={s} variant="outline" className="rounded-lg">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t.members.length} members · {t.slots} slots open
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <Sparkles className="size-3.5" /> {pct}% match
                  </span>
                </div>
                <div className="mt-auto pt-4">
                  <Button
                    size="sm"
                    variant={joined ? "outline" : "default"}
                    className="w-full rounded-xl"
                    onClick={() => {
                      toggleTeam(t.id);
                      toast.success(
                        joined ? "Left team" : "Request sent to team lead",
                      );
                    }}
                  >
                    {joined ? "Leave team" : "Request to join"}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
          {list.length === 0 && (
            <GlassCard className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
              No teams match your search.
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}

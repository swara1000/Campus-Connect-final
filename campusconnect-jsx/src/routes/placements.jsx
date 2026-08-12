import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Briefcase,
  MapPin,
  CalendarClock,
  Bookmark,
  Search,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCampus } from "@/lib/campus-store";
import { placements } from "@/lib/learning-data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/placements")({
  head: () => ({
    meta: [
      {
        title: "Placements & Internships — CampusConnect",
      },
      {
        name: "description",
        content:
          "Track internships, job drives and full-time roles, and manage your applications.",
      },
      {
        property: "og:title",
        content: "Placements & Internships — CampusConnect",
      },
      {
        property: "og:description",
        content:
          "Campus placement listings with eligibility, deadlines and application tracking.",
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
  component: PlacementsPage,
});
const tabs = [
  "All",
  "Internship",
  "Full-time",
  "Job Drive",
  "Applied",
  "Saved",
];
function PlacementsPage() {
  const { appliedJobs, applyJob, savedJobs, toggleSavedJob } = useCampus();
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const list = useMemo(
    () =>
      placements.filter((p) => {
        const q = query.trim().toLowerCase();
        if (
          q &&
          !`${p.role} ${p.company} ${p.skills.join(" ")}`
            .toLowerCase()
            .includes(q)
        )
          return false;
        if (tab === "Applied") return appliedJobs.includes(p.id);
        if (tab === "Saved") return savedJobs.includes(p.id);
        if (tab !== "All") return p.type === tab;
        return true;
      }),
    [tab, query, appliedJobs, savedJobs],
  );
  return (
    <AppShell
      title="Placements & Internships"
      subtitle="Opportunities from the campus placement cell."
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Open opportunities",
              value: placements.length,
              icon: Briefcase,
            },
            {
              label: "Applications sent",
              value: appliedJobs.length,
              icon: BadgeCheck,
            },
            {
              label: "Saved for later",
              value: savedJobs.length,
              icon: Bookmark,
            },
          ].map((s) => (
            <GlassCard key={s.label}>
              <s.icon className="size-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-extrabold">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles, companies or skills"
              className="rounded-xl bg-card/70 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                  tab === t
                    ? "bg-gradient-brand text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-card/70 text-muted-foreground hover:bg-accent/60",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((p) => {
            const applied = appliedJobs.includes(p.id);
            const saved = savedJobs.includes(p.id);
            return (
              <GlassCard key={p.id} className="flex h-full flex-col">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-xl">
                    {p.logo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.role}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.company}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => toggleSavedJob(p.id)}
                    aria-label="Save"
                  >
                    <Bookmark
                      className={cn(
                        "size-4",
                        saved && "fill-primary text-primary",
                      )}
                    />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-lg">
                    {p.type}
                  </Badge>
                  <Badge variant="outline" className="gap-1 rounded-lg">
                    <MapPin className="size-3" /> {p.location}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg">
                    {p.stipend}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>Eligibility: {p.eligibility}</p>
                  <p className="flex items-center gap-1.5">
                    <CalendarClock className="size-3.5" /> Apply before{" "}
                    {p.deadline}
                  </p>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-card/60"
                    onClick={() => setActive(p)}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl"
                    disabled={applied}
                    onClick={() => {
                      applyJob(p.id);
                      toast.success(`Application sent to ${p.company}`);
                    }}
                  >
                    {applied ? "Applied" : "Apply now"}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
          {list.length === 0 && (
            <GlassCard className="text-sm text-muted-foreground lg:col-span-2">
              Nothing here yet.
            </GlassCard>
          )}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-6">{active?.role}</DialogTitle>
            <DialogDescription>
              {active?.company} · {active?.location}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{active?.description}</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-semibold">Compensation:</span>{" "}
              {active?.stipend}
            </p>
            <p>
              <span className="font-semibold">Eligibility:</span>{" "}
              {active?.eligibility}
            </p>
            <p>
              <span className="font-semibold">Deadline:</span>{" "}
              {active?.deadline}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {active?.skills.map((s) => (
              <Badge key={s} variant="secondary" className="rounded-lg">
                {s}
              </Badge>
            ))}
          </div>
          <DialogFooter>
            <Button
              className="rounded-xl"
              disabled={!!active && appliedJobs.includes(active.id)}
              onClick={() => {
                if (active) {
                  applyJob(active.id);
                  toast.success(`Application sent to ${active.company}`);
                  setActive(null);
                }
              }}
            >
              {active && appliedJobs.includes(active.id)
                ? "Already applied"
                : "Apply now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "../lib/api-config.js";

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

const API_URL = `${API_BASE_URL}/api/placements`;

const tabs = [
  "All",
  "Internship",
  "Full-time",
  "Job Drive",
  "Applied",
  "Saved",
];

function formatDeadline(value) {
  if (!value) return "TBC";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PlacementsPage() {
  const [placements, setPlacements] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingApplyId, setPendingApplyId] = useState(null);
  const [pendingSaveId, setPendingSaveId] = useState(null);

  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetchPlacements();
    fetchMyApplications();
    fetchMySaved();
  }, []);

  const getToken = () => localStorage.getItem("campusconnect_token");

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load placements.");
        return;
      }

      setPlacements(data.placements || []);
    } catch (err) {
      console.error("Placements fetch error:", err);
      setError("Cannot connect to backend. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setAppliedIds((data.placements || []).map((p) => p._id));
      }
    } catch (err) {
      console.error("My applications fetch error:", err);
    }
  };

  const fetchMySaved = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/my-saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setSavedIds((data.placements || []).map((p) => p._id));
      }
    } catch (err) {
      console.error("My saved placements fetch error:", err);
    }
  };

  const handleApply = async (placement) => {
    const token = getToken();

    if (!token) {
      toast.error("Please login to apply.");
      return;
    }

    try {
      setPendingApplyId(placement._id);

      const response = await fetch(`${API_URL}/${placement._id}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Unable to submit application");
        return;
      }

      setAppliedIds((prev) => [...prev, placement._id]);

      setPlacements((prev) =>
        prev.map((p) =>
          p._id === placement._id
            ? { ...p, applicantCount: data.applicantCount ?? (p.applicantCount || 0) + 1 }
            : p
        )
      );

      toast.success(`Application sent to ${placement.company}`);
      setActive(null);
    } catch (err) {
      console.error("Apply error:", err);
      toast.error("Cannot connect to backend.");
    } finally {
      setPendingApplyId(null);
    }
  };

  const handleToggleSave = async (placement) => {
    const token = getToken();

    if (!token) {
      toast.error("Please login to save opportunities.");
      return;
    }

    const isSaved = savedIds.includes(placement._id);

    try {
      setPendingSaveId(placement._id);

      const response = await fetch(`${API_URL}/${placement._id}/save`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Unable to update saved status");
        return;
      }

      setSavedIds((prev) =>
        isSaved
          ? prev.filter((id) => id !== placement._id)
          : [...prev, placement._id]
      );
    } catch (err) {
      console.error("Save toggle error:", err);
      toast.error("Cannot connect to backend.");
    } finally {
      setPendingSaveId(null);
    }
  };

  const list = useMemo(
    () =>
      placements.filter((p) => {
        const q = query.trim().toLowerCase();

        if (
          q &&
          !`${p.role} ${p.company} ${(p.skills || []).join(" ")}`
            .toLowerCase()
            .includes(q)
        )
          return false;

        if (tab === "Applied") return appliedIds.includes(p._id);
        if (tab === "Saved") return savedIds.includes(p._id);
        if (tab !== "All") return p.type === tab;

        return true;
      }),
    [placements, tab, query, appliedIds, savedIds]
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
              value: placements.filter((p) => p.status !== "Closed").length,
              icon: Briefcase,
            },
            {
              label: "Applications sent",
              value: appliedIds.length,
              icon: BadgeCheck,
            },
            {
              label: "Saved for later",
              value: savedIds.length,
              icon: Bookmark,
            },
          ].map((s) => (
            <GlassCard key={s.label}>
              <s.icon className="size-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-extrabold">
                {loading ? "—" : s.value}
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

        {loading && (
          <GlassCard className="text-center text-sm text-muted-foreground">
            Loading placements...
          </GlassCard>
        )}

        {error && (
          <GlassCard className="text-center text-sm text-red-500">
            {error}
          </GlassCard>
        )}

        {!loading && !error && (
          <div className="grid gap-4 lg:grid-cols-2">
            {list.map((p) => {
              const applied = appliedIds.includes(p._id);
              const saved = savedIds.includes(p._id);
              const closed = p.status === "Closed";
              const deadlinePassed = new Date(p.deadline) < new Date();
              const canApply = !applied && !closed && !deadlinePassed;

              return (
                <GlassCard key={p._id} className="flex h-full flex-col">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-xl">
                      {p.logo || "💼"}
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
                      disabled={pendingSaveId === p._id}
                      onClick={() => handleToggleSave(p)}
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
                    {p.location && (
                      <Badge variant="outline" className="gap-1 rounded-lg">
                        <MapPin className="size-3" /> {p.location}
                      </Badge>
                    )}
                    {p.stipend && (
                      <Badge variant="outline" className="rounded-lg">
                        {p.stipend}
                      </Badge>
                    )}
                    {closed && (
                      <Badge variant="outline" className="rounded-lg text-red-500">
                        Closed
                      </Badge>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {p.eligibility && <p>Eligibility: {p.eligibility}</p>}
                    <p className="flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" /> Apply before{" "}
                      {formatDeadline(p.deadline)}
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
                      disabled={!canApply || pendingApplyId === p._id}
                      onClick={() => handleApply(p)}
                    >
                      {applied
                        ? "Applied"
                        : closed || deadlinePassed
                          ? "Closed"
                          : pendingApplyId === p._id
                            ? "Applying..."
                            : "Apply now"}
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
        )}
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
              {active?.stipend || "Not specified"}
            </p>
            <p>
              <span className="font-semibold">Eligibility:</span>{" "}
              {active?.eligibility || "Not specified"}
            </p>
            <p>
              <span className="font-semibold">Deadline:</span>{" "}
              {active ? formatDeadline(active.deadline) : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(active?.skills || []).map((s) => (
              <Badge key={s} variant="secondary" className="rounded-lg">
                {s}
              </Badge>
            ))}
          </div>
          <DialogFooter>
            <Button
              className="rounded-xl"
              disabled={
                !!active &&
                (appliedIds.includes(active._id) ||
                  active.status === "Closed" ||
                  new Date(active.deadline) < new Date() ||
                  pendingApplyId === active._id)
              }
              onClick={() => {
                if (active) handleApply(active);
              }}
            >
              {active && appliedIds.includes(active._id)
                ? "Already applied"
                : active &&
                    (active.status === "Closed" ||
                      new Date(active.deadline) < new Date())
                  ? "Closed"
                  : pendingApplyId === active?._id
                    ? "Applying..."
                    : "Apply now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

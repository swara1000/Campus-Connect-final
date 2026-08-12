import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Radio,
  Video,
  MapPin,
  Clock,
  Check,
  X,
  MessageSquare,
  Plus,
} from "lucide-react";
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
import { learningRequests as seed, subjects } from "@/lib/learning-data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/peer-learning")({
  head: () => ({
    meta: [
      {
        title: "Peer Learning — CampusConnect",
      },
      {
        name: "description",
        content:
          "Broadcast learning requests, accept peer sessions and start a private chat instantly.",
      },
      {
        property: "og:title",
        content: "Peer Learning — CampusConnect",
      },
      {
        property: "og:description",
        content: "Match with peers by subject, topic and preferred study mode.",
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
  component: PeerLearningPage,
});
const tabs = ["Incoming", "My requests", "Matches"];
function PeerLearningPage() {
  const { acceptedRequests, declinedRequests, acceptRequest, declineRequest } =
    useCampus();
  const navigate = useNavigate();
  const [items, setItems] = useState(seed);
  const [tab, setTab] = useState("Incoming");
  const [mode, setMode] = useState("All");
  const [subject, setSubject] = useState("All subjects");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subject: subjects[0],
    topic: "",
    description: "",
    preferredTime: "",
    mode: "Online",
  });
  const mine = items.filter((r) => r.student === "Aisha Rahman");
  const incoming = items.filter((r) => r.student !== "Aisha Rahman");
  const list = useMemo(() => {
    const base =
      tab === "My requests"
        ? mine
        : tab === "Matches"
          ? incoming.filter((r) => acceptedRequests.includes(r.id))
          : incoming;
    return base.filter((r) => {
      if (mode !== "All" && r.mode !== mode) return false;
      if (subject !== "All subjects" && r.subject !== subject) return false;
      return true;
    });
  }, [tab, mine, incoming, acceptedRequests, mode, subject]);
  const broadcast = () => {
    if (!form.topic.trim()) return;
    setItems((i) => [
      {
        id: `lr-${Date.now()}`,
        student: "Aisha Rahman",
        initials: "AR",
        subject: form.subject,
        topic: form.topic.trim(),
        description: form.description.trim() || "Looking for a study partner.",
        preferredTime: form.preferredTime || "Flexible",
        mode: form.mode,
        posted: "Just now",
        status: "open",
      },
      ...i,
    ]);
    setForm({
      subject: subjects[0],
      topic: "",
      description: "",
      preferredTime: "",
      mode: "Online",
    });
    setOpen(false);
    setTab("My requests");
    toast.success("Request broadcast to all students");
  };
  const onAccept = (r) => {
    acceptRequest(r.id);
    toast.success(`Matched with ${r.student} — opening private chat`);
    setTimeout(
      () =>
        navigate({
          to: "/chat",
        }),
      700,
    );
  };
  return (
    <AppShell
      title="Peer Learning"
      subtitle="Broadcast what you need help with — get matched with a peer."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-xl">
              <Plus className="size-4" />{" "}
              <span className="hidden sm:inline">New request</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a learning request</DialogTitle>
              <DialogDescription>
                Your request is broadcast to every student in the subject.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Subject</Label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subject: e.target.value,
                      })
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-card/70 px-3 text-sm"
                  >
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Mode</Label>
                  <select
                    value={form.mode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        mode: e.target.value,
                      })
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-card/70 px-3 text-sm"
                  >
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Topic</Label>
                <Input
                  value={form.topic}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      topic: e.target.value,
                    })
                  }
                  placeholder="e.g. Dynamic programming on trees"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">Preferred time</Label>
                <Input
                  value={form.preferredTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferredTime: e.target.value,
                    })
                  }
                  placeholder="e.g. Today, 18:00"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 rounded-xl"
                  placeholder="What exactly do you need help with?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="rounded-xl"
                onClick={broadcast}
                disabled={!form.topic.trim()}
              >
                Broadcast request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Open broadcasts",
              value: incoming.filter(
                (r) =>
                  !acceptedRequests.includes(r.id) &&
                  !declinedRequests.includes(r.id),
              ).length,
              icon: Radio,
            },
            {
              label: "Sessions matched",
              value: acceptedRequests.length,
              icon: Check,
            },
            {
              label: "My requests",
              value: mine.length,
              icon: MessageSquare,
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

        <GlassCard className="flex flex-wrap items-center gap-2">
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
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="h-8 rounded-xl border border-input bg-card/70 px-2 text-xs"
          >
            <option value="All">Any mode</option>
            <option>Online</option>
            <option>Offline</option>
          </select>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-8 rounded-xl border border-input bg-card/70 px-2 text-xs"
          >
            <option>All subjects</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </GlassCard>

        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((r) => {
            const accepted = acceptedRequests.includes(r.id);
            const declined = declinedRequests.includes(r.id);
            return (
              <GlassCard key={r.id} className="flex h-full flex-col">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xs font-bold text-primary-foreground">
                    {r.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {r.student}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.subject} · {r.posted}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 gap-1 rounded-lg"
                  >
                    {r.mode === "Online" ? (
                      <Video className="size-3" />
                    ) : (
                      <MapPin className="size-3" />
                    )}
                    {r.mode}
                  </Badge>
                </div>
                <p className="mt-3 font-semibold">{r.topic}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.description}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> {r.preferredTime}
                </p>
                <div className="mt-4 flex gap-2">
                  {r.student === "Aisha Rahman" ? (
                    <Badge variant="outline" className="rounded-lg">
                      Broadcasting…
                    </Badge>
                  ) : accepted ? (
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-xl"
                      onClick={() =>
                        navigate({
                          to: "/chat",
                        })
                      }
                    >
                      <MessageSquare className="size-3.5" /> Open chat
                    </Button>
                  ) : declined ? (
                    <Badge
                      variant="outline"
                      className="rounded-lg text-muted-foreground"
                    >
                      Declined
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5 rounded-xl"
                        onClick={() => onAccept(r)}
                      >
                        <Check className="size-3.5" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-xl bg-card/60"
                        onClick={() => declineRequest(r.id)}
                      >
                        <X className="size-3.5" /> Decline
                      </Button>
                    </>
                  )}
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
    </AppShell>
  );
}

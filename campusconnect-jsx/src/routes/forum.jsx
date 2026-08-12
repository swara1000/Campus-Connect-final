import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronUp,
  MessageSquare,
  Pin,
  Flame,
  Plus,
  Search,
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
import { forumQuestions as seed, subjects } from "@/lib/learning-data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/forum")({
  head: () => ({
    meta: [
      {
        title: "Discussion Forum — CampusConnect",
      },
      {
        name: "description",
        content:
          "Ask academic questions, answer peers and upvote the best explanations by subject.",
      },
      {
        property: "og:title",
        content: "Discussion Forum — CampusConnect",
      },
      {
        property: "og:description",
        content: "Subject-wise Q&A with upvoting and trending threads.",
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
  component: ForumPage,
});
function ForumPage() {
  const [items, setItems] = useState(seed);
  const [voted, setVoted] = useState([]);
  const [subject, setSubject] = useState("All subjects");
  const [sort, setSort] = useState("Trending");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [answer, setAnswer] = useState("");
  const [form, setForm] = useState({
    title: "",
    body: "",
    subject: subjects[0],
  });
  const list = useMemo(() => {
    let l = items.filter((q) => {
      const s = query.trim().toLowerCase();
      if (s && !`${q.title} ${q.body} ${q.subject}`.toLowerCase().includes(s))
        return false;
      return subject === "All subjects" || q.subject === subject;
    });
    if (sort === "Top voted") l = [...l].sort((a, b) => b.votes - a.votes);
    if (sort === "Trending")
      l = [...l].sort(
        (a, b) =>
          Number(!!b.trending) - Number(!!a.trending) || b.votes - a.votes,
      );
    return [...l].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  }, [items, query, subject, sort]);
  const vote = (id) => {
    if (voted.includes(id)) return;
    setVoted((v) => [...v, id]);
    setItems((i) =>
      i.map((q) =>
        q.id === id
          ? {
              ...q,
              votes: q.votes + 1,
            }
          : q,
      ),
    );
  };
  const ask = () => {
    if (!form.title.trim()) return;
    setItems((i) => [
      {
        id: `q-${Date.now()}`,
        title: form.title.trim(),
        body: form.body.trim(),
        subject: form.subject,
        author: "Aisha Rahman",
        initials: "AR",
        time: "Just now",
        votes: 0,
        answers: [],
      },
      ...i,
    ]);
    setForm({
      title: "",
      body: "",
      subject: subjects[0],
    });
    setOpen(false);
    toast.success("Question posted");
  };
  const postAnswer = () => {
    if (!active || !answer.trim()) return;
    const a = {
      id: `a-${Date.now()}`,
      author: "Aisha Rahman",
      initials: "AR",
      body: answer.trim(),
      votes: 0,
      time: "Just now",
    };
    setItems((i) =>
      i.map((q) =>
        q.id === active.id
          ? {
              ...q,
              answers: [...q.answers, a],
            }
          : q,
      ),
    );
    setActive((q) =>
      q
        ? {
            ...q,
            answers: [...q.answers, a],
          }
        : q,
    );
    setAnswer("");
  };
  return (
    <AppShell
      title="Discussion Forum"
      subtitle="Ask, answer and upvote — subject by subject."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-xl">
              <Plus className="size-4" />{" "}
              <span className="hidden sm:inline">Ask question</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ask the campus</DialogTitle>
              <DialogDescription>
                Be specific — questions with context get answered faster.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Question</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 rounded-xl"
                  placeholder="What are you stuck on?"
                />
              </div>
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
                <Label className="text-xs">Details</Label>
                <Textarea
                  rows={4}
                  value={form.body}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      body: e.target.value,
                    })
                  }
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="rounded-xl"
                onClick={ask}
                disabled={!form.title.trim()}
              >
                Post question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <GlassCard className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions"
                className="rounded-xl bg-card/70 pl-9"
              />
            </div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card/70 px-3 text-sm"
            >
              <option>All subjects</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card/70 px-3 text-sm"
            >
              <option>Trending</option>
              <option>Newest</option>
              <option>Top voted</option>
            </select>
          </GlassCard>

          {list.map((q) => (
            <GlassCard key={q.id}>
              <div className="flex gap-4">
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <button
                    onClick={() => vote(q.id)}
                    className={cn(
                      "grid size-10 place-items-center rounded-2xl border border-border/60 bg-card/70 transition-colors hover:bg-accent/60",
                      voted.includes(q.id) &&
                        "border-primary/40 bg-primary/10 text-primary",
                    )}
                    aria-label="Upvote"
                  >
                    <ChevronUp className="size-5" />
                  </button>
                  <span className="mt-1 text-sm font-bold">{q.votes}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-lg">
                      {q.subject}
                    </Badge>
                    {q.pinned && (
                      <Badge className="gap-1 rounded-lg">
                        <Pin className="size-3" /> Pinned
                      </Badge>
                    )}
                    {q.trending && (
                      <Badge variant="outline" className="gap-1 rounded-lg">
                        <Flame className="size-3" /> Trending
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setActive(q)}
                    className="mt-2 block text-left"
                  >
                    <p className="font-semibold hover:text-primary">
                      {q.title}
                    </p>
                  </button>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {q.body}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{q.author}</span>
                    <span>{q.time}</span>
                    <button
                      onClick={() => setActive(q)}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <MessageSquare className="size-3.5" /> {q.answers.length}{" "}
                      answers
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="space-y-4">
          <GlassCard>
            <h2 className="text-sm font-bold">Trending topics</h2>
            <div className="mt-3 space-y-2">
              {items
                .filter((q) => q.trending)
                .map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setActive(q)}
                    className="block w-full rounded-xl px-2 py-1.5 text-left text-sm hover:bg-accent/60"
                  >
                    <p className="truncate font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.votes} upvotes
                    </p>
                  </button>
                ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="text-sm font-bold">Browse by subject</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className="rounded-lg bg-card/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="pr-6">{active?.title}</DialogTitle>
            <DialogDescription>
              {active?.subject} · asked by {active?.author} · {active?.time}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{active?.body}</p>
          <div className="max-h-56 space-y-3 overflow-y-auto">
            {active?.answers.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-border/60 bg-card/70 p-3"
              >
                <p className="text-xs font-semibold">
                  {a.author} ·{" "}
                  <span className="font-normal text-muted-foreground">
                    {a.time} · {a.votes} upvotes
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </div>
            ))}
            {active?.answers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No answers yet — be the first.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write an answer"
              className="rounded-xl bg-card/70"
            />
            <Button
              className="rounded-xl"
              onClick={postAnswer}
              disabled={!answer.trim()}
            >
              Answer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

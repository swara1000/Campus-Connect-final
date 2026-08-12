import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkle,
  BookOpenCheck,
  ListChecks,
  Lightbulb,
  Library,
  Plus,
  Bot,
} from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { aiHistory, aiSuggestions } from "@/lib/learning-data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      {
        title: "AI Study Assistant — CampusConnect",
      },
      {
        name: "description",
        content:
          "Ask questions, summarise notes, generate quizzes and get study resource recommendations.",
      },
      {
        property: "og:title",
        content: "AI Study Assistant — CampusConnect",
      },
      {
        property: "og:description",
        content: "Your personal AI tutor for topics, summaries and quizzes.",
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
  component: AssistantPage,
});
const quickActions = [
  {
    label: "Explain Topic",
    icon: Lightbulb,
    prompt: "Explain this topic step by step: ",
  },
  {
    label: "Summarize Notes",
    icon: BookOpenCheck,
    prompt: "Summarise my notes on ",
  },
  {
    label: "Generate Quiz",
    icon: ListChecks,
    prompt: "Generate a 5-question quiz on ",
  },
  {
    label: "Recommend Resources",
    icon: Library,
    prompt: "Recommend study resources for ",
  },
];
function reply(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("quiz"))
    return "Here's a quick 5-question quiz:\n\n1. Define the core term in one sentence.\n2. Which property guarantees correctness here?\n3. State the time and space complexity.\n4. Give one real-world application.\n5. Describe a failure case and how to avoid it.\n\nAnswer them out loud first — recall beats rereading. Reply with your answers and I'll mark them.";
  if (p.includes("summar"))
    return "Summary in ten bullets:\n\n• Core definition and why it exists\n• Two key properties you must be able to state\n• The standard algorithm or procedure\n• Complexity and trade-offs\n• Typical exam framing of the concept\n• One worked example to memorise\n• The most common mistake students make\n• A closely related concept to contrast with\n• Where it shows up in previous year questions\n• A one-line mnemonic to retain it";
  if (p.includes("recommend") || p.includes("resource"))
    return "Recommended path:\n\n1. Start with the peer notes in Study Materials rated above 4.5.\n2. Do the previous year questions for the last three years.\n3. Book a peer learning session for the part that stays fuzzy.\n4. Finish with a self-quiz here 24 hours later for spaced repetition.";
  return "Great question. Think of it in three layers:\n\n1. Intuition — what problem does this solve, and what would break without it?\n2. Mechanics — the exact procedure, step by step, on a small example.\n3. Edges — where it fails, and the assumptions that keep it correct.\n\nWork through layer 2 on paper with a tiny input. If you'd like, I can turn that into a quiz to check retention.";
}
function AssistantPage() {
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [turns.length, thinking]);
  const send = (text) => {
    const body = text.trim();
    if (!body || thinking) return;
    setTurns((t) => [
      ...t,
      {
        id: `u${Date.now()}`,
        role: "user",
        body,
      },
    ]);
    setDraft("");
    setThinking(true);
    setTimeout(() => {
      setTurns((t) => [
        ...t,
        {
          id: `a${Date.now()}`,
          role: "assistant",
          body: reply(body),
        },
      ]);
      setThinking(false);
    }, 900);
  };
  return (
    <AppShell
      title="AI Study Assistant"
      subtitle="Explain, summarise, quiz and plan — in one place."
      action={
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 rounded-xl bg-card/60"
          onClick={() => setTurns([])}
        >
          <Plus className="size-4" />{" "}
          <span className="hidden sm:inline">New chat</span>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <GlassCard className="flex h-[72vh] flex-col p-0">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {turns.length === 0 && (
              <div className="mx-auto max-w-lg text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-gradient-brand text-primary-foreground shadow-lg shadow-primary/25">
                  <Bot className="size-7" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">
                  How can I help you study today?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask anything about your subjects, or start with a suggestion.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {aiSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-2xl border border-border/60 bg-card/70 p-3 text-left text-sm transition-colors hover:bg-accent/60"
                    >
                      <Sparkle className="mb-1.5 size-3.5 text-primary" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {turns.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "flex gap-3",
                  t.role === "user" && "flex-row-reverse",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                    t.role === "user"
                      ? "bg-gradient-brand text-primary-foreground"
                      : "border border-border/60 bg-card text-primary",
                  )}
                >
                  {t.role === "user" ? "AR" : <Bot className="size-4" />}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm",
                    t.role === "user"
                      ? "bg-gradient-brand text-primary-foreground"
                      : "border border-border/60 bg-card/80",
                  )}
                >
                  {t.body}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 animate-bounce rounded-full bg-primary" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/60 p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => setDraft(a.prompt)}
                  className="flex items-center gap-1.5 rounded-xl bg-card/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <a.icon className="size-3.5 text-primary" /> {a.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                rows={1}
                placeholder="Ask your study assistant anything…"
                className="min-h-11 resize-none rounded-2xl bg-card/70"
              />
              <Button
                size="icon"
                className="size-11 shrink-0 rounded-2xl"
                onClick={() => send(draft)}
                disabled={!draft.trim() || thinking}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h2 className="text-sm font-bold">Conversation history</h2>
            <div className="mt-3 space-y-1.5">
              {aiHistory.map((h) => (
                <button
                  key={h.id}
                  className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent/60"
                >
                  <p className="truncate text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{h.time}</p>
                </button>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="text-sm font-bold">Study context</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The assistant references your bookmarked notes and subjects.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Data Structures", "Machine Learning", "DBMS"].map((s) => (
                <Badge key={s} variant="secondary" className="rounded-lg">
                  {s}
                </Badge>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

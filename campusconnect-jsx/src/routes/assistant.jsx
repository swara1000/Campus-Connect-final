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

const API_URL = "http://localhost:5000/api/ai/chat";

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

function AssistantPage() {
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");

  const endRef = useRef(null);

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [turns.length, thinking]);

  /* =====================================================
     GET TOKEN
  ===================================================== */

  const getToken = () =>
    localStorage.getItem("campusconnect_token");

  /* =====================================================
     SEND MESSAGE TO REAL AI
  ===================================================== */

  const send = async (text) => {
    const body = text.trim();

    if (!body || thinking) {
      return;
    }

    setError("");

    const userMessage = {
      id: `u${Date.now()}`,
      role: "user",
      body,
    };

    setTurns((previous) => [
      ...previous,
      userMessage,
    ]);

    setDraft("");
    setThinking(true);

    try {
      const token = getToken();

      if (!token) {
        setError(
          "Login token not found. Please login again."
        );

        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          message: body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "AI assistant failed to respond"
        );
      }

      const assistantMessage = {
        id: `a${Date.now()}`,
        role: "assistant",
        body:
          data.reply ||
          "I could not generate a response.",
      };

      setTurns((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "AI assistant error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect to AI assistant."
      );

      setTurns((previous) => [
        ...previous,
        {
          id: `e${Date.now()}`,
          role: "assistant",
          body:
            "Sorry, I could not answer that right now. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  /* =====================================================
     NEW CHAT
  ===================================================== */

  const handleNewChat = () => {
    setTurns([]);
    setDraft("");
    setError("");
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
          onClick={handleNewChat}
        >
          <Plus className="size-4" />

          <span className="hidden sm:inline">
            New chat
          </span>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">

        {/* =================================================
            CHAT AREA
        ================================================= */}

        <GlassCard className="flex h-[72vh] flex-col p-0">

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">

            {/* EMPTY / WELCOME STATE */}

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

                  {aiSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() =>
                        send(suggestion)
                      }
                      className="rounded-2xl border border-border/60 bg-card/70 p-3 text-left text-sm transition-colors hover:bg-accent/60"
                    >
                      <Sparkle className="mb-1.5 size-3.5 text-primary" />

                      {suggestion}
                    </button>
                  ))}

                </div>
              </div>
            )}

            {/* CHAT MESSAGES */}

            {turns.map((turn) => (
              <div
                key={turn.id}
                className={cn(
                  "flex gap-3",

                  turn.role === "user" &&
                    "flex-row-reverse"
                )}
              >

                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold",

                    turn.role === "user"
                      ? "bg-gradient-brand text-primary-foreground"
                      : "border border-border/60 bg-card text-primary"
                  )}
                >
                  {turn.role === "user" ? (
                    "ST"
                  ) : (
                    <Bot className="size-4" />
                  )}
                </span>

                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm",

                    turn.role === "user"
                      ? "bg-gradient-brand text-primary-foreground"
                      : "border border-border/60 bg-card/80"
                  )}
                >
                  {turn.body}
                </div>
              </div>
            ))}

            {/* THINKING */}

            {thinking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">

                <span className="size-1.5 animate-bounce rounded-full bg-primary" />

                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />

                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />

                Thinking...
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div ref={endRef} />

          </div>

          {/* =================================================
              QUICK ACTIONS + INPUT
          ================================================= */}

          <div className="border-t border-border/60 p-3">

            <div className="mb-2 flex flex-wrap gap-2">

              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() =>
                    setDraft(
                      action.prompt
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-card/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <action.icon className="size-3.5 text-primary" />

                  {action.label}
                </button>
              ))}

            </div>

            <div className="flex items-end gap-2">

              <Textarea
                value={draft}
                onChange={(e) =>
                  setDraft(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();

                    send(draft);
                  }
                }}
                rows={1}
                placeholder="Ask your study assistant anything..."
                className="min-h-11 resize-none rounded-2xl bg-card/70"
              />

              <Button
                size="icon"
                className="size-11 shrink-0 rounded-2xl"
                onClick={() =>
                  send(draft)
                }
                disabled={
                  !draft.trim() ||
                  thinking
                }
              >
                <Send className="size-4" />
              </Button>

            </div>
          </div>

        </GlassCard>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <div className="space-y-4">

          <GlassCard>

            <h2 className="text-sm font-bold">
              Conversation history
            </h2>

            <div className="mt-3 space-y-1.5">

              {aiHistory.map((history) => (
                <button
                  key={history.id}
                  className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent/60"
                >
                  <p className="truncate text-sm font-medium">
                    {history.title}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {history.time}
                  </p>
                </button>
              ))}

            </div>

          </GlassCard>

          <GlassCard>

            <h2 className="text-sm font-bold">
              Study context
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Ask questions about subjects, generate quizzes, summaries and viva preparation.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">

              {[
                "Data Structures",
                "Machine Learning",
                "DBMS",
              ].map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="rounded-lg"
                >
                  {subject}
                </Badge>
              ))}

            </div>

          </GlassCard>

        </div>

      </div>
    </AppShell>
  );
}
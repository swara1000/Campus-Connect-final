import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Circle, Paperclip, Smile, Search } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { chatChannels, seedMessages } from "@/lib/campus-data";
import { useCampus } from "@/lib/campus-store";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      {
        title: "Campus Chat — CampusConnect",
      },
      {
        name: "description",
        content: "Real-time messaging with clubs, cohorts and project teams.",
      },
      {
        property: "og:title",
        content: "Campus Chat — CampusConnect",
      },
      {
        property: "og:description",
        content: "Instant messaging across clubs, cohorts and teams.",
      },
    ],
  }),
  component: ChatPage,
});
const replies = [
  "Noted — I'll add it to the sprint board.",
  "Works for me. See you there.",
  "Can you share the file when you get a moment?",
  "Confirmed with the venue, we're good.",
];
function ChatPage() {
  const { user } = useCampus();
  const [activeId, setActiveId] = useState(chatChannels[0].id);
  const [threads, setThreads] = useState(() => structuredClone(seedMessages));
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const active = chatChannels.find((c) => c.id === activeId);
  const messages = threads[activeId] ?? [];
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length, typing]);
  const send = () => {
    const body = draft.trim().slice(0, 500);
    if (!body) return;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setThreads((t) => ({
      ...t,
      [activeId]: [
        ...(t[activeId] ?? []),
        {
          id: `m${Date.now()}`,
          from: user?.name ?? "You",
          initials: user?.initials ?? "ST",
          body,
          time: now,
          me: true,
        },
      ],
    }));
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setThreads((t) => ({
        ...t,
        [activeId]: [
          ...(t[activeId] ?? []),
          {
            id: `m${Date.now()}r`,
            from: "Marcus Ortega",
            initials: "MO",
            body: replies[Math.floor(Math.random() * replies.length)],
            time: now,
          },
        ],
      }));
    }, 1600);
  };
  return (
    <AppShell
      title="Chat"
      subtitle="Live channels over Socket.IO"
      action={
        <Badge
          variant="secondary"
          className="hidden gap-1.5 rounded-lg sm:flex"
        >
          <Circle className="size-2 fill-[var(--success)] text-[var(--success)]" />{" "}
          Connected
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <GlassCard className="hidden p-3 lg:block">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search channels"
              className="rounded-xl bg-card/70 pl-9"
            />
          </div>
          <div className="space-y-1">
            {chatChannels.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-2.5 text-left transition-colors",
                  activeId === c.id
                    ? "bg-gradient-brand text-primary-foreground"
                    : "hover:bg-accent/60",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card/40 text-lg">
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {c.name}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-xs",
                      activeId === c.id
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.last}
                  </span>
                </span>
                {c.unread > 0 && activeId !== c.id && (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="flex h-[70vh] flex-col p-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                {active.emoji}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{active.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {typing ? "Marcus is typing…" : "12 members online"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 -space-x-2">
              {["MO", "LF", "YK"].map((i) => (
                <span
                  key={i}
                  className="grid size-7 place-items-center rounded-full border-2 border-card bg-gradient-brand text-[10px] font-bold text-primary-foreground"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex gap-3", m.me && "flex-row-reverse")}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-primary-foreground">
                  {m.initials}
                </span>
                <div
                  className={cn("max-w-[75%] min-w-0", m.me && "text-right")}
                >
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    {m.from} · {m.time}
                  </p>
                  <p
                    className={cn(
                      "inline-block rounded-2xl px-4 py-2.5 text-left text-sm",
                      m.me
                        ? "bg-gradient-brand text-primary-foreground"
                        : "border border-border/60 bg-card/80",
                    )}
                  >
                    {m.body}
                  </p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 animate-bounce rounded-full bg-primary" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/60 p-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
              >
                <Paperclip className="size-4" />
              </Button>
              <Input
                value={draft}
                maxLength={500}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Message ${active.name}`}
                className="rounded-xl bg-card/70"
              />
              <Button
                variant="ghost"
                size="icon"
                className="hidden shrink-0 text-muted-foreground sm:inline-flex"
              >
                <Smile className="size-4" />
              </Button>
              <Button
                size="icon"
                className="shrink-0 rounded-xl"
                onClick={send}
                disabled={!draft.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

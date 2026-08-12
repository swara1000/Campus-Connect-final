import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  ImagePlus,
  Send,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCampus } from "@/lib/campus-store";
import { posts as seedPosts } from "@/lib/campus-data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      {
        title: "Campus News Feed — CampusConnect",
      },
      {
        name: "description",
        content:
          "Real-time campus announcements, club updates and student posts.",
      },
      {
        property: "og:title",
        content: "Campus News Feed — CampusConnect",
      },
      {
        property: "og:description",
        content: "Announcements, club updates and student posts in one stream.",
      },
    ],
  }),
  component: FeedPage,
});
const filters = ["All", "Announcement", "Club", "Careers", "Facilities"];
function FeedPage() {
  const { user } = useCampus();
  const [items, setItems] = useState(seedPosts);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState("All");
  const [liked, setLiked] = useState([]);
  const publish = () => {
    const body = draft.trim().slice(0, 500);
    if (!body) return;
    setItems([
      {
        id: `p-${Date.now()}`,
        author: user?.name ?? "You",
        initials: user?.initials ?? "ST",
        handle: "@you",
        time: "now",
        body,
        tag: "Student",
        likes: 0,
        comments: 0,
      },
      ...items,
    ]);
    setDraft("");
    toast.success("Posted to the campus feed");
  };
  const visible =
    active === "All" ? items : items.filter((p) => p.tag === active);
  return (
    <AppShell
      title="News Feed"
      subtitle="Everything the campus is talking about."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <GlassCard>
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
                {user?.initials ?? "ST"}
              </span>
              <div className="min-w-0 flex-1">
                <Textarea
                  value={draft}
                  maxLength={500}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Share an update with your campus…"
                  className="min-h-20 resize-none rounded-2xl border-border/60 bg-card/70"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={() =>
                      toast("Image upload coming with Cloud storage")
                    }
                  >
                    <ImagePlus className="size-4" /> Media
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={publish}
                    disabled={!draft.trim()}
                  >
                    <Send className="size-4" /> Post
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-4 shrink-0 text-muted-foreground" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  active === f
                    ? "bg-gradient-brand text-primary-foreground"
                    : "glass-soft text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {visible.map((p) => {
            const isLiked = liked.includes(p.id);
            return (
              <GlassCard key={p.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
                      {p.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.author}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.handle} · {p.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 rounded-lg">
                    {p.tag}
                  </Badge>
                </div>
                <p className="mt-4 text-sm leading-relaxed">{p.body}</p>
                <div className="mt-4 flex items-center gap-1 border-t border-border/60 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("gap-2", isLiked && "text-primary")}
                    onClick={() =>
                      setLiked((l) =>
                        isLiked ? l.filter((x) => x !== p.id) : [...l, p.id],
                      )
                    }
                  >
                    <Heart
                      className={cn("size-4", isLiked && "fill-current")}
                    />{" "}
                    {p.likes + (isLiked ? 1 : 0)}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                  >
                    <MessageCircle className="size-4" /> {p.comments}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={() => toast("Link copied")}
                  >
                    <Share2 className="size-4" /> Share
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <aside className="hidden space-y-4 xl:block">
          <GlassCard>
            <h2 className="mb-3 text-base font-bold">Trending on campus</h2>
            <div className="space-y-3">
              {[
                {
                  tag: "#AutumnHackathon",
                  count: "482 posts",
                },
                {
                  tag: "#DebateFinal",
                  count: "311 posts",
                },
                {
                  tag: "#WellnessWeek",
                  count: "205 posts",
                },
                {
                  tag: "#CareerFair26",
                  count: "178 posts",
                },
              ].map((t) => (
                <div key={t.tag} className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    {t.tag}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.count}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="mb-3 text-base font-bold">Community guidelines</h2>
            <p className="text-sm text-muted-foreground">
              Posts are moderated by Student Affairs. Keep it respectful, credit
              sources and avoid sharing personal contact details publicly.
            </p>
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}

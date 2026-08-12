import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Users, Crown, ArrowLeft, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clubs, events } from "@/lib/campus-data";
import { useCampus } from "@/lib/campus-store";
export const Route = createFileRoute("/clubs/$clubId")({
  loader: ({ params }) => {
    const club = clubs.find((c) => c.id === params.clubId);
    if (!club) throw notFound();
    return {
      club,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          {
            title: "Club unavailable — CampusConnect",
          },
          {
            name: "robots",
            content: "noindex",
          },
        ],
      };
    }
    const { club } = loaderData;
    return {
      meta: [
        {
          title: `${club.name} — CampusConnect`,
        },
        {
          name: "description",
          content: club.blurb,
        },
        {
          property: "og:title",
          content: `${club.name} — CampusConnect`,
        },
        {
          property: "og:description",
          content: club.blurb,
        },
      ],
    };
  },
  component: ClubDetails,
});
const roster = [
  {
    name: "Marcus Ortega",
    role: "President",
    initials: "MO",
  },
  {
    name: "Lena Fischer",
    role: "Vice President",
    initials: "LF",
  },
  {
    name: "Yusuf Karim",
    role: "Tech Lead",
    initials: "YK",
  },
  {
    name: "Priya Nair",
    role: "Events",
    initials: "PN",
  },
  {
    name: "Tom Weaver",
    role: "Treasurer",
    initials: "TW",
  },
  {
    name: "Hannah Boateng",
    role: "Outreach",
    initials: "HB",
  },
];
function ClubDetails() {
  const { club } = Route.useLoaderData();
  const { joinedClubs, toggleClub } = useCampus();
  const joined = joinedClubs.includes(club.id);
  const clubEvents = events.filter((e) =>
    e.club.includes(club.name.split(" ")[0]),
  );
  return (
    <AppShell
      title={club.name}
      subtitle={`${club.category} · ${club.members} members`}
      action={
        <Link to="/clubs">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />{" "}
            <span className="hidden sm:inline">All clubs</span>
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <GlassCard className="overflow-hidden p-0">
            <div className="h-28 bg-gradient-brand" />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 p-5">
              <div className="flex min-w-0 items-end gap-4">
                <span className="-mt-14 grid size-20 shrink-0 place-items-center rounded-3xl border-4 border-card bg-secondary text-4xl">
                  {club.emoji}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-bold">
                    {club.name}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {club.blurb}
                  </p>
                </div>
              </div>
              <Button
                className="shrink-0 rounded-xl"
                variant={joined ? "secondary" : "default"}
                onClick={() => {
                  toggleClub(club.id);
                  toast(joined ? `Left ${club.name}` : `Joined ${club.name}`);
                }}
              >
                {joined ? "Member" : "Join club"}
              </Button>
            </div>
          </GlassCard>

          <Tabs defaultValue="about">
            <TabsList className="rounded-xl">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-4">
              <GlassCard>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {club.about}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Members",
                      value: club.members,
                    },
                    {
                      label: "Events run",
                      value: 14,
                    },
                    {
                      label: "Founded",
                      value: 2011,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-border/60 bg-card/70 p-4"
                    >
                      <p className="font-display text-2xl font-extrabold">
                        {s.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>
            <TabsContent value="events" className="mt-4 space-y-3">
              {(clubEvents.length ? clubEvents : events.slice(0, 2)).map(
                (e) => (
                  <Link
                    key={e.id}
                    to="/events/$eventId"
                    params={{
                      eventId: e.id,
                    }}
                  >
                    <GlassCard className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 transition-colors hover:bg-accent/40">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{e.title}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {e.date} · {e.venue}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-lg"
                      >
                        {e.category}
                      </Badge>
                    </GlassCard>
                  </Link>
                ),
              )}
            </TabsContent>
            <TabsContent value="members" className="mt-4">
              <GlassCard>
                <div className="grid gap-3 sm:grid-cols-2">
                  {roster.map((m) => (
                    <div
                      key={m.name}
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                        {m.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {m.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <GlassCard>
            <h3 className="flex items-center gap-2 text-base font-bold">
              <Crown className="size-4 text-primary" /> Club lead
            </h3>
            <p className="mt-2 text-sm font-semibold">{club.lead}</p>
            <p className="text-xs text-muted-foreground">
              Contact via club channel
            </p>
            <Link to="/chat">
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-2 rounded-xl bg-card/60"
              >
                <MessagesSquare className="size-4" /> Open club chat
              </Button>
            </Link>
          </GlassCard>
          <GlassCard>
            <h3 className="flex items-center gap-2 text-base font-bold">
              <Users className="size-4 text-primary" /> Membership
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Open to all enrolled students. New members are onboarded at the
              start of each month.
            </p>
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}

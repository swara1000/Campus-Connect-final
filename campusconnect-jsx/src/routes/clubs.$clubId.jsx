import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  Crown,
  ArrowLeft,
  MessagesSquare,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { API_BASE_URL } from "../lib/api-config.js";

const CLUB_API =
  `${API_BASE_URL}/api/clubs`;

const EVENT_API =
  `${API_BASE_URL}/api/events`;

export const Route =
  createFileRoute("/clubs/$clubId")({
    loader: async ({ params }) => {
      const response = await fetch(
        `${CLUB_API}/${params.clubId}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Club not found"
        );
      }

      const backendClub =
        data.club;

      const club = {
        id:
          backendClub._id,

        name:
          backendClub.name,

        category:
          backendClub.category ||
          "General",

        members:
          backendClub.membersCount ||
          0,

        lead:
          backendClub.president ||
          "Not assigned",

        blurb:
          backendClub.description ||
          "Campus student club",

        about:
          backendClub.description ||
          "More information about this club will be added soon.",

        status:
          backendClub.status ||
          "Active",

        emoji:
          getClubEmoji(
            backendClub.category
          ),

        createdAt:
          backendClub.createdAt,
      };

      return {
        club,
      };
    },

    head: ({ loaderData }) => {
      if (!loaderData) {
        return {
          meta: [
            {
              title:
                "Club unavailable — CampusConnect",
            },
          ],
        };
      }

      const { club } =
        loaderData;

      return {
        meta: [
          {
            title: `${club.name} — CampusConnect`,
          },
          {
            name: "description",
            content:
              club.blurb,
          },
        ],
      };
    },

    component: ClubDetails,
  });

function ClubDetails() {
  const { club } =
    Route.useLoaderData();

  const [
    joined,
    setJoined,
  ] = useState(false);

  const [
    membersCount,
    setMembersCount,
  ] = useState(
    club.members
  );

  const [
    clubEvents,
    setClubEvents,
  ] = useState([]);

  const [
    checkingMembership,
    setCheckingMembership,
  ] = useState(true);

  useEffect(() => {
    checkMembershipStatus();
    fetchClubEvents();
  }, [club.id]);

  const checkMembershipStatus =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "campusconnect_token"
          );

        if (!token) {
          setCheckingMembership(
            false
          );
          return;
        }

        const response =
          await fetch(
            `${CLUB_API}/${club.id}/membership-status`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (response.ok) {
          setJoined(
            Boolean(
              data.joined
            )
          );
        }
      } catch (error) {
        console.error(
          "Membership status error:",
          error
        );
      } finally {
        setCheckingMembership(
          false
        );
      }
    };

  const fetchClubEvents =
    async () => {
      try {
        const response =
          await fetch(
            EVENT_API
          );

        const data =
          await response.json();

        if (!response.ok) {
          return;
        }

        const events =
          (
            data.events || []
          )
            .filter(
              (event) =>
                event.club ===
                club.name
            )
            .map(
              (event) => ({
                id:
                  event._id,

                title:
                  event.name,

                date:
                  event.date,

                venue:
                  event.venue ||
                  "TBA",

                category:
                  event.category ||
                  "Campus",
              })
            );

        setClubEvents(
          events
        );
      } catch (error) {
        console.error(
          "Club events error:",
          error
        );
      }
    };

  const handleJoinClub =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "campusconnect_token"
          );

        if (!token) {
          toast.error(
            "Please login again."
          );
          return;
        }

        const response =
          await fetch(
            `${CLUB_API}/${club.id}/join`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          toast.error(
            data.message ||
              "Unable to join club"
          );
          return;
        }

        setJoined(true);

        setMembersCount(
          data.membersCount ??
            membersCount + 1
        );

        toast.success(
          `Joined ${club.name}`
        );
      } catch (error) {
        console.error(
          "Join club error:",
          error
        );

        toast.error(
          "Cannot connect to backend."
        );
      }
    };

  const handleLeaveClub =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "campusconnect_token"
          );

        if (!token) {
          toast.error(
            "Please login again."
          );
          return;
        }

        const response =
          await fetch(
            `${CLUB_API}/${club.id}/join`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          toast.error(
            data.message ||
              "Unable to leave club"
          );
          return;
        }

        setJoined(false);

        setMembersCount(
          data.membersCount ??
            Math.max(
              0,
              membersCount - 1
            )
        );

        toast.success(
          `Left ${club.name}`
        );
      } catch (error) {
        console.error(
          "Leave club error:",
          error
        );

        toast.error(
          "Cannot connect to backend."
        );
      }
    };

  const foundedYear =
    club.createdAt
      ? new Date(
          club.createdAt
        ).getFullYear()
      : "—";

  return (
    <AppShell
      title={club.name}
      subtitle={`${club.category} · ${membersCount} members`}
      action={
        <Link to="/clubs">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="size-4" />

            <span className="hidden sm:inline">
              All clubs
            </span>
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
                variant={
                  joined
                    ? "secondary"
                    : "default"
                }
                disabled={
                  checkingMembership
                }
                onClick={() => {
                  if (joined) {
                    handleLeaveClub();
                  } else {
                    handleJoinClub();
                  }
                }}
              >
                {checkingMembership
                  ? "Checking..."
                  : joined
                    ? "Member"
                    : "Join club"}
              </Button>
            </div>
          </GlassCard>

          <Tabs defaultValue="about">
            <TabsList className="rounded-xl">
              <TabsTrigger value="about">
                About
              </TabsTrigger>

              <TabsTrigger value="events">
                Events
              </TabsTrigger>

              <TabsTrigger value="members">
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="about"
              className="mt-4"
            >
              <GlassCard>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {club.about}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label:
                        "Members",
                      value:
                        membersCount,
                    },

                    {
                      label:
                        "Events run",
                      value:
                        clubEvents.length,
                    },

                    {
                      label:
                        "Founded",
                      value:
                        foundedYear,
                    },
                  ].map(
                    (item) => (
                      <div
                        key={
                          item.label
                        }
                        className="rounded-2xl border border-border/60 bg-card/70 p-4"
                      >
                        <p className="font-display text-2xl font-extrabold">
                          {
                            item.value
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            item.label
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent
              value="events"
              className="mt-4 space-y-3"
            >
              {clubEvents.length >
              0 ? (
                clubEvents.map(
                  (event) => (
                    <Link
                      key={
                        event.id
                      }
                      to="/events/$eventId"
                      params={{
                        eventId:
                          event.id,
                      }}
                    >
                      <GlassCard className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 transition-colors hover:bg-accent/40">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {
                              event.title
                            }
                          </p>

                          <p className="truncate text-sm text-muted-foreground">
                            {
                              event.date
                            }{" "}
                            ·{" "}
                            {
                              event.venue
                            }
                          </p>
                        </div>

                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-lg"
                        >
                          {
                            event.category
                          }
                        </Badge>
                      </GlassCard>
                    </Link>
                  )
                )
              ) : (
                <GlassCard className="text-sm text-muted-foreground">
                  No events scheduled for this club.
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent
              value="members"
              className="mt-4"
            >
              <GlassCard>
                <div className="text-sm text-muted-foreground">
                  {membersCount} students are currently members of this club.
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <GlassCard>
            <h3 className="flex items-center gap-2 text-base font-bold">
              <Crown className="size-4 text-primary" />

              Club lead
            </h3>

            <p className="mt-2 text-sm font-semibold">
              {club.lead}
            </p>

            <p className="text-xs text-muted-foreground">
              Contact via club channel
            </p>

            <Link to="/chat">
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-2 rounded-xl bg-card/60"
              >
                <MessagesSquare className="size-4" />

                Open club chat
              </Button>
            </Link>
          </GlassCard>

          <GlassCard>
            <h3 className="flex items-center gap-2 text-base font-bold">
              <Users className="size-4 text-primary" />

              Membership
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Open to all enrolled students. New members are onboarded at the start of each month.
            </p>
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}

function getClubEmoji(category) {
  switch (category) {
    case "Tech":
    case "Engineering":
      return "💻";

    case "Arts":
      return "🎨";

    case "Business":
      return "💼";

    case "Community":
      return "🤝";

    case "Academic":
      return "📚";

    default:
      return "🏫";
  }
}
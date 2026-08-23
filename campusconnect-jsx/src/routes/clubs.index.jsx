import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Search,
  Users,
  LogOut,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { useCampus } from "@/lib/campus-store";

import { cn } from "@/lib/utils";

import { API_BASE_URL } from "../lib/api-config.js";

const CLUB_API = `${API_BASE_URL}/api/clubs`;

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
      return "🏛️";
  }
}

/* =====================================================
   ROUTE
===================================================== */

export const Route = createFileRoute(
  "/clubs/"
)({
  head: () => ({
    meta: [
      {
        title:
          "Campus Clubs — CampusConnect",
      },
      {
        name: "description",
        content:
          "Discover and join student societies across engineering, arts, business and community.",
      },
      {
        property: "og:title",
        content:
          "Campus Clubs — CampusConnect",
      },
      {
        property: "og:description",
        content:
          "Discover and join student societies on campus.",
      },
    ],
  }),

  component: ClubsPage,
});

/* =====================================================
   CATEGORIES
===================================================== */

const cats = [
  "All",
  "Engineering",
  "Academic",
  "Arts",
  "Business",
  "Community",
];

/* =====================================================
   PAGE
===================================================== */

function ClubsPage() {
  const {
    joinedClubs,
    toggleClub,
  } = useCampus();

  const [q, setQ] =
    useState("");

  const [cat, setCat] =
    useState("All");

  const [clubs, setClubs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     FETCH CLUBS
  ===================================================== */

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(CLUB_API);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load clubs.");
          return;
        }

        const formattedClubs = (data.clubs || []).map((club) => ({
          id: club._id,
          name: club.name,
          category: club.category || "General",
          members: club.membersCount || 0,
          lead: club.president || "Not assigned",
          blurb: club.description || "Campus student club",
          status: club.status || "Active",
          emoji: getClubEmoji(club.category),
        }));

        setClubs(formattedClubs);
      } catch (err) {
        console.error("Clubs fetch error:", err);
        setError("Cannot connect to backend. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  /* =====================================================
     FILTER CLUBS
  ===================================================== */

  const list =
    clubs.filter(
      (club) =>
        (cat === "All" ||
          club.category === cat) &&
        club.name
          .toLowerCase()
          .includes(
            q.toLowerCase()
          ),
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <AppShell
      title="Clubs"
      subtitle={`${clubs.length} societies currently recruiting`}
    >
      <div className="space-y-6">

        {/* =================================================
            SEARCH + CATEGORIES
        ================================================= */}

        <GlassCard className="grid gap-3 md:grid-cols-[minmax(0,22rem)_1fr] md:items-center">

          {/* SEARCH */}

          <div className="relative min-w-0">

            <Search
              className="
                absolute
                left-3
                top-1/2
                size-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <Input
              value={q}
              maxLength={80}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Search clubs"
              className="
                rounded-xl
                bg-card/70
                pl-9
              "
            />

          </div>

          {/* CATEGORIES */}

          <div className="flex flex-wrap gap-2">

            {cats.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setCat(category)
                }
                className={cn(
                  `
                  rounded-full
                  px-3.5
                  py-1.5
                  text-xs
                  font-semibold
                  transition-colors
                  `,

                  cat === category
                    ? `
                      bg-gradient-brand
                      text-primary-foreground
                    `
                    : `
                      border
                      border-border
                      bg-card/60
                      text-muted-foreground
                      hover:text-foreground
                    `,
                )}
              >
                {category}
              </button>
            ))}

          </div>

        </GlassCard>

        {loading && (
          <GlassCard className="text-center text-sm text-muted-foreground">
            Loading clubs...
          </GlassCard>
        )}

        {error && (
          <GlassCard className="text-center text-sm text-red-500">
            {error}
          </GlassCard>
        )}

        {/* =================================================
            CLUB CARDS
        ================================================= */}

        {!loading && !error && (
        <div
          className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {list.map((club) => {

            const joined =
              joinedClubs.includes(
                club.id
              );

            return (
              <GlassCard
                key={club.id}
                className="flex flex-col"
              >

                {/* =================================================
                    CLUB HEADER
                ================================================= */}

                <div
                  className="
                    grid
                    grid-cols-[minmax(0,1fr)_auto]
                    items-start
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >

                    <span
                      className="
                        grid
                        size-12
                        shrink-0
                        place-items-center
                        rounded-2xl
                        bg-secondary
                        text-2xl
                      "
                    >
                      {club.emoji}
                    </span>

                    <div className="min-w-0">

                      <h2
                        className="
                          truncate
                          font-display
                          text-base
                          font-bold
                        "
                      >
                        {club.name}
                      </h2>

                      <p
                        className="
                          truncate
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Lead: {club.lead}
                      </p>

                    </div>

                  </div>

                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-lg"
                  >
                    {club.category}
                  </Badge>

                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <p
                  className="
                    mt-4
                    flex-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  {club.blurb}
                </p>

                {/* =================================================
                    MEMBER COUNT
                ================================================= */}

                <p
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    text-xs
                    text-muted-foreground
                  "
                >
                  <Users className="size-3.5 shrink-0" />

                  {club.members} members
                </p>

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="mt-4 grid grid-cols-2 gap-2">

                  {/* DETAILS */}

                  <Link
                    to="/clubs/$clubId"
                    params={{
                      clubId: club.id,
                    }}
                  >
                    <Button
                      variant="outline"
                      className="
                        w-full
                        rounded-xl
                        bg-card/60
                      "
                    >
                      Details
                    </Button>
                  </Link>

                  {/* =================================================
                      JOIN / LEAVE
                  ================================================= */}

                  {joined ? (
                    <Button
                      type="button"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-red-500
                        bg-red-500
                        text-white

                        hover:border-red-600
                        hover:bg-red-600
                        hover:text-white

                        focus-visible:ring-red-500
                      "
                      onClick={() => {
                        toggleClub(
                          club.id
                        );

                        toast.success(
                          `Left ${club.name}`
                        );
                      }}
                    >
                      <LogOut className="mr-2 size-4" />

                      Leave
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="
                        w-full
                        rounded-xl
                      "
                      onClick={() => {
                        toggleClub(
                          club.id
                        );

                        toast.success(
                          `Joined ${club.name}`
                        );
                      }}
                    >
                      Join
                    </Button>
                  )}

                </div>

              </GlassCard>
            );
          })}

        </div>
        )}

        {/* =================================================
            NO RESULTS
        ================================================= */}

        {!loading && !error && list.length === 0 && (
          <GlassCard className="py-12 text-center">

            <Search className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm font-semibold">
              No clubs found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Try another search or category.
            </p>

          </GlassCard>
        )}

      </div>
    </AppShell>
  );
}
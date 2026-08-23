import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, MapPin, Clock, CalendarDays } from "lucide-react";

import { AppShell, GlassCard } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useCampus } from "@/lib/campus-store";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "../lib/api-config.js";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      {
        title: "Campus Events — CampusConnect",
      },
      {
        name: "description",
        content:
          "Browse hackathons, debates, workshops and wellbeing sessions across campus.",
      },
      {
        property: "og:title",
        content: "Campus Events — CampusConnect",
      },
      {
        property: "og:description",
        content: "Find and register for upcoming university events.",
      },
    ],
  }),
  component: EventsPage,
});

const API_URL = `${API_BASE_URL}/api/events`;

const categories = [
  "All",
  "Tech",
  "Culture",
  "Arts",
  "Careers",
  "Wellbeing",
  "Campus",
];

function EventsPage() {
  const { registered } = useCampus();

  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load events."
        );
        return;
      }

      const formattedEvents = (data.events || []).map(
        (event) => ({
          id: event._id,

          title: event.name,

          club:
            event.club || "Student Affairs",

          date: event.date,

          time: event.time || "TBC",

          venue:
            event.venue || "To be announced",

          category:
            event.category || "Campus",

          seats:
            event.regCap || 100,

          taken:
            event.regCount || 0,

          summary:
            event.desc || "Campus event",

          status:
            event.status || "Upcoming",
        })
      );

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Student events fetch error:", error);

      setError(
        "Cannot connect to backend. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const list = events.filter((event) => {
    const categoryMatch =
      cat === "All" ||
      event.category === cat;

    const search = q.toLowerCase();

    const searchMatch =
      event.title
        .toLowerCase()
        .includes(search) ||
      event.club
        .toLowerCase()
        .includes(search);

    return categoryMatch && searchMatch;
  });

  return (
    <AppShell
      title="Events"
      subtitle={`${events.length} events scheduled`}
    >
      <div className="space-y-6">

        <GlassCard className="grid gap-3 md:grid-cols-[minmax(0,22rem)_1fr] md:items-center">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={q}
              maxLength={80}
              onChange={(event) =>
                setQ(event.target.value)
              }
              placeholder="Search events or clubs"
              className="rounded-xl bg-card/70 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setCat(category)
                }
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",

                  cat === category
                    ? "bg-gradient-brand text-primary-foreground"
                    : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </GlassCard>

        {loading && (
          <GlassCard className="text-center text-sm text-muted-foreground">
            Loading events...
          </GlassCard>
        )}

        {error && (
          <GlassCard className="text-center text-sm text-red-500">
            {error}
          </GlassCard>
        )}

        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((event) => (
              <GlassCard
                key={event.id}
                className="flex flex-col"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold">
                      {event.title}
                    </h2>

                    <p className="truncate text-sm text-muted-foreground">
                      {event.club}
                    </p>
                  </div>

                  <Badge
                    className="shrink-0 rounded-lg"
                    variant="secondary"
                  >
                    {event.category}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {event.summary}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-3.5 shrink-0" />
                    {event.date}
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock className="size-3.5 shrink-0" />
                    {event.time}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0" />

                    <span className="truncate">
                      {event.venue}
                    </span>
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {event.taken} registered
                    </span>

                    <span>
                      {Math.max(
                        0,
                        event.seats - event.taken
                      )}{" "}
                      left
                    </span>
                  </div>

                  <Progress
                    value={
                      event.seats
                        ? (event.taken /
                            event.seats) *
                          100
                        : 0
                    }
                    className="mt-1.5 h-1.5"
                  />
                </div>

                <Link
                  to="/events/$eventId"
                  params={{
                    eventId: event.id,
                  }}
                  className="mt-5"
                >
                  <Button
                    className="w-full rounded-xl"
                    variant={
                      registered.includes(
                        event.id
                      )
                        ? "outline"
                        : "default"
                    }
                  >
                    {registered.includes(
                      event.id
                    )
                      ? "View your ticket"
                      : "View details"}
                  </Button>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          list.length === 0 && (
            <GlassCard className="text-center text-sm text-muted-foreground">
              No events match that search.
            </GlassCard>
          )}
      </div>
    </AppShell>
  );
}
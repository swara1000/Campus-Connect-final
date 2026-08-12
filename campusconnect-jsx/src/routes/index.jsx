import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  CalendarDays,
  MessagesSquare,
  DoorOpen,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampus } from "@/lib/campus-store";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "CampusConnect — One Platform for Campus Life",
      },
      {
        name: "description",
        content:
          "CampusConnect unifies events, clubs, real-time chat and room booking for students and administrators.",
      },
      {
        property: "og:title",
        content: "CampusConnect — One Platform for Campus Life",
      },
      {
        property: "og:description",
        content:
          "Events, clubs, real-time chat and room booking for your whole university.",
      },
    ],
  }),
  component: Splash,
});
const highlights = [
  {
    icon: CalendarDays,
    label: "Events & QR check-in",
  },
  {
    icon: Users,
    label: "Club management",
  },
  {
    icon: MessagesSquare,
    label: "Real-time chat",
  },
  {
    icon: DoorOpen,
    label: "Resource booking",
  },
];
function Splash() {
  const navigate = useNavigate();
  const { user, hydrated } = useCampus();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (ready && hydrated && user)
      navigate({
        to: "/dashboard",
      });
  }, [ready, hydrated, user, navigate]);
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
      <div className="relative w-full max-w-xl rounded-[2rem] glass px-8 py-12 animate-in fade-in zoom-in-95 duration-700">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-brand text-primary-foreground shadow-xl shadow-primary/30">
          <GraduationCap className="size-10" />
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">Campus</span>Connect
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          A unified platform for campus activities, clubs and student
          engagement.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-2 text-left">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5"
            >
              <h.icon className="size-4 shrink-0 text-primary" />
              <span className="truncate text-xs font-medium sm:text-sm">
                {h.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-brand transition-[width] duration-[1400ms] ease-out"
            style={{
              width: ready ? "100%" : "12%",
            }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link to="/login">
            <Button size="lg" className="w-full gap-2 rounded-xl sm:w-auto">
              Enter CampusConnect <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to="/register">
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl bg-card/60 sm:w-auto"
            >
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

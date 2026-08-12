import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { events } from "@/lib/campus-data";
import { useCampus } from "@/lib/campus-store";
export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = events.find((e) => e.id === params.eventId);
    if (!event) throw notFound();
    return {
      event,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          {
            title: "Event unavailable — CampusConnect",
          },
          {
            name: "robots",
            content: "noindex",
          },
        ],
      };
    }
    const { event } = loaderData;
    return {
      meta: [
        {
          title: `${event.title} — CampusConnect`,
        },
        {
          name: "description",
          content: event.summary,
        },
        {
          property: "og:title",
          content: `${event.title} — CampusConnect`,
        },
        {
          property: "og:description",
          content: event.summary,
        },
      ],
    };
  },
  component: EventDetails,
});
function EventDetails() {
  const { event } = Route.useLoaderData();
  const { registered, toggleEvent, user } = useCampus();
  const navigate = useNavigate();
  const isRegistered = registered.includes(event.id);
  return (
    <AppShell
      title={event.title}
      subtitle={`${event.club} · ${event.date}`}
      action={
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() =>
            navigate({
              to: "/events",
            })
          }
        >
          <ArrowLeft className="size-4" />{" "}
          <span className="hidden sm:inline">All events</span>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <GlassCard className="overflow-hidden p-0">
            <div className="relative h-44 bg-gradient-brand p-6 text-primary-foreground sm:h-52">
              <div className="pointer-events-none absolute -bottom-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
              <Badge className="relative rounded-lg bg-white/20 text-primary-foreground hover:bg-white/25">
                {event.category}
              </Badge>
              <h2 className="relative mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                {event.title}
              </h2>
              <p className="relative mt-1 text-sm text-primary-foreground/80">
                {event.summary}
              </p>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {[
                {
                  icon: CalendarDays,
                  label: "Date",
                  value: event.date,
                },
                {
                  icon: Clock,
                  label: "Time",
                  value: event.time,
                },
                {
                  icon: MapPin,
                  label: "Venue",
                  value: event.venue,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                >
                  <m.icon className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {m.label}
                    </p>
                    <p className="truncate text-sm font-semibold">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-base font-bold">About this event</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {event.details}
            </p>
            <div className="mt-5 rounded-2xl border border-border/60 bg-card/70 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Users className="size-4 shrink-0 text-primary" /> Capacity
                </span>
                <span className="text-muted-foreground">
                  {event.taken} / {event.seats}
                </span>
              </div>
              <Progress
                value={(event.taken / event.seats) * 100}
                className="mt-3 h-2"
              />
            </div>
          </GlassCard>
        </div>

        <aside className="space-y-6">
          <GlassCard>
            {isRegistered ? (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--success)]">
                  <CheckCircle2 className="size-4" /> You're registered
                </div>
                <div className="mt-4 grid place-items-center rounded-2xl bg-white p-4">
                  <QRCodeSVG
                    value={`campusconnect:${event.id}:${user?.id ?? "guest"}`}
                    size={168}
                    level="M"
                  />
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Show this QR code at the door for check-in.
                </p>
                <Link to="/registered">
                  <Button
                    variant="outline"
                    className="mt-4 w-full rounded-xl bg-card/60"
                  >
                    Go to my tickets
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="mt-2 w-full text-muted-foreground"
                  onClick={() => {
                    toggleEvent(event.id);
                    toast("Registration cancelled");
                  }}
                >
                  Cancel registration
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold">Register</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.seats - event.taken} seats remaining. A QR pass is
                  issued instantly.
                </p>
                <Button
                  size="lg"
                  className="mt-4 w-full rounded-xl"
                  onClick={() => {
                    toggleEvent(event.id);
                    toast.success("Registered", {
                      description: "Your QR pass is ready.",
                    });
                  }}
                >
                  Register for free
                </Button>
              </>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="text-base font-bold">Organiser</h3>
            <p className="mt-2 text-sm text-muted-foreground">{event.club}</p>
            <Link to="/clubs">
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full rounded-xl bg-card/60"
              >
                View club
              </Button>
            </Link>
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}

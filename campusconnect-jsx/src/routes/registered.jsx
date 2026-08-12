import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { events } from "@/lib/campus-data";
import { useCampus } from "@/lib/campus-store";
export const Route = createFileRoute("/registered")({
  head: () => ({
    meta: [
      {
        title: "My Tickets — CampusConnect",
      },
      {
        name: "description",
        content: "Your registered campus events and QR check-in passes.",
      },
      {
        property: "og:title",
        content: "My Tickets — CampusConnect",
      },
      {
        property: "og:description",
        content: "Every event you're registered for, with QR passes.",
      },
    ],
  }),
  component: RegisteredPage,
});
function RegisteredPage() {
  const { registered, toggleEvent, user } = useCampus();
  const mine = events.filter((e) => registered.includes(e.id));
  return (
    <AppShell
      title="Registered Events"
      subtitle={`${mine.length} active ticket${mine.length === 1 ? "" : "s"}`}
    >
      {mine.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <Ticket className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-semibold">No tickets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Register for an event and your QR pass appears here.
          </p>
          <Link to="/events">
            <Button className="mt-5 rounded-xl">Browse events</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {mine.map((e) => (
            <GlassCard
              key={e.id}
              className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <Badge variant="secondary" className="rounded-lg">
                  {e.category}
                </Badge>
                <h2 className="mt-2 truncate font-display text-lg font-bold">
                  {e.title}
                </h2>
                <p className="truncate text-sm text-muted-foreground">
                  {e.club}
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-3.5 shrink-0" /> {e.date}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="size-3.5 shrink-0" /> {e.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0" />{" "}
                    <span className="truncate">{e.venue}</span>
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/events/$eventId"
                    params={{
                      eventId: e.id,
                    }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl bg-card/60"
                    >
                      Event details
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => {
                      toggleEvent(e.id);
                      toast("Ticket released");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="shrink-0 self-start rounded-2xl bg-white p-3">
                <QRCodeSVG
                  value={`campusconnect:${e.id}:${user?.id ?? "guest"}`}
                  size={124}
                  level="M"
                />
                <p className="mt-2 text-center text-[10px] font-medium tracking-wide text-black/60">
                  {e.id.toUpperCase()}-{(user?.id ?? "GUEST").toUpperCase()}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}

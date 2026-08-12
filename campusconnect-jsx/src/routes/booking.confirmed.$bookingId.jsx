import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  Building2,
  DoorOpen,
} from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useCampus } from "@/lib/campus-store";
export const Route = createFileRoute("/booking/confirmed/$bookingId")({
  head: () => ({
    meta: [
      {
        title: "Booking Confirmed — CampusConnect",
      },
      {
        name: "description",
        content:
          "Your campus room reservation is confirmed with an access QR code.",
      },
      {
        property: "og:title",
        content: "Booking Confirmed — CampusConnect",
      },
      {
        property: "og:description",
        content: "Room reservation confirmed with QR access pass.",
      },
    ],
  }),
  component: BookingConfirmed,
});
function BookingConfirmed() {
  const { bookingId } = Route.useParams();
  const { bookings } = useCampus();
  const booking = bookings.find((b) => b.id === bookingId);
  return (
    <AppShell title="Booking Confirmed" subtitle={`Reference ${bookingId}`}>
      <div className="mx-auto max-w-2xl space-y-6">
        <GlassCard className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-[var(--success)]/15 text-[var(--success)]">
            <CheckCircle2 className="size-8" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-extrabold">
            You're all set
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference{" "}
            <span className="font-mono font-semibold text-foreground">
              {bookingId}
            </span>
          </p>

          {booking ? (
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              {[
                {
                  icon: DoorOpen,
                  label: "Room",
                  value: booking.roomName,
                },
                {
                  icon: Building2,
                  label: "Building",
                  value: booking.building,
                },
                {
                  icon: CalendarDays,
                  label: "Date",
                  value: booking.date,
                },
                {
                  icon: Clock,
                  label: "Slot",
                  value: booking.slot,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                >
                  <r.icon className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {r.label}
                    </p>
                    <p className="truncate text-sm font-semibold">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              This reservation is no longer in your local session.
            </p>
          )}

          <div className="mt-6 inline-grid place-items-center rounded-2xl bg-white p-4">
            <QRCodeSVG
              value={`campusconnect:booking:${bookingId}`}
              size={160}
              level="M"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Scan at the door panel to unlock the room.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/booking">
              <Button
                variant="outline"
                className="w-full rounded-xl bg-card/60 sm:w-auto"
              >
                Book another room
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="w-full rounded-xl sm:w-auto">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </GlassCard>

        {booking && (
          <GlassCard>
            <h3 className="text-base font-bold">Purpose</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {booking.purpose}
            </p>
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Building2, CalendarCheck } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { rooms, timeSlots } from "@/lib/campus-data";
import { useCampus } from "@/lib/campus-store";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/booking/")({
  head: () => ({
    meta: [
      {
        title: "Resource Booking — CampusConnect",
      },
      {
        name: "description",
        content:
          "Reserve study pods, seminar rooms and halls across campus in seconds.",
      },
      {
        property: "og:title",
        content: "Resource Booking — CampusConnect",
      },
      {
        property: "og:description",
        content: "Book study rooms, labs and halls across campus.",
      },
    ],
  }),
  component: BookingPage,
});
function BookingPage() {
  const { addBooking, bookings } = useCampus();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [slot, setSlot] = useState(timeSlots[3]);
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [purpose, setPurpose] = useState("Group study session");
  const room = rooms.find((r) => r.id === roomId);
  const confirm = () => {
    const id = addBooking({
      roomId: room.id,
      roomName: room.name,
      building: room.building,
      date,
      slot,
      purpose: purpose.trim().slice(0, 120) || "Study session",
    });
    navigate({
      to: "/booking/confirmed/$bookingId",
      params: {
        bookingId: id,
      },
    });
  };
  return (
    <AppShell
      title="Resource Booking"
      subtitle="Study pods, labs and halls — reserved in seconds."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setRoomId(r.id)}
                className="text-left"
              >
                <GlassCard
                  className={cn(
                    "h-full transition-all",
                    roomId === r.id
                      ? "ring-2 ring-primary"
                      : "hover:-translate-y-0.5",
                  )}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-bold">
                        {r.name}
                      </h2>
                      <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <Building2 className="size-3.5 shrink-0" /> {r.building}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 gap-1 rounded-lg"
                    >
                      <Users className="size-3" /> {r.capacity}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.perks.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>

          {bookings.length > 0 && (
            <GlassCard>
              <h2 className="mb-3 text-base font-bold">Your bookings</h2>
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {b.roomName} · {b.building}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.date} · {b.slot}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-lg">
                      {b.id}
                    </Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <aside>
          <GlassCard className="sticky top-4">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <CalendarCheck className="size-4 text-primary" /> Reserve{" "}
              {room.name}
            </h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl bg-card/70"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Time slot</Label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                        slot === s
                          ? "border-transparent bg-gradient-brand text-primary-foreground"
                          : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  maxLength={120}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="rounded-xl bg-card/70"
                />
              </div>
              <Button size="lg" className="w-full rounded-xl" onClick={confirm}>
                Confirm booking
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Bookings can be cancelled up to two hours before the slot.
              </p>
            </div>
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}

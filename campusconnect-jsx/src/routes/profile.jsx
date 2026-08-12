import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  GraduationCap,
  Pencil,
  Award,
  CalendarDays,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCampus } from "@/lib/campus-store";
import { clubs, events } from "@/lib/campus-data";
export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      {
        title: "Student Profile — CampusConnect",
      },
      {
        name: "description",
        content:
          "Your CampusConnect profile: interests, clubs, events and engagement.",
      },
      {
        property: "og:title",
        content: "Student Profile — CampusConnect",
      },
      {
        property: "og:description",
        content: "Manage your student profile, interests and club memberships.",
      },
    ],
  }),
  component: ProfilePage,
});
function ProfilePage() {
  const { user, joinedClubs, registered } = useCampus();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [major, setMajor] = useState(user?.major ?? "");
  if (!user) return null;
  return (
    <AppShell
      title="Profile"
      subtitle="How the rest of campus sees you."
      action={
        <Button
          size="sm"
          variant={editing ? "default" : "outline"}
          className="gap-2 rounded-xl bg-card/60 data-[state=on]:bg-primary"
          onClick={() => {
            if (editing) toast.success("Profile updated");
            setEditing(!editing);
          }}
        >
          <Pencil className="size-4" />{" "}
          <span className="hidden sm:inline">{editing ? "Save" : "Edit"}</span>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <GlassCard className="overflow-hidden p-0">
            <div className="h-28 bg-gradient-brand" />
            <div className="p-5">
              <div className="flex min-w-0 items-end gap-4">
                <span className="-mt-14 grid size-20 shrink-0 place-items-center rounded-3xl border-4 border-card bg-gradient-brand font-display text-2xl font-extrabold text-primary-foreground">
                  {user.initials}
                </span>
                <div className="min-w-0 pb-1">
                  <h2 className="truncate font-display text-xl font-bold">
                    {user.name}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {major} · {user.year}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {editing ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="major">Programme</Label>
                      <Input
                        id="major"
                        value={major}
                        maxLength={80}
                        onChange={(e) => setMajor(e.target.value)}
                        className="rounded-xl bg-card/70"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        maxLength={300}
                        onChange={(e) => setBio(e.target.value)}
                        className="min-h-24 rounded-2xl bg-card/70"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {user.interests.map((i) => (
                    <Badge key={i} variant="secondary" className="rounded-lg">
                      {i}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-2">
                    <Mail className="size-4 shrink-0" />{" "}
                    <span className="truncate">{user.email}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <GraduationCap className="size-4 shrink-0" /> {user.year}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Events attended",
                value: 17,
                icon: CalendarDays,
              },
              {
                label: "Clubs",
                value: joinedClubs.length,
                icon: Users,
              },
              {
                label: "Badges earned",
                value: 6,
                icon: Award,
              },
            ].map((s) => (
              <GlassCard key={s.label}>
                <s.icon className="size-5 text-primary" />
                <p className="mt-3 font-display text-2xl font-extrabold">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard>
            <h3 className="mb-3 text-base font-bold">Upcoming for you</h3>
            <div className="space-y-2">
              {events
                .filter((e) => registered.includes(e.id))
                .map((e) => (
                  <div
                    key={e.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {e.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.date}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-lg">
                      {e.category}
                    </Badge>
                  </div>
                ))}
              {registered.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No registrations yet.
                </p>
              )}
            </div>
          </GlassCard>
        </div>

        <aside className="space-y-6">
          <GlassCard>
            <h3 className="text-base font-bold">Profile strength</h3>
            <Progress value={78} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              78% complete — add a photo and two more interests.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="mb-3 text-base font-bold">My clubs</h3>
            <div className="space-y-2">
              {clubs
                .filter((c) => joinedClubs.includes(c.id))
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                      {c.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.category}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}

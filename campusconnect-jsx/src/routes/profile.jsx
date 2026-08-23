import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Mail,
  GraduationCap,
  Pencil,
  Award,
  CalendarDays,
  Users,
  CheckCircle2,
  IdCard,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useCampus } from "@/lib/campus-store";
import { API_BASE_URL } from "../lib/api-config.js";

/* =====================================================
   ROUTE
===================================================== */

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      {
        title: "Student Profile — CampusConnect",
      },
      {
        name: "description",
        content: "Your CampusConnect student profile.",
      },
      {
        property: "og:title",
        content: "Student Profile — CampusConnect",
      },
      {
        property: "og:description",
        content: "View your CampusConnect student profile, clubs and campus activity.",
      },
    ],
  }),

  component: ProfilePage,
});

function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatMemberSince(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

/* =====================================================
   COMPONENT
===================================================== */

function ProfilePage() {
  const { user, hydrated, updateUser } = useCampus();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [studentId, setStudentId] = useState("");
  const [bio, setBio] = useState("");

  const [myEvents, setMyEvents] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!user) return;

    setDepartment(user.department || "");
    setYear(user.year || "");
    setStudentId(user.studentId || "");
    setBio(user.bio || "");
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchActivity = async () => {
    const token = localStorage.getItem("campusconnect_token");

    if (!token) {
      setLoadingActivity(false);
      return;
    }

    try {
      setLoadingActivity(true);

      const [eventsRes, clubsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events/my-registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/clubs/my-memberships`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const eventsData = await eventsRes.json();
      const clubsData = await clubsRes.json();

      if (eventsRes.ok) {
        setMyEvents(eventsData.events || []);
      }

      if (clubsRes.ok) {
        setMyClubs(clubsData.clubs || []);
      }
    } catch (error) {
      console.error("Profile activity fetch error:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  /* =====================================================
     WAIT FOR AUTH STATE
  ===================================================== */

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     LOGIN PROTECTION
  ===================================================== */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSave = async () => {
    const token = localStorage.getItem("campusconnect_token");

    if (!token) {
      toast.error("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          department,
          year,
          studentId,
          bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Unable to update profile");
        return;
      }

      updateUser(data.user);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Cannot connect to backend.");
    } finally {
      setSaving(false);
    }
  };

  const filledFieldsCount = [department, year, studentId, bio].filter(
    (value) => value && value.trim().length > 0
  ).length;

  const profileStrength = Math.round(((2 + filledFieldsCount) / 6) * 100);

  const upcomingEvents = myEvents.slice(0, 3);
  const displayedClubs = myClubs.slice(0, 4);

  return (
    <AppShell
      title="Profile"
      subtitle="How the rest of campus sees you."
      action={
        <Button
          size="sm"
          variant={editing ? "default" : "outline"}
          className="gap-2 rounded-xl bg-card/60"
          disabled={saving}
          onClick={() => {
            if (editing) {
              handleSave();
              return;
            }

            setEditing(true);
          }}
        >
          <Pencil className="size-4" />

          <span className="hidden sm:inline">
            {editing ? (saving ? "Saving..." : "Save") : "Edit"}
          </span>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* MAIN PROFILE */}
        <div className="space-y-6">
          <GlassCard className="overflow-hidden p-0">
            <div className="h-28 bg-gradient-brand" />

            <div className="p-5">
              <div className="flex min-w-0 items-end gap-4">
                <span className="-mt-14 grid size-20 shrink-0 place-items-center rounded-3xl border-4 border-card bg-gradient-brand font-display text-2xl font-extrabold text-primary-foreground">
                  {initialsFromName(user.name)}
                </span>

                <div className="min-w-0 pb-1">
                  <h2 className="truncate font-display text-xl font-bold">
                    {user.name}
                  </h2>

                  <p className="truncate text-sm text-muted-foreground">
                    {editing ? "" : department || "Department not set"}
                    {!editing && year ? ` · ${year}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {editing ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={department}
                          maxLength={80}
                          placeholder="e.g. Computer Science & Engineering"
                          onChange={(event) => setDepartment(event.target.value)}
                          className="rounded-xl bg-card/70"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={year}
                          maxLength={40}
                          placeholder="e.g. 3rd Year"
                          onChange={(event) => setYear(event.target.value)}
                          className="rounded-xl bg-card/70"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={studentId}
                        maxLength={40}
                        placeholder="e.g. CSE21045"
                        onChange={(event) => setStudentId(event.target.value)}
                        className="rounded-xl bg-card/70"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        maxLength={300}
                        placeholder="Tell campus a bit about yourself"
                        onChange={(event) => setBio(event.target.value)}
                        className="min-h-24 rounded-2xl bg-card/70"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {bio || "No bio yet — tap Edit to add one."}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-2">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </span>

                  {!editing && year && (
                    <span className="flex items-center gap-2">
                      <GraduationCap className="size-4 shrink-0" />
                      {year}
                    </span>
                  )}

                  {!editing && studentId && (
                    <span className="flex items-center gap-2">
                      <IdCard className="size-4 shrink-0" />
                      {studentId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ACTIVITY STATS */}
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard>
              <CalendarDays className="size-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-extrabold">
                {loadingActivity ? "—" : myEvents.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Events registered
              </p>
            </GlassCard>

            <GlassCard>
              <Users className="size-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-extrabold">
                {loadingActivity ? "—" : myClubs.length}
              </p>
              <p className="text-xs text-muted-foreground">Clubs joined</p>
            </GlassCard>

            <GlassCard>
              <Award className="size-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-extrabold">
                {formatMemberSince(user.createdAt)}
              </p>
              <p className="text-xs text-muted-foreground">Member since</p>
            </GlassCard>
          </div>

          {/* UPCOMING EVENTS */}
          <GlassCard>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Upcoming for you</h3>

              <Badge variant="secondary" className="rounded-lg">
                {loadingActivity ? "…" : `${upcomingEvents.length} events`}
              </Badge>
            </div>

            {loadingActivity ? (
              <p className="text-sm text-muted-foreground">
                Loading your events...
              </p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven't registered for any events yet.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event._id}
                    to="/events/$eventId"
                    params={{ eventId: event._id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {event.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {event.date}
                      </p>
                    </div>

                    <Badge variant="secondary" className="shrink-0 rounded-lg">
                      {event.category || "Campus"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Profile strength</h3>
              <CheckCircle2 className="size-4 text-primary" />
            </div>

            <Progress value={profileStrength} className="mt-3 h-2" />

            <p className="mt-2 text-xs text-muted-foreground">
              {profileStrength}% complete
              {profileStrength < 100
                ? " — fill in the remaining fields to complete your profile."
                : " — your profile is looking great."}
            </p>
          </GlassCard>

          <GlassCard>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">My clubs</h3>

              <Badge variant="secondary" className="rounded-lg">
                {loadingActivity ? "…" : `${myClubs.length} clubs`}
              </Badge>
            </div>

            {loadingActivity ? (
              <p className="text-sm text-muted-foreground">
                Loading your clubs...
              </p>
            ) : displayedClubs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven't joined any clubs yet.
              </p>
            ) : (
              <div className="space-y-2">
                {displayedClubs.map((club) => (
                  <Link
                    key={club._id}
                    to="/clubs/$clubId"
                    params={{ clubId: club._id }}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-sm font-bold">
                      {initialsFromName(club.name)}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {club.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {club.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}

import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  Mail,
  GraduationCap,
  Pencil,
  Award,
  CalendarDays,
  Users,
  CheckCircle2,
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

import {
  clubs,
  events,
} from "@/lib/campus-data";

import { useCampus } from "@/lib/campus-store";

/* =====================================================
   ROUTE
===================================================== */

export const Route = createFileRoute(
  "/profile"
)({
  head: () => ({
    meta: [
      {
        title:
          "Student Profile — CampusConnect",
      },
      {
        name: "description",
        content:
          "Your CampusConnect student profile.",
      },
      {
        property: "og:title",
        content:
          "Student Profile — CampusConnect",
      },
      {
        property: "og:description",
        content:
          "View your CampusConnect student profile, clubs and campus activity.",
      },
    ],
  }),

  component: ProfilePage,
});

/* =====================================================
   STATIC PROFILE DATA
===================================================== */

/*
  These values are intentionally STATIC.

  Every student will see the same profile information.

  Authentication is still checked separately so that
  users cannot access the page without logging in.
*/

const STATIC_PROFILE = {
  name: "Prajwal Dhumane",

  initials: "PD",

  programme:
    "Computer Science & Engineering",

  year:
    "3rd Year",

  email:
    "prajwaldhumane@gmail.com",

  bio:
    "Computer Science student passionate about software development, artificial intelligence, problem solving and building meaningful campus communities.",

  interests: [
    "Artificial Intelligence",
    "Web Development",
    "Machine Learning",
    "Competitive Programming",
    "Open Source",
  ],
};

/* =====================================================
   STATIC ACTIVITY
===================================================== */

const STATIC_STATS = [
  {
    label: "Events attended",
    value: 17,
    icon: CalendarDays,
  },
  {
    label: "Clubs",
    value: 4,
    icon: Users,
  },
  {
    label: "Badges earned",
    value: 6,
    icon: Award,
  },
];

/* =====================================================
   COMPONENT
===================================================== */

function ProfilePage() {
  const { user, hydrated } =
    useCampus();

  const [editing, setEditing] =
    useState(false);

  /*
    These are local UI values only.

    They are NOT taken from the logged-in user.
  */

  const [bio, setBio] =
    useState(
      STATIC_PROFILE.bio
    );

  const [programme, setProgramme] =
    useState(
      STATIC_PROFILE.programme
    );

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
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =====================================================
     STATIC DATA
  ===================================================== */

  const staticEvents =
    events.slice(0, 3);

  const staticClubs =
    clubs.slice(0, 4);

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSave = () => {
    toast.success(
      "Profile updated successfully"
    );

    setEditing(false);
  };

  return (
    <AppShell
      title="Profile"
      subtitle="How the rest of campus sees you."
      action={
        <Button
          size="sm"
          variant={
            editing
              ? "default"
              : "outline"
          }
          className="gap-2 rounded-xl bg-card/60"
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
            {editing
              ? "Save"
              : "Edit"}
          </span>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">

        {/* =================================================
            MAIN PROFILE
        ================================================= */}

        <div className="space-y-6">

          <GlassCard className="overflow-hidden p-0">

            {/* =============================================
                COVER
            ============================================= */}

            <div className="h-28 bg-gradient-brand" />

            <div className="p-5">

              {/* ===========================================
                  PROFILE HEADER
              =========================================== */}

              <div className="flex min-w-0 items-end gap-4">

                <span className="-mt-14 grid size-20 shrink-0 place-items-center rounded-3xl border-4 border-card bg-gradient-brand font-display text-2xl font-extrabold text-primary-foreground">
                  {STATIC_PROFILE.initials}
                </span>

                <div className="min-w-0 pb-1">

                  <h2 className="truncate font-display text-xl font-bold">
                    {STATIC_PROFILE.name}
                  </h2>

                  <p className="truncate text-sm text-muted-foreground">
                    {programme} ·{" "}
                    {STATIC_PROFILE.year}
                  </p>

                </div>

              </div>

              {/* ===========================================
                  PROFILE CONTENT
              =========================================== */}

              <div className="mt-5 space-y-4">

                {editing ? (
                  <>
                    {/* PROGRAMME */}

                    <div className="space-y-1.5">

                      <Label htmlFor="programme">
                        Programme
                      </Label>

                      <Input
                        id="programme"
                        value={programme}
                        maxLength={80}
                        onChange={(event) =>
                          setProgramme(
                            event.target.value
                          )
                        }
                        className="rounded-xl bg-card/70"
                      />

                    </div>

                    {/* BIO */}

                    <div className="space-y-1.5">

                      <Label htmlFor="bio">
                        Bio
                      </Label>

                      <Textarea
                        id="bio"
                        value={bio}
                        maxLength={300}
                        onChange={(event) =>
                          setBio(
                            event.target.value
                          )
                        }
                        className="min-h-24 rounded-2xl bg-card/70"
                      />

                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {bio}
                  </p>
                )}

                {/* =========================================
                    INTERESTS
                ========================================= */}

                <div className="flex flex-wrap gap-2">

                  {STATIC_PROFILE.interests.map(
                    (interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="rounded-lg"
                      >
                        {interest}
                      </Badge>
                    )
                  )}

                </div>

                {/* =========================================
                    CONTACT INFORMATION
                ========================================= */}

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">

                  <span className="flex min-w-0 items-center gap-2">

                    <Mail className="size-4 shrink-0" />

                    <span className="truncate">
                      {STATIC_PROFILE.email}
                    </span>

                  </span>

                  <span className="flex items-center gap-2">

                    <GraduationCap className="size-4 shrink-0" />

                    {STATIC_PROFILE.year}

                  </span>

                </div>

              </div>

            </div>

          </GlassCard>

          {/* =================================================
              STATIC ACTIVITY STATS
          ================================================= */}

          <div className="grid gap-4 sm:grid-cols-3">

            {STATIC_STATS.map(
              (stat) => (
                <GlassCard key={stat.label}>

                  <stat.icon className="size-5 text-primary" />

                  <p className="mt-3 font-display text-2xl font-extrabold">
                    {stat.value}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                  </p>

                </GlassCard>
              )
            )}

          </div>

          {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

          <GlassCard>

            <div className="mb-3 flex items-center justify-between">

              <h3 className="text-base font-bold">
                Upcoming for you
              </h3>

              <Badge
                variant="secondary"
                className="rounded-lg"
              >
                3 events
              </Badge>

            </div>

            <div className="space-y-2">

              {staticEvents.map(
                (event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  >

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold">
                        {event.title}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {event.date}
                      </p>

                    </div>

                    <Badge
                      variant="secondary"
                      className="shrink-0 rounded-lg"
                    >
                      {event.category}
                    </Badge>

                  </div>
                )
              )}

            </div>

          </GlassCard>

        </div>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="space-y-6">

          {/* ===============================================
              PROFILE STRENGTH
          =============================================== */}

          <GlassCard>

            <div className="flex items-center justify-between">

              <h3 className="text-base font-bold">
                Profile strength
              </h3>

              <CheckCircle2 className="size-4 text-primary" />

            </div>

            <Progress
              value={85}
              className="mt-3 h-2"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              85% complete — your profile
              is looking great.
            </p>

          </GlassCard>

          {/* ===============================================
              MY CLUBS
          =============================================== */}

          <GlassCard>

            <div className="mb-3 flex items-center justify-between">

              <h3 className="text-base font-bold">
                My clubs
              </h3>

              <Badge
                variant="secondary"
                className="rounded-lg"
              >
                4 clubs
              </Badge>

            </div>

            <div className="space-y-2">

              {staticClubs.map(
                (club) => (
                  <div
                    key={club.id}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  >

                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                      {club.emoji}
                    </span>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold">
                        {club.name}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {club.category}
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>

          </GlassCard>

        </aside>

      </div>
    </AppShell>
  );
}
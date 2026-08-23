import { Link, useRouterState, useNavigate } from "@tanstack/react-router";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessagesSquare,
  Bell,
  UserRound,
  Settings,
  ShieldCheck,
  BarChart3,
  Moon,
  Sun,
  LogOut,
  GraduationCap,
  Menu,
  BookOpen,
  Bot,
  UsersRound,
  Briefcase,
  Building2,
  FileStack,
  ClipboardList,
  CalendarCog,
} from "lucide-react";

import { useState } from "react";

import { useCampus } from "@/lib/campus-store";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

/* =====================================================
   STUDENT NAVIGATION
===================================================== */

const studentNav = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/materials",
    label: "Study Materials",
    icon: BookOpen,
  },
  {
    to: "/assistant",
    label: "AI Study Assistant",
    icon: Bot,
  },
  {
    to: "/peer-learning",
    label: "Peer Learning",
    icon: GraduationCap,
  },
  {
    to: "/chat",
    label: "Chat",
    icon: MessagesSquare,
  },
  {
    to: "/teams",
    label: "Team Finder",
    icon: UsersRound,
  },
  {
    to: "/events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    to: "/clubs",
    label: "Clubs",
    icon: Users,
  },
  {
    to: "/placements",
    label: "Placements & Internships",
    icon: Briefcase,
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

/* =====================================================
   ADMIN NAVIGATION
===================================================== */

const adminNav = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: ShieldCheck,
  },
  {
    to: "/materials",
    label: "Study Materials",
    icon: FileStack,
  },
  {
    to: "/peer-learning",
    label: "Learning Requests",
    icon: ClipboardList,
  },
  {
    to: "/admin/events",
    label: "Manage Events",
    icon: CalendarCog,
  },
  {
    to: "/clubs",
    label: "Clubs",
    icon: Building2,
  },
  {
    to: "/placements",
    label: "Placements",
    icon: Briefcase,
  },
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];

/* =====================================================
   NAVIGATION LIST
===================================================== */

function NavList({ onNavigate }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { user } = useCampus();

  const renderItem = (to, label, Icon) => {
    const active =
      pathname === to ||
      (to !== "/dashboard" &&
        pathname.startsWith(`${to}/`));

    return (
      <Link
        key={to}
        to={to}
        onClick={onNavigate}
        className={cn(
          `
          flex
          items-center
          gap-3
          rounded-full
          px-4
          py-3
          text-sm
          font-medium
          transition-all
          duration-200
          `,
          active
            ? `
              bg-gradient-brand
              text-primary-foreground
              shadow-lg
              shadow-primary/25
            `
            : `
              text-muted-foreground
              hover:bg-sidebar-accent
              hover:text-sidebar-accent-foreground
            `,
        )}
      >
        <Icon className="size-[18px] shrink-0" />

        <span className="truncate">
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="space-y-6">

      {/* =================================================
          STUDENT NAVIGATION
      ================================================= */}

      <div>
        <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
          Campus
        </p>

        <div className="space-y-1">
          {studentNav.map((nav) =>
            renderItem(
              nav.to,
              nav.label,
              nav.icon,
            ),
          )}
        </div>
      </div>

      {/* =================================================
          ADMIN NAVIGATION
      ================================================= */}

      {user?.role === "admin" && (
        <div>
          <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
            Administration
          </p>

          <div className="space-y-1">
            {adminNav.map((nav) =>
              renderItem(
                nav.to,
                nav.label,
                nav.icon,
              ),
            )}
          </div>
        </div>
      )}

      {/* =================================================
          SYSTEM
      ================================================= */}

      <div>
        <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
          System
        </p>

        <div className="space-y-1">
          {renderItem(
            "/settings",
            "Settings",
            Settings,
          )}
        </div>
      </div>

    </nav>
  );
}

/* =====================================================
   BRAND
===================================================== */

function Brand() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-3"
    >
      <div
        className="
          flex
          size-11
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-gradient-brand
          text-white
          shadow-lg
          shadow-primary/20
        "
      >
        <GraduationCap className="size-6" />
      </div>

      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight">
          CampusConnect
        </h1>

        <p className="text-[11px] text-muted-foreground">
          Student Portal
        </p>
      </div>
    </Link>
  );
}

/* =====================================================
   USER PROFILE
===================================================== */

function SidebarProfile({
  user,
  onSignOut,
}) {
  if (!user) {
    return null;
  }

  const initials =
    user.initials ||
    user.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "ST";

  return (
    <div
      className="
        mt-4
        shrink-0
        rounded-[24px]
        border
        border-border/70
        bg-background/75
        p-4
        shadow-sm
        backdrop-blur
      "
    >
      <Link
        to="/profile"
        className="flex items-center gap-3"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="size-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="
              flex
              size-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-brand
              text-sm
              font-bold
              text-white
            "
          >
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {user.name}
          </p>

          <p className="truncate text-xs capitalize text-muted-foreground">
            {user.role || "Student"}
          </p>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        className="
          mt-3
          w-full
          justify-start
          gap-2
          rounded-full
          text-muted-foreground

          hover:bg-red-50
          hover:text-red-500
        "
        onClick={onSignOut}
      >
        <LogOut className="size-4" />

        Sign out
      </Button>
    </div>
  );
}

/* =====================================================
   APP SHELL
===================================================== */

export function AppShell({
  title,
  subtitle,
  action,
  children,
}) {
  const {
    user,
    theme,
    toggleTheme,
    signOut,
  } = useCampus();

  const [open, setOpen] =
    useState(false);

  const handleSignOut = () => {
    signOut();

    navigate({
      to: "/login",
    });
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">

      {/* =================================================
          FIXED DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className="
          fixed
          bottom-3
          left-3
          top-3
          z-40

          hidden
          w-[290px]

          flex-col

          overflow-hidden

          rounded-[30px]
          border
          border-border/60

          bg-background/85

          p-5

          shadow-[0_20px_60px_rgba(40,70,120,0.13)]

          backdrop-blur-xl

          lg:flex
        "
      >

        {/* Brand */}

        <div className="shrink-0 pb-5">
          <Brand />
        </div>

        {/* Navigation */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            pr-1
            [scrollbar-width:thin]
          "
        >
          <NavList />
        </div>

        {/* Profile */}

        <SidebarProfile
          user={user}
          onSignOut={handleSignOut}
        />

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className="
          min-h-screen
          p-3

          lg:ml-[303px]
        "
      >

        <main className="min-w-0">

          {/* =================================================
              HEADER
          ================================================= */}

          <header
            className="
              sticky
              top-3
              z-30

              mb-4

              flex
              min-h-[76px]
              flex-wrap
              items-center
              justify-between
              gap-3

              rounded-[28px]
              border
              border-border/60

              bg-background/80

              px-3
              py-3

              shadow-[0_15px_45px_rgba(40,70,120,0.10)]

              backdrop-blur-xl

              sm:mb-6
              sm:px-5
            "
          >

            <div className="flex min-w-0 items-center gap-3">

              {/* MOBILE SIDEBAR */}

              <Sheet
                open={open}
                onOpenChange={setOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="
                    flex
                    w-[300px]
                    flex-col
                    p-4
                    sm:w-[320px]
                  "
                >

                  <div className="shrink-0 pb-5">
                    <Brand />
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <NavList
                      onNavigate={() =>
                        setOpen(false)
                      }
                    />
                  </div>

                  <SidebarProfile
                    user={user}
                    onSignOut={handleSignOut}
                  />

                </SheetContent>
              </Sheet>

              {/* TITLE */}

              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-base
                    font-bold
                    leading-tight
                    tracking-tight

                    sm:text-xl
                    xl:text-2xl
                  "
                >
                  {title}
                </h1>

                {subtitle && (
                  <p
                    className="
                      mt-0.5
                      line-clamp-2
                      text-[11px]
                      text-muted-foreground

                      sm:text-sm
                    "
                  >
                    {subtitle}
                  </p>
                )}
              </div>

            </div>

            {/* HEADER ACTIONS */}

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">

              {action}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>

              <Link
                to="/notifications"
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="relative rounded-full"
                >
                  <Bell className="size-4" />

                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
                </Button>
              </Link>

            </div>

          </header>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <div className="min-w-0 pb-6">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
}

/* =====================================================
   GLASS CARD
===================================================== */

export function GlassCard({
  className,
  children,
}) {
  return (
    <div
      className={cn(
        `
        rounded-2xl
        glass
        p-4

        sm:rounded-3xl
        sm:p-5
        `,
        className,
      )}
    >
      {children}
    </div>
  );
} 
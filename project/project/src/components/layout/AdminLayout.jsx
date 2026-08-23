import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Student Management", path: "/admin/students", icon: Users },
  { label: "Events", path: "/admin/events", icon: CalendarDays },
  { label: "Clubs", path: "/admin/clubs", icon: Users },
  { label: "Placements", path: "/admin/placements", icon: Briefcase },
  { label: "Study Materials", path: "/admin/materials", icon: BookOpen },
  { label: "Learning Requests", path: "/admin/learning-requests", icon: UserRoundCheck },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
];

function getAdminUser() {
  try {
    const savedUser = localStorage.getItem("adminUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lg shadow-primary/20">
        <GraduationCap className="size-6" />
      </div>

      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">CampusConnect</h1>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Administration</p>
      </div>
    </div>
  );
}

function SidebarProfile({ user, onSignOut }) {
  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <div className="mt-4 shrink-0 rounded-[24px] border border-border/70 bg-background/75 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{user.name || "Administrator"}</p>
          <p className="truncate text-xs capitalize text-muted-foreground">{user.role || "Admin"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="mt-3 flex w-full items-center justify-start gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => getAdminUser());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("adminTheme") === "dark");

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncAdminUser = () => setAdminUser(getAdminUser());
    syncAdminUser();
    window.addEventListener("storage", syncAdminUser);
    return () => window.removeEventListener("storage", syncAdminUser);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("adminTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const currentPage =
    NAV_ITEMS.find(
      (item) =>
        location.pathname === item.path ||
        (item.path !== "/admin/dashboard" && location.pathname.startsWith(`${item.path}/`)),
    ) || NAV_ITEMS[0];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminUser");
    setProfileOpen(false);
    navigate("/admin/login", { replace: true });
  };

  const navClasses = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-gradient-brand text-primary-foreground shadow-lg shadow-primary/25"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed bottom-3 left-3 top-3 z-40 hidden w-[290px] flex-col overflow-hidden rounded-[30px] border border-border/60 bg-background/85 p-5 shadow-[0_20px_60px_rgba(40,70,120,0.13)] backdrop-blur-xl lg:flex">
        <div className="shrink-0 pb-5">
          <Brand />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:thin]">
          <nav className="space-y-6">
            <div>
              <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                Administration
              </p>

              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} className={navClasses}>
                      <Icon className="size-[18px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        <SidebarProfile user={adminUser} onSignOut={handleLogout} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" className="fixed inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />

          <aside className="animate-drawer-in relative z-10 flex h-full w-[300px] max-w-[80vw] flex-col bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3 pb-5">
              <Brand />
              <button type="button" onClick={() => setSidebarOpen(false)} className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Close menu">
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <nav className="space-y-6">
                <div>
                  <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                    Administration
                  </p>

                  <div className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={navClasses}>
                          <Icon className="size-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>

            <SidebarProfile user={adminUser} onSignOut={handleLogout} />
          </aside>
        </div>
      )}

      <div className="min-h-screen p-3 lg:ml-[303px]">
        <main className="min-w-0">
          <header className="sticky top-3 z-30 mb-4 flex min-h-[76px] flex-wrap items-center justify-between gap-3 rounded-[28px] border border-border/60 bg-background/80 px-3 py-3 shadow-[0_15px_45px_rgba(40,70,120,0.10)] backdrop-blur-xl sm:mb-6 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-accent lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-base font-bold leading-tight tracking-tight text-foreground sm:text-xl xl:text-2xl">{currentPage.label}</h1>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-sm">Manage the campus platform from one place.</p>
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                aria-label="Toggle dark mode"
                className="rounded-full p-2 text-muted-foreground transition hover:bg-accent"
              >
                {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>

              <button type="button" className="hidden rounded-full p-2 text-muted-foreground transition hover:bg-accent sm:flex" aria-label="Notifications">
                <Bell className="size-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-left shadow-sm"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
                    {adminUser?.name ? adminUser.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD"}
                  </div>

                  <div className="hidden text-sm md:block">
                    <p className="font-medium text-foreground">{adminUser?.name || "Administrator"}</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </div>

                  <ChevronDown className="size-4 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-border bg-card p-2 shadow-xl">
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50">
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="min-w-0 pb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
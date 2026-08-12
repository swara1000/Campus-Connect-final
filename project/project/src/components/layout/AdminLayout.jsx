import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  Briefcase,
  BookOpen,
  UserRoundCheck,
  Bell,
  LayoutDashboard,
  Menu,
  X,
  Search,
  ChevronDown,
  GraduationCap,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

/* ================= NAVIGATION ================= */

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  // ADDED: Student Management
  {
    label: "Student Management",
    path: "/admin/students",
    icon: Users,
  },

  {
    label: "Events",
    path: "/admin/events",
    icon: CalendarDays,
  },

  {
    label: "Clubs",
    path: "/admin/clubs",
    icon: Users,
  },

  {
    label: "Placements",
    path: "/admin/placements",
    icon: Briefcase,
  },

  {
    label: "Study Materials",
    path: "/admin/materials",
    icon: BookOpen,
  },

  {
    label: "Learning Requests",
    path: "/admin/learning-requests",
    icon: UserRoundCheck,
  },

  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
  },
];

/* ================= ADMIN LAYOUT ================= */

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* ================= CLOSE MENUS ON ROUTE CHANGE ================= */

  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");

    setProfileOpen(false);

    navigate("/admin/login", {
      replace: true,
    });
  };

  /* ================= NAVIGATION LIST ================= */

  const NavList = ({ onNavigate }) => (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-slate-600 hover:bg-blue-50/70"
              }`
            }
          >
            <Icon size={17} />

            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside className="hidden lg:flex w-60 shrink-0 border-r border-slate-200 bg-white flex-col">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-200 shrink-0">
            <GraduationCap size={18} />
          </div>

          <span className="font-semibold text-slate-900">
            CampusConnect
          </span>
        </div>

        <div className="px-4 pt-5 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 tracking-wider px-2 mb-2">
            ADMIN
          </p>

          <NavList />
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />

          <aside className="animate-drawer-in relative z-10 w-72 max-w-[80vw] h-full bg-white flex flex-col shadow-xl">
            <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-200 shrink-0">
                <GraduationCap size={18} />
              </div>

              <span className="font-semibold text-slate-900 flex-1">
                CampusConnect
              </span>

              <button
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pt-5 overflow-y-auto">
              <p className="text-xs font-semibold text-slate-400 tracking-wider px-2 mb-2">
                ADMIN
              </p>

              <NavList
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN AREA ================= */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* ================= HEADER ================= */}

        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-3 sm:px-6 gap-2 sm:gap-4">
          {/* Mobile menu */}

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Search */}

          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-300 focus:bg-white"
            />
          </div>

          {/* Mobile search */}

          <button
            onClick={() => setSearchOpen((value) => !value)}
            className="sm:hidden h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Profile */}

          <div className="relative ml-auto pl-2 sm:pl-4 border-l border-slate-200">
            <button
              onClick={() =>
                setProfileOpen((value) => !value)
              }
              className="flex items-center gap-2 sm:gap-2.5"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xs font-semibold shadow-sm shadow-blue-200">
                AD
              </div>

              <div className="text-sm leading-tight text-left hidden md:block">
                <p className="font-medium text-slate-800">
                  Administrator
                </p>

                <p className="text-slate-400 text-xs">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={15}
                className="text-slate-400 hidden sm:block"
              />
            </button>

            {/* Profile dropdown */}

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= MOBILE SEARCH ================= */}

        {searchOpen && (
          <div className="sm:hidden border-b border-slate-200 bg-white p-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-300 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* ================= PAGE CONTENT ================= */}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
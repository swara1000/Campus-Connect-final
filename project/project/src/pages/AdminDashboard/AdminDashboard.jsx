import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  Briefcase,
  BookOpen,
  UserRoundCheck,
  Bell,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../components/Shared";
import { cardShadowCls, primaryBtnShadowCls } from "../../utils";
import { adminFetch } from "../../api-client.js";
import { API_BASE_URL } from "../../api-config.js";
import {
  seedEvents,
  seedClubs,
  seedDrives,
  seedLearningRequests,
  seedNotifications,
} from "../../data/mockData";

const quickActions = [
  {
    label: "Manage Events",
    description: "Add, edit or remove campus events",
    icon: CalendarDays,
    tint: "text-blue-600",
    path: "/admin/events",
  },
  {
    label: "Manage Clubs",
    description: "Add, edit or remove clubs",
    icon: Users,
    tint: "text-violet-600",
    path: "/admin/clubs",
  },
  {
    label: "Manage Placements",
    description: "Track drives and applicants",
    icon: Briefcase,
    tint: "text-emerald-600",
    path: "/admin/placements",
  },
  {
    label: "Study Materials",
    description: "Upload and organise resources",
    icon: BookOpen,
    tint: "text-orange-600",
    path: "/admin/materials",
  },
  {
    label: "Learning Requests",
    description: "Review pending student requests",
    icon: UserRoundCheck,
    tint: "text-pink-600",
    path: "/admin/learning-requests",
  },
  {
    label: "Notifications",
    description: "Send and schedule announcements",
    icon: Bell,
    tint: "text-cyan-600",
    path: "/admin/notifications",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    events: seedEvents,
    clubs: seedClubs,
    requests: seedLearningRequests,
  });

  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      try {
        const [eventsResponse, clubsResponse, requestsResponse] = await Promise.all([
          adminFetch(`${API_BASE_URL}/api/events`),
          adminFetch(`${API_BASE_URL}/api/clubs`),
          adminFetch(`${API_BASE_URL}/api/peer-learning`),
        ]);
        const [eventsData, clubsData, requestsData] = await Promise.all([
          eventsResponse.json(),
          clubsResponse.json(),
          requestsResponse.json(),
        ]);

        if (!active) return;
        setSummary({
          events: eventsResponse.ok && Array.isArray(eventsData.events) ? eventsData.events : seedEvents,
          clubs: clubsResponse.ok && Array.isArray(clubsData.clubs) ? clubsData.clubs : seedClubs,
          requests: requestsResponse.ok && Array.isArray(requestsData.requests) ? requestsData.requests : seedLearningRequests,
        });
      } catch (error) {
        console.error("Admin dashboard summary error:", error);
      }
    };

    loadSummary();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const upcomingEvents = summary.events.filter((event) => {
      const status = String(event.status || "").toLowerCase();
      return status === "upcoming" || (status !== "completed" && new Date(event.date) >= new Date());
    }).length;
    const pendingRequests = summary.requests.filter(
      (request) => String(request.status || "").toLowerCase() === "pending"
    ).length;

    return [
      { label: "Total Events", value: summary.events.length, icon: CalendarDays, tint: "bg-blue-50 text-blue-600" },
      { label: "Total Clubs", value: summary.clubs.length, icon: Users, tint: "bg-violet-50 text-violet-600" },
      { label: "Upcoming Events", value: upcomingEvents, icon: CalendarDays, tint: "bg-emerald-50 text-emerald-600" },
      { label: "Pending Requests", value: pendingRequests, icon: UserRoundCheck, tint: "bg-orange-50 text-orange-600" },
    ];
  }, [summary]);

  const recentActivities = useMemo(
    () => [
      {
        id: 1,
        title: "New event created",
        description: `${seedEvents[seedEvents.length - 2]?.name ?? "A new event"} was added.`,
        time: "10 minutes ago",
      },
      {
        id: 2,
        title: "Club updated",
        description: `${seedClubs[0]?.name ?? "A club"} details were updated.`,
        time: "1 hour ago",
      },
      {
        id: 3,
        title: "Notification sent",
        description: `${seedNotifications[0]?.title ?? "A notification"} went out to students.`,
        time: "Yesterday",
      },
      {
        id: 4,
        title: "New placement drive",
        description: `${seedDrives[0]?.company ?? "A company"} opened a new drive.`,
        time: "2 days ago",
      },
    ],
    []
  );

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back, Administrator 👋</h2>
          <p className="mt-2 text-muted-foreground">Here is an overview of your CampusConnect platform.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            className={`flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 font-medium text-white transition ${primaryBtnShadowCls}`}
          >
            <Plus size={19} />
            Add Event
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/clubs")}
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-medium text-foreground transition hover:bg-accent"
          >
            <Plus size={19} />
            Add Club
          </button>
        </div>
      </div>

      {/* Dashboard cards — reuses the same StatCard used across every other module page */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} tint={card.tint} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent activities */}
        <section className={`rounded-2xl border border-border bg-card p-6 xl:col-span-2 ${cardShadowCls}`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground">Recent Activities</h3>
              <p className="mt-1 text-sm text-muted-foreground">Latest updates in the admin panel.</p>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-2xl bg-muted p-4">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" />

                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{activity.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                </div>

                <p className="hidden text-xs text-muted-foreground sm:block">{activity.time}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className={`rounded-2xl border border-border bg-card p-6 ${cardShadowCls}`}>
          <h3 className="text-xl font-bold text-foreground">Quick Actions</h3>
          <p className="mt-1 text-sm text-muted-foreground">Quickly manage campus modules.</p>

          <div className="mt-6 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <Icon size={22} className={action.tint} />

                  <div>
                    <p className="font-semibold text-foreground">{action.label}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

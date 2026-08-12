import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { engagementByMonth, categorySplit } from "@/lib/campus-data";
export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      {
        title: "Analytics — CampusConnect",
      },
      {
        name: "description",
        content:
          "Engagement trends, category mix and participation metrics across campus.",
      },
      {
        property: "og:title",
        content: "Analytics — CampusConnect",
      },
      {
        property: "og:description",
        content: "Campus engagement analytics for administrators.",
      },
    ],
  }),
  component: Analytics,
});
function Analytics() {
  const max = Math.max(...engagementByMonth.map((m) => m.signups));
  return (
    <AppShell
      title="Analytics"
      subtitle="Participation and engagement over the term."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <GlassCard>
          <h2 className="text-base font-bold">Monthly engagement</h2>
          <div className="mt-6 flex h-56 items-end gap-3">
            {engagementByMonth.map((m) => (
              <div
                key={m.month}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-xl bg-gradient-brand"
                  style={{
                    height: `${(m.signups / max) * 100}%`,
                  }}
                  title={`${m.signups} signups`}
                />
                <span className="truncate text-[11px] text-muted-foreground">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-base font-bold">Category mix</h2>
          <div className="mt-4 space-y-4">
            {categorySplit.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {c.value}%
                  </span>
                </div>
                <Progress value={c.value} className="mt-1.5 h-2" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

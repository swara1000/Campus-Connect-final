import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun, ShieldCheck, BellRing, Globe, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCampus } from "@/lib/campus-store";
export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      {
        title: "Settings — CampusConnect",
      },
      {
        name: "description",
        content:
          "Appearance, notification and privacy preferences for your campus account.",
      },
      {
        property: "og:title",
        content: "Settings — CampusConnect",
      },
      {
        property: "og:description",
        content: "Control theme, notifications and privacy on CampusConnect.",
      },
    ],
  }),
  component: SettingsPage,
});
function Row({ label, hint, children }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
      <div className="min-w-0">
        <Label className="text-sm font-semibold">{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
function SettingsPage() {
  const { theme, toggleTheme, signOut, user } = useCampus();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    events: true,
    clubs: true,
    mentions: true,
    digest: false,
    discoverable: true,
  });
  const set = (k) => (v) => {
    setPrefs((p) => ({
      ...p,
      [k]: v,
    }));
    toast("Preference saved");
  };
  return (
    <AppShell title="Settings" subtitle="Tune CampusConnect to your rhythm.">
      <div className="mx-auto max-w-3xl space-y-6">
        <GlassCard>
          <h2 className="flex items-center gap-2 text-base font-bold">
            {theme === "dark" ? (
              <Moon className="size-4 text-primary" />
            ) : (
              <Sun className="size-4 text-primary" />
            )}{" "}
            Appearance
          </h2>
          <Separator className="my-2" />
          <Row
            label="Dark mode"
            hint="Softer contrast for late-night study sessions."
          >
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </Row>
        </GlassCard>

        <GlassCard>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <BellRing className="size-4 text-primary" /> Notifications
          </h2>
          <Separator className="my-2" />
          <Row
            label="Event reminders"
            hint="Ping me a day before events I registered for."
          >
            <Switch checked={prefs.events} onCheckedChange={set("events")} />
          </Row>
          <Row
            label="Club announcements"
            hint="Updates from clubs I've joined."
          >
            <Switch checked={prefs.clubs} onCheckedChange={set("clubs")} />
          </Row>
          <Row
            label="Chat mentions"
            hint="Notify me when someone @mentions me."
          >
            <Switch
              checked={prefs.mentions}
              onCheckedChange={set("mentions")}
            />
          </Row>
          <Row
            label="Weekly digest"
            hint="One email summarising campus activity."
          >
            <Switch checked={prefs.digest} onCheckedChange={set("digest")} />
          </Row>
        </GlassCard>

        <GlassCard>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <ShieldCheck className="size-4 text-primary" /> Privacy & security
          </h2>
          <Separator className="my-2" />
          <Row
            label="Discoverable profile"
            hint="Let other students find me in club directories."
          >
            <Switch
              checked={prefs.discoverable}
              onCheckedChange={set("discoverable")}
            />
          </Row>
          <Row label="Active sessions" hint="You're signed in on this device.">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-card/60"
              onClick={() => toast("Other sessions revoked")}
            >
              Revoke others
            </Button>
          </Row>
        </GlassCard>

        <GlassCard>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Globe className="size-4 text-primary" /> Account
          </h2>
          <Separator className="my-2" />
          <Row label="Signed in" hint={user?.email ?? "Not signed in"}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl bg-card/60"
              onClick={() => {
                signOut();
                navigate({
                  to: "/login",
                });
              }}
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </Row>
        </GlassCard>
      </div>
    </AppShell>
  );
}

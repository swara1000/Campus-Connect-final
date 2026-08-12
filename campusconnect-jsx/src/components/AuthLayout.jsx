import { Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, Zap, Users } from "lucide-react";
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-8 text-primary-foreground xl:p-10 lg:flex">
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-white/10 blur-2xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">CampusConnect</span>
        </Link>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Everything happening on campus, in one calm place.
          </h2>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Events, clubs, announcements, chat and study rooms — no more chasing
            five different group threads.
          </p>
          <div className="mt-8 space-y-3">
            {[
              {
                icon: ShieldCheck,
                text: "Secure JWT sessions and Google sign-in",
              },
              {
                icon: Zap,
                text: "Real-time messaging over Socket.IO",
              },
              {
                icon: Users,
                text: "12,400 students across 68 active clubs",
              },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"
              >
                <f.icon className="size-4 shrink-0" />
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          © 2026 CampusConnect · Student Affairs
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-3xl glass p-7 sm:p-8">
          <Link to="/" className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-display text-base font-bold">
              CampusConnect
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
export function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
    >
      <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.4-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-17z"
        />
        <path
          fill="#FBBC05"
          d="M10.3 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.5 10.8l7.8-6.1z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.6 2.2-8.8 2.2-6.4 0-11.8-3.7-13.7-9.2l-7.8 6.1C6.4 42.6 14.6 48 24 48z"
        />
      </svg>
      Continue with Google
    </button>
  );
}

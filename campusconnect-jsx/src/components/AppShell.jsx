export function AppShell({ title, subtitle, action, children }) {
  const { user, theme, toggleTheme, signOut, unreadNotificationCount } = useCampus();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 🔹 Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ================= SIDEBAR ================= */}
      <aside
        className="
          fixed top-3 bottom-3 left-3 z-40
          hidden lg:flex w-[290px] flex-col

          rounded-[30px] border border-border/60
          bg-white/70 dark:bg-zinc-900/70
          backdrop-blur-xl

          p-5 shadow-[0_20px_60px_rgba(40,70,120,0.13)]
        "
      >
        <div className="pb-5">
          <Brand />
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <NavList />
        </div>

        <SidebarProfile user={user} onSignOut={handleSignOut} />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="min-h-screen p-3 lg:ml-[303px]">
        <main>

          {/* ================= HEADER ================= */}
          <header
            className={cn(
              `
                sticky top-3 z-30
                mb-4 sm:mb-6

                flex min-h-[76px] flex-wrap items-center justify-between gap-3

                rounded-[28px] border
                px-3 py-3 sm:px-5

                transition-all duration-300 ease-out
              `,
              scrolled
                ? "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_15px_45px_rgba(40,70,120,0.10)]"
                : "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md"
            )}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">

              {/* MOBILE MENU */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-[300px] flex flex-col p-4">
                  <div className="pb-5">
                    <Brand />
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <NavList onNavigate={() => setOpen(false)} />
                  </div>

                  <SidebarProfile user={user} onSignOut={handleSignOut} />
                </SheetContent>
              </Sheet>

              {/* TITLE */}
              <div>
                <h1 className="text-base sm:text-xl xl:text-2xl font-bold truncate">
                  {title}
                </h1>

                {subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 ml-auto">

              {action}

              {/* THEME */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>

              {/* NOTIFICATIONS */}
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
                  )}
                </Button>
              </Link>
            </div>
          </header>

          {/* ================= CONTENT ================= */}
          <div className="pb-6">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}
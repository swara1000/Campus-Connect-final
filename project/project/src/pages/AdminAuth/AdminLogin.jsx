import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, LockKeyhole, ShieldCheck, Users, Zap } from "lucide-react";
import { inputCls, primaryBtnShadowCls } from "../../utils";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid admin email or password.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      if (formData.remember) {
        localStorage.setItem("admin_remember_email", email);
      } else {
        localStorage.removeItem("admin_remember_email");
      }

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Cannot connect to backend. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-8 text-primary-foreground lg:flex xl:p-10">
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-lg font-bold">CampusConnect</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Everything happening on campus, in one calm place.</h2>
          <p className="mt-4 text-sm text-white/80">
            Events, clubs, placements, announcements and student operations — no more switching between scattered admin tools.
          </p>

          <div className="mt-8 space-y-3">
            {[{ icon: ShieldCheck, text: "Secure admin access with JWT sessions" }, { icon: Zap, text: "Live campus operations and communication" }, { icon: Users, text: "Oversight across clubs, events and student activity" }].map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <item.icon className="size-4 shrink-0" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/70">© 2026 CampusConnect · Administration Portal</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-[32px] border border-border bg-card/80 p-7 shadow-[0_25px_70px_rgba(30,64,175,0.12)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-white">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-base font-bold text-foreground">CampusConnect</span>
          </div>

          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LockKeyhole size={30} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to access the admin dashboard.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-foreground">
                Admin Email <span className="ml-1 text-red-500">*</span>
              </label>
              <input id="admin-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@campusconnect.com" className={`${inputCls} bg-card text-foreground placeholder:text-muted-foreground`} />
            </div>

            <div className="mb-5">
              <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-foreground">
                Password <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <input id="admin-password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter admin password" className={`${inputCls} pr-14 bg-card text-foreground placeholder:text-muted-foreground`} />

                <button type="button" onClick={() => setShowPassword((previous) => !previous)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange} className="accent-blue-600" />
                Remember me
              </label>

              <button type="button" className="font-medium text-primary hover:underline" onClick={() => alert("Admin forgot-password feature will be added later.")}>Forgot password?</button>
            </div>

            <button type="submit" disabled={loading} className={`flex w-full items-center justify-center rounded-full bg-gradient-brand py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${primaryBtnShadowCls}`}>
              {loading ? "Signing In..." : "Sign In as Administrator"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

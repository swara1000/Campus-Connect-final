import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, LockKeyhole } from "lucide-react";
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

    const response = await fetch(
      "http://localhost:5000/api/auth/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "Invalid admin email or password."
      );
      return;
    }

    // Save admin JWT separately
    localStorage.setItem(
  "adminToken",
  data.token
);

    // Save admin user
   localStorage.setItem(
  "adminUser",
  JSON.stringify(data.user)
);

    // Optional remember email
    if (formData.remember) {
      localStorage.setItem(
        "admin_remember_email",
        email
      );
    } else {
      localStorage.removeItem(
        "admin_remember_email"
      );
    }

    navigate("/admin/dashboard");
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    alert(
      "Cannot connect to backend. Make sure backend is running."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="grid min-h-screen bg-app-bg lg:grid-cols-2">
      {/* Left section */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-800 to-blue-500 p-14 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <GraduationCap size={28} />
          </div>

          <div>
            <h2 className="text-3xl font-bold">CampusConnect</h2>
            <p className="text-sm text-blue-100">Administration Portal</p>
          </div>
        </div>

        <div>
          <h1 className="text-6xl font-extrabold leading-tight">
            Manage your
            <br />
            campus from
            <br />
            one place.
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-8 text-blue-100">
            Manage events, clubs, placements, study materials and learning
            requests using one secure administration dashboard.
          </p>

          <div className="mt-12 space-y-4">
            <div className="rounded-full border border-white/20 bg-white/10 px-6 py-4 backdrop-blur">
              📅 Manage campus events
            </div>

            <div className="rounded-full border border-white/20 bg-white/10 px-6 py-4 backdrop-blur">
              👥 Manage clubs and communities
            </div>

            <div className="rounded-full border border-white/20 bg-white/10 px-6 py-4 backdrop-blur">
              🔐 Secure administrator access
            </div>
          </div>
        </div>

        <p className="text-blue-100">© 2026 CampusConnect Administration</p>
      </div>

      {/* Right section */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[36px] bg-white p-8 shadow-2xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LockKeyhole size={30} />
            </div>

            <h1 className="mt-5 text-4xl font-bold text-slate-900">
              Admin Login
            </h1>

            <p className="mt-2 text-slate-500">
              Sign in to access the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Admin Email
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="admin-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@campusconnect.com"
                className={inputCls}
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  className={`${inputCls} pr-14`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                Remember me
              </label>

              <button
                type="button"
                className="font-medium text-blue-600 hover:underline"
                onClick={() =>
                  alert("Admin forgot-password feature will be added later.")
                }
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center rounded-full bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${primaryBtnShadowCls}`}
            >
              {loading ? "Signing In..." : "Sign In as Administrator"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

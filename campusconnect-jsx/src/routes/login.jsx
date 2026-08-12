import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  GraduationCap,
  ShieldCheck,
  Zap,
  UsersRound,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";

import { useCampus } from "@/lib/campus-store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useCampus();

  /* =====================================================
     GOOGLE CLIENT ID
     Paste your real Google Web Client ID here.
     Do NOT paste Client Secret.
  ===================================================== */

  const googleClientId =
    "693434437854-pngos0e6dcdsvs9de4j9tp5n3151eh1u.apps.googleusercontent.com";

  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [googleLoading, setGoogleLoading] =
    useState(true);

  /* =====================================================
     PASSWORD RULES
  ===================================================== */

  const passwordRules = {
    length:
      formData.password.length >= 6 &&
      formData.password.length <= 8,

    uppercase:
      /[A-Z]/.test(formData.password),

    lowercase:
      /[a-z]/.test(formData.password),

    number:
      /[0-9]/.test(formData.password),

    symbol:
      /[^A-Za-z0-9]/.test(
        formData.password
      ),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.symbol;

  /* =====================================================
     GOOGLE RESPONSE
  ===================================================== */

  const handleGoogleResponse = (
    response
  ) => {
    setError("");

    if (!response?.credential) {
      setError(
        "Google sign-in failed. Please try again."
      );

      return;
    }

    const googleUser =
      decodeGoogleCredential(
        response.credential
      );

    if (!googleUser) {
      setError(
        "Unable to read Google account information."
      );

      return;
    }

    const name =
      googleUser.name ||
      googleUser.given_name ||
      "Student";

    const user = {
      id: googleUser.sub,

      name,

      email:
        googleUser.email || "",

      avatar:
        googleUser.picture || "",

      initials:
        getInitials(name),

      role: "student",

      loginProvider: "google",
    };

    /* Save logged-in Google user */
    signIn(user);

    /* Go to dashboard */
    navigate({
      to: "/dashboard",
    });
  };

  /* =====================================================
     LOAD GOOGLE IDENTITY SERVICES
  ===================================================== */

  useEffect(() => {
    /*
      Don't try Google if the real Client ID
      has not been pasted yet.
    */

    if (
      !googleClientId ||
      googleClientId.includes(
        "PASTE_YOUR_REAL"
      )
    ) {
      setGoogleLoading(false);
      return;
    }

    const initializeGoogle = () => {
      if (
        !window.google?.accounts?.id
      ) {
        console.error(
          "Google Identity Services not loaded."
        );

        setGoogleLoading(false);

        return;
      }

      /*
        Initialize only with your
        Google Web Client ID.
      */

      window.google.accounts.id.initialize({
        client_id: googleClientId,

        callback:
          handleGoogleResponse,

        /*
          Do not automatically choose
          an old account.
        */
        auto_select: false,

        /*
          Popup style.
        */
        ux_mode: "popup",
      });

      /*
        Render Google's official button.
      */

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML =
          "";

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: "standard",

            theme: "outline",

            size: "large",

            text: "continue_with",

            shape: "pill",

            logo_alignment: "left",

            width: 420,
          }
        );
      }

      setGoogleLoading(false);
    };

    /*
      Check if Google script already exists.
    */

    const existingScript =
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

    if (existingScript) {
      if (
        window.google?.accounts?.id
      ) {
        initializeGoogle();
      } else {
        existingScript.addEventListener(
          "load",
          initializeGoogle
        );
      }

      return;
    }

    /*
      Add Google script dynamically.
    */

    const script =
      document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload =
      initializeGoogle;

    script.onerror = () => {
      console.error(
        "Failed to load Google Identity Services."
      );

      setGoogleLoading(false);

      setError(
        "Unable to load Google Sign-In."
      );
    };

    document.head.appendChild(
      script
    );

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
  };

  /* =====================================================
     NORMAL LOGIN
  ===================================================== */

 const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");

  if (!formData.email.trim()) {
    setError(
      "Please enter your university email."
    );
    return;
  }

  if (!formData.password) {
    setError(
      "Please enter your password."
    );
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/student/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: formData.email
            .trim()
            .toLowerCase(),

          password: formData.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message ||
          "Invalid email or password."
      );
      return;
    }

    localStorage.setItem(
      "campusconnect_token",
      data.token
    );

    localStorage.setItem(
      "campusconnect_user",
      JSON.stringify(data.user)
    );

    signIn(data.user);

    navigate({
      to: "/dashboard",
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    setError(
      "Cannot connect to backend. Make sure backend is running."
    );
  }
};

  return (
    <div className="min-h-screen bg-[#edf4fc] lg:p-1.5">
      <div
        className="
          grid
          min-h-screen
          overflow-hidden
          bg-white

          lg:min-h-[calc(100vh-12px)]
          lg:grid-cols-2
          lg:rounded-[22px]
          lg:border
          lg:border-[#d6e0ec]
        "
      >
        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <section
          className="
            relative
            hidden
            overflow-hidden

            bg-gradient-to-br
            from-[#173687]
            via-[#255ac9]
            to-[#65afe9]

            px-12
            py-12

            text-white

            lg:flex
            lg:flex-col
          "
        >
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <GraduationCap
                size={24}
              />
            </div>

            <h1 className="text-[25px] font-bold">
              CampusConnect
            </h1>
          </div>

          {/* Content */}
          <div className="my-auto max-w-[570px]">
            <h2
              className="
                text-[42px]
                font-bold
                leading-[1.18]
                tracking-tight

                xl:text-[48px]
              "
            >
              Everything happening
              <br />

              on campus, in one calm
              <br />

              place.
            </h2>

            <p
              className="
                mt-6
                max-w-[550px]
                text-[17px]
                leading-7
                text-white/80
              "
            >
              Events, clubs,
              announcements, chat and
              study rooms — no more
              chasing five different
              group threads.
            </p>

            <div className="mt-10 space-y-4">
              <Feature
                icon={ShieldCheck}
                text="Secure student login and Google sign-in"
              />

              <Feature
                icon={Zap}
                text="Real-time messaging and campus updates"
              />

              <Feature
                icon={UsersRound}
                text="Connect with students and active clubs"
              />
            </div>
          </div>

          <p className="text-sm text-white/70">
            © 2026 CampusConnect ·
            Student Affairs
          </p>
        </section>

        {/* =========================================
            RIGHT SIDE
        ========================================= */}

        <section
          className="
            flex
            min-h-screen
            items-center
            justify-center

            bg-gradient-to-br
            from-[#f8fbff]
            via-[#f4f8fd]
            to-[#eaf5ff]

            px-4
            py-10

            sm:px-6

            lg:min-h-0
          "
        >
          <div
            className="
              w-full
              max-w-[520px]

              rounded-[34px]

              bg-white/90

              px-6
              py-8

              shadow-[0_24px_65px_rgba(40,70,120,0.16)]

              backdrop-blur-xl

              sm:px-10
              sm:py-10
            "
          >
            {/* Mobile brand */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-full

                  bg-gradient-to-br
                  from-[#1852c7]
                  to-[#3d91ed]

                  text-white
                "
              >
                <GraduationCap
                  size={20}
                />
              </div>

              <span className="text-xl font-bold text-[#132033]">
                CampusConnect
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-[30px] font-bold tracking-tight text-[#101828]">
              Welcome back
            </h2>

            <p className="mt-1 text-[16px] text-[#718097]">
              Sign in to pick up where
              you left off.
            </p>

            {/* Error */}
            {error && (
              <div
                className="
                  mt-5
                  rounded-[18px]
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {/* =====================================
                NORMAL SIGN IN
            ===================================== */}

            <form
              onSubmit={handleSubmit}
              className="mt-8"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#172033]"
                >
                  University email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"

                  value={
                    formData.email
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="samruddhi@university.edu"

                  autoComplete="email"

                  className="
                    w-full
                    rounded-full

                    border
                    border-[#cfdae8]

                    bg-white

                    px-5
                    py-3

                    text-[15px]
                    text-[#172033]

                    shadow-sm

                    outline-none

                    transition

                    placeholder:text-[#8a96a8]

                    focus:border-[#4a83df]
                    focus:ring-4
                    focus:ring-[#dbe9ff]
                  "
                />
              </div>

              {/* Password */}
              <div className="mt-5">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#172033]"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"

                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }

                    name="password"

                    value={
                      formData.password
                    }

                    onChange={
                      handleChange
                    }

                    maxLength={8}

                    placeholder="Enter password"

                    autoComplete="current-password"

                    className="
                      w-full
                      rounded-full

                      border
                      border-[#cfdae8]

                      bg-white

                      px-5
                      py-3
                      pr-12

                      text-[15px]
                      text-[#172033]

                      shadow-sm

                      outline-none

                      transition

                      focus:border-[#4a83df]
                      focus:ring-4
                      focus:ring-[#dbe9ff]
                    "
                  />

                  <button
                    type="button"

                    onClick={() =>
                      setShowPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }

                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#7e8b9f]

                      hover:text-[#2563eb]
                    "
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>

                {/* Password requirements */}
                {formData.password && (
                  <div
                    className="
                      mt-3
                      grid
                      gap-2
                      text-xs

                      sm:grid-cols-2
                    "
                  >
                    <PasswordRule
                      valid={
                        passwordRules.length
                      }
                      text="6–8 characters"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.uppercase
                      }
                      text="1 uppercase letter"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.lowercase
                      }
                      text="1 lowercase letter"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.number
                      }
                      text="1 number"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.symbol
                      }
                      text="1 special symbol"
                    />
                  </div>
                )}
              </div>

              {/* Remember */}
              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                "
              >
                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    text-sm
                    text-[#69788d]
                  "
                >
                  <input
                    type="checkbox"
                    name="remember"

                    checked={
                      formData.remember
                    }

                    onChange={
                      handleChange
                    }

                    className="h-4 w-4 accent-[#2563eb]"
                  />

                  Keep me signed in
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#2563eb] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                className="
                  mt-5
                  w-full

                  rounded-full

                  bg-gradient-to-r
                  from-[#2a67dc]
                  to-[#2e6bdc]

                  px-5
                  py-3

                  text-sm
                  font-semibold
                  text-white

                  shadow-[0_8px_18px_rgba(37,99,235,0.25)]

                  transition

                  hover:-translate-y-0.5
                "
              >
                Sign in
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#d6dfeb]" />

              <span className="text-sm text-[#7b8798]">
                or
              </span>

              <div className="h-px flex-1 bg-[#d6dfeb]" />
            </div>

            {/* =====================================
                GOOGLE SIGN IN
            ===================================== */}

            {googleClientId &&
            !googleClientId.includes(
              "PASTE_YOUR_REAL"
            ) ? (
              <div className="w-full">
                <div
                  ref={
                    googleButtonRef
                  }
                  className="
                    flex
                    min-h-[46px]
                    w-full
                    justify-center
                  "
                />

                {googleLoading && (
                  <p className="mt-2 text-center text-xs text-[#8995a7]">
                    Loading Google
                    sign-in...
                  </p>
                )}
              </div>
            ) : (
              <div
                className="
                  rounded-[18px]
                  border
                  border-amber-200
                  bg-amber-50
                  px-4
                  py-3
                  text-center
                  text-xs
                  text-amber-700
                "
              >
                Paste your real Google
                Web Client ID in
                login.jsx.
              </div>
            )}

            {/* Register */}
            <p className="mt-7 text-center text-sm text-[#6f7e91]">
              New here?{" "}

              <Link
                to="/register"
                className="font-semibold text-[#2563eb]"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =====================================================
   FEATURE
===================================================== */

function Feature({
  icon: Icon,
  text,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4

        rounded-full

        border
        border-white/10

        bg-white/10

        px-5
        py-4

        backdrop-blur
      "
    >
      <Icon className="h-5 w-5 shrink-0" />

      <span className="text-[15px] font-medium text-white/90">
        {text}
      </span>
    </div>
  );
}

/* =====================================================
   PASSWORD RULE
===================================================== */

function PasswordRule({
  valid,
  text,
}) {
  return (
    <div
      className={`flex items-center gap-1.5 ${
        valid
          ? "text-green-600"
          : "text-[#8995a7]"
      }`}
    >
      {valid ? (
        <Check size={13} />
      ) : (
        <X size={13} />
      )}

      {text}
    </div>
  );
}

/* =====================================================
   GOOGLE TOKEN DECODER
===================================================== */

function decodeGoogleCredential(
  credential
) {
  try {
    const payload =
      credential.split(".")[1];

    const normalized =
      payload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const decoded =
      decodeURIComponent(
        atob(normalized)
          .split("")
          .map(
            (character) =>
              `%${(
                "00" +
                character
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)}`
          )
          .join("")
      );

    return JSON.parse(decoded);
  } catch (error) {
    console.error(
      "Google credential decode error:",
      error
    );

    return null;
  }
}

/* =====================================================
   EMAIL TO NAME
===================================================== */

function getNameFromEmail(
  email
) {
  const localPart =
    email.split("@")[0] ||
    "Student";

  const cleaned =
    localPart
      .replace(
        /[._-]+/g,
        " "
      )
      .trim();

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

/* =====================================================
   INITIALS
===================================================== */

function getInitials(name) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "ST";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}
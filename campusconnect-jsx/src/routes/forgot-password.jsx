import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  GraduationCap,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();

  // =====================================================
  // STEP
  // 1 = Email
  // 2 = OTP
  // 3 = New Password
  // =====================================================

  const [step, setStep] = useState(1);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =====================================================
  // RESET TOKEN
  // =====================================================

  const [resetToken, setResetToken] = useState("");

  // =====================================================
  // UI STATES
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // OTP TIMER - 1 MINUTE
  // =====================================================

  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  // =====================================================
  // FORMAT TIMER
  // Example:
  // 60  -> 01:00
  // 59  -> 00:59
  // 10  -> 00:10
  // 0   -> 00:00
  // =====================================================

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // =====================================================
  // OTP COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (step !== 2 || otpTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimer((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setOtpExpired(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpTimer]);

  // =====================================================
  // SEND OTP
  // =====================================================

  const handleSendOTP = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to send OTP."
        );
        return;
      }

      // Save normalized email
      setEmail(normalizedEmail);

      // Clear previous OTP
      setOtp("");

      // Start 1-minute timer
      setOtpTimer(60);

      // OTP is not expired
      setOtpExpired(false);

      setSuccess(
        "OTP sent successfully to your email."
      );

      // Move to OTP screen
      setStep(2);
    } catch (error) {
      console.error("Send OTP error:", error);

      setError(
        "Cannot connect to backend. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Check OTP expiration first
    if (otpExpired || otpTimer <= 0) {
      setError(
        "OTP has expired. Please request a new OTP."
      );
      return;
    }

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "OTP must contain exactly 6 digits."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid OTP."
        );
        return;
      }

      if (!data.resetToken) {
        setError(
          "OTP verified but reset token was not received."
        );
        return;
      }

      // Save reset token
      setResetToken(data.resetToken);

      // Stop OTP timer
      setOtpTimer(0);
      setOtpExpired(false);

      setSuccess(
        "OTP verified successfully."
      );

      // Move to password reset
      setStep(3);
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      setError(
        "Cannot connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PASSWORD RULES
  // =====================================================

  const passwordRules = {
    length:
      newPassword.length >= 6 &&
      newPassword.length <= 8,

    uppercase:
      /[A-Z]/.test(newPassword),

    lowercase:
      /[a-z]/.test(newPassword),

    number:
      /[0-9]/.test(newPassword),

    symbol:
      /[^A-Za-z0-9]/.test(newPassword),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.symbol;

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!isPasswordValid) {
      setError(
        "Please satisfy all password requirements."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Password reset failed."
        );
        return;
      }

      setSuccess(
        "Password reset successfully!"
      );

      // Redirect to login
      setTimeout(() => {
        navigate({
          to: "/login",
        });
      }, 1500);
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        "Cannot connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to resend OTP."
        );
        return;
      }

      // Clear old OTP
      setOtp("");

      // Restart timer
      setOtpTimer(60);

      // Mark OTP as active
      setOtpExpired(false);

      setSuccess(
        "A new OTP has been sent to your email."
      );
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        "Cannot connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (step === 1) {
      navigate({
        to: "/login",
      });

      return;
    }

    if (step === 2) {
      setStep(1);

      setOtp("");

      // Reset timer
      setOtpTimer(0);
      setOtpExpired(false);

      setError("");
      setSuccess("");

      return;
    }

    if (step === 3) {
      setStep(2);

      setResetToken("");

      setNewPassword("");
      setConfirmPassword("");

      setError("");
      setSuccess("");
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

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
        {/* =================================================
            LEFT SIDE
        ================================================= */}

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
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-white/15
                backdrop-blur
              "
            >
              <GraduationCap size={24} />
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
              Reset your
              <br />
              CampusConnect
              <br />
              password.
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
              Don't worry if you forgot
              your password. Verify your
              email using a secure OTP
              and create a new password.
            </p>

            <div className="mt-10 space-y-4">
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
                <Mail className="h-5 w-5" />

                <span className="text-[15px] font-medium text-white/90">
                  OTP verification through email
                </span>
              </div>

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
                <CheckCircle className="h-5 w-5" />

                <span className="text-[15px] font-medium text-white/90">
                  Secure password reset
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/70">
            © 2026 CampusConnect · Student Affairs
          </p>
        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

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
            {/* =================================================
                MOBILE BRAND
            ================================================= */}

            <div
              className="
                mb-7
                flex
                items-center
                gap-3
                lg:hidden
              "
            >
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
                <GraduationCap size={20} />
              </div>

              <span className="text-xl font-bold text-[#132033]">
                CampusConnect
              </span>
            </div>

            {/* =================================================
                BACK
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              className="
                mb-6
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-[#64748b]
                transition
                hover:text-[#2563eb]
              "
            >
              <ArrowLeft size={17} />
              Back
            </button>

            {/* =================================================
                STEP 1 - EMAIL
            ================================================= */}

            {step === 1 && (
              <>
                <div
                  className="
                    mb-6
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#eaf2ff]
                    text-[#2563eb]
                  "
                >
                  <Mail size={25} />
                </div>

                <h2 className="text-[30px] font-bold tracking-tight text-[#101828]">
                  Forgot password?
                </h2>

                <p className="mt-2 text-[16px] leading-6 text-[#718097]">
                  Enter your registered email
                  address and we'll send you
                  a 6-digit OTP.
                </p>

                <form
                  onSubmit={handleSendOTP}
                  className="mt-8"
                >
                  <label
                    htmlFor="forgot-email"
                    className="mb-2 block text-sm font-medium text-[#172033]"
                  >
                    Email address
                  </label>

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="student@gmail.com"
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

                  <button
                    type="submit"
                    disabled={loading}
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
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading
                      ? "Sending OTP..."
                      : "Send OTP"}
                  </button>
                </form>
              </>
            )}

            {/* =================================================
                STEP 2 - OTP
            ================================================= */}

            {step === 2 && (
              <>
                <div
                  className="
                    mb-6
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#eaf2ff]
                    text-[#2563eb]
                  "
                >
                  <Mail size={25} />
                </div>

                <h2 className="text-[30px] font-bold tracking-tight text-[#101828]">
                  Verify OTP
                </h2>

                <p className="mt-2 text-[16px] leading-6 text-[#718097]">
                  Enter the 6-digit OTP sent
                  to
                  <br />

                  <span className="font-semibold text-[#172033]">
                    {email}
                  </span>
                </p>

                <form
                  onSubmit={handleVerifyOTP}
                  className="mt-8"
                >
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium text-[#172033]"
                  >
                    Verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="000000"
                    autoComplete="one-time-code"
                    className="
                      w-full
                      rounded-full
                      border
                      border-[#cfdae8]
                      bg-white
                      px-5
                      py-3
                      text-center
                      text-[20px]
                      font-semibold
                      tracking-[0.35em]
                      text-[#172033]
                      shadow-sm
                      outline-none
                      transition
                      placeholder:text-[#b2bdca]
                      focus:border-[#4a83df]
                      focus:ring-4
                      focus:ring-[#dbe9ff]
                    "
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      otpExpired ||
                      otpTimer <= 0
                    }
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
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify OTP"}
                  </button>
                </form>

                {/* =================================================
                    OTP TIMER
                ================================================= */}

                <div className="mt-5 text-center">
                  {!otpExpired && otpTimer > 0 ? (
                    <p className="text-sm text-[#718097]">
                      OTP expires in{" "}
                      <span className="font-bold text-[#2563eb]">
                        {formatTimer(otpTimer)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-red-500">
                      OTP has expired.
                    </p>
                  )}
                </div>

                {/* =================================================
                    RESEND OTP
                ================================================= */}

                <div className="mt-3 text-center">
                  <span className="text-sm text-[#718097]">
                    Didn't receive the OTP?{" "}
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={
                      loading ||
                      (!otpExpired && otpTimer > 0)
                    }
                    className="
                      text-sm
                      font-semibold
                      text-[#2563eb]
                      hover:underline
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Resend OTP
                  </button>
                </div>
              </>
            )}

            {/* =================================================
                STEP 3 - NEW PASSWORD
            ================================================= */}

            {step === 3 && (
              <>
                <div
                  className="
                    mb-6
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-green-50
                    text-green-600
                  "
                >
                  <CheckCircle size={25} />
                </div>

                <h2 className="text-[30px] font-bold tracking-tight text-[#101828]">
                  Create new password
                </h2>

                <p className="mt-2 text-[16px] leading-6 text-[#718097]">
                  Your OTP has been verified.
                  Create a new password for
                  your account.
                </p>

                <form
                  onSubmit={handleResetPassword}
                  className="mt-8"
                >
                  {/* New password */}

                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-medium text-[#172033]"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      maxLength={8}
                      placeholder="Enter new password"
                      autoComplete="new-password"
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
                          (previous) =>
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
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Password rules */}

                  {newPassword && (
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

                  {/* Confirm password */}

                  <div className="mt-5">
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-sm font-medium text-[#172033]"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        maxLength={8}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
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
                          setShowConfirmPassword(
                            (previous) =>
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
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      mt-6
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
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading
                      ? "Resetting password..."
                      : "Reset password"}
                  </button>
                </form>
              </>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

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

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                className="
                  mt-5
                  rounded-[18px]
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-sm
                  text-green-700
                "
              >
                {success}
              </div>
            )}

            {/* =================================================
                LOGIN LINK
            ================================================= */}

            <p className="mt-7 text-center text-sm text-[#6f7e91]">
              Remember your password?{" "}

              <Link
                to="/login"
                className="font-semibold text-[#2563eb] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// =====================================================
// PASSWORD RULE
// =====================================================

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-1.5 ${
        valid
          ? "text-green-600"
          : "text-[#8995a7]"
      }`}
    >
      {valid ? (
        <CheckCircle size={13} />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-[#aab4c2]" />
      )}

      {text}
    </div>
  );
}
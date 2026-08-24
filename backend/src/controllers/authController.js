import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import { sendOTPEmail } from "../services/emailService.js";

// =====================================================
// GENERATE JWT
// =====================================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================================
// FORMAT USER
// =====================================================

const formatUser = (user) => {
  return {
    id: user._id.toString(),
    _id: user._id.toString(),

    name: user.name,
    email: user.email,
    role: user.role,

    studentId: user.studentId || "",
    department: user.department || "",
    year: user.year || "",
    bio: user.bio || "",

    preferences: {
      events: user.preferences?.events ?? true,
      clubs: user.preferences?.clubs ?? true,
      mentions: user.preferences?.mentions ?? true,
      digest: user.preferences?.digest ?? false,
      discoverable: user.preferences?.discoverable ?? true,
    },

    status: user.status || "active",

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// =====================================================
// UPDATE PROFILE - STUDENT
// =====================================================

export const updateProfile = async (req, res) => {
  try {
    const {
      studentId,
      department,
      year,
      bio,
      preferences,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (studentId !== undefined) {
      user.studentId = String(studentId).trim();
    }

    if (department !== undefined) {
      user.department = String(department).trim();
    }

    if (year !== undefined) {
      user.year = String(year).trim();
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    if (preferences && typeof preferences === "object") {
      if (!user.preferences) {
        user.preferences = {};
      }

      const allowedKeys = [
        "events",
        "clubs",
        "mentions",
        "digest",
        "discoverable",
      ];

      for (const key of allowedKeys) {
        if (preferences[key] !== undefined) {
          user.preferences[key] = Boolean(preferences[key]);
        }
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// =====================================================
// STUDENT REGISTER
// =====================================================

export const studentRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      studentId = "",
      department = "",
      year = "",
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",

      studentId: studentId || "",
      department: department || "",
      year: year || "",

      bio: "",
      status: "active",
    });

    const token = generateToken(user._id);

    console.log("====================================");
    console.log("NEW STUDENT REGISTERED");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("MongoDB ID:", user._id.toString());
    console.log("Role:", user.role);
    console.log("====================================");

    return res.status(201).json({
      success: true,
      message: "Student registration successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Student register error:", error);

    return res.status(500).json({
      success: false,
      message: "Student registration failed",
    });
  }
};

// =====================================================
// STUDENT LOGIN
// =====================================================

export const studentLogin = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      role: "student",
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid student email or password",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid student email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Student login successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Student login error:", error);

    return res.status(500).json({
      success: false,
      message: "Student login failed",
    });
  }
};

// =====================================================
// GOOGLE LOGIN
// =====================================================

export const googleLogin = async (req, res) => {
  try {
    const {
      googleId,
      name,
      email,
      avatar,
    } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: "Google ID and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      if (user.role !== "student") {
        return res.status(403).json({
          success: false,
          message:
            "This Google account is not registered as a student account.",
        });
      }

      if (user.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Your account is blocked",
        });
      }
    }

    if (!user) {
      const randomPassword = crypto
        .randomBytes(32)
        .toString("hex");

      const hashedPassword = await bcrypt.hash(
        randomPassword,
        10
      );

      user = await User.create({
        name: name?.trim() || "Student",
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",

        studentId: "",
        department: "",
        year: "",
        bio: "",

        status: "active",
      });

      console.log("====================================");
      console.log("NEW GOOGLE STUDENT REGISTERED");
      console.log("Name:", user.name);
      console.log("Email:", user.email);
      console.log("MongoDB ID:", user._id.toString());
      console.log("====================================");
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google login successful",

      token,

      user: {
        ...formatUser(user),
        avatar: avatar || "",
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};

// =====================================================
// ADMIN LOGIN
// =====================================================

export const adminLogin = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};

// =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    // Generate 6-digit OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash OTP before storing it
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // OTP valid for 10 minutes
    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.resetOtpHash = otpHash;
    user.resetOtpExpiresAt = otpExpiresAt;

    await user.save();

    // Send OTP
    await sendOTPEmail(user.email, otp);

    console.log("====================================");
    console.log("PASSWORD RESET OTP SENT");
    console.log("Email:", user.email);
    console.log("OTP expires:", otpExpiresAt);
    console.log("====================================");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// =====================================================
// VERIFY OTP
// =====================================================

export const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP request found. Please request a new OTP.",
      });
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiresAt) {
      user.resetOtpHash = null;
      user.resetOtpExpiresAt = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Hash entered OTP
    const enteredOtpHash = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    if (enteredOtpHash !== user.resetOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is correct
    // Clear OTP so it cannot be reused
    user.resetOtpHash = null;
    user.resetOtpExpiresAt = null;

    await user.save();

    // Generate short-lived password reset token
    const resetToken = jwt.sign(
      {
        userId: user._id.toString(),
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async (req, res) => {
  try {
    const {
      resetToken,
      newPassword,
    } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Reset token is invalid or expired",
      });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid password reset token",
      });
    }

    const user = await User.findById(
      decoded.userId
    ).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    // Make sure any old OTP data is cleared
    user.resetOtpHash = null;
    user.resetOtpExpiresAt = null;

    await user.save();

    console.log("====================================");
    console.log("PASSWORD RESET SUCCESSFUL");
    console.log("Email:", user.email);
    console.log("====================================");

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};
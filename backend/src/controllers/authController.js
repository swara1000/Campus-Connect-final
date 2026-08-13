import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
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

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
      studentId,
      department,
      year,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Student registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
      },
    });
  } catch (error) {
    console.error(
      "Student register error:",
      error
    );

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || user.role !== "student") {
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
      },
    });
  } catch (error) {
    console.error(
      "Student login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Student login failed",
    });
  }
};

// =====================================================
// ADMIN LOGIN
// =====================================================

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};
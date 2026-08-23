import express from "express";

import {
  studentRegister,
  studentLogin,
  googleLogin,
  adminLogin,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateProfile,
} from "../controllers/authController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// STUDENT AUTHENTICATION
// =====================================================

router.post(
  "/student/register",
  studentRegister
);

router.post(
  "/student/login",
  studentLogin
);

// =====================================================
// GOOGLE
// =====================================================

router.post(
  "/google",
  googleLogin
);

// =====================================================
// ADMIN
// =====================================================

router.post(
  "/admin/login",
  adminLogin
);

// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-otp",
  verifyOTP
);

router.post(
  "/reset-password",
  resetPassword
);

// =====================================================
// PROFILE
// =====================================================

router.patch(
  "/profile",
  protect,
  updateProfile
);

export default router;
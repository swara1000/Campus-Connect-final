import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAdminBroadcasts,
  createAdminBroadcast,
  sendAdminBroadcast,
  deleteAdminBroadcast,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// =====================================================
// ADMIN BROADCASTS (compose/send/delete campus-wide notices)
// GET    /api/notifications/admin
// POST   /api/notifications/admin
// PUT    /api/notifications/admin/:id/send
// DELETE /api/notifications/admin/:id
// =====================================================

router.get("/admin", protect, adminOnly, getAdminBroadcasts);

router.post("/admin", protect, adminOnly, createAdminBroadcast);

router.put(
  "/admin/:id/send",
  protect,
  adminOnly,
  sendAdminBroadcast
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteAdminBroadcast
);

// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get(
  "/",
  protect,
  getMyNotifications
);

// =====================================================
// MARK ONE AS READ
// PUT /api/notifications/:id/read
// =====================================================

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// =====================================================
// MARK ALL AS READ
// PUT /api/notifications/read-all
// =====================================================

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

export default router;
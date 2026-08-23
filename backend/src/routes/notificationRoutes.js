import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

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
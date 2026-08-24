import express from "express";

import {
  getEvents,
  getEventById,
  getEventRegistrations,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventRegistrationStatus,
  getMyRegisteredEvents,
} from "../controllers/eventController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  adminOnly,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

// Student + Admin can see events
router.get("/", getEvents);

// STUDENT - events the current student has registered for
// (must come before the "/:id" route below)
router.get(
  "/my-registrations",
  protect,
  getMyRegisteredEvents
);

// Student + Admin can see a single event
router.get("/:id", getEventById);

// ADMIN - registered students for an event
router.get(
  "/:id/registrations",
  protect,
  adminOnly,
  getEventRegistrations
);

// CHECK REGISTRATION STATUS
router.get(
  "/:id/registration-status",
  protect,
  getEventRegistrationStatus
);

// REGISTER FOR EVENT
router.post(
  "/:id/register",
  protect,
  registerForEvent
);

// CANCEL REGISTRATION
router.delete(
  "/:id/register",
  protect,
  cancelEventRegistration
);

// Admin only
router.post(
  "/",
  protect,
  adminOnly,
  createEvent
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateEvent
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteEvent
);

export default router;
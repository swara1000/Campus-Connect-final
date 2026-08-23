import express from "express";

import {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  getClubMembershipStatus,
  getClubMembers,
  getMyClubs,
} from "../controllers/clubController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  adminOnly,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET ALL CLUBS
router.get("/", getClubs);

// GET CLUBS THE CURRENT STUDENT HAS JOINED
router.get(
  "/my-memberships",
  protect,
  getMyClubs
);

// GET REAL CLUB MEMBERS - ADMIN
router.get(
  "/:id/members",
  protect,
  adminOnly,
  getClubMembers
);

// CHECK STUDENT MEMBERSHIP
router.get(
  "/:id/membership-status",
  protect,
  getClubMembershipStatus
);

// JOIN CLUB
router.post(
  "/:id/join",
  protect,
  joinClub
);

// LEAVE CLUB
router.delete(
  "/:id/join",
  protect,
  leaveClub
);

// GET ONE CLUB
router.get(
  "/:id",
  getClubById
);

// CREATE CLUB - ADMIN
router.post(
  "/",
  protect,
  adminOnly,
  createClub
);

// UPDATE CLUB - ADMIN
router.put(
  "/:id",
  protect,
  adminOnly,
  updateClub
);

// DELETE CLUB - ADMIN
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteClub
);

export default router;
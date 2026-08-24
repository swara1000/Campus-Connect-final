import express from "express";

import {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  applyToPlacement,
  withdrawApplication,
  savePlacement,
  unsavePlacement,
  getPlacementStatus,
  getMyApplications,
  getMySavedPlacements,
} from "../controllers/placementController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Student + Admin can see placements
router.get("/", getPlacements);

// STUDENT - placements the current student has applied to
// (must come before the "/:id" route below)
router.get("/my-applications", protect, getMyApplications);

// STUDENT - placements the current student has saved
router.get("/my-saved", protect, getMySavedPlacements);

// Student + Admin can see a single placement
router.get("/:id", getPlacementById);

// CHECK APPLICATION / SAVE STATUS
router.get("/:id/status", protect, getPlacementStatus);

// APPLY TO PLACEMENT
router.post("/:id/apply", protect, applyToPlacement);

// WITHDRAW APPLICATION
router.delete("/:id/apply", protect, withdrawApplication);

// SAVE PLACEMENT
router.post("/:id/save", protect, savePlacement);

// UNSAVE PLACEMENT
router.delete("/:id/save", protect, unsavePlacement);

// Admin only
router.post("/", protect, adminOnly, createPlacement);

router.put("/:id", protect, adminOnly, updatePlacement);

router.delete("/:id", protect, adminOnly, deletePlacement);

export default router;

import express from "express";

import {
  getPeerLearningRequests,
  getPeerLearningRequestById,
  createPeerLearningRequest,
  acceptPeerLearningRequest,
  cancelPeerLearningRequest,
} from "../controllers/peerLearningController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ALL STUDENTS CAN VIEW
router.get(
  "/",
  protect,
  getPeerLearningRequests
);

// ONE REQUEST
router.get(
  "/:id",
  protect,
  getPeerLearningRequestById
);

// CREATE REQUEST
router.post(
  "/",
  protect,
  createPeerLearningRequest
);

// ACCEPT REQUEST
router.post(
  "/:id/accept",
  protect,
  acceptPeerLearningRequest
);

// CANCEL OWN REQUEST
router.patch(
  "/:id/cancel",
  protect,
  cancelPeerLearningRequest
);

export default router;
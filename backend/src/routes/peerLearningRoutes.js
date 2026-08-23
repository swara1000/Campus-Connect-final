import express from "express";

import {
  getPeerLearningRequests,
  getPeerLearningRequestById,
  createPeerLearningRequest,
  acceptPeerLearningRequest,
  cancelPeerLearningRequest,
  adminApprovePeerLearningRequest,
  adminRejectPeerLearningRequest,
} from "../controllers/peerLearningController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* =====================================================
   GET ALL PEER LEARNING REQUESTS
===================================================== */

router.get(
  "/",
  protect,
  getPeerLearningRequests
);

/* =====================================================
   GET ONE REQUEST
===================================================== */

router.get(
  "/:id",
  protect,
  getPeerLearningRequestById
);

/* =====================================================
   CREATE REQUEST - STUDENT
===================================================== */

router.post(
  "/",
  protect,
  createPeerLearningRequest
);

/* =====================================================
   ACCEPT REQUEST - STUDENT
===================================================== */

router.post(
  "/:id/accept",
  protect,
  acceptPeerLearningRequest
);

/* =====================================================
   ADMIN APPROVE REQUEST
===================================================== */

router.post(
  "/:id/admin-approve",
  protect,
  adminApprovePeerLearningRequest
);

/* =====================================================
   ADMIN REJECT REQUEST
===================================================== */

router.post(
  "/:id/admin-reject",
  protect,
  adminRejectPeerLearningRequest
);

/* =====================================================
   CANCEL OWN REQUEST - STUDENT
===================================================== */

router.patch(
  "/:id/cancel",
  protect,
  cancelPeerLearningRequest
);

export default router;
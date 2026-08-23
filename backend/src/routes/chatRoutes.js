import express from "express";

import {
  getOrCreatePeerConversation,
  getMyConversations,
  getUnreadMessageCount,
  getMessages,
  sendMessage,
} from "../controllers/chatController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* =====================================================
   GET ALL MY CONVERSATIONS
===================================================== */

router.get(
  "/conversations",
  protect,
  getMyConversations
);

/* =====================================================
   GET UNREAD MESSAGE COUNT
===================================================== */

router.get(
  "/unread-count",
  protect,
  getUnreadMessageCount
);

/* =====================================================
   OPEN / CREATE CONVERSATION
===================================================== */

router.post(
  "/peer-learning/:requestId",
  protect,
  getOrCreatePeerConversation
);

/* =====================================================
   GET MESSAGES
===================================================== */

router.get(
  "/conversations/:conversationId/messages",
  protect,
  getMessages
);

/* =====================================================
   SEND MESSAGE
===================================================== */

router.post(
  "/conversations/:conversationId/messages",
  protect,
  sendMessage
);

export default router;
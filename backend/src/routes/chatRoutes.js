import express from "express";

import {
  getOrCreatePeerConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/chatController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL MY CONVERSATIONS
router.get(
  "/conversations",
  protect,
  getMyConversations
);

// OPEN / CREATE CONVERSATION FROM PEER LEARNING MATCH
router.post(
  "/peer-learning/:requestId",
  protect,
  getOrCreatePeerConversation
);

// GET MESSAGES
router.get(
  "/conversations/:conversationId/messages",
  protect,
  getMessages
);

// SEND MESSAGE
router.post(
  "/conversations/:conversationId/messages",
  protect,
  sendMessage
);

export default router;
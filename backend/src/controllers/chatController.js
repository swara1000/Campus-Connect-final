import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import PeerLearning from "../models/PeerLearning.js";

/* =====================================================
   GET OR CREATE CONVERSATION FOR PEER LEARNING MATCH
===================================================== */

export const getOrCreatePeerConversation = async (req, res) => {
  try {
    const { requestId } = req.params;

    const peerRequest = await PeerLearning.findById(requestId);

    if (!peerRequest) {
      return res.status(404).json({
        success: false,
        message: "Peer learning request not found",
      });
    }

    if (peerRequest.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Peer learning request is not accepted yet",
      });
    }

    const requesterId =
      peerRequest.requestedBy.toString();

    const accepterId =
      peerRequest.acceptedBy?.toString();

    if (!accepterId) {
      return res.status(400).json({
        success: false,
        message: "No matched student found",
      });
    }

    const currentUserId =
      req.user._id.toString();

    // Only matched students can open this chat
    if (
      currentUserId !== requesterId &&
      currentUserId !== accepterId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this peer learning match",
      });
    }

    /*
     * IMPORTANT:
     * Find an existing conversation containing
     * BOTH students.
     *
     * This gives Student A and Student B the
     * SAME conversation even if they have
     * multiple Peer Learning matches.
     */

    let conversation =
      await Conversation.findOne({
        participants: {
          $all: [
            peerRequest.requestedBy,
            peerRequest.acceptedBy,
          ],
        },
      }).populate(
        "participants",
        "name email department year"
      );

    // No conversation between these two students yet
    if (!conversation) {
      conversation =
        await Conversation.create({
          participants: [
            peerRequest.requestedBy,
            peerRequest.acceptedBy,
          ],

          peerLearningRequest:
            peerRequest._id,

          lastMessage: "",
        });

      conversation =
        await Conversation.findById(
          conversation._id
        ).populate(
          "participants",
          "name email department year"
        );
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Get/create conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to open conversation",
    });
  }
};

/* =====================================================
   GET MY CONVERSATIONS
===================================================== */

export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate(
        "participants",
        "name email department year"
      )
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

/* =====================================================
   GET MESSAGES
===================================================== */

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (participantId) =>
        participantId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "name email")
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

/* =====================================================
   SEND MESSAGE + REAL-TIME EMIT
===================================================== */

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (participantId) =>
        participantId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text.trim(),
    });

    conversation.lastMessage = text.trim();
    await conversation.save();

    const populatedMessage = await Message.findById(
      message._id
    ).populate("sender", "name email");

    /* =================================================
       SOCKET.IO REAL-TIME MESSAGE
    ================================================= */

    const io = req.app.get("io");

    if (io) {
      io.to(conversationId).emit(
        "new-message",
        {
          _id: populatedMessage._id,
          conversation:
            populatedMessage.conversation,
          sender:
            populatedMessage.sender,
          text:
            populatedMessage.text,
          read:
            populatedMessage.read,
          createdAt:
            populatedMessage.createdAt,
          updatedAt:
            populatedMessage.updatedAt,
        }
      );

      console.log(
        `Real-time message emitted to conversation ${conversationId}`
      );
    } else {
      console.warn(
        "Socket.IO instance not found"
      );
    }

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};
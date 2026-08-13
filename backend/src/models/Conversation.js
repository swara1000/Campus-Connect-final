import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    peerLearningRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeerLearning",
      default: null,
    },

    lastMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;
import mongoose from "mongoose";

const peerLearningSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    skillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    preferredMode: {
      type: String,
      enum: ["Online", "Offline", "Either"],
      default: "Either",
    },

    preferredTime: {
  type: String,
  default: "Flexible",
},

    status: {
      type: String,
      enum: ["Open", "Accepted", "Completed", "Cancelled"],
      default: "Open",
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PeerLearning = mongoose.model(
  "PeerLearning",
  peerLearningSchema,
  "learningrequests"
);

export default PeerLearning;
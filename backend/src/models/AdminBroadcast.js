import mongoose from "mongoose";

// =====================================================
// ADMIN BROADCAST
// A "campaign" composed by an admin from the Notifications
// panel (title/message/audience/channel). When sent, it
// fans out into individual Notification documents (one per
// recipient) so students see it in their real notification
// feed / bell in real time.
// =====================================================

const adminBroadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    audience: {
      type: String,
      enum: ["All students", "Final year", "Club members", "Faculty"],
      default: "All students",
    },

    channel: {
      type: String,
      enum: ["push", "email", "in-app"],
      default: "push",
    },

    status: {
      type: String,
      enum: ["Sent", "Scheduled", "Draft"],
      default: "Draft",
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    recipientCount: {
      type: Number,
      default: 0,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AdminBroadcast = mongoose.model(
  "AdminBroadcast",
  adminBroadcastSchema
);

export default AdminBroadcast;

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    club: {
      type: String,
      default: "",
    },

    desc: {
      type: String,
      default: "",
    },

    date: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      default: "",
    },

    regCap: {
      type: Number,
      default: 100,
      min: 1,
    },

    regCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
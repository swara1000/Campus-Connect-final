import mongoose from "mongoose";

const placementApplicationSchema = new mongoose.Schema(
  {
    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Placement",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applied: {
      type: Boolean,
      default: false,
    },

    appliedAt: {
      type: Date,
      default: null,
    },

    saved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

placementApplicationSchema.index(
  { placement: 1, student: 1 },
  { unique: true }
);

const PlacementApplication = mongoose.model(
  "PlacementApplication",
  placementApplicationSchema
);

export default PlacementApplication;

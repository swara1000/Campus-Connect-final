import mongoose from "mongoose";

const clubMembershipSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["joined", "left"],
      default: "joined",
    },
  },
  {
    timestamps: true,
  }
);

clubMembershipSchema.index(
  { club: 1, student: 1 },
  { unique: true }
);

const ClubMembership = mongoose.model(
  "ClubMembership",
  clubMembershipSchema
);

export default ClubMembership;
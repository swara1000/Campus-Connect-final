import mongoose from "mongoose";

const placementSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Internship", "Full-time", "Job Drive"],
      default: "Internship",
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    stipend: {
      type: String,
      default: "",
      trim: true,
    },

    eligibility: {
      type: String,
      default: "",
      trim: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    logo: {
      type: String,
      default: "💼",
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    applicantCount: {
      type: Number,
      default: 0,
      min: 0,
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

const Placement = mongoose.model("Placement", placementSchema);

export default Placement;

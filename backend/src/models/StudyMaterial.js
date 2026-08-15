import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
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

    semester: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["Notes", "PYQ", "Assignment"],
      default: "Notes",
    },

    summary: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    uploadedBy: {
      type: String,
      default: "Admin",
    },

    downloads: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    ratings: {
      type: Number,
      default: 0,
    },

    comments: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const StudyMaterial = mongoose.model(
  "StudyMaterial",
  studyMaterialSchema
);

export default StudyMaterial;
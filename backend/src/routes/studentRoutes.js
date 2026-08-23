import express from "express";

import {
  getAllStudents,
  getStudentById,
} from "../controllers/studentController.js";

const router = express.Router();

// =====================================================
// ADMIN STUDENT MANAGEMENT
// =====================================================

// GET ALL REGISTERED STUDENTS
router.get("/", getAllStudents);

// GET ONE STUDENT
router.get("/:id", getStudentById);

export default router;
import express from "express";

import {
  studentRegister,
  studentLogin,
  adminLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);
router.post("/admin/login", adminLogin);

export default router;
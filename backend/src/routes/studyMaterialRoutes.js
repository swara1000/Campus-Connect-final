import express from "express";

import {
  getStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
} from "../controllers/studyMaterialController.js";

const router = express.Router();

router.get("/", getStudyMaterials);

router.post("/", createStudyMaterial);

router.put("/:id", updateStudyMaterial);

router.delete("/:id", deleteStudyMaterial);

export default router;
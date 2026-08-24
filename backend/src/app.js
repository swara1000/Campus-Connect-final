import express from "express";
import cors from "cors";

// =====================================================
// ROUTES
// =====================================================

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

import eventRoutes from "./routes/eventRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import peerLearningRoutes from "./routes/peerLearningRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import studyMaterialRoutes from "./routes/studyMaterialRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import placementRoutes from "./routes/placementRoutes.js";

const app = express();

// =====================================================
// CORS
// =====================================================

const defaultOrigins = [
  "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
  "http://localhost:5176", "http://localhost:8080", "http://localhost:8081",
];
const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(normalizeOrigin).filter(Boolean)
  : [];
const allowedOrigins = new Set([
  ...defaultOrigins.map(normalizeOrigin),
  ...envOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error(`HTTP origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// APIs
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/students",
  studentRoutes
);

app.use(
  "/api/events",
  eventRoutes
);

app.use(
  "/api/clubs",
  clubRoutes
);

app.use(
  "/api/peer-learning",
  peerLearningRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/study-materials",
  studyMaterialRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/placements",
  placementRoutes
);

// =====================================================
// TEST
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusConnect Backend Running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy",
  });
});

export default app;
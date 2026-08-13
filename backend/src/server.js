import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

/* =====================================================
   CREATE HTTP SERVER
===================================================== */

const httpServer = http.createServer(app);

/* =====================================================
   SOCKET.IO
===================================================== */

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:8080",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* =====================================================
   SOCKET EVENTS
===================================================== */

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  // Join a specific private conversation
  socket.on(
    "join-conversation",
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socket.join(conversationId);

      console.log(
        `Socket ${socket.id} joined conversation ${conversationId}`
      );
    }
  );

  // Leave conversation
  socket.on(
    "leave-conversation",
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socket.leave(conversationId);
    }
  );

  // Typing
  socket.on(
    "typing",
    ({
      conversationId,
      userName,
    }) => {
      if (!conversationId) {
        return;
      }

      socket
        .to(conversationId)
        .emit("user-typing", {
          conversationId,
          userName,
        });
    }
  );

  // Stop typing
  socket.on(
    "stop-typing",
    ({
      conversationId,
    }) => {
      if (!conversationId) {
        return;
      }

      socket
        .to(conversationId)
        .emit("user-stop-typing", {
          conversationId,
        });
    }
  );

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

/* =====================================================
   MAKE IO AVAILABLE TO CONTROLLERS
===================================================== */

app.set("io", io);

/* =====================================================
   START SERVER
===================================================== */

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );

        console.log(
          "Socket.IO server ready"
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );
  }
};

startServer();
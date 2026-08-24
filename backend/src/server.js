import "dotenv/config";

console.log(
  "Gemini key loaded:",
  Boolean(process.env.GEMINI_API_KEY)
);

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
const defaultSocketOrigins = [
  "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
  "http://localhost:5176", "http://localhost:8080", "http://localhost:8081",
];
const envSocketOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const io = new Server(httpServer, {
  cors: {
    origin: [...new Set([...defaultSocketOrigins, ...envSocketOrigins])],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const conversationRoom = (conversationId) =>
  `conversation-${String(conversationId)}`;

/* =====================================================
   SOCKET EVENTS
===================================================== */

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  /* =================================================
     USER NOTIFICATION ROOM
  ================================================= */

  socket.on("join-user", (userId) => {
    if (!userId) {
      console.warn(
        "join-user called without userId"
      );

      return;
    }

    const room = `user-${userId}`;

    socket.join(room);

    console.log(
      `User ${userId} joined notification room ${room}`
    );
  });

  /* =================================================
     CHAT CONVERSATION
  ================================================= */

  socket.on(
    "join-conversation",
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socket.join(conversationRoom(conversationId));

      console.log(
        `Socket ${socket.id} joined conversation ${conversationId}`
      );
    }
  );

  /* =================================================
     LEAVE CONVERSATION
  ================================================= */

  socket.on(
    "leave-conversation",
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socket.leave(conversationRoom(conversationId));

      console.log(
        `Socket ${socket.id} left conversation ${conversationId}`
      );
    }
  );

  /* =================================================
     TYPING
  ================================================= */

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
        .to(conversationRoom(conversationId))
        .emit("user-typing", {
          conversationId,
          userName,
        });
    }
  );

  /* =================================================
     STOP TYPING
  ================================================= */

  socket.on(
    "stop-typing",
    ({
      conversationId,
    }) => {
      if (!conversationId) {
        return;
      }

      socket
        .to(conversationRoom(conversationId))
        .emit(
          "user-stop-typing",
          {
            conversationId,
          }
        );
    }
  );

  /* =================================================
     DISCONNECT
  ================================================= */

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

/* =====================================================
   MAKE SOCKET.IO AVAILABLE TO CONTROLLERS
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
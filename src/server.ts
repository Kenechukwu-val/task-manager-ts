import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import http from "http";
import path from "path";

import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import { setupSocket } from "./sockets/socketHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = setupSocket(httpServer);

app.set("io", io);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.socket.io",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000"],
      },
    },
  }),
);
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "..")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io ready`);
});

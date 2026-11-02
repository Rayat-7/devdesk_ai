import express from "express";
import cors from "cors";
import "dotenv/config";

import chatRoutes from "./routes/chat.routes";

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "DevDesk AI server is running"
  });
});

// Routes
app.use("/api/chat", chatRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`DevDesk AI running on port ${PORT}`);
});
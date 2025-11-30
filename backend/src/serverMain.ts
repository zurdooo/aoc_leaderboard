import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config";
import { login, logout, validateSession } from "./auth";
import { query } from "./db";

const app = express();

// Middleware
app.use(cors({ 
  origin: "http://localhost:5173", // Allow frontend origin
  credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api/health", async (_req, res) => {
  try {
    // Test DB connection
    await query('SELECT NOW()');
    res.json({ status: "ok", db: "connected", time: new Date().toISOString() });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ status: "error", db: "disconnected", error: String(err) });
  }
});
// TODO app.get('/api/leaderboard', getLeaderboard);.

app.post("/api/login", login);
app.post("/api/logout", logout);
app.get("/api/me", validateSession);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});



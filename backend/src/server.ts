import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config";
import { login, logout, validateSession } from "./controllers/authController";

const app = express();

// Middleware
app.use(cors({ 
  origin: "http://localhost:5173", // Allow frontend origin
  credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/api/login", login);
app.post("/api/logout", logout);
app.get("/api/me", validateSession);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


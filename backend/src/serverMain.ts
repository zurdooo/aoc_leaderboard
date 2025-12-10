import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config";
import { login, logout, validateSession } from "./auth";
import { query } from "./db";
import { submitUpload, handleSubmission } from "./submissions";
import { runSubmission } from "./dockerRunner";
import type { LeaderboardEntry } from "./types/leaderboardTypes";
import fs from "fs/promises";
import path from "path";
import { getLeaderboard } from "./leaderboard";

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true, // Allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api/health", async (_req, res) => {
  try {
    // Test DB connection
    await query("SELECT NOW()");
    res.json({ status: "ok", db: "connected", time: new Date().toISOString() });
  } catch (err) {
    console.error("Health check failed:", err);
    res
      .status(500)
      .json({ status: "error", db: "disconnected", error: String(err) });
  }
});
app.get('/api/leaderboard', getLeaderboard);

app.post("/api/login", login);
app.post("/api/logout", logout);
app.get("/api/me", validateSession);

// File submission endpoint
app.post("/api/submit", submitUpload, handleSubmission);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

// Always-on debug hook to validate Docker execution with a sample C++ file
async function runDockerDebugSample() {
  const sampleCodePath = path.join(__dirname, "..", "sample", "test.cpp");
  const sampleInputPath = path.join(__dirname, "..", "sample", "input.txt");

  try {
    const [codeBuf, inputBuf] = await Promise.all([
      fs.readFile(sampleCodePath),
      fs.readFile(sampleInputPath).catch(() => Buffer.from("")),
    ]);

    const sampleEntry: LeaderboardEntry = {
      rank: -1,
      userId: "debug-user",
      username: "docker-debug",
      year: new Date().getFullYear(),
      day: 0,
      part1Completed: true,
      part2Completed: false,
      language: "cpp",
      executionTimeMs: -1,
      memoryUsageKb: -1,
      linesOfRelevantCode: -1,
      submittedAt: new Date(),
    };

    console.log("[docker-debug] Running sample C++ submission...");
    const result = await runSubmission(codeBuf, sampleEntry, inputBuf);
    console.log("[docker-debug] Completed sample run:", {
      exitCode: result.executionTimeMs === -1 ? "unknown" : 0,
      language: result.language,
      executionTimeMs: result.executionTimeMs,
      memoryUsageKb: result.memoryUsageKb,
      linesOfRelevantCode: result.linesOfRelevantCode,
    });
  } catch (err) {
    console.error("[docker-debug] Failed to run sample:", err);
  }
}

// Always-on debug hook to validate Docker execution with a sample Python file
async function runDockerDebugSamplePy() {
  const sampleCodePath = path.join(__dirname, "..", "sample", "test.py");
  const sampleInputPath = path.join(__dirname, "..", "sample", "input.txt");

  try {
    const [codeBuf, inputBuf] = await Promise.all([
      fs.readFile(sampleCodePath),
      fs.readFile(sampleInputPath).catch(() => Buffer.from("")),
    ]);

    const sampleEntry: LeaderboardEntry = {
      rank: -1,
      userId: "debug-user",
      username: "docker-debug",
      year: new Date().getFullYear(),
      day: 0,
      part1Completed: true,
      part2Completed: false,
      language: "python",
      executionTimeMs: -1,
      memoryUsageKb: -1,
      linesOfRelevantCode: -1,
      submittedAt: new Date(),
    };

    console.log("[docker-debug] Running sample Python submission...");
    const result = await runSubmission(codeBuf, sampleEntry, inputBuf);
    console.log("[docker-debug] Completed sample Python run:", {
      exitCode: result.executionTimeMs === -1 ? "unknown" : 0,
      language: result.language,
      executionTimeMs: result.executionTimeMs,
      memoryUsageKb: result.memoryUsageKb,
      linesOfRelevantCode: result.linesOfRelevantCode,
    });
  } catch (err) {
    console.error("[docker-debug] Failed to run sample Python:", err);
  }
}

// Fire and forget; do not block server startup
runDockerDebugSample();
runDockerDebugSamplePy();

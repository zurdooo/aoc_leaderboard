import { Request, Response } from "express";
import { getLeaderboardEntries } from "./db";
import type { LeaderboardFilter } from "./types/leaderboardTypes";

/*
User requests leaderboard data, requests two options, overall leaderboard or leaderboard for a specific day, for now language is ignored
*/

// GET /api/leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const filters: LeaderboardFilter = {
      year: req.query.year ? Number(req.query.year) : undefined,
      day: req.query.day ? Number(req.query.day) : undefined,
      language:
        typeof req.query.language === "string"
          ? String(req.query.language)
          : undefined,
      username:
        typeof req.query.username === "string"
          ? String(req.query.username)
          : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const entries = await getLeaderboardEntries(filters);
    res.json({
      entries: entries.map((e) => ({
        ...e,
        submittedAt: e.submittedAt instanceof Date ? e.submittedAt.toISOString() : e.submittedAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

// POST /api/submit-stats
export const submitStats = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: "Stats submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit stats" });
  }
};

import { Request, Response } from "express";
import { query } from "./db";
import type {
  LeaderboardEntry,
  LeaderboardFilter,
} from "./types/leaderboardTypes";

/*
User requests leaderboard data, requests two options, overall leaderboard or leaderboard for a specific day, for now language is ignored
*/

// GET /api/leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // TODO(backlog): derive filters from query params (year, day, language, username)
    // const filters: LeaderboardFilter = {
    //   year: req.query.year ? Number(req.query.year) : undefined,
    //   day: req.query.day ? Number(req.query.day) : undefined,
    //   language: typeof req.query.language === "string" ? req.query.language : undefined,
    //   username: typeof req.query.username === "string" ? req.query.username : undefined,
    //   limit: req.query.limit ? Number(req.query.limit) : 50,
    //   cursor: typeof req.query.cursor === "string" ? req.query.cursor : undefined,
    // }; // Validate ranges before use.

    // TODO(backlog): query submissions joined with users sorted by submitted_at DESC
    // const result = await query('SELECT ... FROM submissions s JOIN users u ON ... WHERE ... ORDER BY submitted_at DESC LIMIT $1', [filters.limit]);
    // res.json({ entries: mapRowsToEntries(result.rows), nextCursor: makeCursor(result.rows) });

    res.json({ message: "Leaderboard data will go here" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

// POST /api/submit-stats
export const submitStats = async (req: Request, res: Response) => {
  try {
    const stats: LeaderboardEntry = req.body;

    // TODO(backlog): Validate payload & enforce auth context (req.user)
    // TODO(backlog): Insert into submissions table with returning submitted_at for ordering
    // await query('INSERT INTO leaderboard ...', [stats.userId, stats.day...]);

    res.json({ success: true, message: "Stats submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit stats" });
  }
};

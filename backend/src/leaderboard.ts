import { Request, Response } from "express";
import { query } from "./db";
import { LeaderboardEntry } from "./types/leaderboard";

/*
User requests leaderboard data, requests two options, overall leaderboard or leaderboard for a specific day, for now language is ignored
*/

// GET /api/leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // TODO: Implement fetching stats from DB
    // const { day, language } = req.query;
    // const result = await query('SELECT * FROM leaderboard ...');

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

    // TODO: Validate input
    // TODO: Insert into DB
    // await query('INSERT INTO leaderboard ...', [stats.userId, stats.day...]);

    res.json({ success: true, message: "Stats submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit stats" });
  }
};

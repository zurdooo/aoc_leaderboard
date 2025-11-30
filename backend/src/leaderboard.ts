import { Request, Response } from 'express';
import { query } from './db';
import { CodeStats } from './types/leaderboard';

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
    const stats: CodeStats = req.body;
    
    // TODO: Validate input
    // TODO: Insert into DB
    // await query('INSERT INTO leaderboard ...', [stats.userId, stats.day...]);

    res.json({ success: true, message: "Stats submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit stats" });
  }
};

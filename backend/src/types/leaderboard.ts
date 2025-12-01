export interface LeaderboardEntry {
  rank: number;
  userId: string; // User identifier by backend not displayed to users
  username: string; // User's display name
  day: number; // Advent of Code day (1-25)
  part1Completed: boolean;
  part2Completed: boolean;
  language: string; // e.g., 'python', 'javascript'
  executionTimeMs: number;
  memoryUsageKb: number;
  linesOfRelevantCode: number;
  submittedAt: Date;
}

// Usually filtered by day but user could request overall leaderboard
export interface LeaderboardFilter {
  day?: number;
}

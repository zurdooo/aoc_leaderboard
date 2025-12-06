export interface LeaderboardEntry {
  rank: number;
  userId: string; // User identifier by backend not displayed to users
  username: string; // User's display name
  year?: number; // Advent of Code year
  day: number; // Advent of Code day (1-25)
  part1Completed: boolean;
  part2Completed: boolean;
  language: string; // e.g., 'python', 'javascript'
  executionTimeMs: number;
  memoryUsageKb: number;
  linesOfRelevantCode: number;
  submittedAt: Date;
}

export interface LeaderboardFilter {
  year?: number;
  day?: number;
  language?: string;
  username?: string;
  limit?: number;
  cursor?: string;
}

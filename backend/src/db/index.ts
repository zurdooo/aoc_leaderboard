import { Pool } from 'pg';
import { DB_CONFIG } from '../config';
import type { LeaderboardEntry, LeaderboardFilter } from '../types/leaderboardTypes';

const pool = new Pool(DB_CONFIG);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// TODO: Define additional functions to query the database as needed
export const insertLeaderboardEntry = async (entry: LeaderboardEntry) => {
  // Ensure the table exists before attempting to insert
  await query(
    `CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      year INT,
      day INT NOT NULL,
      part1_completed BOOLEAN NOT NULL,
      part2_completed BOOLEAN NOT NULL,
      language TEXT NOT NULL,
      execution_time_ms INT NOT NULL,
      memory_usage_kb INT NOT NULL,
      lines_of_relevant_code INT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );

  const values = [
    entry.userId,
    entry.username,
    entry.year ?? null,
    entry.day,
    entry.part1Completed,
    entry.part2Completed,
    entry.language,
    entry.executionTimeMs,
    entry.memoryUsageKb,
    entry.linesOfRelevantCode,
    entry.submittedAt,
  ];

  await query(
    `INSERT INTO leaderboard_entries (
      user_id, username, year, day, part1_completed, part2_completed,
      language, execution_time_ms, memory_usage_kb, lines_of_relevant_code, submitted_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    values
  );
};

export const getLeaderboardEntries = async (
  filters: LeaderboardFilter
): Promise<LeaderboardEntry[]> => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.year) {
    params.push(filters.year);
    conditions.push(`year = $${params.length}`);
  }

  if (filters.day) {
    params.push(filters.day);
    conditions.push(`day = $${params.length}`);
  }

  if (filters.language) {
    params.push(filters.language.toLowerCase());
    conditions.push(`LOWER(language) = $${params.length}`);
  }

  if (filters.username) {
    params.push(filters.username.toLowerCase());
    conditions.push(`LOWER(username) = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 200) : 100;
  params.push(limit);

  const sql = `
    SELECT
      ROW_NUMBER() OVER (ORDER BY submitted_at DESC, execution_time_ms ASC NULLS LAST) AS rank,
      user_id,
      username,
      year,
      day,
      part1_completed,
      part2_completed,
      language,
      execution_time_ms,
      memory_usage_kb,
      lines_of_relevant_code,
      submitted_at
    FROM leaderboard_entries
    ${where}
    ORDER BY submitted_at DESC, execution_time_ms ASC NULLS LAST
    LIMIT $${params.length}
  `;

  const { rows } = await query(sql, params);
  return rows.map((row) => ({
    rank: Number(row.rank),
    userId: row.user_id,
    username: row.username,
    year: row.year ?? undefined,
    day: row.day,
    part1Completed: row.part1_completed,
    part2Completed: row.part2_completed,
    language: row.language,
    executionTimeMs: row.execution_time_ms,
    memoryUsageKb: row.memory_usage_kb,
    linesOfRelevantCode: row.lines_of_relevant_code,
    submittedAt: row.submitted_at,
  }));
};
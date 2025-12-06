import { Pool } from 'pg';
import { DB_CONFIG } from '../config';
import type { LeaderboardEntry } from '../types/leaderboardTypes';

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
}
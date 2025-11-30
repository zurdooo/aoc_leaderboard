import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3001;
export const SHARED_PASSWORD = process.env.SHARED_PASSWORD || 'ZPMCnEXApqxuP4Get80d73gGKulZ1SrN';
export const COOKIE_NAME = 'aoc_auth_token';
export const IS_PROD = process.env.NODE_ENV === 'production';

export const DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aoc_leaderboard',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

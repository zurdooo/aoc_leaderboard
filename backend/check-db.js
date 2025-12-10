// Simple DB connectivity checker
const dotenv = require('dotenv');
dotenv.config();

const { Client } = require('pg');

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aoc_leaderboard',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

console.log('Using DB config:', {
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password ? '***set***' : '***not set***',
  port: config.port,
});

(async () => {
  const client = new Client(config);
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ok');
    console.log('Connection successful:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err.message);
    if (err.code) console.error('pg error code:', err.code);
  } finally {
    await client.end().catch(() => {});
  }
})();

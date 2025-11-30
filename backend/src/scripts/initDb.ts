import { query } from '../db';
import fs from 'fs';``
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running schema...');
    await query(schema);
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
};

initDb();

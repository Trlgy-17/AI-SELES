import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createDb } from './client.js';

const url = process.argv.includes('--test') ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL (or TEST_DATABASE_URL with --test) is not set');

const { db, pool } = createDb(url);
await migrate(db, { migrationsFolder: 'database/migrations' });
console.log(`Migrations applied to ${new URL(url).pathname.slice(1)}`);
await pool.end();

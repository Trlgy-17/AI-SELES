import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './server/src/db/schema.ts',
  out: './database/migrations',
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true
});

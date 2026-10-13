import mysql from 'mysql2/promise';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema.js';

export type Db = MySql2Database<typeof schema>;

export const createDb = (url: string) => {
    // timezone 'Z' makes the driver read/write JS Dates as UTC.
    const pool = mysql.createPool({ uri: url, connectionLimit: 10, timezone: 'Z', dateStrings: false, supportBigNumbers: true });
    // Column defaults (CURRENT_TIMESTAMP) follow the session time zone, so pin every connection to UTC as well.
    pool.pool.on('connection', (conn) => {
        conn.query("SET time_zone = '+00:00'");
    });
    const db = drizzle(pool, { schema, mode: 'default' });
    return { db, pool };
};

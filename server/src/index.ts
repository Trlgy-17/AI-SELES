import { loadConfig } from './config.js';
import { createDb } from './db/client.js';
import { buildApp } from './app.js';
import { createEreportClient } from './modules/integrations/ereport/client.js';
import { runEreportSync } from './modules/integrations/ereport/sync.js';

const config = loadConfig();
const { db, pool } = createDb(config.DATABASE_URL);
const app = await buildApp({ config, db });

let timer: NodeJS.Timeout | null = null;
if (config.EREPORT_SYNC_INTERVAL_MINUTES > 0 && config.EREPORT_API_URL && config.EREPORT_API_TOKEN) {
    const client = createEreportClient(config.EREPORT_API_URL, config.EREPORT_API_TOKEN);
    timer = setInterval(() => {
        runEreportSync(db, client, { trigger: 'schedule' }).catch((err) => app.log.warn({ err: String(err?.message || err) }, 'e-report sync skipped/failed'));
    }, config.EREPORT_SYNC_INTERVAL_MINUTES * 60_000);
}

const shutdown = async () => {
    if (timer) clearInterval(timer);
    await app.close();
    await pool.end();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: config.API_PORT, host: '127.0.0.1' });
console.log(`API berjalan di http://127.0.0.1:${config.API_PORT}`);

import { DatabaseSync } from 'node:sqlite';
import { analyticsCutoff } from '../server/analytics.ts';

const filename = process.env.DATABASE_PATH || '/var/lib/kimjaehwan-homepage/platform.sqlite';
const database = new DatabaseSync(filename);
database.exec('PRAGMA busy_timeout=5000; BEGIN');
try {
  const cutoff = analyticsCutoff();
  const visitors = database.prepare('DELETE FROM analytics_visitors WHERE day<?').run(cutoff).changes;
  const views = database.prepare('DELETE FROM analytics_daily WHERE day<?').run(cutoff).changes;
  database.exec('COMMIT');
  console.log(`Pruned visitor analytics before ${cutoff}: ${visitors} visitors, ${views} daily rows`);
} catch (error) {
  database.exec('ROLLBACK');
  throw error;
} finally {
  database.close();
}

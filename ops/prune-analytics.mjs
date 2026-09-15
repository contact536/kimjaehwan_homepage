import { DatabaseSync } from 'node:sqlite';
import { visitorHashCutoff } from '../server/analytics.ts';

const filename = process.env.DATABASE_PATH || '/var/lib/kimjaehwan-homepage/platform.sqlite';
const database = new DatabaseSync(filename);
database.exec('PRAGMA busy_timeout=5000; BEGIN');
try {
  const cutoff = visitorHashCutoff();
  const visitors = database.prepare('DELETE FROM analytics_visitors WHERE day<?').run(cutoff).changes;
  database.exec('COMMIT');
  console.log(`Pruned ${visitors} prior-day visitor hashes before ${cutoff}; aggregate statistics retained`);
} catch (error) {
  database.exec('ROLLBACK');
  throw error;
} finally {
  database.close();
}

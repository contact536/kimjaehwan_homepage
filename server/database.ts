import {initializeResearch} from './research-content.ts';
import seed from "../seed/records.json" with { type: "json" };
export interface Result {
  results: Record<string, any>[];
  meta: { changes?: number };
}
export interface Statement {
  bind(...values: any[]): Statement;
  all(): Promise<Result>;
  first(): Promise<Record<string, any> | null>;
  run(): Promise<Result>;
}
export interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<Result[]>;
}
export type Kind = "conferences" | "journals" | "news" | "profile" | "research";
export async function initializeData(db: Database) {
  if (
    await db.prepare("SELECT value FROM settings WHERE key = 'seed-v1'").first()
  )
    { await initializePersonalData(db); await initializeCareerData(db); await initializeCredentialData(db); await initializeCuratedNewsV2(db); await initializeResearch(db); return; }
  const now = new Date().toISOString();
  for (let i = 0; i < seed.length; i += 40) {
    await db.batch(
      seed
        .slice(i, i + 40)
        .map((row) =>
          db
            .prepare(
              "INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES(?,?,?,?,1,?) ON CONFLICT(kind,id) DO NOTHING",
            )
            .bind(
              row.kind,
              row.id,
              row.data.name,
              JSON.stringify(row.data),
              now,
            ),
        ),
    );
  }
  await db
    .prepare(
      "INSERT INTO settings(key,value) VALUES('seed-v1','complete') ON CONFLICT(key) DO NOTHING",
    )
    .run();
  await initializePersonalData(db);
  await initializeCareerData(db);
  await initializeCredentialData(db);
  await initializeCuratedNewsV2(db);
  await initializeResearch(db);
}
async function initializePersonalData(db: Database) {
  if (await db.prepare("SELECT value FROM settings WHERE key='kim-profile-v1'").first()) return;
  const personal = seed.filter(row => row.kind === 'profile' || row.kind === 'news');
  await db.batch([
    db.prepare("DELETE FROM records WHERE kind IN ('profile','news')"),
    ...personal.map(row => db.prepare('INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES(?,?,?,?,1,?)').bind(row.kind,row.id,row.data.name,JSON.stringify(row.data),new Date().toISOString())),
    db.prepare("INSERT INTO settings(key,value) VALUES('kim-profile-v1','complete') ON CONFLICT(key) DO NOTHING")
  ]);
}
async function initializeCareerData(db: Database) {
  if (await db.prepare("SELECT value FROM settings WHERE key='kim-career-v1'").first()) return;
  const career = seed.filter(row => row.kind === 'news' && row.id.startsWith('career-'));
  await db.batch([
    ...career.map(row => db.prepare("INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES(?,?,?,?,1,?) ON CONFLICT(kind,id) DO NOTHING").bind(row.kind,row.id,row.data.name,JSON.stringify(row.data),new Date().toISOString())),
    db.prepare("INSERT INTO settings(key,value) VALUES('kim-career-v1','complete') ON CONFLICT(key) DO NOTHING"),
  ]);
}
async function initializeCredentialData(db: Database) {
  if (await db.prepare("SELECT value FROM settings WHERE key='kim-company-credentials-v1'").first()) return;
  const credentials = seed.filter(row => row.kind === 'news' && row.id.startsWith('credential-'));
  await db.batch([
    ...credentials.map(row => db.prepare("INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES(?,?,?,?,1,?) ON CONFLICT(kind,id) DO NOTHING").bind(row.kind,row.id,row.data.name,JSON.stringify(row.data),new Date().toISOString())),
    db.prepare("INSERT INTO settings(key,value) VALUES('kim-company-credentials-v1','complete') ON CONFLICT(key) DO NOTHING"),
  ]);
}
async function initializeCuratedNewsV2(db: Database) {
  if (await db.prepare("SELECT value FROM settings WHERE key='kim-curated-news-v2'").first()) return;
  const curated = seed.filter(row => row.kind === 'news' && /^(news|career|credential)-/u.test(row.id));
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("DELETE FROM records WHERE kind='news' AND (id LIKE 'news-%' OR id LIKE 'career-%' OR id LIKE 'credential-%')"),
    ...curated.map(row => db.prepare('INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES(?,?,?,?,1,?)').bind(row.kind,row.id,row.data.name,JSON.stringify(row.data),now)),
    db.prepare("INSERT INTO settings(key,value) VALUES('kim-curated-news-v2','complete') ON CONFLICT(key) DO NOTHING"),
  ]);
}
export function unpack(row: Record<string, any>) {
  return {
    id: row.id,
    kind: row.kind,
    revision: row.revision,
    updatedAt: row.updated_at,
    data: JSON.parse(row.payload),
  };
}

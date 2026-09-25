import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const seed = JSON.parse(fs.readFileSync('seed/records.json', 'utf8'))
  .filter(record => !['profile', 'news'].includes(record.kind));

seed.push({
  kind: 'profile',
  id: 'main',
  data: {
    name: profile.name,
    tagline: profile.role,
    identity: 'CLOA · 세무회계 LLM/RAG · KorTaxArena',
    email: profile.email,
    publications: 0,
    projects: 3,
    presentations: 0,
    awards: 0,
  },
});
seed.push(...profile.milestones.map((record, index) => ({
  kind: 'news',
  id: `news-${index + 1}`,
  data: {name: `${record.title} — ${record.description}`, date: record.date, url: ''},
})));
seed.push(...(profile.career ?? []).map((record, index) => ({
  kind: 'news',
  id: `career-${index + 1}`,
  data: {name: `${record.title} — ${record.description}`, date: record.date, url: record.url ?? ''},
})));
seed.push(...(profile.companyCredentials ?? []).map((record, index) => ({
  kind: 'news',
  id: `credential-${index + 1}`,
  data: {
    name: `${record.title} — ${record.description}`,
    date: record.date,
    url: record.url ?? '',
    issuer: record.issuer ?? '',
    certificate: record.certificate ?? '',
  },
})));

fs.writeFileSync('seed/records.json', `${JSON.stringify(seed, null, 2)}\n`);
const totalRecords = seed.length + (profile.research?.length ?? 0);
const apiTest = fs.readFileSync('tests/api.test.ts', 'utf8').replace(
  /assert\.equal\(\(await json\(response\)\)\.records, \d+\);/u,
  `assert.equal((await json(response)).records, ${totalRecords});`,
);
fs.writeFileSync('tests/api.test.ts', apiTest);
console.log(`Personal database seed: ${seed.length} records; expected initialized total: ${totalRecords}.`);

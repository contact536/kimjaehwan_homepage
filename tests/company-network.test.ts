import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import researcher from '../seed/researcher.json' with {type: 'json'};
import path from 'node:path';
import {execFileSync} from 'node:child_process';

test('company cooperation records render on the home and detailed page', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  const page = fs.readFileSync('public/pages/company-network.html', 'utf8');
  const experience = fs.readFileSync('public/pages/experience.html', 'utf8');
  const network = researcher.companyNetwork;
  assert.equal(network.trainingPartnerships.length, 4);
  assert.equal(network.memberships.length, 3);
  assert.equal(researcher.academicMemberships.length, 3);
  assert.equal((page.match(/class="network-card"/gu) || []).length, 13);
  assert.equal((page.match(/class="network-card network-personal"/gu) || []).length, 3);
  assert.equal((page.match(/class="network-card network-escrow"/gu) || []).length, 1);
  assert.match(home, /Cooperation &amp; network/u);
  assert.match(home, /협력 · 회원 네트워크 전체 보기/u);
  assert.match(page, /XAIKOREA의 회사 활동/u);
  for (const item of [...network.trainingPartnerships, ...network.memberships]) {
    assert.ok(page.includes(item.organization), item.organization);
    assert.ok(page.includes(item.category), item.category);
  }
  for (const item of researcher.academicMemberships) {
    assert.ok(page.includes(item.organization), item.organization);
    assert.ok(page.includes(item.category), item.category);
    assert.ok(page.includes(item.date), item.date);
    assert.ok(experience.includes(item.organization), `${item.organization} missing from CV`);
  }
  assert.match(home, /개인 학술단체 회원자격/u);
  assert.ok(page.includes(network.technologyEscrow.technology));
  assert.match(page, /2026\.09\.08 - 2027\.09\.07/u);
  assert.match(page, /www\.xaikorea\.ai\.kr\/about#company-network/u);
  for (const item of network.researchIpPrograms) {
    const card = page.match(new RegExp(`<article class="network-card" id="${item.id}"[\\s\\S]*?</article>`, 'u'))?.[0] ?? '';
    for (const fact of item.facts) assert.ok(card.includes(fact.value), fact.label);
    assert.ok(card.includes(item.sourceUrl));
    assert.doesNotMatch(card, /\.pdf|download=|mailto:|tel:|\/documents\//u);
  }
  assert.match(page, /계약기간<\/dt><dd>2026\.09\.21 – 2026\.12\.16/u);
  assert.match(page, /전자서명 완료<\/dt><dd>2026\.09\.23/u);
  const ipNarae = page.match(/<article class="network-card" id="ip-narae-2026"[\s\S]*?<\/article>/u)?.[0] ?? '';
  assert.match(ipNarae, /서류 작성일<\/dt><dd>2026\.08\.04/u);
  assert.match(ipNarae, /수원상공회의소 · 경기남부지식재산센터/u);
  assert.doesNotMatch(ipNarae, /협약일|선정일|계좌|송금|미리보기|다운로드|<img/u);
});

test('page finder and sources expose the company network without duplicate source entries', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  const sources = fs.readFileSync('public/pages/sources.html', 'utf8');
  assert.match(home, /\/pages\/company-network\.html/u);
  assert.match(sources, /인재양성 협약 · 회사 회원자격 · 기술자료 임치/u);
  assert.match(sources, /김재환 학술단체 회원자격 3건/u);
  assert.equal((sources.match(/경기도 AI 멤버십 기업 인증서/gu) || []).length, 1);
  assert.equal((sources.match(/기술보호 선도기업 지정서/gu) || []).length, 1);
});

test('regenerating the company network retains exactly one researcher sidebar and all records', () => {
  const temporaryRoot = path.resolve('.tools');
  fs.mkdirSync(temporaryRoot, {recursive:true});
  const directory = fs.mkdtempSync(path.join(temporaryRoot, 'kim-network-regeneration-'));
  try {
    fs.mkdirSync(path.join(directory, 'public/pages'), {recursive:true});
    fs.mkdirSync(path.join(directory, 'seed'));
    for (const file of ['public/pages/sources.html', 'public/index.html', 'seed/pages.json']) {
      fs.copyFileSync(file, path.join(directory, file));
    }
    const script = path.resolve('scripts/apply-company-network.mjs');
    execFileSync(process.execPath, [script], {cwd:directory});
    const once = fs.readFileSync(path.join(directory, 'public/pages/company-network.html'), 'utf8');
    execFileSync(process.execPath, [script], {cwd:directory});
    const twice = fs.readFileSync(path.join(directory, 'public/pages/company-network.html'), 'utf8');
    assert.equal(twice, once);
    assert.equal((twice.match(/class="author-panel"/gu) || []).length, 1);
    assert.match(twice, /aria-label="연구자 관련 링크"/u);
    for (const id of ['patent-voucher-program','ip-narae-2026','d-testbed-2026','hoban-poc-agreement','core-technology-monitoring','technology-leakage-prevention','academic-memberships']) assert.ok(twice.includes(`id="${id}"`));
    assert.ok(fs.readFileSync('public/pages/company-network.html','utf8').includes('class="author-panel"'));
  } finally {
    const resolved = path.resolve(directory);
    if (path.dirname(resolved) !== temporaryRoot || !path.basename(resolved).startsWith('kim-network-regeneration-')) throw new Error('Unexpected temporary test directory');
    fs.rmSync(resolved, {recursive:true,force:true});
  }
});

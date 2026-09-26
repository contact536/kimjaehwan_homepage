import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import researcher from '../seed/researcher.json' with {type: 'json'};

test('company cooperation records render on the home and detailed page', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  const page = fs.readFileSync('public/pages/company-network.html', 'utf8');
  const experience = fs.readFileSync('public/pages/experience.html', 'utf8');
  const network = researcher.companyNetwork;
  assert.equal(network.trainingPartnerships.length, 4);
  assert.equal(network.memberships.length, 3);
  assert.equal(researcher.academicMemberships.length, 3);
  assert.equal((page.match(/class="network-card"/gu) || []).length, 10);
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

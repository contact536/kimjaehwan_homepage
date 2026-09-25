import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import researcher from '../seed/researcher.json' with {type: 'json'};
import {searchResearch} from '../server/agent.ts';

test('three internal tools render with seven local screenshots and clear access boundaries', () => {
  const projects = fs.readFileSync('public/pages/projects.html', 'utf8');
  const home = fs.readFileSync('public/index.html', 'utf8');
  assert.equal(researcher.internalTools.length, 3);
  assert.equal((projects.match(/class="internal-tool"/gu) || []).length, 3);
  assert.equal((projects.match(/<img src="\/assets\/internal-tools\/[^"]+\.jpg"/gu) || []).length, 7);
  assert.match(projects, /회사 내부 연구·운영 도구/u);
  assert.match(projects, /모두 사내 전용이며 외부 접속 주소가 없습니다/u);
  assert.doesNotMatch(projects, /127\.0\.0\.1|localhost|비밀번호/u);
  for (const tool of researcher.internalTools) {
    assert.ok(projects.includes(tool.name), tool.name);
    assert.ok(projects.includes(tool.koreanName), tool.koreanName);
    assert.ok(home.includes(tool.name), `${tool.name} missing from home`);
    for (const image of tool.images) assert.ok(fs.existsSync(`public${image.src}`), image.src);
  }
});

test('research assistant explains each internal tool from curated data', () => {
  assert.match(searchResearch('MONKRAG 내부도구').answer, /근거 질의/u);
  assert.match(searchResearch('랩토메이트').answer, /정확한 문서파일로 재생성/u);
  assert.match(searchResearch('아울메이트').answer, /랩토메이트.*정확도/u);
});

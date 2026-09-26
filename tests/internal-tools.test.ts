import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import researcher from '../seed/researcher.json' with {type: 'json'};
import {searchResearch} from '../server/agent.ts';

test('four internal tools render on Projects only with ten screenshots and inventor attribution', () => {
  const projects = fs.readFileSync('public/pages/projects.html', 'utf8');
  const home = fs.readFileSync('public/index.html', 'utf8');
  assert.equal(researcher.internalTools.length, 4);
  assert.equal((projects.match(/class="internal-tool"/gu) || []).length, 4);
  assert.equal((projects.match(/<img src="\/assets\/internal-tools\/[^"]+\.(?:webp|png)"/gu) || []).length, 10);
  assert.equal((projects.match(/class="internal-tool-logo"/gu) || []).length, 4);
  assert.equal((projects.match(/<details class="internal-tool-screens">/gu) || []).length, 4);
  assert.match(projects, /\/js\/internal-tools\.js\?v=/u);
  assert.doesNotMatch(home, /internal-tools-home|\/assets\/internal-tools\/|\/css\/internal-tools\.css/u);
  const research = fs.readFileSync('public/pages/research.html', 'utf8');
  assert.doesNotMatch(research, /\/assets\/internal-tools\//u);
  assert.match(projects, /회사 내부 연구·운영 도구/u);
  assert.match(projects, /모두 사내 전용이며 외부 접속 주소가 없습니다/u);
  assert.doesNotMatch(projects, /127\.0\.0\.1|localhost|비밀번호/u);
  const analyzer = projects.match(/<article class="internal-tool" id="internal-tool-github-analyzer"[\s\S]*?<\/article>/u)?.[0] ?? '';
  assert.match(analyzer, /발명자<\/span> <strong>윤재성 개발자<\/strong>/u);
  assert.match(analyzer, /RAG와 온톨로지로 분석/u);
  assert.equal((analyzer.match(/class="internal-tool-preview"/gu) ?? []).length, 3);
  assert.doesNotMatch(analyzer, /href="https?:/u);
  for (const tool of researcher.internalTools) {
    assert.ok(projects.includes(tool.name), tool.name);
    assert.ok(projects.includes(tool.koreanName), tool.koreanName);
    assert.ok(fs.existsSync(`public${tool.logo ?? `/assets/internal-tools/${tool.id}-logo-v1.webp`}`));
    for (const image of tool.images) assert.ok(fs.existsSync(`public${image.src}`), image.src);
  }
});

test('research assistant explains each internal tool from curated data', () => {
  assert.match(searchResearch('MONKRAG 내부도구').answer, /근거 질의/u);
  assert.match(searchResearch('랩토메이트').answer, /정확한 문서파일로 재생성/u);
  assert.match(searchResearch('아울메이트').answer, /랩토메이트.*정확도/u);
  const analyzer = searchResearch('GitHub Analyzer 발명자');
  assert.match(analyzer.answer, /발명자 윤재성 개발자/u);
  assert.ok(analyzer.sources.some(source => source.url.endsWith('#internal-tool-github-analyzer')));
  assert.match(searchResearch('깃허브 코드 분석').answer, /RAG와 온톨로지/u);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import overview from '../seed/research-overview.json' with {type:'json'};
import {searchResearch} from '../server/agent.ts';

test('current research map connects all areas to live sections and retains first-page-only manuscript previews',()=>{
  const home=fs.readFileSync('public/index.html','utf8');
  const research=fs.readFileSync('public/pages/research.html','utf8');
  const publications=fs.readFileSync('public/pages/publications.html','utf8');
  const finder=home.match(/<details class="page-finder">[\s\S]*?<\/details>/)![0];
  for(const area of overview.areas){
    for(const html of [home,research])assert.equal(html.split(`data-topic="${area.id}"`).length-1,1);
    for(const link of area.links){
      assert.ok(research.includes(`id="${link.anchor}"`));
      assert.ok(home.includes(`href="/pages/research.html#${link.anchor}"`));
      assert.ok(finder.includes(`/pages/research.html#${link.anchor}`));
    }
  }
  const index=publications.match(/<nav class="manuscript-index"[\s\S]*?<\/nav>/)![0];
  assert.match(index,/3차 총평완료 · 게재가능/);
  for(const [,anchor] of index.matchAll(/href="#([^"]+)"/g))assert.ok(publications.includes(`id="${anchor}"`));
  const previews=[...publications.matchAll(/<details class="(?:manuscript-preview|sdg-preview)"[\s\S]*?<\/details>/g)];
  assert.equal(previews.length,11);
  assert.equal(previews.reduce((n,[html])=>n+(html.match(/<img /g)??[]).length,0),12);
  for(const [preview] of previews)assert.doesNotMatch(preview,/href="[^"]+\.(?:pdf|docx|hwpx?)"|<iframe|<embed|<object/);
});

test('research search includes expanded scope and uses curated content over untouched older database seeds',()=>{
  const result=searchResearch('김재환의 현재 연구 분야');
  assert.equal(result.sources[0].url,'/pages/research.html#research-overview');
  for(const name of ['Vision','SDG','금융데이터','LLM 생성 코드'])assert.ok(result.answer.includes(name),name);
  const row={id:'kortaxarena',revision:1,data:{name:'OUTDATED PROFILE',subtitle:'OLD',summary:'OLD',body:'OLD'}};
  assert.doesNotMatch(searchResearch('KorTaxArena',[row]).answer,/OUTDATED PROFILE/);
  assert.match(searchResearch('OUTDATED PROFILE',[{...row,revision:2}]).answer,/OUTDATED PROFILE/);
});

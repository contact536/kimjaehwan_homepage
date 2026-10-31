import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {englishDocuments,searchEnglishResearch} from '../server/english-research.ts';
import {createApp} from '../server/app.ts';
import {openDatabase} from '../server/sqlite.ts';

test('every public page has a language choice outside the collapsible mobile menu',()=>{
  const files=fs.readdirSync('public',{recursive:true}).filter(f=>String(f).endsWith('.html')&&!String(f).startsWith('admin'));
  for(const file of files){
    const html=fs.readFileSync(path.join('public',String(file)),'utf8');
    assert.equal((html.match(/data-site-language="ko"/g)||[]).length,1,String(file));
    assert.equal((html.match(/data-site-language="en"/g)||[]).length,1,String(file));
    assert.ok(html.indexOf('class="language-switch"')<html.indexOf('<nav id="academicMenu"'),String(file));
    assert.equal((html.match(/src="\/js\/language.js"/g)||[]).length,1);
  }
});

test('menu generation is idempotent and handles the minimal privacy header',()=>{
  const root=path.resolve('.tools');fs.mkdirSync(root,{recursive:true});
  const dir=fs.mkdtempSync(path.join(root,'language-test-'));
  try{
    fs.mkdirSync(path.join(dir,'public/pages'),{recursive:true});
    const original=fs.readFileSync('public/pages/privacy.html','utf8').replace(/<div class="language-switch"[\s\S]*?<\/div>/,'').replace(/<button class="academic-menu-toggle"[\s\S]*?<\/button>/,'');
    const file=path.join(dir,'public/pages/privacy.html');fs.writeFileSync(file,original);
    const generate=()=>execFileSync(process.execPath,[path.resolve('scripts/apply-language-menu.mjs')],{cwd:dir});
    generate();const once=fs.readFileSync(file,'utf8');generate();assert.equal(fs.readFileSync(file,'utf8'),once);
    assert.match(once,/data-site-language="en"/);assert.match(once,/class="academic-menu-toggle"/);
  }finally{if(path.dirname(path.resolve(dir))!==root)throw Error('Unexpected test directory');fs.rmSync(dir,{recursive:true,force:true});}
});

test('English retrieval has translated sources, valid destinations and distinct manuscript statuses',()=>{
  for(const d of englishDocuments){
    assert.doesNotMatch(d.title+' '+d.text,/[가-힣]/,d.url);
    const [file,anchor]=d.url.split('#');const html=fs.readFileSync('public'+file,'utf8');
    if(anchor)assert.ok(html.includes(`id="${anchor}"`),d.url);
  }
  assert.equal(searchEnglishResearch('What are Jaehwan Kim’s current research areas?').sources[0].url,'/pages/research.html#research-overview');
  assert.match(searchEnglishResearch('meeting intelligence manuscript review status').answer,/Eligible for publication/i);
  assert.match(searchEnglishResearch('D-Testbed planned financial research').answer,/Planned research.*data are received/);
  assert.match(searchEnglishResearch('education').answer,/PhD|doctoral/i);
  assert.match(searchEnglishResearch('contact').answer,/ceo@xaikorea.ai.kr/);
  assert.equal(searchEnglishResearch('zzzzunlikelyquery').sources.length,0);
});

test('research API accepts English and retains the default Korean search contract',async()=>{
  const connection=openDatabase(':memory:');
  try{
    const app=createApp(),env={DB:connection.db};
    const search=(body:unknown)=>app.request('http://localhost/api/research/search',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'},body:JSON.stringify(body)},env);
    const en=await search({question:'meeting intelligence manuscript review status',language:'en'});assert.equal(en.status,200);assert.match(((await en.json()) as {answer:string}).answer,/Eligible for publication/i);
    const ko=await search({question:'김재환 학력'});assert.equal(ko.status,200);assert.match(((await ko.json()) as {answer:string}).answer,/박사과정/);
    assert.equal((await search({question:'SDG',language:'xx'})).status,400);
  }finally{connection.close();}
});

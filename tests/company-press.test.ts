import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import test from 'node:test';
import press from '../seed/company-press.json' with {type:'json'};

test('regenerating related content retains press, valid source links and the researcher sidebar without duplicates', () => {
  const root = path.resolve('.tools');
  fs.mkdirSync(root, {recursive:true});
  const directory = fs.mkdtempSync(path.join(root, 'kim-press-regeneration-'));
  const files = ['public/index.html','public/pages/research.html','public/pages/publications.html','public/pages/sources.html','public/pages/company-network.html','seed/pages.json'];
  try {
    for (const file of files) {
      const target = path.join(directory, file);
      fs.mkdirSync(path.dirname(target), {recursive:true});
      fs.copyFileSync(file, target);
    }
    const generate = () => {
      for (const script of ['apply-profile-sources','apply-company-network','apply-home-journey','apply-company-research-update','apply-conference-publication','apply-company-press','apply-journal-manuscripts']) {
        execFileSync(process.execPath, [path.resolve(`scripts/${script}.mjs`)], {cwd:directory});
      }
      return files.map(file => fs.readFileSync(path.join(directory, file), 'utf8'));
    };
    const once = generate();
    assert.deepEqual(generate(), once);
    assert.deepEqual(once, files.map(file => fs.readFileSync(file, 'utf8')), 'Checked-in pages must match generated content');
    const [home, research, publications, , network] = once;
    assert.equal((network.match(/class="author-panel"/gu) || []).length, 1);
    assert.equal((research.match(/class="company-press-card"/gu) || []).length, 6);
    assert.equal((home.match(/company-press-home:start/gu) || []).length, 1);
    assert.equal(new Set(press.articles.map(article => article.url)).size, press.articles.length);
    for (const article of press.articles) {
      assert.equal((research.match(new RegExp(`id="press-${article.id}"`, 'gu')) || []).length, 1);
      assert.ok(research.includes(`보도일 <time datetime="${article.publishedAt}">`));
      assert.ok(research.includes(`href="${article.url}" target="_blank" rel="noopener noreferrer"`));
      assert.equal(new URL(article.url).hostname, 'www.mt.co.kr');
      const [file, anchor] = article.relatedUrl.split('#');
      assert.ok(fs.existsSync('public' + file), file);
      if (anchor) assert.ok(fs.readFileSync('public' + file, 'utf8').includes(`id="${anchor}"`), article.relatedUrl);
    }
    assert.ok(publications.includes(press.articles.find(article => article.id === 'ksci-meeting-ai-2026')!.url));
  } finally {
    const resolved = path.resolve(directory);
    if (path.dirname(resolved) !== root || !path.basename(resolved).startsWith('kim-press-regeneration-')) throw new Error('Unexpected temporary test directory');
    fs.rmSync(resolved, {recursive:true,force:true});
  }
});

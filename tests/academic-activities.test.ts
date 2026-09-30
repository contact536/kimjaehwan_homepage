import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import activityData from '../seed/academic-activities.json' with {type:'json'};
import {searchResearch} from '../server/agent.ts';

test('participation summaries use event dates and link CV and search to public text only', () => {
  const research = fs.readFileSync('public/pages/research.html','utf8');
  const section = research.match(/<!-- academic-activities:start -->[\s\S]*?<!-- academic-activities:end -->/u)?.[0] ?? '';
  const cv = fs.readFileSync('public/pages/experience.html','utf8');
  assert.equal(activityData.activities.length,3);
  assert.doesNotMatch(section, /<img|<iframe|<object|<embed|\.pdf|download|학번|연락처|서명|참가사진|참여 사진|file:\/\/|[CD]:[\\/]/u);
  const links = [...section.matchAll(/href="([^"]+)"/gu)].map(match=>match[1]);
  assert.deepEqual(links,activityData.activities.flatMap(item=>['#taxia',...item.articles.map(article=>article.url)]));
  const dates = ['2025-12-30','2025-12-04','2025-11-27'];
  for (const [index,item] of activityData.activities.entries()) {
    assert.equal(item.date,dates[index]);
    assert.equal(item.participation,'참가·청강');
    assert.equal(research.split(`id="activity-${item.id}"`).length-1,1);
    assert.ok(section.includes(`datetime="${item.date}"`));
    const target = `/pages/research.html#activity-${item.id}`;
    assert.ok(cv.includes(`href="${target}"`));
    const result = searchResearch(item.title);
    assert.equal(result.sources[0].url,target);
    assert.ok(result.answer.includes(item.researchConnection));
    assert.match(result.answer,/참가·청강/u);
    assert.ok(cv.includes(`href="${target}-press"`));
    for (const article of item.articles) {
      assert.equal(new URL(article.url).protocol,'https:');
      assert.equal(links.filter(url=>url===article.url).length,1);
      const articleResult = searchResearch(article.title);
      assert.equal(articleResult.sources[0].url,article.url);
      assert.ok(articleResult.answer.includes(article.publisher));
      assert.ok(articleResult.answer.includes(article.publishedAt));
    }
  }
});

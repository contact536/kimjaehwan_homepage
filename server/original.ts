import {renderResearch} from './research-content.ts';
/** Keep original frontend source intact. Only edited backend content changes the response. */
import type { Database } from './database.ts';
import { initializeData } from './database.ts';
import seed from '../seed/records.json' with { type: 'json' };

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const originalByKind = (kind: string) => seed.filter(row => row.kind === kind);

async function legacyResponse(response: Response, pathname: string, db?: Database): Promise<Response> {
  if (!db || response.status !== 200 || !['/', '/index.html', '/pages/conference-tier.html', '/pages/journal.html'].includes(pathname)) return response;
  try {
    await initializeData(db);
    const kind = pathname.endsWith('conference-tier.html') ? 'conferences' : pathname.endsWith('journal.html') ? 'journals' : null;
    const relevant = kind ? [kind] : ['profile', 'news'];
    const groups = new Map<string, { id: string; revision: number; data: Record<string, any> }[]>();
    let changed = false;
    for (const collection of relevant) {
      const { results } = await db.prepare('SELECT id,revision,payload FROM records WHERE kind=? ORDER BY id').bind(collection).all();
      const rows = results.map(row => ({ id: row.id, revision: row.revision, data: JSON.parse(row.payload) }));
      groups.set(collection, rows);
      const initial = originalByKind(collection), initialIds = new Set(initial.map(row => row.id));
      if (rows.length !== initial.length || rows.some(row => row.revision !== 1 || !initialIds.has(row.id))) changed = true;
    }
    // In the default state return the original response, including its exact body bytes.
    if (!changed) return response;
    let html = await response.clone().text();
    if (kind) {
      const name = kind === 'conferences' ? 'CONFERENCES' : 'JOURNALS';
      const rows = groups.get(kind)!;
      const seedIds = new Map(originalByKind(kind).map(row => [row.data.name.toLowerCase().trim(), row.id]));
      // Preserve the source's duplicate rows and ordering until that record is edited or deleted.
      const initialRows = originalByKind(kind);
      const originals = new Map(initialRows.map(row => [row.id, row]));
      const runtimeMap = Object.fromEntries(rows.map(row => [row.id, { revision: row.revision, data: row.data }]));
      const extras = rows.filter(row => !originals.has(row.id)).map(row => row.data);
      const inserted = `\n    // Synchronize edited content without replacing the original filters or renderer.\n    {\n      const seedIds = ${scriptJson(Object.fromEntries(seedIds))};\n      const edited = ${scriptJson(runtimeMap)};\n      const next = ${name}.flatMap(item => {\n        const current = edited[seedIds[item.name.toLowerCase().trim()]];\n        if (!current) return [];\n        return [current.revision === 1 ? item : {...current.data, field: current.data.fields.join('/'), tier: current.data.tiers.join('/')}];\n      });\n      for (const item of ${scriptJson(extras)}) next.push({...item, field:item.fields.join('/'), tier:item.tiers.join('/')});\n      ${name}.splice(0, ${name}.length, ...next);\n    }\n    function escapeEditedHtml(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }\n`;
      html = html.replace('    // Support multi-category fields separated by "/" or ","', () => inserted + '    // Support multi-category fields separated by "/" or ","');
      for (const expression of ['f', 'c.name', 'c.acceptance', 'c.tier', 'c.format', 'j.name', 'j.abbr', 'j.publisher', 'j.tier', 'j.if', 'j.strength', "j.host === '—' ? '' : j.host"]) {
        html = html.split('${' + expression + '}').join('${escapeEditedHtml(' + expression + ')}');
      }
    } else {
      const profile = groups.get('profile')?.find(row => row.id === 'main');
      if (profile && profile.revision > 1) {
        const d = profile.data;
        html = html.replace(/(<span class="gradient-text">)[\s\S]*?(<\/span>)/, (_, before, after) => before + escapeHtml(d.name) + after);
        for (const [className, value] of [['hero-tagline', d.tagline], ['hero-identity', d.identity]]) {
          html = html.replace(new RegExp('(<p class="' + className + '[^"]*">)[\\s\\S]*?(<\\/p>)'), (_, before, after) => before + escapeHtml(value) + after);
        }
        const originalEmail = originalByKind('profile')[0]?.data.email;
        if(originalEmail) html = html.replaceAll(originalEmail, escapeHtml(d.email));
      }
      const news = groups.get('news') || [], initialNews = originalByKind('news');
      const personalNews = news.slice().sort((a,b)=>String(b.data.date).localeCompare(String(a.data.date))).map(row=>{
        const d=row.data, parts=String(d.name).split(' — ');
        const title=escapeHtml(parts.shift()), detail=escapeHtml(parts.join(' — '));
        const url=/^https?:\/\//i.test(d.url)?escapeHtml(d.url):'';
        return `<article class="kim-row"><time>${escapeHtml(d.date)}</time><div><h3>${url?`<a href="${url}" rel="noopener">${title}</a>`:title}</h3>${detail?`<p>${detail}</p>`:''}</div></article>`;
      }).join('');
      html=html.replace(/(<h2 class="section-title"><span class="section-number">03\.<\/span> Journey<\/h2>)[\s\S]*?(<\/div><\/section>)/,(_,before,after)=>before+personalNews+after);
      const byId = new Map(news.map(row => [row.id, row]));
      let index = 0;
      html = html.replace(/<div class="timeline-item">[\s\S]*?<div class="timeline-text">[\s\S]*?<\/div>\s*<\/div>/g, block => {
        const original = initialNews[index++]; if (!original) return block;
        const row = byId.get(original.id); if (!row) return '';
        if (row.revision === 1) return block;
        const title = escapeHtml(row.data.name), url = /^https?:\/\//i.test(row.data.url) ? row.data.url : '';
        const text = url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${title}</a>` : title;
        return block.replace(/(<span class="timeline-date">)[\s\S]*?(<\/span>)/, (_, a, b) => a + escapeHtml(row.data.date) + b).replace(/<p>[\s\S]*?<\/p>/, () => '<p>' + text + '</p>');
      });
      const initialIds = new Set(initialNews.map(row => row.id));
      const additions = news.filter(row => !initialIds.has(row.id)).map(row => {
        const d = row.data, title = escapeHtml(d.name), url = /^https?:\/\//i.test(d.url) ? d.url : '';
        return `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-text"><span class="timeline-date">${escapeHtml(d.date)}</span><p>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${title}</a>` : title}</p></div></div>`;
      }).join('');
      if (additions) html = html.replace(/(<div class="year-content[^\"]*">)/, before => before + additions);
    }
    const headers = new Headers(response.headers); headers.delete('content-length'); headers.delete('etag'); headers.set('Cache-Control', 'no-store');
    return new Response(html, { status: response.status, headers });
  } catch (error) {
    console.warn('Original frontend fallback:', error instanceof Error ? error.message : 'content unavailable');
    return response;
  }
}

export async function originalResponse(response:Response,pathname:string,db?:Database):Promise<Response>{
 if(!db||response.status!==200||pathname.startsWith('/api/')||pathname.startsWith('/admin')||!(pathname==='/'||pathname.endsWith('.html')))return response;
 await initializeData(db);
 return renderResearch(await legacyResponse(response,pathname,db),db);
}

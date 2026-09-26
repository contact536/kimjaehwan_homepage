// Apply the same left-hand researcher panel during every page regeneration.
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);

export function applyAuthorLayout(html, profile) {
  const panel = `<aside class="author-panel" aria-label="연구자 프로필"><a class="author-photo" href="/" aria-label="김재환 소개 페이지"><img src="/assets/jaehwan-kim.jpg" alt="김재환" width="1682" height="2528"></a><div class="author-info"><a class="author-name" href="/">${esc(profile.name)}<span>${esc(profile.englishName)}</span></a><p>${esc(profile.role)}</p><nav aria-label="연구자 관련 링크"><a href="mailto:${esc(profile.email)}">이메일 ↗</a><a href="/pages/experience.html">학력 · 경력 →</a><a href="/pages/research.html">연구 분야 →</a></nav></div></aside>`;
  html = html.replace(/<!-- author-layout:start -->[\s\S]*?<!-- author-layout:content -->/u, '').replace('</div><!-- author-layout:end -->', '');
  if (!html.includes('/css/author-panel.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/author-panel.css"></head>');
  return html.replace(/(<main[^>]*>)([\s\S]*?)(<\/main>)/u, (_, open, content, close) => `${open}<!-- author-layout:start --><div class="author-layout">${panel}<!-- author-layout:content -->${content}</div><!-- author-layout:end -->${close}`);
}

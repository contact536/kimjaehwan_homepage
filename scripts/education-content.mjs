import profile from '../seed/researcher.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function schoolLink(item) {
  const school = item.institution;
  if (!school) return '';
  return `<a class="education-school-link" href="${esc(school.url)}" target="_blank" rel="noopener noreferrer" title="학교 공식 홈페이지 (새 탭)"><span class="education-school-logo"><img src="${esc(school.logo)}" alt="" width="${school.width}" height="${school.height}" loading="lazy" decoding="async"></span><span>${esc(school.name)} <span aria-hidden="true">↗</span></span></a>`;
}

export function educationRows() {
  return profile.education.map(item => `<article class="kim-row"><time>${esc(item.date)}</time><div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p>${schoolLink(item)}</div></article>`).join('');
}

export function doctoralIdentity() {
  const [assist, sdg] = profile.education.map(item => item.institution);
  return `<p class="hero-identity"><a href="${esc(assist.url)}" target="_blank" rel="noopener noreferrer" title="학교 공식 홈페이지 (새 탭)">aSSIST</a> <span>AI융합 ·</span> <a href="${esc(sdg.url)}" target="_blank" rel="noopener noreferrer" title="학교 공식 홈페이지 (새 탭)">SDG</a> <span>복수학위 박사과정</span></p>`;
}

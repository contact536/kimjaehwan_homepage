import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const network = profile.companyNetwork;
if (!network) throw new Error('companyNetwork is missing from seed/researcher.json.');

const facts = items => `<dl>${items.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl>`;
const card = (item, type) => `<article class="network-card" id="${esc(item.id)}" tabindex="-1"><p class="network-card-type">${esc(type)}</p><h3>${esc(item.organization)}</h3><p class="network-category">${esc(item.category)}</p><p>${esc(item.description)}</p>${facts(item.facts)}</article>`;
const trainingCards = network.trainingPartnerships.map(item => card(item, '인재양성 협약')).join('');
const membershipCards = network.memberships.map(item => card(item, '회원자격')).join('');
const escrow = network.technologyEscrow;
const escrowCard = `<article class="network-card network-escrow" id="${esc(escrow.id)}" tabindex="-1"><p class="network-card-type">기술자료 임치</p><h3>${esc(escrow.title)}</h3><p class="network-category">${esc(escrow.technology)}</p><p>${esc(escrow.description)}</p>${facts(escrow.facts)}</article>`;
const body = `<div class="kim-page reading-page company-network-page"><p class="kim-overline">XAIKOREA / COOPERATION &amp; NETWORK</p><h1>산학협력 · 회원 네트워크</h1><p class="kim-lead">XAIKOREA가 공개한 인재양성 협약, 산업·기술 단체 회원자격, 기술자료 임치 내용을 정리합니다.</p><aside class="network-notice"><strong>자료 범위</strong><p>아래 내용은 XAIKOREA의 회사 활동이며 김재환 개인의 자격이나 교육·채용 실적으로 표시하지 않습니다. 기관명, 자격과 기간은 회사 공식 공개 자료 기준입니다.</p><a href="${esc(network.sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 공식 자료 확인 ↗</a></aside><nav class="network-jump" aria-label="페이지 내 이동"><a href="#training-partnerships">인재양성 협약 ${network.trainingPartnerships.length}건</a><a href="#memberships">회원자격 ${network.memberships.length}건</a><a href="#technology-escrow">기술자료 임치 1건</a></nav><section class="network-section" id="training-partnerships" aria-labelledby="training-heading"><p class="network-section-label">01 / TALENT DEVELOPMENT</p><h2 id="training-heading">인재양성 협약</h2><div class="network-grid">${trainingCards}</div></section><section class="network-section" id="memberships" aria-labelledby="membership-heading"><p class="network-section-label">02 / MEMBERSHIP</p><h2 id="membership-heading">산업 · 기술 단체 회원자격</h2><div class="network-grid">${membershipCards}</div></section><section class="network-section" id="technology-escrow" aria-labelledby="escrow-heading"><p class="network-section-label">03 / TECHNOLOGY ESCROW</p><h2 id="escrow-heading">기술자료 임치</h2>${escrowCard}</section></div>`;

const pageFile = 'public/pages/company-network.html';
let page = fs.readFileSync('public/pages/sources.html', 'utf8');
page = page.replace(/<title>[\s\S]*?<\/title>/u, '<title>산학협력 · 회원 네트워크 | 김재환 · Jaehwan Kim</title>');
if (!page.includes('/css/company-network.css')) page = page.replace('</head>', '<link rel="stylesheet" href="/css/company-network.css"></head>');
page = page.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/u, (_, open, close) => open + body + close);
fs.writeFileSync(pageFile, page);

const homeStart = '<!-- company-network-home:start -->';
const homeEnd = '<!-- company-network-home:end -->';
const homeBlock = `${homeStart}<section class="section company-network-home" id="company-network"><div class="container"><h2 class="section-title"><span class="section-number">04.</span> Cooperation &amp; network</h2><p class="kim-section-intro">AI 인재양성, 산업 네트워크와 기술보호를 연결하는 XAIKOREA의 협력 기반입니다.</p><div class="network-home-grid"><article><span class="network-count">${String(network.trainingPartnerships.length).padStart(2, '0')}</span><h3>인재양성 협약</h3><p>${network.trainingPartnerships.map(item => esc(item.organization)).join(' · ')}</p></article><article><span class="network-count">${String(network.memberships.length).padStart(2, '0')}</span><h3>산업 · 기술 단체 회원자격</h3><p>${network.memberships.map(item => esc(item.organization)).join(' · ')}</p></article><article><span class="network-count">01</span><h3>기술자료 임치</h3><p>${esc(escrow.technology)}</p></article></div><a class="btn btn-outline network-home-link" href="/pages/company-network.html">협력 · 회원 네트워크 전체 보기 ↗</a></div></section>${homeEnd}`;
const homeFile = 'public/index.html';
let home = fs.readFileSync(homeFile, 'utf8');
if (!home.includes('/css/company-network.css')) home = home.replace('</head>', '<link rel="stylesheet" href="/css/company-network.css"></head>');
home = home.replace(new RegExp(`${homeStart}[\\s\\S]*?${homeEnd}`, 'u'), '');
home = home.replace('<section class="section" id="contact">', `${homeBlock}<section class="section" id="contact">`);
fs.writeFileSync(homeFile, home);

const pagesFile = 'seed/pages.json';
const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
if (!pages.some(page => page.path === '/pages/company-network.html')) {
  pages.push({path: '/pages/company-network.html', title: '산학협력 · 회원 네트워크 | 김재환'});
  fs.writeFileSync(pagesFile, `${JSON.stringify(pages, null, 2)}\n`);
}
console.log(`Company network generated: ${network.trainingPartnerships.length} partnerships, ${network.memberships.length} memberships and 1 escrow record.`);

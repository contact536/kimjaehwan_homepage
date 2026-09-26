import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};
import {applyAuthorLayout} from './author-layout.mjs';

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const network = profile.companyNetwork;
if (!network) throw new Error('companyNetwork is missing from seed/researcher.json.');

const facts = items => `<dl>${items.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl>`;
const card = (item, type) => `<article class="network-card" id="${esc(item.id)}" tabindex="-1"><p class="network-card-type">${esc(type)}</p><h3>${esc(item.organization)}</h3><p class="network-category">${esc(item.category)}</p><p>${esc(item.description)}</p>${facts(item.facts)}</article>`;
const collaborationCards = network.businessCollaborations.map(item => card(item, '협업 사업화 지원 협약').replace('</article>', `<a class="network-detail-link" href="${esc(item.projectUrl)}">${esc(item.projectName)} 프로젝트 보기 ↗</a></article>`)).join('');
const protectionCards = network.technologyProtectionPrograms.map(item => card(item, '기술보호 지원사업')).join('');
const researchIpCards = network.researchIpPrograms.map(item => card(item, '지식재산 · 데이터 연구').replace('</article>', `<a class="network-detail-link" href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 공개 요약 보기 ↗</a></article>`)).join('');
const trainingCards = network.trainingPartnerships.map(item => card(item, '인재양성 협약')).join('');
const membershipCards = network.memberships.map(item => card(item, '회원자격')).join('');
const academicMembershipCards = [...(profile.academicMemberships ?? [])]
  .sort((left, right) => String(right.date).localeCompare(String(left.date), 'ko'))
  .map(item => `<article class="network-card network-personal" id="${esc(item.id)}" tabindex="-1"><p class="network-card-type">김재환 · 개인 학술회원</p><h3>${esc(item.organization)}</h3><p class="network-category">${esc(item.category)}</p><p>${esc(item.description)}</p>${facts(item.facts)}</article>`)
  .join('');
const escrow = network.technologyEscrow;
const escrowCard = `<article class="network-card network-escrow" id="${esc(escrow.id)}-record" tabindex="-1"><p class="network-card-type">기술자료 임치</p><h3>${esc(escrow.title)}</h3><p class="network-category">${esc(escrow.technology)}</p><p>${esc(escrow.description)}</p>${facts(escrow.facts)}</article>`;
const body = [
  '<div class="kim-page reading-page company-network-page"><p class="kim-overline">XAIKOREA / COOPERATION &amp; NETWORK</p><h1>산학협력 · 회원 네트워크</h1>',
  '<p class="kim-lead">기업 협업과 지식재산·데이터 연구, 기술보호와 인재양성으로 이어지는 XAIKOREA의 협력 기반과 김재환의 학술단체 활동을 소개합니다.</p>',
  `<aside class="network-notice"><strong>자료 범위</strong><p>기업 협업, 기술보호 지원사업, 인재양성 협약, 산업·기술 단체 회원자격과 기술자료 임치는 XAIKOREA의 회사 활동입니다. 학술단체 회원자격은 김재환 개인 이력으로 별도 표시했습니다.</p><a href="${esc(network.sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 공식 자료 확인 ↗</a></aside>`,
  `<nav class="network-jump" aria-label="페이지 내 이동"><a href="#business-collaboration">기업 협업 ${network.businessCollaborations.length}건</a><a href="#technology-protection-programs">기술보호 지원사업 ${network.technologyProtectionPrograms.length}건</a><a href="#technology-escrow">기술자료 임치 1건</a><a href="#training-partnerships">인재양성 협약 ${network.trainingPartnerships.length}건</a><a href="#memberships">회사 회원자격 ${network.memberships.length}건</a><a href="#academic-memberships">개인 학술회원 ${(profile.academicMemberships ?? []).length}건</a></nav>`,
  `<section class="network-section" id="business-collaboration" aria-labelledby="collaboration-heading"><p class="network-section-label">01 / BUSINESS COLLABORATION</p><h2 id="collaboration-heading">기업 협업 · 사업화</h2>${collaborationCards}</section>`,
  `<section class="network-section" id="technology-protection-programs" aria-labelledby="protection-heading"><p class="network-section-label">02 / TECHNOLOGY PROTECTION</p><h2 id="protection-heading">기술보호 지원사업</h2><div class="network-grid">${protectionCards}</div></section>`,
  `<section class="network-section" id="technology-escrow" aria-labelledby="escrow-heading"><p class="network-section-label">03 / TECHNOLOGY ESCROW</p><h2 id="escrow-heading">기술자료 임치</h2>${escrowCard}</section>`,
  `<section class="network-section" id="training-partnerships" aria-labelledby="training-heading"><p class="network-section-label">04 / TALENT DEVELOPMENT</p><h2 id="training-heading">인재양성 협약</h2><div class="network-grid">${trainingCards}</div></section>`,
  `<section class="network-section" id="memberships" aria-labelledby="membership-heading"><p class="network-section-label">05 / COMPANY MEMBERSHIP</p><h2 id="membership-heading">산업 · 기술 단체 회원자격</h2><div class="network-grid">${membershipCards}</div></section>`,
  `<section class="network-section" id="academic-memberships" aria-labelledby="academic-membership-heading"><p class="network-section-label">06 / ACADEMIC MEMBERSHIP</p><h2 id="academic-membership-heading">김재환 학술단체 회원자격</h2><p class="network-section-intro">개인 학술활동 이력이며 XAIKOREA의 회사 회원자격과 구분합니다.</p><div class="network-grid">${academicMembershipCards}</div></section></div>`,
].join('');

// Insert research programs after collaboration while retaining existing deep links.
const updatedBody = body
  .replace('기업 협업, 기술보호 지원사업,', '기업 협업, 지식재산·데이터 연구, 기술보호 지원사업,')
  .replace('<a href="#technology-protection-programs">', `<a href="#research-ip-programs">지식재산·데이터 연구 ${network.researchIpPrograms.length}건</a><a href="#technology-protection-programs">`)
  .replace(/0([2-6]) \/ /gu, (_, digit) => `0${Number(digit) + 1} / `)
  .replace('<section class="network-section" id="technology-protection-programs"', `<section class="network-section" id="research-ip-programs" aria-labelledby="research-ip-heading"><p class="network-section-label">02 / INTELLECTUAL PROPERTY &amp; DATA RESEARCH</p><h2 id="research-ip-heading">지식재산 · 데이터 연구</h2><p class="network-section-intro">특허 출원·등록 지원과 안전한 데이터 연구를 위한 회사 협약 이력입니다.</p><div class="network-grid">${researchIpCards}</div></section><section class="network-section" id="technology-protection-programs"`);

const pageFile = 'public/pages/company-network.html';
let page = fs.readFileSync('public/pages/sources.html', 'utf8');
page = page.replace(/<title>[\s\S]*?<\/title>/u, '<title>산학협력 · 회원 네트워크 | 김재환 · Jaehwan Kim</title>');
page = page.replace(/<meta name="description" content="[^"]*">/u, '<meta name="description" content="XAIKOREA의 호반건설 PoC 협약, 기술보호 지원사업, 기술자료 임치와 인재양성·회원 네트워크, 김재환의 학술단체 활동.">');
if (!page.includes('/css/company-network.css')) page = page.replace('</head>', '<link rel="stylesheet" href="/css/company-network.css"></head>');
page = page.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/u, (_, open, close) => open + updatedBody + close);
fs.writeFileSync(pageFile, applyAuthorLayout(page, profile));

const homeStart = '<!-- company-network-home:start -->';
const homeEnd = '<!-- company-network-home:end -->';
const homeBlock = `${homeStart}<section class="section company-network-home" id="company-network"><div class="container"><h2 class="section-title"><span class="section-number">04.</span> Cooperation &amp; network</h2><p class="kim-section-intro">XAIKOREA의 협력 기반과 김재환의 학술단체 활동을 구분해 소개합니다.</p><div class="network-home-grid"><article><span class="network-count">${String(network.trainingPartnerships.length).padStart(2, '0')}</span><h3>인재양성 협약</h3><p>${network.trainingPartnerships.map(item => esc(item.organization)).join(' · ')}</p></article><article><span class="network-count">${String(network.memberships.length).padStart(2, '0')}</span><h3>회사 회원자격</h3><p>${network.memberships.map(item => esc(item.organization)).join(' · ')}</p></article><article><span class="network-count">${String((profile.academicMemberships ?? []).length).padStart(2, '0')}</span><h3>개인 학술단체 회원자격</h3><p>${(profile.academicMemberships ?? []).map(item => `${esc(item.organization)} ${esc(item.category)}`).join(' · ')}</p></article><article><span class="network-count">01</span><h3>기술자료 임치</h3><p>${esc(escrow.technology)}</p></article></div><a class="btn btn-outline network-home-link" href="/pages/company-network.html">협력 · 회원 네트워크 전체 보기 ↗</a></div></section>${homeEnd}`;
const homeWithCooperation = homeBlock.replace('<div class="network-home-grid">', `<div class="network-home-grid"><article><span class="network-count">${String(network.businessCollaborations.length).padStart(2, '0')}</span><h3>기업 협업 · 사업화</h3><p>호반건설 PoC · 경기창조경제혁신센터 주관 민간주도 오픈이노베이션 지원사업</p><a class="network-detail-link" href="/pages/company-network.html#business-collaboration">협약 내용 보기 ↗</a></article><article><span class="network-count">${String(network.technologyProtectionPrograms.length).padStart(2, '0')}</span><h3>기술보호 지원사업</h3><p>${network.technologyProtectionPrograms.map(item => esc(item.title)).join(' · ')}</p><a class="network-detail-link" href="/pages/company-network.html#technology-protection-programs">지원사업 보기 ↗</a></article>`);
const homeFile = 'public/index.html';
let home = fs.readFileSync(homeFile, 'utf8');
if (!home.includes('/css/company-network.css')) home = home.replace('</head>', '<link rel="stylesheet" href="/css/company-network.css"></head>');
home = home.replace(new RegExp(`${homeStart}[\\s\\S]*?${homeEnd}`, 'u'), '');
const researchIpHome = `<aside class="network-research-note"><h3>지식재산 · 데이터 연구</h3><p>특허 출원·등록 지원 바우처 협약과 D-테스트베드 데이터 연구 참여를 통해 연구 기반을 넓혀갑니다.</p><a class="network-detail-link" href="/pages/company-network.html#research-ip-programs">참여기관 · 기간 · 데이터 보호 원칙 보기 ↗</a></aside>`;
home = home.replace('<section class="section" id="contact">', `${homeWithCooperation.replace('<a class="btn btn-outline network-home-link"', researchIpHome + '<a class="btn btn-outline network-home-link"')}<section class="section" id="contact">`);
fs.writeFileSync(homeFile, home);

const pagesFile = 'seed/pages.json';
const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
if (!pages.some(page => page.path === '/pages/company-network.html')) {
  pages.push({path: '/pages/company-network.html', title: '산학협력 · 회원 네트워크 | 김재환'});
  fs.writeFileSync(pagesFile, `${JSON.stringify(pages, null, 2)}\n`);
}
console.log(`Company network generated: ${network.trainingPartnerships.length} partnerships, ${network.memberships.length} company memberships, ${(profile.academicMemberships ?? []).length} academic memberships and 1 escrow record.`);

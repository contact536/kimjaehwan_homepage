import fs from 'node:fs';

const file = 'public/pages/sources.html';
let html = fs.readFileSync(file, 'utf8');
const start = '<!-- ai-membership-source:start -->';
const end = '<!-- ai-membership-source:end -->';
const item = `${start}<li><a href="/documents/xaikorea-ai-membership-2026.pdf" target="_blank" rel="noopener">경기도 AI 멤버십 기업 인증서</a>: 2026년 9월 1일</li><li><a href="/documents/xaikorea-technology-leading-company-2026.pdf" target="_blank" rel="noopener">기술보호 선도기업 지정서</a>: 2026년 6월 11일</li>${end}`;

if (html.includes(start)) {
  html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), item);
} else {
  html = html.replace('</ul>', item + '</ul>');
}
html = html.replace(
  '증명서 원본은 공개하지 않습니다.',
  '학력·재직 증명서 원본은 공개하지 않으며, 공개 가능한 기업 인증서는 논문·자료 페이지에서 제공합니다.',
);
fs.writeFileSync(file, html);
console.log('Profile source list updated with company certificates.');

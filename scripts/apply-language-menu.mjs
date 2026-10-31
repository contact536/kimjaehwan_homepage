import fs from 'node:fs';
import path from 'node:path';

const menu = '<div class="language-switch" role="group" aria-label="Language / 언어" translate="no"><button type="button" lang="ko" data-site-language="ko" aria-pressed="true">한국어</button><button type="button" lang="en" data-site-language="en" aria-pressed="false">English</button></div>';
for (const file of fs.readdirSync('public', {recursive:true}).filter(file => file.endsWith('.html') && !file.startsWith('admin'))) {
  const destination = path.join('public', file);
  let html = fs.readFileSync(destination, 'utf8');
  if (!html.includes('class="academic-header"')) continue;
  html = html.replace(/<div class="language-switch"[\s\S]*?<\/div>/g, '');
  if (!html.includes('class="academic-menu-toggle"')) html = html.replace('<nav id="academicMenu"', '<button class="academic-menu-toggle" type="button" aria-controls="academicMenu" aria-expanded="false">메뉴</button><nav id="academicMenu"');
  html = html.replace('<button class="academic-menu-toggle"', menu + '<button class="academic-menu-toggle"');
  if (!html.includes('/css/language.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/language.css"></head>');
  if (!html.includes('/js/language.js')) html = html.replace('</head>', '<script defer src="/js/language.js"></script></head>');
  fs.writeFileSync(destination, html);
}

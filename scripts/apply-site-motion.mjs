import fs from 'node:fs';
import path from 'node:path';

for (const file of fs.readdirSync('public', {recursive:true}).filter(file=>file.endsWith('.html')&&!file.startsWith('admin'))) {
  const destination = path.join('public',file);
  let html = fs.readFileSync(destination,'utf8');
  if (!html.includes('class="academic-header"')) continue;
  if (!html.includes('/css/site-motion.css')) html = html.replace('</head>','<link rel="stylesheet" href="/css/site-motion.css"></head>');
  if (!html.includes('/js/site-motion.js')) html = html.replace('</head>','<script defer src="/js/site-motion.js"></script></head>');
  fs.writeFileSync(destination,html);
}

import fs from 'node:fs';
import {topicCards} from './research-overview-content.mjs';
for(const file of ['public/index.html','public/pages/research.html']) {
 const home=file==='public/index.html';
 let html=fs.readFileSync(file,'utf8');
 const block=/<!-- research-topics:start -->[\s\S]*?<!-- research-topics:end -->/g;
 if(block.test(html)) html=html.replace(block,topicCards(home));
 else if(home) html=html.replace('<div class="kim-grid">',topicCards(true)+'<div class="kim-grid">');
 else html=html.replace('<h1>연구</h1>','<h1>연구</h1>'+topicCards());
 html=html.replace(/<nav class="academic-toc"[^>]*>[\s\S]*?<\/nav>/,'');
 if(!html.includes('/css/research-topics.css'))html=html.replace('</head>','<link rel="stylesheet" href="/css/research-topics.css"></head>');
 fs.writeFileSync(file,html);
}

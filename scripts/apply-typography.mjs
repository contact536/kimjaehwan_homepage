import fs from 'node:fs';
import path from 'node:path';
for(const file of fs.readdirSync('public',{recursive:true}).filter(f=>f.endsWith('.html'))){
 const dest=path.join('public',file);let html=fs.readFileSync(dest,'utf8');
 html=html.replace(/<link[^>]*href="\/css\/typography.css"[^>]*>/g,'');
 html=html.replace('</head>','<link rel="stylesheet" href="/css/typography.css"></head>');
 fs.writeFileSync(dest,html);
}

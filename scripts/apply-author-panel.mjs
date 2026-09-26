import fs from 'node:fs';
import p from '../seed/researcher.json' with {type:'json'};
import {applyAuthorLayout} from './author-layout.mjs';
for(const name of ['publications','patents','sources','contact','company-network']){
 const file=`public/pages/${name}.html`;
 let html=fs.readFileSync(file,'utf8');
 html=applyAuthorLayout(html,p);
 fs.writeFileSync(file,html);
}
console.log('Applied shared researcher panel to five supporting pages.');

import type {Database} from './database.ts';
import profile from '../seed/researcher.json' with {type:'json'};
export async function initializeResearch(db:Database){
 if(await db.prepare("SELECT value FROM settings WHERE key='research-cms-v1'").first())return;
 await db.batch([...profile.research.map(r=>db.prepare('INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES(?,?,?,?,1,?) ON CONFLICT(kind,id) DO NOTHING').bind('research',r.id,r.title,JSON.stringify({name:r.title,subtitle:r.subtitle,summary:r.description.split('。')[0],body:r.description}),new Date().toISOString())),db.prepare("INSERT INTO settings(key,value) VALUES('research-cms-v1','complete') ON CONFLICT(key) DO NOTHING")]);
}
export async function researchRows(db:Database){const {results}=await db.prepare("SELECT id,revision,payload FROM records WHERE kind='research' ORDER BY id").all();return results.map(r=>({id:r.id,revision:r.revision,data:JSON.parse(r.payload)}));}
export async function renderResearch(response:Response,db:Database){
 const rows=await researchRows(db);if(!rows.some(r=>r.revision>1))return response;
 let html=await response.clone().text();if(!html.includes('data-cms-research='))return response;
 const records=new Map(rows.map(r=>[r.id,r]));
 const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 html=html.replace(/(<(\w+)\b[^>]*data-cms-research="([^:"]+):([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/g,(match,open,tag,id,key,close)=>{const row=records.get(id);return row&&row.revision>1&&['name','subtitle','summary','body'].includes(key)?open+escape(row.data[key])+close:match;});
 const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');headers.delete('last-modified');headers.set('Cache-Control','no-store');return new Response(html,{status:response.status,headers});
}

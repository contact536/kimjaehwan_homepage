import type {Database} from './database.ts';
export const credentialKey='administrator-credential-v1';
export async function credential(db:Database){const row=await db.prepare('SELECT value FROM settings WHERE key=?').bind(credentialKey).first();return row?{raw:String(row.value),...JSON.parse(row.value)}:null;}
async function derive(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(salt.match(/../g)!,v=>parseInt(v,16)),iterations:100000,hash:'SHA-256'},key,256))).map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function matchesPassword(password:string,stored:any,fallback?:string){
 const a=stored?await derive(password,stored.salt):Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password)))).join(',');
 const b=stored?stored.hash:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(fallback||'')))).join(',');
 let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;
}
export async function makeCredential(password:string){const salt=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(v=>v.toString(16).padStart(2,'0')).join('');return {salt,hash:await derive(password,salt),version:crypto.randomUUID(),algorithm:'PBKDF2-SHA256',iterations:100000};}

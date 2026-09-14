import test from 'node:test';import assert from 'node:assert/strict';
import {createApp} from '../server/app.ts';import {openDatabase} from '../server/sqlite.ts';
test('password change persists, rejects invalid input and revokes previous sessions without exporting hashes',async()=>{
 const file='data/password-test-'+crypto.randomUUID()+'.sqlite';let connection=openDatabase(file);let app=createApp();const old='oldpass8';const next='newpass8';const env={DB:connection.db,ADMIN_PASSWORD:old,SESSION_SECRET:'a-session-secret-with-at-least-32-characters'};
 const req=(path:string,body?:any,cookie='',origin='http://localhost')=>app.request('http://localhost'+path,{method:body?'POST':'GET',headers:{origin,cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})},env);
 try{
 const login=await req('/api/auth/login',{password:old});const cookie=login.headers.get('set-cookie')!.split(';')[0];
 const data={currentPassword:old,newPassword:next,confirmPassword:next};
 assert.equal((await req('/api/admin/password',data)).status,401);
 assert.equal((await req('/api/admin/password',data,cookie,'https://other.example')).status,403);
 assert.equal((await req('/api/admin/password',{...data,currentPassword:'wrong'},cookie)).status,400);
 assert.equal((await req('/api/admin/password',{...data,confirmPassword:next+'x'},cookie)).status,400);
 assert.equal((await req('/api/admin/password',{...data,newPassword:'1234567',confirmPassword:'1234567'},cookie)).status,400);
 assert.equal((await req('/api/admin/password',data,cookie)).status,200);
 assert.equal((await req('/api/admin/session',undefined,cookie)).status,401);
 assert.equal((await req('/api/auth/login',{password:old})).status,401);
 const stored=await connection.db.prepare("SELECT value FROM settings WHERE key='administrator-credential-v1'").first();assert.ok(stored);assert.ok(!stored!.value.includes(next));assert.ok(!stored!.value.includes(old));
 connection.close();connection=openDatabase(file);env.DB=connection.db;app=createApp();
 const relogin=await req('/api/auth/login',{password:next});assert.equal(relogin.status,200);const fresh=relogin.headers.get('set-cookie')!.split(';')[0];assert.equal((await req('/api/admin/session',undefined,fresh)).status,200);
 const exported=await (await req('/api/admin/export',undefined,fresh)).text();assert.ok(!exported.includes(JSON.parse(stored!.value).hash));
 }finally{connection.close();}
});

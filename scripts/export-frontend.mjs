import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {openDatabase} from '../server/sqlite.ts';
import {initializeData} from '../server/database.ts';
import {originalResponse} from '../server/original.ts';
const root=process.cwd(),stamp=new Date().toISOString().replace(/[:.]/g,'-');
const output=path.resolve('deliverables','frontend-'+stamp);
if(!output.startsWith(path.join(root,'deliverables')+path.sep))throw Error('Invalid output path');
fs.mkdirSync(output,{recursive:true});
fs.cpSync('public',output,{recursive:true,filter:source=>!path.relative('public',source).split(path.sep).includes('admin')});
const connection=openDatabase(process.env.DATABASE_PATH||'./data/platform.sqlite');
try{
 await initializeData(connection.db);
 for(const file of fs.readdirSync(output,{recursive:true}).filter(f=>f.endsWith('.html'))){
  const filename=path.join(output,file);
  const response=await originalResponse(new Response(fs.readFileSync(filename,'utf8'),{headers:{'content-type':'text/html'}}),'/'+file.replaceAll('\\','/'),connection.db);
  let html=await response.text();
  html=html.replace(/<a\b[^>]*href="\/admin\/?"[^>]*>[\s\S]*?<\/a>/g,'');
  if(file.replaceAll('\\','/')==='pages/assistant.html')html=html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/,`$1<div class="kim-page"><h1>연구 도우미</h1><p>이 파일 묶음은 읽기 전용입니다. AI 연구 도우미와 콘텐츠 저장은 백엔드가 실행 중인 전체 플랫폼에서 사용할 수 있습니다.</p><a href="/pages/research.html">연구 자료 보기 →</a></div>$2`);
  fs.writeFileSync(filename,html);
 }
 fs.writeFileSync(path.join(output,'README.txt'),'읽기 전용 프론트엔드 스냅샷\n이 폴더를 HTTP 서버의 루트로 실행하세요. 예: python -m http.server 14318 --bind 127.0.0.1\nhttp://127.0.0.1:14318/ 에 접속하세요. file:// 직접 열기는 지원하지 않습니다.\n현재 저장된 공개 데이터가 HTML에 반영됩니다. 관리자, 운영 DB, 비밀번호 및 모델 설정은 포함하지 않습니다.\n');
 const archive=output+'.zip';
 const quote=s=>"'"+s.replaceAll("'","''")+"'";
 const zip=spawnSync('powershell.exe',['-NoProfile','-Command',`$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory(${quote(output)}, ${quote(archive)})`],{encoding:'utf8'});
 if(zip.status!==0)throw Error(zip.stderr||'ZIP export failed');
 console.log(JSON.stringify({directory:output,archive}));
}finally{connection.close();}

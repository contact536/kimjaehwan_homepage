import fs from 'node:fs';
const header='# 김재환 개인 연구자 웹플랫폼\n\n현재 실행 버전은 김재환 XAIKOREA 대표이사의 자료를 반영한 개인 연구 플랫폼입니다. [개인화 내용과 출처](PERSONALIZATION.md), [에이전트 설정](AGENT-BACKEND.md)을 먼저 읽어 주세요.\n\n로컬 미리보기: http://127.0.0.1:4321/\n\n검증: HTML 41개 응답, JavaScript 구문 8개, 백엔드 테스트 11개, TypeScript 검사 및 프로덕션 빌드 통과. 실제 Ollama 모델 추론과 브라우저 시각 검사는 실시하지 않았습니다.\n\n아래 내용은 개인화 이전 원본 재현판의 기록입니다. 39개 원본 파일 동일성은 현재 HTML/JS에 적용되지 않습니다. 현재 로컬 변경을 이전 공개 사이트에 배포하지 않았습니다.\n\n---\n\n';
let readme=fs.readFileSync('README.md','utf8');if(!readme.startsWith('# 김재환'))fs.writeFileSync('README.md',header+readme);
for(const f of ['SOURCE-FIDELITY.md','VERIFICATION.md']){const t=fs.readFileSync(f,'utf8');if(!t.startsWith('> 이전'))fs.writeFileSync(f,'> 이전 원본 재현판의 기록입니다. 현재 개인화 변경 내용과 검증 범위는 PERSONALIZATION.md 및 README.md를 참고하세요.\n\n'+t)}
console.log('Updated delivery documentation.');

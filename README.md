# 김재환 개인 연구 홈페이지

김재환 XAIKOREA 대표의 연구·프로젝트·학력·회사 자료를 제공하는 홈페이지의 전체 소스입니다.

- 운영 도메인: https://kimjaehwan.com/
- 정적 배포 저장소: https://github.com/contact536/contact536.github.io
- 이 저장소: HTML/CSS/JavaScript 프론트엔드 + Hono/SQLite 백엔드 + 관리자 + LangGraph/Ollama 연구 도우미
- 회사 자료 PDF 2개, Pretendard 글꼴 및 라이선스, 경영전공 수정, 회사 홈페이지 링크 포함
- 운영 DB, 비밀번호, 세션 비밀값, 모델 가중치 및 node_modules는 포함하지 않습니다.
- 이 저장소에 푸시하는 것만으로 기존 홈페이지가 재배포되지는 않습니다.

## 로컬 실행

Node.js 24 이상을 설치하고 저장소 루트에서 실행합니다.

~~~sh
npm ci
npm run setup
npm start
~~~

기본 주소: http://127.0.0.1:4317/
관리자: http://127.0.0.1:4317/admin/

setup이 생성하는 .env에서 관리자 비밀번호를 확인하세요. 기존 .env는 덮어쓰지 않습니다.
관리자에서 비밀번호를 변경했다면 DB에 저장된 비밀번호가 우선합니다. 비밀번호는 8자 이상입니다.
초기 실행은 공개 seed 데이터로 시작합니다. 기존 관리자 수정 내용을 옮기려면 별도의 비공개 DB 이전이 필요합니다.

## 연구 도우미

자료 검색은 외부 모델 없이 동작합니다. 생성형 AI 모드는 Ollama와 도구 호출을 지원하는 모델이 필요하고 관리자 로그인 후 사용할 수 있습니다.
서버의 .env에 OLLAMA_BASE_URL 및 OLLAMA_MODEL을 설정하세요. 기존 로컬 검증 모델은 qwen2.5:7b입니다.
모델 서버는 공개 인터넷에 노출하지 마세요.

## 구조 및 검증

- public/: 홈페이지, 관리자, 글꼴, 공개 PDF
- server/: API·인증·SQLite·연구 도우미
- seed/: 최초 공개 콘텐츠
- scripts/: 페이지 생성, 실행 준비, 정적 내보내기
- tests/: 관리자·인증·콘텐츠·검색 테스트

~~~sh
npm test
npm run check
npm run build
~~~

npm run build는 기존 Cloudflare/Sites용 출력입니다. NHN VM에서는 npm start로 Node 서버를 실행합니다.
npm run build:frontend는 관리자/API를 제외한 읽기 전용 정적 묶음을 만듭니다. 현재 ZIP 생성 단계는 Windows PowerShell을 사용하므로 Linux에서는 조정이 필요합니다.
npm run content:generate는 seed 기준으로 화면을 다시 생성하므로 public/ 직접 수정사항을 먼저 보관하세요.

## NHN Cloud 이전 검토

[NHN-CLOUD-MIGRATION.md](NHN-CLOUD-MIGRATION.md)에 권장 구조, 사양 가정, 코드 보완점, 데이터 이전·도메인 전환·복구 절차를 정리했습니다.
현재는 이전 검토 단계이며 NHN 리소스 생성이나 DNS 변경을 수행하지 않았습니다.

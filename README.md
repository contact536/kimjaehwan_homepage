# 김재환 개인 연구 홈페이지

김재환 XAIKOREA 대표의 연구·프로젝트·학력·회사 자료를 제공하는 홈페이지의 전체 소스입니다.

- 운영 도메인: https://kimjaehwan.com/
- 정적 배포 저장소: https://github.com/contact536/contact536.github.io
- 이 저장소: HTML/CSS/JavaScript 프론트엔드 + Hono/SQLite 백엔드 + 관리자 + LangGraph/Ollama 연구 도우미
- 회사 자료 PDF 2개, Pretendard 글꼴 및 라이선스, 경영전공 수정, 회사 홈페이지 링크 포함
- 운영 DB, 비밀번호, 세션 비밀값, 모델 가중치 및 node_modules는 포함하지 않습니다.
- 이 저장소에 푸시하는 것만으로 운영 서버가 자동 갱신되지는 않습니다. 서버에서 `sudo /srv/kimjaehwan-homepage/ops/deploy.sh`를 실행해 검증된 배포 절차를 사용합니다.

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

## 한국어·영어 선택

공개 페이지 상단에서 한국어와 영어를 선택합니다. `?lang=ko` / `?lang=en` 링크가 저장된 언어 선택보다 우선하며, 페이지 이동 시 선택 언어와 문서 위치를 유지합니다. 관리자와 원본 PDF·이미지는 번역 대상에 포함하지 않습니다.

한국어와 영어 모두 내부 페이지 링크에 선택값을 명시합니다. 연락 페이지를 포함한 모든 공개 페이지에서 두 버튼을 유지하며, 한 화면에는 선택한 언어만 표시합니다. 운영 서버는 HTML·메뉴 스크립트·스타일·번역 파일을 재검증하도록 응답해 배포 후 이전 UI가 캐시에 남는 것을 방지합니다.

- `public/locales/en.json`: 정규화한 한국어 원문과 영어 번역의 대응표. 공개 문구를 수정할 때 번역도 함께 갱신합니다.
- `public/js/language.js`, `public/css/language.css`: 언어 전환, 동적 UI 번역, 내부 링크와 모바일 메뉴.
- `scripts/apply-language-menu.mjs`: 공개 HTML에 공통 메뉴를 적용하며 `content:generate` 마지막 단계에서도 실행합니다.
- `server/english-research.ts`: 공개 seed와 같은 번역표를 사용하는 영문 자료 검색. 연구 주제를 추가할 때 검색 자료도 보완합니다.

변경 후 `npm test`, `npm run check`와 함께 PC·모바일의 양방향 전환, 페이지 찾기, 미리보기, 다운로드를 확인합니다. 번역 파일을 불러오지 못하면 한국어를 유지하고 다시 선택할 수 있습니다.

상단 메뉴는 현재 페이지에서도 동일한 글자 굵기와 높이를 유지하며 색상·밑줄로 선택 상태를 표시합니다. 스크롤바 공간을 확보해 짧은 페이지로 이동할 때도 메뉴가 좌우로 움직이지 않습니다. 모바일에서는 상단 조작 버튼 아래의 메뉴 목록만 한 열로 스크롤하며, 좁은 화면에서는 언어 버튼을 다음 줄에 배치합니다. 프로필·CV 사이드바는 실제 헤더 높이에 맞춰 고정됩니다.

## 화면 전환·스크롤 효과

`public/js/site-motion.js`와 `public/css/site-motion.css`는 공개 페이지의 섹션·카드 등장, 스크롤 진행 표시, 연구 목차의 현재 위치 강조와 맨 위로 이동을 담당합니다. `scripts/apply-site-motion.mjs`로 공통 자산을 적용합니다. 등장 효과는 논문·연구·프로젝트 카드와 소개·경력 등 구역 전체에 적용하며, 제목이나 문구만 별도로 움직이지 않습니다. 화면보다 긴 카드도 상단이 들어올 때 전체가 한 번 나타나고, 중첩된 구역의 효과는 겹치지 않습니다. 본문은 기본적으로 표시되며, 동작 줄이기 설정에서는 등장·호버 이동 효과를 사용하지 않습니다. 미리보기·키보드 포커스·앵커 이동·인쇄 시에는 읽기와 조작을 우선합니다.

`public/css/site-interactions.css`는 메뉴 밑줄, 이미지·로고 강조, 버튼 반응, 상세 패널 등장과 경력 타임라인 강조를 제공합니다. 터치 화면에서는 호버 전용 동작을 사용하지 않으며, 키보드 포커스로도 링크·미리보기를 식별할 수 있습니다. 논문과 서비스 화면 이미지는 확대 효과 없이 전체 크기·비율을 유지합니다.

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
NHN 판교 인스턴스와 `kimjaehwan.com` HTTPS 전환은 완료되었습니다. 운영 절차는 [ops/README.md](ops/README.md)를 기준으로 유지합니다.

# Academic Pages 분석 및 적용

분석일: 2026-09-06
참고: https://academicpages.github.io/

## 분석
공식 데모는 상단에 학술 콘텐츠별 메뉴를 두고, 왼쪽에 사진·이름·소개·소속·연락 및 외부 프로필 링크를 제공한다. 하위 페이지에서도 연구자 맥락을 유지할 수 있는 구조다. Jekyll/Minimal Mistakes 기반이며 Markdown 콘텐츠와 YAML 설정을 화면 템플릿에서 분리한다. 메뉴와 프로필을 공통 설정으로 관리하는 방식이 특징이다.

## 적용
논문·자료, 지식재산, 자료 기준, 연락 페이지에 사진·한영 이름·역할·이메일·CV·연구 분야 링크를 담은 공통 프로필 패널을 추가했다. 넓은 화면은 왼쪽 사이드바, 850px 이하는 작은 사진과 정보를 나란히 배치한 상단 프로필이다. 기존 읽기 화면과 다크 테마 변수를 사용한다.

프로필은 seed/researcher.json에서 생성한다. 확인되지 않은 Google Scholar·ORCID 계정은 만들지 않는다. 이미 프로필을 보여주는 홈과 CV에는 중복 패널을 넣지 않는다. 기존 Hono 구조를 유지하고 추가 JavaScript나 Jekyll 이전은 하지 않았다.

## 구현
- scripts/apply-author-panel.mjs: 공통 패널 생성, content:generate 마지막 단계에 연결.
- public/css/author-panel.css: 반응형 프로필과 본문 배치, 키보드 포커스, 인쇄 시 패널 숨김.
- public/pages/publications.html, patents.html, sources.html, contact.html: 적용 페이지.

원본 사이트의 모든 CSS/JavaScript 내부 구현을 복제한 작업은 아니다. 공개 페이지의 정보 구조를 참고해 현재 프로젝트에 맞게 구현했다. 로컬 적용이며 브라우저 시각 검증과 재배포는 수행하지 않는다.

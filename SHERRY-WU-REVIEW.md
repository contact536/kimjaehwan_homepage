# Sherry Wu 홈페이지 분석 및 적용

참고: https://www.cs.cmu.edu/~sherryw/ · 공개 HTML 및 https://www.cs.cmu.edu/~sherryw/styles.css 분석 (2026-09-06).

## 분석
- 짧은 자기소개 뒤에 최근 연구 방향을 설명하고, 세 가지 주제에서 핵심 질문(We ask)과 연구 접근(We do)을 함께 제시한다.
- 주제 카드에서 관련 Research Highlights로 바로 이동한다. 방문자가 논문 제목을 읽기 전에 연구의 목적을 이해할 수 있는 정보 구조다.
- HTML 앵커와 반응형 그리드가 핵심 탐색을 담당한다. 공개 소스에는 Jekyll 생성 흔적과 Pure CSS 그리드, 외부 글꼴 및 별도 분석·소셜 스크립트가 있다.

## 적용
- 홈과 연구 페이지에 CLOA / TAXiA / KorTaxArena를 설명하는 세 가지 연구 질문과 접근 방법을 추가했다. 기존 회사소개서·프로필 내용을 편집해 표현했으며 새로운 성과를 주장하지 않는다.
- 홈은 각 연구 요약으로, 연구 페이지는 해당 상세 설명으로 연결한다. 기본 HTML 앵커와 tabindex=-1을 사용해 키보드 탐색도 지원한다.
- 분야별 색상과 명시적인 텍스트 이름을 함께 제공한다. 선택한 연구에는 :target 테두리를 표시하고 고정 메뉴 높이를 고려한 스크롤 여백을 둔다.
- 좁은 화면은 한 열로 구성하고 다크 테마 색상을 지정했다. 기존 연구 목록과 상세 펼치기는 유지한다.
- 참고 사이트의 개인 정보, 연구 이미지, 논문, 외부 추적 스크립트는 가져오지 않았다.

## 구현
- scripts/apply-research-topics.mjs: 연구 질문 데이터와 페이지 생성. content:generate 마지막 단계에 연결했다.
- public/css/research-topics.css: 반응형 탐색과 도착 지점 강조.
- scripts/apply-research-rows.mjs: 후속 앵커 속성이 추가되어도 재생성이 가능하도록 조정했다.
- public/index.html, public/pages/research.html: 생성된 결과.

## 검증과 범위
기존 테스트 11개 통과. 프론트엔드 검증에서 HTML 41개, JavaScript 문법 9개 및 데이터베이스 응답을 확인했다. 브라우저 화면 캡처나 실제 기기 시각 검증은 수행하지 않았다. 이번 변경은 로컬 프로젝트에 적용하며 기존 배포본은 갱신하지 않는다.

# al-folio 분석 및 적용

2026-09-06 공식 저장소와 데모 및 _pages/about.md, publications.md, projects.md, _config.yml을 확인했습니다. 브라우저 시각 검사는 수행하지 않았습니다.

참고: https://github.com/alshedivat/al-folio / https://alshedivat.github.io/al-folio/

al-folio의 about 설정은 우측 프로필 사진, 소개, 선별 논문, 제한된 소식 목록을 결합합니다. publications는 검색과 역시간순 서지 목록, projects는 분류와 중요도 순서 및 가로/세로 카드 구성을 제공합니다. 설정의 기본 본문 최대 폭은 930px이며 고정 상단 내비게이션과 밝음/어두움 테마를 지원합니다. 현재 v1은 Jekyll 스타터와 별도 플러그인으로 구성됩니다.

이번 적용은 코드 복제가 아닌 정보 구조를 참고한 자체 HTML/CSS/JavaScript 구현입니다. Ruby/Jekyll 런타임이나 타인의 논문·예제 프로필은 포함하지 않습니다.

- 메인: 대형 전체 화면 인트로 및 입자 애니메이션을 제거하고 소개와 사진을 첫 화면에 배치.
- 내비게이션: 주요 메뉴를 상단에 노출하고 학회·저널·도우미·지식재산은 연구 도구로 통합. 모바일은 명시적인 메뉴 버튼, 현재 페이지 표시, Escape 닫기 지원. JavaScript가 없어도 모든 링크에 접근 가능.
- 읽기: 약 960px의 본문 폭, 16px 본문, 밝은 기본 배경과 절제한 보라색 링크. 저장한 어두운 테마 선택은 유지.
- 연구: 논문이 아직 공개되지 않은 상태에 맞춰 선별 연구 목록을 적용. 연구 이름·상태·요약·태그를 가로 행으로 구분하고 모바일은 세로로 전환.
- 연구 상세: CLOA/TAXiA/KorTaxArena 앵커 탐색과 고정 메뉴를 고려한 스크롤 여백.
- 경력/소식: 날짜 정렬, 얇은 구분선, CV 인쇄 시 메뉴·장식 제외.
- 기존 관리자 인증, 데이터 수정, 학회·저널 필터, 연구 검색 및 에이전트 API는 유지.

미적용: BibTeX 자동 생성은 확인된 논문이 없어서 제외. 블로그·수업·책 목록 등 현재 콘텐츠가 없는 기능도 추가하지 않았습니다. CMS 교체는 이번 디자인 개선 범위에 포함되지 않습니다.

재생성 시 scripts/personalize.mjs와 scripts/finalize-personal.mjs 다음에 `node scripts/apply-academic.mjs`를 실행합니다. 또는 `npm run content:generate`를 사용합니다. 이 스크립트는 반복 실행해도 헤더와 스타일 링크를 중복 추가하지 않습니다.

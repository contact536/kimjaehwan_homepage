# Jon Barron 홈페이지 분석 및 적용

2026-09-06 공개 페이지와 원본 index.html, stylesheet.css를 확인했습니다.

- https://jonbarron.info/
- https://raw.githubusercontent.com/jonbarron/jonbarron.github.io/master/index.html
- https://raw.githubusercontent.com/jonbarron/jonbarron.github.io/master/stylesheet.css

원본은 최대 800px의 중앙 본문, 짧은 소개 옆 원형 사진, 텍스트 연락 링크, 연구별 시각 자료와 제목·저자·발표처·자료 링크·짧은 설명을 결합합니다. 일부 연구에는 배경 강조를 쓰고, 이미지 교체를 마우스 오버 이벤트로 구현합니다. 프론트엔드는 표 기반 HTML과 작은 CSS/JavaScript로 구성됩니다.

현재 프로젝트에는 메인·소개·프로젝트의 연구 목록에 다음을 적용했습니다.

1. 연구별 요약 패널과 설명을 나란히 배치. 자료가 없는 논문 이미지 대신 실제 연구명·분야를 나타내는 텍스트 패널을 사용.
2. 제목, 기관·진행 상태, 확인된 본인 역할, 관련 링크, 한 문장 요약 순서로 통일.
3. 카드 전체 클릭 대신 연구 상세와 특허/협업/공개 자료 현황에 직접 접근하는 링크 제공.
4. 상세 설명은 기본 HTML details/summary로 펼치기. JavaScript 없이 동작하며 터치와 키보드 접근 가능.
5. 메인 프로필은 원형 표시로 조정하고 첫 화면의 세로 여백을 축소. 사진 원본 파일은 변경하지 않음.
6. 기존 al-folio 기반 상단 탐색과 한글 가독성을 고려한 본문 폭, 어두운 테마는 유지.

원본의 표 기반 레이아웃이나 마우스 오버 전용 기능은 복사하지 않았습니다. 의미 있는 article/aside/nav와 CSS Grid로 새로 구현했습니다. 임의 논문·저자·실험 결과·코드 저장소는 추가하지 않았으며 KorTaxArena의 개인 역할은 자료에서 구체적으로 확인되지 않아 별도로 표기하지 않았습니다.

`npm run content:generate` 마지막 단계에 `node scripts/apply-research-rows.mjs`를 연결했습니다. 반복 실행 시 중복 없이 현재 연구 JSON에서 목록을 다시 생성합니다. 연구별 한 문장 요약과 링크 매핑은 해당 스크립트에서 편집합니다.

검증 범위: 기존 백엔드 회귀 테스트, HTML 응답과 JavaScript 구문, 목록 개수·자료 링크·반복 생성 동일성. 브라우저 시각 검사는 수행하지 않았습니다. 이 개선은 로컬 프로젝트용이며 공개 배포본의 업데이트를 의미하지 않습니다.

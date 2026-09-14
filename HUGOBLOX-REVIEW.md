# Hugo Blox 분석 및 적용

분석일: 2026-09-06

## 공개 자료
- https://hugoblox.com/ : frontmatter에서 블록을 구성하고 Hugo로 렌더링하는 콘텐츠 구조, 템플릿 중심 시작 흐름.
- https://hugoblox.com/hugo-academic : CV·논문·프로젝트·소식 구성, 인용 자료와 다크 모드 등 연구자용 기능 안내.
- https://github.com/HugoBlox/kit : Hugo 기반 프레임워크와 Tailwind 블록 구성 확인.

공식 홈페이지는 서비스 소개용 랜딩 페이지다. 그 페이지의 가격표와 마케팅 섹션보다 Academic의 콘텐츠 블록 구성이 현재 개인 연구 플랫폼에 적합하다고 판단했다. 내부 JavaScript 전체나 정확한 CSS 수치까지 분석·복제한 것은 아니다.

## 적용 결정
CV를 독립된 세 블록(경력, 학력, 기업 주요 이력)으로 재구성했다. 이전 Education과 Experience & Milestones에 중복되어 있던 박사과정 입학·MBA 취득을 학력에서 한 번만 표시한다. 기업의 인증과 특허 출원은 별도 블록에 둔다.

왼쪽에 이름·역할·섹션 탐색·연락처·자료 기준을 제공하고 오른쪽에 세로 타임라인을 배치했다. 좁은 화면은 한 열로 전환한다. 학력은 과정 재학과 학위 취득 상태를 텍스트로 구분한다. 섹션 링크는 기본 HTML 앵커로 작동하며 키보드 포커스와 도착 위치 강조를 지원한다.

Hugo로 이전하거나 Tailwind를 추가하지 않고, 기존 seed/researcher.json에서 HTML을 생성하는 프로젝트의 방식에 블록 구조를 적용했다. 생성 스크립트를 content:generate 마지막 단계에 연결해 반복 실행과 데이터 재사용을 지원한다. 사용자에게 제공할 새로운 학력·실적·수치·숙련도는 만들지 않았다.

## 파일
- scripts/apply-cv-blocks.mjs
- public/css/cv-blocks.css
- public/pages/experience.html
- package.json

## 범위
로컬 프로젝트 적용. 재배포와 브라우저 시각 검증은 이번 작업에 포함하지 않는다.

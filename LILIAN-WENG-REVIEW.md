# Lil’Log 분석 및 적용

분석일: 2026-09-06

## 참고한 공개 페이지
- https://lilianweng.github.io/ : 짧은 소개, 글 제목·요약·날짜·읽기 시간·작성자, Archive/Search/Tags 탐색. 푸터에 Hugo와 PaperMod 명시.
- https://lilianweng.github.io/posts/2023-06-23-agent/ : 계층형 목차, 제목별 영구 링크, 본문과 참고문헌을 연결하는 긴 글 구조.

공개 페이지의 텍스트와 링크 구조를 확인했다. 원본 HTML 직접 다운로드는 환경의 네트워크 제한으로 완료하지 못했으므로 정확한 CSS 수치나 JavaScript 내부 동작을 복제했다고 주장하지 않는다.

## 현재 프로젝트에 적용
1. 논문·자료: 기존 KorTaxArena 소개를 제목, 요약, 연구 상태, 공개 자료 상태, 읽기 링크 순서의 항목으로 재구성했다. 실제 등록되지 않은 논문·날짜·읽기 시간은 만들지 않았다.
2. 논문·자료, 지식재산, 자료 기준: 본문 최대 폭을 780px로 제한하고 행간과 여백을 조정했다. 기존 테마 변수를 활용해 밝은/어두운 화면을 지원한다.
3. 지식재산: 기존 특허 출원 3개로 접을 수 있는 목차와 제목별 링크를 생성했다. native details, anchor, tabindex, :target을 사용한다.
4. 논문·자료 하단: 이미 존재하는 지식재산·프로필 자료 기준 페이지를 요약과 함께 연결한다.

등록 자료 수가 적어 검색·태그 필터·연도별 아카이브는 이번에 추가하지 않았다. 기존 검색 도구 및 연구 주제 탐색은 유지한다. 추가 런타임 JavaScript나 라이브러리는 없다.

## 파일
- scripts/apply-reading.mjs: 정적 페이지 변환, content:generate 마지막 단계.
- public/css/reading.css: 자료 읽기 화면.
- public/pages/publications.html, patents.html, sources.html: 적용 결과.

이번 작업은 로컬 프로젝트 수정이다. 브라우저 시각 검증과 재배포는 수행하지 않는다.

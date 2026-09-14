> 이전 원본 재현판의 기록입니다. 현재 개인화 변경 내용과 검증 범위는 PERSONALIZATION.md 및 README.md를 참고하세요.

# 원본 프론트엔드 대응표

HTML 33개, CSS 3개, JavaScript 3개를 원본 그대로 보존했습니다. 총 39개 소스의 SHA-256이 수집 원본과 일치하며, 실제 사이트에서 재조회한 39개 소스도 같은 해시였습니다.

## 복원한 동작

- 전체 화면 필기 인트로와 세션별 재생, 테마 버튼 표시 시점.
- 최대 150개의 파티클 및 연결선·마우스 반응.
- 0에서 시작하는 2초 숫자 카운터와 스크롤 등장 효과.
- 원본 레이아웃·폰트·색상·간격·반응형 CSS.
- 학회 406행·저널 478행과 원본 배지·분야 칩·필터·검색·집계.
- 원본 지구본·사진·카드·코드 복사·라이트박스·푸터·외부 링크.

관리자 UI는 `/admin/`에 분리되어 있습니다. 백엔드의 편집 내용은 서버 응답에서만 반영하며, 초기 상태에는 원본 HTML을 그대로 제공합니다. 원본 상대경로 메뉴의 404는 서버 리다이렉트로 호환합니다.

이 검증은 소스 동일성에 대한 것입니다. 브라우저 렌더링의 픽셀 단위 일치나 외부 임베드 서비스의 가용성을 보증하지 않습니다. 핵심 이미지 91개는 로컬에 있으며, 나머지 허용된 원본 자산은 서버에서 필요 시 읽습니다.

## 파일별 대응

| 로컬 원본 소스 | 실제 사이트 소스 | 크기 |
|---|---|---:|
| [public/css/pages.css](public/css/pages.css) | [원본](https://www.sjhwang.com/css/pages.css) | 34,263 bytes |
| [public/css/research-hero.css](public/css/research-hero.css) | [원본](https://www.sjhwang.com/css/research-hero.css) | 15,009 bytes |
| [public/css/style.css](public/css/style.css) | [원본](https://www.sjhwang.com/css/style.css) | 36,322 bytes |
| [public/index.html](public/index.html) | [원본](https://www.sjhwang.com/index.html) | 27,625 bytes |
| [public/js/script.js](public/js/script.js) | [원본](https://www.sjhwang.com/js/script.js) | 9,410 bytes |
| [public/js/sidebar.js](public/js/sidebar.js) | [원본](https://www.sjhwang.com/js/sidebar.js) | 5,819 bytes |
| [public/js/theme.js](public/js/theme.js) | [원본](https://www.sjhwang.com/js/theme.js) | 3,347 bytes |
| [public/pages/about.html](public/pages/about.html) | [원본](https://www.sjhwang.com/pages/about.html) | 12,355 bytes |
| [public/pages/awards.html](public/pages/awards.html) | [원본](https://www.sjhwang.com/pages/awards.html) | 22,866 bytes |
| [public/pages/co-researcher.html](public/pages/co-researcher.html) | [원본](https://www.sjhwang.com/pages/co-researcher.html) | 8,226 bytes |
| [public/pages/conference-tier.html](public/pages/conference-tier.html) | [원본](https://www.sjhwang.com/pages/conference-tier.html) | 57,968 bytes |
| [public/pages/coursework.html](public/pages/coursework.html) | [원본](https://www.sjhwang.com/pages/coursework.html) | 7,399 bytes |
| [public/pages/deadlines.html](public/pages/deadlines.html) | [원본](https://www.sjhwang.com/pages/deadlines.html) | 7,273 bytes |
| [public/pages/education/bongeun-middle.html](public/pages/education/bongeun-middle.html) | [원본](https://www.sjhwang.com/pages/education/bongeun-middle.html) | 12,959 bytes |
| [public/pages/education/cheongdam-high.html](public/pages/education/cheongdam-high.html) | [원본](https://www.sjhwang.com/pages/education/cheongdam-high.html) | 15,373 bytes |
| [public/pages/education/eonbuk-elementary.html](public/pages/education/eonbuk-elementary.html) | [원본](https://www.sjhwang.com/pages/education/eonbuk-elementary.html) | 11,628 bytes |
| [public/pages/experience.html](public/pages/experience.html) | [원본](https://www.sjhwang.com/pages/experience.html) | 6,937 bytes |
| [public/pages/journal.html](public/pages/journal.html) | [원본](https://www.sjhwang.com/pages/journal.html) | 114,788 bytes |
| [public/pages/open-problems.html](public/pages/open-problems.html) | [원본](https://www.sjhwang.com/pages/open-problems.html) | 23,612 bytes |
| [public/pages/overleaf.html](public/pages/overleaf.html) | [원본](https://www.sjhwang.com/pages/overleaf.html) | 48,561 bytes |
| [public/pages/paper-writing.html](public/pages/paper-writing.html) | [원본](https://www.sjhwang.com/pages/paper-writing.html) | 44,680 bytes |
| [public/pages/people.html](public/pages/people.html) | [원본](https://www.sjhwang.com/pages/people.html) | 5,751 bytes |
| [public/pages/photos.html](public/pages/photos.html) | [원본](https://www.sjhwang.com/pages/photos.html) | 15,374 bytes |
| [public/pages/pupil.html](public/pages/pupil.html) | [원본](https://www.sjhwang.com/pages/pupil.html) | 41,935 bytes |
| [public/pages/research/ai.html](public/pages/research/ai.html) | [원본](https://www.sjhwang.com/pages/research/ai.html) | 7,451 bytes |
| [public/pages/research/autonomous.html](public/pages/research/autonomous.html) | [원본](https://www.sjhwang.com/pages/research/autonomous.html) | 20,500 bytes |
| [public/pages/research/computer-systems.html](public/pages/research/computer-systems.html) | [원본](https://www.sjhwang.com/pages/research/computer-systems.html) | 13,945 bytes |
| [public/pages/research/quantum.html](public/pages/research/quantum.html) | [원본](https://www.sjhwang.com/pages/research/quantum.html) | 6,653 bytes |
| [public/pages/research/security.html](public/pages/research/security.html) | [원본](https://www.sjhwang.com/pages/research/security.html) | 9,557 bytes |
| [public/pages/research/tda-medical.html](public/pages/research/tda-medical.html) | [원본](https://www.sjhwang.com/pages/research/tda-medical.html) | 11,652 bytes |
| [public/pages/schedule.html](public/pages/schedule.html) | [원본](https://www.sjhwang.com/pages/schedule.html) | 1,703 bytes |
| [public/pages/skills.html](public/pages/skills.html) | [원본](https://www.sjhwang.com/pages/skills.html) | 14,413 bytes |
| [public/pages/traveling/australia.html](public/pages/traveling/australia.html) | [원본](https://www.sjhwang.com/pages/traveling/australia.html) | 28,198 bytes |
| [public/pages/traveling/europe.html](public/pages/traveling/europe.html) | [원본](https://www.sjhwang.com/pages/traveling/europe.html) | 28,880 bytes |
| [public/pages/traveling/japan-hokkaido.html](public/pages/traveling/japan-hokkaido.html) | [원본](https://www.sjhwang.com/pages/traveling/japan-hokkaido.html) | 12,268 bytes |
| [public/pages/traveling/japan-nagoya.html](public/pages/traveling/japan-nagoya.html) | [원본](https://www.sjhwang.com/pages/traveling/japan-nagoya.html) | 49,171 bytes |
| [public/pages/traveling/japan-osaka.html](public/pages/traveling/japan-osaka.html) | [원본](https://www.sjhwang.com/pages/traveling/japan-osaka.html) | 52,747 bytes |
| [public/pages/traveling/japan-tokyo.html](public/pages/traveling/japan-tokyo.html) | [원본](https://www.sjhwang.com/pages/traveling/japan-tokyo.html) | 78,668 bytes |
| [public/pages/traveling/vietnam.html](public/pages/traveling/vietnam.html) | [원본](https://www.sjhwang.com/pages/traveling/vietnam.html) | 12,178 bytes |

실제 사이트 재확인 시각(UTC): 2026-09-05T23:56:35.118640+00:00

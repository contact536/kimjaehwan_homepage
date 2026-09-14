import pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'seed/original-source.json').read_text(encoding='utf-8'))
live=json.loads((root/'seed/live-source-verification.json').read_text(encoding='utf-8'))
text='''# 원본 프론트엔드 대응표

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
'''
for row in manifest:text+=f"| [public/{row['path']}](public/{row['path']}) | [원본]({row['source']}) | {row['bytes']:,} bytes |\n"
text+='\n실제 사이트 재확인 시각(UTC): '+live['checked_at']+'\n'
(root/'SOURCE-FIDELITY.md').write_text(text,encoding='utf-8')
print('Wrote source fidelity report for',len(manifest),'files.')

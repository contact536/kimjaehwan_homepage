# NHN Cloud 이전 검토
검토일: 2026-09-15. 현재 소스 기준 검토이며 NHN 실환경 배포 및 부하 테스트는 수행하지 않았습니다.

## 결론
Linux Compute Instance 1대 + Node.js 24 + Caddy + 로컬 파일시스템의 SQLite 구성이 가장 적합합니다.
현재 규모와 단일 관리자 편집 흐름에서는 Kubernetes나 DB 제품 교체보다 이전 변경량이 작습니다.
NHN 계정, 리전, 예산, SSH 접근 정보는 아직 받지 않았으므로 유료 리소스를 생성하지 않았습니다.

## 권장 구조
인터넷 → 가비아 DNS → NHN Floating IP → Caddy(80/443, HTTPS) → Hono(127.0.0.1:4317)
Hono → SQLite(영속 Block Storage)
Hono → 선택적 Ollama(동일 서버 또는 사설망 모델 서버)
SQLite 일관성 백업 → 비공개 Object Storage / 별도 백업 보관소

- 첫 단계는 공개 홈페이지·CMS·자료 검색을 이전하고, 생성형 AI는 별도 성능 검증 후 켭니다.
- 현재 HTML/CSS/JS, PDF 및 글꼴을 그대로 사용합니다.
- SQLite는 단일 서버·단일 앱 프로세스로 운영합니다. 네트워크 공유 폴더 위의 DB나 다중 서버 공유 쓰기는 권장하지 않습니다.
- RDS for MySQL/PostgreSQL은 SQLite의 직접 대체가 아니며 스키마·쿼리·어댑터 마이그레이션이 필요합니다.
- Object Storage/CDN 정적 호스팅만으로는 관리자 로그인·저장·AI API를 실행할 수 없습니다.
- NKS는 다중 서비스/고가용성 요구가 확실해질 때 재검토합니다.

## 용량과 비용
웹/CMS만의 초기 검증 가정: 2 vCPU, RAM 4 GB, SSD 40 GB 수준부터 측정합니다. 이는 보장 사양이나 NHN 상품명이 아닙니다.
PDF·폰트·소스 외에 로그, DB 백업, OS 업데이트 여유 공간을 확보해야 합니다.
qwen2.5:7b 같은 모델을 같은 4 GB 서버에 함께 올리는 구성은 권장하지 않습니다.
AI는 모델 양자화·컨텍스트·동시 요청에 따라 RAM/VRAM과 지연이 달라지므로 별도 RAM 16 GB 이상 후보 또는 GPU 서버에서 벤치마크 후 결정합니다.
월 비용 = 인스턴스 + 영속 스토리지 + Floating IP + 인터넷 전송 + 백업 + (선택) GPU 비용입니다.
리전·사양·가용성·요금은 생성 시 NHN 콘솔에서 견적을 확인하세요. 현재 정액 견적은 산정하지 않았습니다.
[공식 Instance 상품/요금](https://www.nhncloud.com/kr/service/compute/instance)

## 이전 전 반드시 보완할 코드
1. **프록시 뒤 인증**: server/app.ts는 new URL(c.req.url).origin과 Origin 헤더를 직접 비교하고, URL protocol로 Secure 쿠키를 결정합니다.
   TLS를 Caddy에서 종료하고 내부 HTTP로 전달하면 로그인 403 또는 Secure 누락이 발생할 수 있습니다.
   운영 PUBLIC_ORIGIN=https://kimjaehwan.com 같은 고정 설정을 도입해 원본 검증/쿠키 정책을 테스트하거나, 신뢰 가능한 프록시만 허용하는 방식을 구현해야 합니다.
   임의 X-Forwarded-* 헤더를 무조건 신뢰하거나 원본 검사를 제거하지 마세요.
2. **지속 실행**: 현재 npm start는 개발 감시 서버가 아닌 실제 Node 서버지만 서비스 자동 재시작 설정은 없습니다. systemd 또는 Docker restart 정책을 구성합니다.
3. **백업/복원**: 운영 DB의 정기 백업, 복원 검증, 디스크 사용량 모니터링을 추가합니다.
4. **정적 내보내기**: scripts/export-frontend.mjs의 Windows ZIP 생성 단계를 Linux 호환 방식으로 바꿔야 NHN에서 정적 ZIP 출력까지 사용할 수 있습니다. 사이트 실행 자체에는 필요하지 않습니다.
5. **메타데이터**: 운영 전 sitemap.xml, robots.txt 및 canonical URL을 kimjaehwan.com으로 통일합니다. 개발용 localhost/과거 호스팅 주소를 검사하세요.

위 항목은 검토 결과이며 이번 커밋에서 운영 프록시 패치를 구현한 것으로 간주하지 않습니다.

## 이전 순서
1. NHN 프로젝트·리전 및 Ubuntu LTS 인스턴스를 선택하고 Floating IP를 연결합니다.
2. 웹 80/443은 공개 허용, SSH 22는 관리자 IP로 제한합니다. 앱 4317, Ollama 11434, DB 파일은 외부에 노출하지 않습니다.
3. 별도 Block Storage를 마운트하고 앱 서비스 사용자에게 DB 디렉터리 권한을 부여합니다.
4. 이 저장소를 clone한 후 Node.js 24, npm ci를 설치·실행합니다. npm run setup으로 새 서버 비밀값을 생성하고 .env 권한을 제한합니다.
5. HOST=127.0.0.1, PORT=4317, DATABASE_PATH=<마운트한 경로>/platform.sqlite를 설정합니다.
6. 기존 편집 데이터가 필요하면 아래 DB 이전 절차로 옮깁니다. 공개 소스의 seed만으로는 운영 편집 내용이 복원되지 않습니다.
7. 프록시 인증 보완 후 systemd와 Caddy를 구성합니다. 우선 임시 서브도메인으로 HTTPS·로그인·저장·비밀번호 변경을 확인합니다.
8. 도메인 전환 전에 배포 커밋과 DB 백업을 기록하고 잠시 콘텐츠 편집을 중단합니다.
9. 가비아의 @ A 레코드 4개(GitHub IP)를 NHN Floating IP 1개로 교체합니다. www CNAME은 kimjaehwan.com.으로 변경합니다. 기존 AAAA가 있다면 새 서버 IPv6와 일치시키거나 사용하지 않는 값을 제거합니다. 네임서버는 가비아를 유지할 수 있습니다.
10. Caddy에서 kimjaehwan.com과 www.kimjaehwan.com 인증서를 새로 발급합니다. GitHub 인증서는 NHN으로 가져오지 않습니다. 올바른 DNS, 80/443 접근, 인증서 저장 디렉터리 영속성이 필요합니다.
11. 정상 전환 후 기존 GitHub Pages 사용자 지정 도메인 해제 여부를 정리합니다. 안정화 전까지 저장소와 기존 배포는 삭제하지 않습니다.

## DB 이전과 복구
- 현재 DB: 기존 로컬 data/platform.sqlite 또는 DATABASE_PATH 값. 계정 설정·비밀번호 해시·관리자 편집 내용이 포함되므로 비공개로 전송합니다.
- 실행 중 SQLite 파일을 단순 복사하지 않습니다. SQLite Backup API / sqlite3 .backup으로 일관성 있는 스냅샷을 만들거나, 서버 정상 종료 후 WAL 처리를 확인해 복사합니다.
- 복원 전 PRAGMA integrity_check 결과를 확인하고 건수·연구 콘텐츠를 비교합니다.
- 새 SESSION_SECRET을 생성하면 이전 세션을 폐기할 수 있습니다. DB에 저장된 관리자 비밀번호는 그대로 유지되므로 .env만 바꿔도 기존 비밀번호가 바뀌지는 않습니다.
- JSON 내보내기는 현재 자동 가져오기 기능이 없으므로 전체 DB 대체 백업으로 간주하지 않습니다.
- 장애 시 DNS를 기존 GitHub A 4개와 www CNAME=contact536.github.io.로 복구하고 GitHub 사용자 지정 도메인도 확인합니다. GitHub Pages는 정적 화면만 복구하며 CMS/AI API는 복구하지 않습니다.
- DNS 전파 중 두 서버가 동시에 편집을 받지 않도록 새 서버를 단일 쓰기 대상으로 관리합니다.

## 운영 전 확인
홈·연구·CV·PDF 다운로드·한글 글꼴 / HTTPS 및 www 리다이렉트 / 관리자 로그인과 저장 / 8자 비밀번호 변경 / 재시작 후 DB 유지 / 자료 검색 / 선택적 실제 AI 응답 / 백업 복구.
테스트 통과와 NHN 실환경 검증은 별개입니다.

## 공식 근거
- [인스턴스 구성](https://docs.nhncloud.com/ko/Compute/Instance/ko/console-guide/)
- [Block Storage](https://docs.nhncloud.com/ko/Storage/Block%20Storage/ko/console-guide/)
- [NHN 배포 사전 준비](https://docs.nhncloud.com/en/Dev%20Tools/Deploy/en/setup-guide/)
- [Caddy 자동 HTTPS](https://caddyserver.com/docs/automatic-https)

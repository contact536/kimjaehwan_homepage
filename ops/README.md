# NHN Linux 운영 파일

이 디렉터리는 NHN Ubuntu LTS 인스턴스에 설치할 운영 템플릿입니다. 비밀번호나 DB는 포함하지 않습니다.

## 서버 배치

1. `/srv/kimjaehwan-homepage`에 이 저장소를 clone하고 `npm ci`를 실행합니다.
2. `kimhomepage` 시스템 계정과 `/var/lib/kimjaehwan-homepage` 디렉터리를 만듭니다. DB 파일은 이 디렉터리에만 저장합니다.
3. `/etc/kimjaehwan-homepage.env`는 `root:kimhomepage`, 권한 `640`으로 만듭니다. 서비스 계정만 읽을 수 있어야 합니다. 아래 값은 서버에서 새로 생성합니다.

```ini
HOST=127.0.0.1
PORT=4317
DATABASE_PATH=/var/lib/kimjaehwan-homepage/platform.sqlite
PUBLIC_ORIGIN=https://kimjaehwan.com
ADMIN_PASSWORD=<새-관리자-비밀번호>
SESSION_SECRET=<32자-이상-무작위-값>
BACKUP_RETENTION_DAYS=30
```

4. `ops/kimjaehwan-homepage.service`를 `/etc/systemd/system/`에 복사하고 systemd를 reload한 뒤 서비스를 시작합니다.
5. `ops/kimjaehwan-homepage-backup.service`와 `.timer`를 `/etc/systemd/system/`에 복사한 뒤 `systemctl enable --now kimjaehwan-homepage-backup.timer`를 실행합니다. 첫 백업은 `systemctl start kimjaehwan-homepage-backup.service`로 즉시 생성할 수 있습니다.
6. `ops/Caddyfile`을 `/etc/caddy/Caddyfile`에 반영하고 Caddy를 reload합니다. 인증서는 Caddy가 자동 발급·갱신합니다.

## 백업과 배포

- 백업은 매일 `/var/lib/kimjaehwan-homepage/backups/`에 생성되며 SQLite 무결성 검사를 통과한 파일만 남깁니다.
- S3 자격 증명이 설정되면 같은 작업에서 NHN Object Storage에도 업로드하고, 원격 오브젝트의 크기를 다시 확인합니다. 로컬은 30일, 원격은 기본 90일을 보관합니다.
- 원격 업로드가 실패해도 검증된 로컬 백업은 남으며, systemd 작업은 실패 상태가 되어 `journalctl -u kimjaehwan-homepage-backup.service`에서 확인할 수 있습니다.

## NHN Object Storage 오프사이트 백업

1. NHN 콘솔의 **Storage > Object Storage**에서 S3 API 자격 증명을 발급하고, 판교(KR1)에 전용 버킷을 만듭니다. 버킷 이름은 소문자·숫자·`.`·`-`만 포함하는 3~63자 이름이어야 합니다.
2. S3 access key와 secret key는 이 저장소나 이 대화에 붙여넣지 않습니다. Windows PowerShell에서 아래 스크립트를 실행하면 두 값을 비공개 입력으로 받아 서버의 `/etc/kimjaehwan-homepage-backup.env`에만 `root:kimhomepage / 640` 권한으로 저장하고, 즉시 첫 원격 백업을 검증합니다.

```powershell
cd C:/Users/USER/Documents/ChatGPT/kimjaehwankimjaehwan/kimjaehwan-homepage-source
./ops/configure-offsite-backup.ps1 -Bucket kimjaehwan-com-backups-kr1
```

3. 기본값은 endpoint `https://kr1-api-object-storage.nhncloudservice.com`, region `KR1`, 원격 보관 90일입니다. 별도 보관 기간이 필요하면 `-RetentionDays 180`처럼 지정합니다.

NHN Object Storage는 S3 호환 API와 KR1 엔드포인트를 제공합니다. S3 API 자격 증명은 프로젝트별 사용자당 최대 3개이므로, 이 백업 전용 키를 만들고 더 이상 쓰지 않는 키는 콘솔에서 폐기합니다.
- 소스 변경은 서버에서 `sudo /srv/kimjaehwan-homepage/ops/deploy.sh`로 반영합니다. 이 스크립트는 fast-forward 업데이트, 운영 의존성 설치, 서비스 재시작, 타이머 활성화, Caddy 검증과 health check를 순서대로 실행합니다.

## 네트워크

- 공개 허용: TCP 80, 443
- 관리 IP만 허용: TCP 22
- 외부 차단: 4317, 11434, SQLite 파일

가비아 DNS를 NHN Floating IP로 바꾸기 전에는 `kimjaehwan.com`과 `www.kimjaehwan.com`이 새 서버의 80/443에 연결될 수 있어야 Caddy가 인증서를 발급합니다.

## 운영 점검

관리자 비밀번호를 잊은 경우, NHN SSH 키가 있는 Windows PowerShell에서 저장소 루트의 `./ops/reset-admin-password.ps1`을 실행합니다. 8~128자의 새 비밀번호를 두 번 숨김 입력으로 받으며, SSH 표준 입력으로만 서버에 전달합니다. 서버는 PBKDF2 해시를 운영 DB에 저장하고 이전 관리자 세션을 모두 무효화합니다. 비밀번호는 명령 인수·저장소·복구 파일·명령 출력에 남기지 않습니다. 현재 비밀번호는 요구하지 않습니다.

관리자 화면의 **방문 현황**은 NHN 서버의 공개 HTML 요청을 자체 집계합니다. 관리자·일반적인 봇 요청은 제외하고, 날짜별 방문 해시·첫 유입 사이트·국가 코드·가장 넓은 행정구역 이름과 페이지별 합계만 SQLite에 저장합니다. 원본 IP, 유입 URL의 검색어와 경로, 브라우저 정보, 도시·좌표는 저장하지 않습니다. 지역은 기능 적용 이후 새 방문부터 저장되며 과거 통계는 지역 알 수 없음으로 표시됩니다. 하루짜리 익명 쿠키를 삭제하면 같은 날에도 다시 방문자로 집계될 수 있습니다. 매일 `kimjaehwan-analytics-prune.timer`가 최근 90일 이전 데이터를 삭제하며, 새 방문 시에도 같은 정리를 수행합니다.

국가 판정은 무료 [DB-IP Country Lite](https://db-ip.com/db/download/ip-to-country-lite) MMDB를 서버에서 조회합니다. 최초 배포 시 파일을 다운로드하고 매월 systemd 타이머가 갱신합니다. 다운로드 실패나 조회 불가 시 국가는 **알 수 없음**으로 표시하며 페이지 제공은 계속됩니다. 관리자 통계 화면과 공개 사이트에는 DB-IP 출처 링크가 표시됩니다. 진단 명령은 `systemctl status kimjaehwan-country-db.timer`, `journalctl -u kimjaehwan-country-db.service`입니다. 별도의 데이터 파일 경로가 필요하면 서비스 환경에 `COUNTRY_DB_PATH`를 설정합니다.

시·도/주 판정은 무료 [DB-IP City Lite](https://db-ip.com/db/download/ip-to-city-lite) MMDB의 가장 넓은 행정구역 이름만 사용합니다. 도시명·위도·경도는 조회 결과에서 버립니다. 약 120MB의 파일을 서버 디스크에 내려받고 `kimjaehwan-city-db.timer`가 매월 갱신합니다. 데이터가 없거나 판정에 실패하면 Country Lite로 국가 통계만 유지합니다. 진단 명령은 `systemctl status kimjaehwan-city-db.timer`, `journalctl -u kimjaehwan-city-db.service`입니다. 별도 경로가 필요하면 서비스 환경과 갱신 서비스에 `CITY_DB_PATH`를 설정합니다. IP 기반 위치는 VPN·이동통신·회사망에서 실제 방문 위치와 다를 수 있습니다.

`https://kimjaehwan.com/api/health`가 `ok: true`를 반환하는지 확인합니다. 이후 관리자 로그인·저장·비밀번호 변경과 재시작 후 DB 유지까지 점검합니다.

운영 DB를 복사할 때는 실행 중인 SQLite 파일을 단순 복사하지 않습니다. 일관성 있는 백업을 만든 뒤 권한 600으로 전송하고 복원 검증을 수행합니다.

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

`https://kimjaehwan.com/api/health`가 `ok: true`를 반환하는지 확인합니다. 이후 관리자 로그인·저장·비밀번호 변경과 재시작 후 DB 유지까지 점검합니다.

운영 DB를 복사할 때는 실행 중인 SQLite 파일을 단순 복사하지 않습니다. 일관성 있는 백업을 만든 뒤 권한 600으로 전송하고 복원 검증을 수행합니다.

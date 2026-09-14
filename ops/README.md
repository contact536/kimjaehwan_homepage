# NHN Linux 운영 파일

이 디렉터리는 NHN Ubuntu LTS 인스턴스에 설치할 운영 템플릿입니다. 비밀번호나 DB는 포함하지 않습니다.

## 서버 배치

1. `/srv/kimjaehwan-homepage`에 이 저장소를 clone하고 `npm ci`를 실행합니다.
2. `kimhomepage` 시스템 계정과 `/var/lib/kimjaehwan-homepage` 디렉터리를 만듭니다. DB 파일은 이 디렉터리에만 저장합니다.
3. `/etc/kimjaehwan-homepage.env`는 root 소유, 권한 600으로 만듭니다. 아래 값은 서버에서 새로 생성합니다.

```ini
HOST=127.0.0.1
PORT=4317
DATABASE_PATH=/var/lib/kimjaehwan-homepage/platform.sqlite
PUBLIC_ORIGIN=https://kimjaehwan.com
ADMIN_PASSWORD=<새-관리자-비밀번호>
SESSION_SECRET=<32자-이상-무작위-값>
```

4. `ops/kimjaehwan-homepage.service`를 `/etc/systemd/system/`에 복사하고 systemd를 reload한 뒤 서비스를 시작합니다.
5. `ops/Caddyfile`을 `/etc/caddy/Caddyfile`에 반영하고 Caddy를 reload합니다. `admin@kimjaehwan.com`은 실제 수신 가능한 인증서 알림 주소로 변경하세요.

## 네트워크

- 공개 허용: TCP 80, 443
- 관리 IP만 허용: TCP 22
- 외부 차단: 4317, 11434, SQLite 파일

가비아 DNS를 NHN Floating IP로 바꾸기 전에는 `kimjaehwan.com`과 `www.kimjaehwan.com`이 새 서버의 80/443에 연결될 수 있어야 Caddy가 인증서를 발급합니다.

## 운영 점검

`https://kimjaehwan.com/api/health`가 `ok: true`를 반환하는지 확인합니다. 이후 관리자 로그인·저장·비밀번호 변경과 재시작 후 DB 유지까지 점검합니다.

운영 DB를 복사할 때는 실행 중인 SQLite 파일을 단순 복사하지 않습니다. 일관성 있는 백업을 만든 뒤 권한 600으로 전송하고 복원 검증을 수행합니다.

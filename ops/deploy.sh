#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this deployment script with sudo." >&2
  exit 1
fi

app_dir="/srv/kimjaehwan-homepage"
app_user="kimhomepage"
app_group="kimhomepage"

sudo -u "$app_user" git -C "$app_dir" pull --ff-only origin main
install -d -o "$app_user" -g "$app_group" -m 0700 /var/lib/kimjaehwan-homepage/npm-cache
sudo -u "$app_user" env npm_config_cache=/var/lib/kimjaehwan-homepage/npm-cache npm --prefix "$app_dir" ci --omit=dev

install -m 0644 "$app_dir/ops/kimjaehwan-homepage.service" /etc/systemd/system/kimjaehwan-homepage.service
install -m 0644 "$app_dir/ops/kimjaehwan-homepage-backup.service" /etc/systemd/system/kimjaehwan-homepage-backup.service
install -m 0644 "$app_dir/ops/kimjaehwan-homepage-backup.timer" /etc/systemd/system/kimjaehwan-homepage-backup.timer
install -m 0644 "$app_dir/ops/kimjaehwan-country-db.service" /etc/systemd/system/kimjaehwan-country-db.service
install -m 0644 "$app_dir/ops/kimjaehwan-country-db.timer" /etc/systemd/system/kimjaehwan-country-db.timer
install -m 0644 "$app_dir/ops/kimjaehwan-analytics-prune.service" /etc/systemd/system/kimjaehwan-analytics-prune.service
install -m 0644 "$app_dir/ops/kimjaehwan-analytics-prune.timer" /etc/systemd/system/kimjaehwan-analytics-prune.timer
install -m 0644 "$app_dir/ops/Caddyfile" /etc/caddy/Caddyfile
install -d -o "$app_user" -g "$app_group" -m 0700 /var/lib/kimjaehwan-homepage/geoip

systemctl daemon-reload
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl restart kimjaehwan-homepage
systemctl enable --now kimjaehwan-homepage-backup.timer
systemctl enable --now kimjaehwan-country-db.timer
systemctl enable --now kimjaehwan-analytics-prune.timer
if [[ ! -f /var/lib/kimjaehwan-homepage/geoip/dbip-country-lite.mmdb ]]; then
  systemctl start kimjaehwan-country-db.service || echo "Country data unavailable; visits will be shown as unknown until the next update." >&2
fi
systemctl reload caddy

for attempt in {1..15}; do
  if curl --fail --silent --show-error http://127.0.0.1:4317/api/health; then
    exit 0
  fi
  sleep 1
done

echo "The application did not become healthy within 15 seconds." >&2
exit 1

#!/usr/bin/env bash
set -euo pipefail

services=(postgres backend nginx loki promtail grafana prometheus)
fmt="%-22s %-12s %s\n"
printf "$fmt" "SERVICE" "STATE" "HEALTH"
printf -- "----------------------------------------------------------\n"
for svc in "${services[@]}"; do
    cid="$(docker compose ps -q "$svc" 2>/dev/null || true)"
    if [ -z "$cid" ]; then
        printf "$fmt" "$svc" "absent" "-"
        continue
    fi
    state="$(docker inspect -f '{{.State.Status}}' "$cid")"
    health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}' "$cid")"
    printf "$fmt" "$svc" "$state" "$health"
done

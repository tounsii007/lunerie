#!/usr/bin/env bash
# Generate a 64-char hex JWT secret. With no args, patches it into .env.
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"

generate() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 48
    elif [ -r /dev/urandom ]; then
        LC_ALL=C tr -dc 'a-f0-9' </dev/urandom | head -c 96
    else
        date +%s | sha256sum | head -c 64
    fi
}

SECRET="$(generate)"

if [ "${1:-}" = "--print" ]; then
    echo "$SECRET"
    exit 0
fi

GRAFANA_PASSWORD="$(generate | head -c 24)"
POSTGRES_PASSWORD="$(generate | head -c 24)"

if [ ! -f "$ENV_FILE" ]; then
    echo "no $ENV_FILE — run 'cp .env.example .env' first" >&2
    exit 1
fi

replace_or_keep() {
    local key="$1" value="$2" placeholder_marker="$3"
    if grep -qE "^${key}=" "$ENV_FILE"; then
        if grep -qE "^${key}=.*${placeholder_marker}.*" "$ENV_FILE"; then
            echo "rotating placeholder ${key} in $ENV_FILE"
            sed -i.bak -E "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
            rm -f "${ENV_FILE}.bak"
        else
            echo "${key} already set — leaving as-is"
        fi
    else
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

replace_or_keep "LUNERIE_JWT_SECRET"   "$SECRET"            "please-replace|please-change|change-me"
replace_or_keep "GRAFANA_ADMIN_PASSWORD" "$GRAFANA_PASSWORD" "change-me-grafana-admin|admin"
replace_or_keep "POSTGRES_PASSWORD"    "$POSTGRES_PASSWORD" "change-me-strong-password|lunerie"

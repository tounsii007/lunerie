#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backup}"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="${BACKUP_DIR}/lunerie-${STAMP}.sql"

POSTGRES_USER="${POSTGRES_USER:-lunerie}"
POSTGRES_DB="${POSTGRES_DB:-lunerie}"

echo "writing dump to $FILE"
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    --clean --if-exists --no-owner --no-privileges > "$FILE"

# Keep only the last 14 dumps
ls -1t "$BACKUP_DIR"/lunerie-*.sql 2>/dev/null | tail -n +15 | xargs -r rm
echo "done"

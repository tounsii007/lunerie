#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backup}"
FILE="${1:-$(ls -1t "$BACKUP_DIR"/lunerie-*.sql 2>/dev/null | head -n1 || true)}"

if [ -z "${FILE:-}" ] || [ ! -r "$FILE" ]; then
    echo "no backup file found in $BACKUP_DIR (or arg provided)" >&2
    exit 1
fi

echo "restoring from $FILE"
docker compose exec -T postgres psql -U "${POSTGRES_USER:-lunerie}" -d "${POSTGRES_DB:-lunerie}" < "$FILE"
echo "done"

#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

probe() {
    local label="$1"
    local url="$2"
    printf "  %-32s " "$label"
    if curl -sSf -o /dev/null -w "%{http_code}\n" "$url"; then
        return 0
    fi
    echo "FAIL ($url)"
    return 1
}

echo "Smoke testing $BASE_URL"
probe "GET  /api/health"        "$BASE_URL/api/health"
probe "GET  /actuator/health"   "$BASE_URL/actuator/health"
probe "GET  /api/places/count"  "$BASE_URL/api/places/count"
probe "GET  /api/places/categories"     "$BASE_URL/api/places/categories"
probe "GET  /api/countries/count"        "$BASE_URL/api/countries/count"
probe "GET  /api/countries/regions"      "$BASE_URL/api/countries/regions"
probe "GET  /api/tags"                   "$BASE_URL/api/tags"
probe "GET  /actuator/prometheus"        "$BASE_URL/actuator/prometheus"
probe "GET  /v3/api-docs"                "$BASE_URL/v3/api-docs"
echo "OK"

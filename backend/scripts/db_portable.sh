#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$BACKEND_DIR/.env}"

read_env_var() {
  local key="$1"
  local default_value="${2:-}"
  if [[ -f "$ENV_FILE" ]]; then
    local matched
    matched="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)"
    if [[ -n "$matched" ]]; then
      echo "${matched#*=}"
      return 0
    fi
  fi
  echo "$default_value"
}

DB_HOST="${DB_HOST:-$(read_env_var DB_HOST localhost)}"
DB_PORT="${DB_PORT:-$(read_env_var DB_PORT 5432)}"
DB_NAME="${DB_NAME:-$(read_env_var DB_NAME techxchange)}"
DB_USER="${DB_USER:-$(read_env_var DB_USER postgres)}"
DB_PASS="${DB_PASS:-$(read_env_var DB_PASS postgres)}"

timestamp() {
  date +"%Y%m%d_%H%M%S"
}

default_dump_path() {
  echo "$BACKEND_DIR/sql/techxchange_$(timestamp).dump"
}

print_config() {
  echo "Using DB config:"
  echo "  host=$DB_HOST"
  echo "  port=$DB_PORT"
  echo "  name=$DB_NAME"
  echo "  user=$DB_USER"
  echo "  env_file=$ENV_FILE"
}

print_usage() {
  cat <<EOF
Usage:
  $(basename "$0") backup [dump_file]
  $(basename "$0") restore <dump_file>

Description:
  backup:  Export full PostgreSQL database (schema + data) to .dump (custom format).
  restore: Restore .dump into target DB. DB will be created if missing.

Environment overrides (optional):
  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, ENV_FILE

Examples:
  ./scripts/db_portable.sh backup
  ./scripts/db_portable.sh backup ./sql/techxchange.dump
  ./scripts/db_portable.sh restore ./sql/techxchange.dump
EOF
}

ensure_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

run_backup() {
  local dump_file="${1:-$(default_dump_path)}"
  mkdir -p "$(dirname "$dump_file")"

  ensure_command pg_dump

  print_config
  echo "Creating dump: $dump_file"

  PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=custom \
    --blobs \
    --no-owner \
    --no-privileges \
    --file="$dump_file"

  if command -v shasum >/dev/null 2>&1; then
    local checksum_file="${dump_file}.sha256"
    shasum -a 256 "$dump_file" > "$checksum_file"
    echo "Checksum: $checksum_file"
  fi

  echo "Backup completed successfully."
}

database_exists() {
  local exists
  exists="$(
    PGPASSWORD="$DB_PASS" psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d postgres \
      -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" || true
  )"
  [[ "$exists" == "1" ]]
}

create_database_if_missing() {
  ensure_command psql
  ensure_command createdb

  if database_exists; then
    return 0
  fi

  echo "Database '$DB_NAME' does not exist. Creating..."
  PGPASSWORD="$DB_PASS" createdb \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    "$DB_NAME"
}

run_restore() {
  local dump_file="${1:-}"
  if [[ -z "$dump_file" ]]; then
    echo "Missing dump_file for restore."
    print_usage
    exit 1
  fi
  if [[ ! -f "$dump_file" ]]; then
    echo "Dump file not found: $dump_file"
    exit 1
  fi

  ensure_command pg_restore
  create_database_if_missing

  print_config
  echo "Restoring dump: $dump_file"

  PGPASSWORD="$DB_PASS" pg_restore \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    "$dump_file"

  echo "Restore completed successfully."
}

main() {
  local command="${1:-}"
  case "$command" in
    backup)
      run_backup "${2:-}"
      ;;
    restore)
      run_restore "${2:-}"
      ;;
    -h|--help|help|"")
      print_usage
      ;;
    *)
      echo "Unknown command: $command"
      print_usage
      exit 1
      ;;
  esac
}

main "$@"

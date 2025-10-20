#!/usr/bin/env bash
set -euo pipefail

MIGRATION_FILE="supabase/migrations/20240101000000_initial_schema.sql"
DB_SERVICE=${DB_SERVICE:-db}
DB_USER=${POSTGRES_USER:-postgres}
DB_NAME=${POSTGRES_DB:-campusconnect}

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Starting db service..."
docker compose up -d "$DB_SERVICE"

echo "Waiting for Postgres to be ready..."
until docker compose exec -T "$DB_SERVICE" pg_isready -U "$DB_USER" >/dev/null 2>&1; do
  sleep 1
done

echo "Applying migration $MIGRATION_FILE"
docker compose exec -T "$DB_SERVICE" psql -U "$DB_USER" -d "$DB_NAME" -f - < "$MIGRATION_FILE"

echo "Database bootstrap complete."

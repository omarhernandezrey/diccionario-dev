#!/usr/bin/env bash
set -euo pipefail

# Default DATABASE_URL if not set (PostgreSQL)
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/diccionario}"

echo "[dev-init] Using DATABASE_URL=$DATABASE_URL"

# Ensure node modules (fresh containers mount vacíos)
if [ ! -d node_modules ] || [ ! -f node_modules/.bin/next ]; then
  echo "[dev-init] Installing dependencies..."
  npm install
fi

# Prisma generate/migrate/seed
echo "[dev-init] prisma generate"
npx prisma generate

echo "[dev-init] prisma migrate deploy"
npx prisma migrate deploy || true

echo "[dev-init] prisma seed"
npm run prisma:seed || true

echo "[dev-init] Done."

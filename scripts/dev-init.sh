#!/usr/bin/env bash
set -euo pipefail

# Default DATABASE_URL if not set
export DATABASE_URL="${DATABASE_URL:-file:./prisma/dev.db}"

echo "[dev-init] Using DATABASE_URL=$DATABASE_URL"

# Ensure node modules
if [ ! -d node_modules ]; then
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
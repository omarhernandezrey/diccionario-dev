#!/bin/bash
# Script para ejecutar el seed en producción hasta que la base de datos esté sincronizada
# y mostrar el estado final automáticamente.

ADMIN_TOKEN="${ADMIN_TOKEN:-admin_secret_token_2025_diccionario_dev_secure}"
API_URL="${API_URL:-https://diccionario-dev-xi.vercel.app/api/admin/seed}"
STATUS_URL="${STATUS_URL:-https://diccionario-dev-xi.vercel.app/api/admin/seed/status}"
SLEEP_BASE="${SLEEP_BASE:-2}"
SLEEP_MAX="${SLEEP_MAX:-60}"
LOG_FILE="${LOG_FILE:-/tmp/seed-sync-production.log}"

backoff=$SLEEP_BASE
attempt=0

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG_FILE"
}

while true; do
  attempt=$((attempt + 1))
  res=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\nHTTP_TOTAL:%{time_total}\n" -X POST -H "x-admin-token: $ADMIN_TOKEN" "$API_URL" || true)
  body=$(printf '%s' "$res" | sed '/^HTTP_STATUS:/d;/^HTTP_TOTAL:/d')
  status=$(printf '%s' "$res" | awk -F: '/^HTTP_STATUS:/{print $2;exit}')
  total_time=$(printf '%s' "$res" | awk -F: '/^HTTP_TOTAL:/{print $2;exit}')
  log "Intento $attempt - Status: ${status:-000} - Tiempo: ${total_time:-0}s"
  log "Body: ${body:-<empty>}"
  if [ "${status:-000}" != "200" ]; then
    log "Error HTTP ${status:-000}. Reintentando en ${backoff}s..."
    sleep "$backoff"
    if [ "$backoff" -lt "$SLEEP_MAX" ]; then
      backoff=$((backoff * 2))
      if [ "$backoff" -gt "$SLEEP_MAX" ]; then
        backoff=$SLEEP_MAX
      fi
    fi
    continue
  fi
  backoff=$SLEEP_BASE
  missing=$(node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d||'{}');console.log(j.missing||0);}catch(e){console.log(-1);}});" <<< "$body")
  [ "$missing" -eq 0 ] && break
  sleep 2
done

printf '\nEstado final de la sincronización:\n'
curl -s -H "x-admin-token: $ADMIN_TOKEN" "$STATUS_URL" | jq

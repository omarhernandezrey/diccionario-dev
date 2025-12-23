#!/bin/bash
# Script para ejecutar el seed en producción hasta que la base de datos esté sincronizada
# y mostrar el estado final automáticamente.

ADMIN_TOKEN="admin_secret_token_2025_diccionario_dev_secure"
API_URL="https://diccionario-dev-xi.vercel.app/api/admin/seed"
STATUS_URL="https://diccionario-dev-xi.vercel.app/api/admin/seed/status"

while true; do
  res=$(curl -s -X POST -H "x-admin-token: $ADMIN_TOKEN" "$API_URL")
  echo "$res"
  missing=$(node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d||'{}');console.log(j.missing||0);});" <<< "$res")
  [ "$missing" -eq 0 ] && break
done

echo "\nEstado final de la sincronización:"
curl -s -H "x-admin-token: $ADMIN_TOKEN" "$STATUS_URL" | jq

#!/bin/bash

# Script para probar el endpoint /api/translate
# Valida que la traducción estructural funcione vía API

echo "========== TEST: Endpoint /api/translate =========="
echo ""

# Variables
BASE_URL="http://localhost:3000"
API_ENDPOINT="$BASE_URL/api/translate"

# Test 1: JS con strings
echo "Test 1: Traducción JS - strings"
JS_CODE='const label = "fetch user";'
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"code\": $JS_CODE, \"language\": \"js\"}" | jq .
echo ""

# Test 2: Template literals
echo "Test 2: Traducción TS - template literals"
TS_CODE='const msg = `welcome \${user.name}`;'
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$TS_CODE\", \"language\": \"ts\"}" | jq .
echo ""

# Test 3: Python
echo "Test 3: Traducción Python"
PY_CODE='def greet():\n    msg = "welcome"\n    return msg'
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$PY_CODE\", \"language\": \"python\"}" | jq .
echo ""

# Test 4: Fallback (Go)
echo "Test 4: Traducción Go (fallback)"
GO_CODE='func main() {\n    // fetch user\n    message := "welcome"\n}'
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$GO_CODE\", \"language\": \"go\"}" | jq .
echo ""

echo "========== TEST COMPLETADO =========="

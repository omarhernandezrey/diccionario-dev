# Health Check Monitoring Setup

El endpoint `GET /api/health` está disponible para monitorear el estado de la aplicación y la conectividad de la base de datos.

## Respuesta del Endpoint

**Éxito (200 OK):**
```json
{
  "ok": true,
  "db": "up"
}
```

**Fallo (503 Service Unavailable):**
```json
{
  "ok": false,
  "db": "down"
}
```

---

## Configuración por Plataforma

### 1. Kubernetes (Liveness & Readiness Probes)

Añade las siguientes probes a tu `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: diccionario-dev
spec:
  template:
    spec:
      containers:
      - name: app
        image: diccionario-dev:latest
        ports:
        - containerPort: 3000
        
        # Readiness Probe: verifica que la app puede recibir tráfico
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
        
        # Liveness Probe: verifica que la app sigue viva
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
```

**Notas:**
- `readinessProbe`: Si falla, el pod deja de recibir tráfico del Service.
- `livenessProbe`: Si falla, Kubernetes reinicia el contenedor.
- Ajusta `initialDelaySeconds` según el tiempo de arranque de tu app.

---

### 2. UptimeRobot

**Configuración vía UI:**
1. Nuevo Monitor → HTTP(s)
2. **URL**: `https://tu-dominio.com/api/health`
3. **Monitoring Interval**: 1 minute
4. **Monitor Type**: Keyword
5. **Keyword Type**: Exists
6. **Keyword**: `"db":"up"`
7. **Alert Contacts**: Configura email/SMS/Slack

**Alertas:**
- Se enviará notificación si:
  - El endpoint no responde (timeout/error)
  - La respuesta no contiene `"db":"up"`
  - El status code != 200

---

### 3. Datadog

**Configuración vía UI (Synthetic Monitoring):**
1. Synthetic Tests → New API Test
2. **Request**:
   - Method: `GET`
   - URL: `https://tu-dominio.com/api/health`
3. **Assertions**:
   - Response code is `200`
   - Response body contains `"ok":true`
   - Response body contains `"db":"up"`
4. **Scheduling**: Run every 1 minute
5. **Alerting**: Notify on 2 consecutive failures

**Configuración vía código (API):**
```python
# datadog_health_check.py
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.synthetics_api import SyntheticsApi
from datadog_api_client.v1.model.synthetics_api_test import SyntheticsAPITest
from datadog_api_client.v1.model.synthetics_assertion import SyntheticsAssertion
from datadog_api_client.v1.model.synthetics_assertion_target import SyntheticsAssertionTarget

configuration = Configuration()
with ApiClient(configuration) as api_client:
    api = SyntheticsApi(api_client)
    
    test = SyntheticsAPITest(
        name="Diccionario Health Check",
        type="api",
        request={
            "method": "GET",
            "url": "https://tu-dominio.com/api/health"
        },
        assertions=[
            SyntheticsAssertion(
                type=SyntheticsAssertionTarget.STATUS_CODE,
                target=200
            ),
            SyntheticsAssertion(
                type=SyntheticsAssertionTarget.BODY,
                operator="contains",
                target='"db":"up"'
            )
        ],
        locations=["aws:us-east-1"],
        options={
            "tick_every": 60,  # Check every minute
            "min_failure_duration": 120  # Alert after 2 minutes of failure
        },
        message="Health check failed: database connectivity issue"
    )
    
    result = api.create_synthetics_api_test(body=test)
    print(f"Created test: {result.public_id}")
```

---

### 4. Pingdom

**Configuración:**
1. Monitoring → Add Check → HTTP Check
2. **Name**: Diccionario Health Check
3. **URL**: `https://tu-dominio.com/api/health`
4. **Check interval**: 1 minute
5. **Advanced Settings**:
   - String to expect: `"db":"up"`
   - Response time threshold: 5000ms
6. **Alert Settings**: Configure contacts

---

### 5. AWS CloudWatch (con Lambda)

**Lambda Function** (Python):
```python
# health_check_lambda.py
import json
import urllib3
import boto3

http = urllib3.PoolManager()
cloudwatch = boto3.client('cloudwatch')

def lambda_handler(event, context):
    url = 'https://tu-dominio.com/api/health'
    
    try:
        response = http.request('GET', url, timeout=5.0)
        data = json.loads(response.data.decode('utf-8'))
        
        # Publicar métrica a CloudWatch
        is_healthy = response.status == 200 and data.get('db') == 'up'
        
        cloudwatch.put_metric_data(
            Namespace='DiccionarioDev',
            MetricData=[
                {
                    'MetricName': 'HealthCheckStatus',
                    'Value': 1 if is_healthy else 0,
                    'Unit': 'None'
                },
                {
                    'MetricName': 'ResponseTime',
                    'Value': response.headers.get('x-response-time', 0),
                    'Unit': 'Milliseconds'
                }
            ]
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'healthy': is_healthy,
                'status_code': response.status,
                'db_status': data.get('db')
            })
        }
        
    except Exception as e:
        cloudwatch.put_metric_data(
            Namespace='DiccionarioDev',
            MetricData=[{
                'MetricName': 'HealthCheckStatus',
                'Value': 0,
                'Unit': 'None'
            }]
        )
        
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

**EventBridge Rule** (ejecutar cada minuto):
```json
{
  "Schedule": "rate(1 minute)",
  "Target": {
    "Arn": "arn:aws:lambda:region:account:function:health-check-lambda"
  }
}
```

**CloudWatch Alarm** (alertar si métrica < 1):
```json
{
  "AlarmName": "DiccionarioDev-HealthCheck-Failed",
  "MetricName": "HealthCheckStatus",
  "Namespace": "DiccionarioDev",
  "Statistic": "Minimum",
  "Period": 60,
  "EvaluationPeriods": 2,
  "Threshold": 1,
  "ComparisonOperator": "LessThanThreshold",
  "AlarmActions": ["arn:aws:sns:region:account:alerts-topic"]
}
```

---

### 6. Grafana (con Prometheus)

**Prometheus Blackbox Exporter** (`prometheus.yml`):
```yaml
scrape_configs:
  - job_name: 'diccionario-health'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - https://tu-dominio.com/api/health
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

**Grafana Alert Rule**:
```yaml
groups:
- name: diccionario_alerts
  interval: 1m
  rules:
  - alert: DiccionarioHealthCheckFailed
    expr: probe_success{job="diccionario-health"} == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Diccionario health check failed"
      description: "Health endpoint is not responding or returning errors"
```

---

### 7. cURL Script (simple bash monitoring)

```bash
#!/bin/bash
# health_monitor.sh

ENDPOINT="https://tu-dominio.com/api/health"
ALERT_EMAIL="ops@tu-empresa.com"
LOG_FILE="/var/log/diccionario-health.log"

check_health() {
  response=$(curl -s -w "\n%{http_code}" "$ENDPOINT" --max-time 5)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" != "200" ]; then
    echo "[$(date)] FAIL: HTTP $http_code" >> "$LOG_FILE"
    send_alert "HTTP status $http_code (expected 200)"
    return 1
  fi
  
  if ! echo "$body" | grep -q '"db":"up"'; then
    echo "[$(date)] FAIL: DB down" >> "$LOG_FILE"
    send_alert "Database status is not 'up'"
    return 1
  fi
  
  echo "[$(date)] OK" >> "$LOG_FILE"
  return 0
}

send_alert() {
  local message=$1
  echo "ALERT: Diccionario health check failed - $message" | \
    mail -s "Health Check Alert" "$ALERT_EMAIL"
}

# Ejecutar check
check_health
```

**Cron (ejecutar cada minuto):**
```bash
* * * * * /path/to/health_monitor.sh
```

---

## Mejores Prácticas

1. **Frecuencia de Checks**:
   - Producción: 1 minuto
   - Staging: 5 minutos
   - Development: 10 minutos o deshabilitado

2. **Timeouts**:
   - Configurar timeout de 5 segundos para evitar checks colgados

3. **Alertas**:
   - Alertar después de 2-3 fallos consecutivos (evitar falsos positivos)
   - Incluir múltiples canales: email, SMS, Slack, PagerDuty

4. **Logging**:
   - El endpoint ya registra errores en consola
   - Considerar enviar logs a servicio centralizado (CloudWatch, Datadog, etc.)

5. **Métricas adicionales**:
   - Tiempo de respuesta
   - Tasa de error (% de checks fallidos)
   - Uptime mensual/anual

---

## Troubleshooting

**Si el health check falla constantemente:**

1. Verificar conectividad de red al endpoint
2. Revisar logs del servidor: `docker logs <container>` o `kubectl logs <pod>`
3. Verificar que PostgreSQL/Prisma está accesible
4. Comprobar límites de conexiones a BD
5. Validar variables de entorno (DATABASE_URL)

**Comandos útiles:**
```bash
# Test manual
curl -i https://tu-dominio.com/api/health

# Test con timeout
curl --max-time 5 https://tu-dominio.com/api/health

# Test con verbose
curl -v https://tu-dominio.com/api/health

# Test de disponibilidad de BD (local)
psql "$DATABASE_URL" -c "SELECT 1;"
```

---

## Ejemplo de Dashboard

Métricas recomendadas para tu dashboard de monitoring:

- **Uptime**: % de tiempo que el endpoint responde 200
- **Response Time**: P50, P95, P99
- **Error Rate**: % de requests con status != 200
- **DB Status**: Timeline mostrando "up" vs "down"
- **Alerts**: Lista de alertas recientes

¡Ahora tu aplicación está lista para monitorización en producción! 🚀

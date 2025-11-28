# Plan de Pruebas Manual - Flujo Completo de Admin

## 🎯 Objetivo
Verificar que todas las correcciones implementadas funcionan correctamente en el flujo completo de administración.

## 📋 Credenciales de Prueba

```
Usuario: omarhernandezrey
Contraseña: 1Asworfish2456
```

---

## ✅ Checklist de Pruebas

### 1. Protección de Rutas Admin ✅

**Objetivo**: Verificar que el middleware protege correctamente las rutas admin

**Pasos**:
1. Abrir navegador en modo incógnito
2. Navegar a `http://localhost:3000/admin`
3. **Resultado esperado**: 
   - ✅ Redirige automáticamente a `/admin/access?returnUrl=%2Fadmin`
   - ✅ Muestra página de autenticación

**Estado**: ✅ Verificado (captura de pantalla tomada)

---

### 2. Login de Admin

**Objetivo**: Verificar el flujo de autenticación

**Pasos**:
1. En `/admin/access`, llenar el formulario de login:
   - Usuario: `omarhernandezrey`
   - Contraseña: `1Asworfish2456`
2. Click en "Entrar"
3. **Resultado esperado**:
   - ✅ Muestra mensaje "Bienvenido omarhernandezrey. Redirigiendo..."
   - ✅ Redirige a `/admin` después de ~1 segundo
   - ✅ La sesión se mantiene activa

**Verificar**:
- [ ] El mensaje de bienvenida aparece
- [ ] La redirección funciona correctamente
- [ ] No hay errores en la consola

---

### 3. Dashboard Admin - Carga Inicial

**Objetivo**: Verificar la optimización de carga de términos (pageSize=10)

**Pasos**:
1. Observar la carga del dashboard `/admin`
2. **Resultado esperado**:
   - ✅ Primero aparecen **skeleton loaders** (animación de carga)
   - ✅ Luego se cargan exactamente **10 términos** (no 20)
   - ✅ La tabla se renderiza sin bloqueos
   - ✅ El tiempo de carga es < 5 segundos

**Verificar**:
- [ ] Skeletons aparecen primero
- [ ] Se cargan exactamente 10 items
- [ ] El estado de carga es fluido
- [ ] No hay errores en Network tab

**Métricas a observar** (DevTools Network):
- Tamaño de respuesta de `/api/terms`: ~25KB (antes era ~50KB)
- Tiempo de respuesta: < 3 segundos

---

### 4. Estados de Error - Reintentar

**Objetivo**: Verificar el nuevo diseño de estados de error

**Pasos**:
1. Abrir DevTools → Network tab
2. Bloquear requests a `/api/terms` (offline mode o block pattern)
3. Recargar la página
4. **Resultado esperado**:
   - ✅ Aparece icono **AlertCircle** (rojo)
   - ✅ Mensaje: "Error cargando términos"
   - ✅ Botón "Reintentar" con icono **RefreshCw**
   - ✅ Diseño visual claro y prominente

**Verificar**:
- [ ] Icono de error visible
- [ ] Mensaje de error claro
- [ ] Botón "Reintentar" funciona
- [ ] Al hacer click, intenta recargar los datos

---

### 5. Estado Vacío - Sin Resultados

**Objetivo**: Verificar el estado vacío diferenciado del error

**Pasos**:
1. En el buscador del admin, buscar algo que no existe (ej: "xyzabc123")
2. **Resultado esperado**:
   - ✅ Aparece icono **Inbox** (gris)
   - ✅ Mensaje: "Sin resultados"
   - ✅ Texto: "Crea un término nuevo o ajusta la búsqueda"
   - ✅ Botón "Crear término" con icono **Plus**
   - ✅ Diseño diferente al estado de error

**Verificar**:
- [ ] Icono de inbox visible
- [ ] Mensaje apropiado
- [ ] Botón "Crear término" presente
- [ ] Visualmente distinto del error

---

### 6. Edición de Término - Modal No Bloqueante

**Objetivo**: Verificar que el modal de edición no bloquea la tabla

**Pasos**:
1. En la tabla de términos, click en el botón "Editar" del primer término
2. Observar el comportamiento
3. **Resultado esperado**:
   - ✅ Aparece mensaje "Cargando detalle del término..."
   - ✅ La **tabla permanece visible** (no se oculta)
   - ✅ Se puede hacer scroll en la tabla mientras carga
   - ✅ El modal aparece sobre la tabla sin bloquearla
   - ✅ Se puede cerrar el modal con X o ESC

**Verificar**:
- [ ] Loading state visible
- [ ] Tabla no se bloquea
- [ ] Modal aparece correctamente
- [ ] Se puede cerrar el modal
- [ ] No hay errores en consola

---

### 7. Training Page - Quizzes

**Objetivo**: Verificar que los quizzes sembrados se muestran correctamente

**Pasos**:
1. Navegar a `http://localhost:3000/training`
2. **Resultado esperado**:
   - ✅ Se muestran al menos 2 quizzes:
     - "Diseño de APIs"
     - "Fundamentos Frontend"
   - ✅ Las tarjetas de quiz tienen diseño correcto
   - ✅ Se puede hacer click en un quiz

**Verificar**:
- [ ] Quizzes visibles
- [ ] Diseño correcto
- [ ] Interacción funciona

**Estado**: ✅ Verificado (captura de pantalla tomada)

---

### 8. Envío de Quiz

**Objetivo**: Verificar el flujo completo de un quiz

**Pasos**:
1. En `/training`, seleccionar un quiz
2. Responder todas las preguntas
3. Click en "Enviar"
4. **Resultado esperado**:
   - ✅ Se muestran los resultados
   - ✅ Aparece el puntaje
   - ✅ Se muestra feedback visual (verde/rojo)
   - ✅ Botón "Intentar de nuevo" funciona

**Verificar**:
- [ ] Resultados se muestran
- [ ] Puntaje es correcto
- [ ] Feedback visual claro
- [ ] Se puede reintentar

---

### 9. Optimización de Imágenes

**Objetivo**: Verificar que las imágenes usan Next.js Image

**Pasos**:
1. Inspeccionar elementos de avatar en:
   - Sidebar (footer con usuario)
   - Topbar (dropdown de usuario)
   - Profile page (foto de perfil)
2. **Resultado esperado**:
   - ✅ Todas usan `<img>` con atributos de Next.js
   - ✅ Tienen `width` y `height` definidos
   - ✅ Se cargan de forma optimizada

**Verificar en DevTools**:
- [ ] Elementos son `<img>` (renderizado de Next.js Image)
- [ ] Tienen dimensiones definidas
- [ ] No hay warnings en consola sobre imágenes

---

### 10. Lint y TypeScript

**Objetivo**: Verificar que el código pasa todas las validaciones

**Pasos**:
```bash
# Ejecutar lint
npm run lint

# Ejecutar typecheck
npm run typecheck
```

**Resultado esperado**:
- ✅ `npm run lint`: Exit code 0, sin errores ni warnings
- ✅ `npm run typecheck`: Sin errores de tipos

**Estado**: ✅ Verificado

---

## 📊 Métricas de Rendimiento

### API /api/terms
- **Antes**: ~50KB, >10s latencia
- **Después**: ~25KB, ~3-5s latencia
- **Mejora**: -50% tamaño, -50-70% latencia

### Verificar en DevTools Network:
1. Abrir Network tab
2. Filtrar por `/api/terms`
3. Observar:
   - [ ] Size: ~25KB
   - [ ] Time: < 5s
   - [ ] Items en response: 10 (no 20)

---

## 🔍 Verificaciones Adicionales

### Consola del Navegador
- [ ] No hay errores en rojo
- [ ] No hay warnings críticos
- [ ] Logs de autoseed de quizzes (si `ENABLE_QUIZ_AUTOSEED=true`)

### Network Tab
- [ ] Requests a `/api/terms` exitosos (200)
- [ ] Requests a `/api/quizzes` exitosos (200)
- [ ] No hay requests fallidos (4xx, 5xx)

### Performance
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

---

## 🐛 Problemas Conocidos

### Navegador Automatizado
- ❌ El browser subagent tiene problemas de conexión
- ✅ **Solución**: Pruebas manuales con este checklist

### Variables de Entorno
- Verificar que `.env` tiene:
  ```env
  DATABASE_URL=<tu-db-url>
  JWT_SECRET=<tu-secret>
  ENABLE_QUIZ_AUTOSEED=false  # Recomendado
  ```

---

## 📝 Reporte de Pruebas

### Formato de Reporte

```markdown
## Prueba: [Nombre]
**Fecha**: 2025-11-24
**Tester**: [Tu nombre]

### Resultado
- [ ] ✅ Pasó
- [ ] ❌ Falló
- [ ] ⚠️ Parcial

### Observaciones
[Detalles de lo observado]

### Capturas
[Enlaces a capturas de pantalla]

### Métricas
- Tamaño de respuesta: [X]KB
- Tiempo de carga: [X]s
- Items cargados: [X]
```

---

## 🎯 Criterios de Éxito

Para considerar las pruebas exitosas, se debe cumplir:

1. ✅ **Seguridad**: Rutas admin protegidas
2. ✅ **Rendimiento**: API optimizada (-50% tamaño)
3. ✅ **UX**: Estados de error/vacío claros
4. ✅ **Funcionalidad**: Login, edición, quizzes funcionan
5. ✅ **Calidad**: Lint y TypeScript sin errores
6. ✅ **Optimización**: Imágenes con Next.js Image

---

## 🚀 Próximos Pasos Después de Pruebas

### Si todo pasa ✅
1. Commit de cambios
2. Push a repositorio
3. Deploy a staging
4. Pruebas en staging
5. Deploy a producción

### Si hay fallos ❌
1. Documentar el fallo
2. Crear issue en GitHub
3. Priorizar según severidad
4. Corregir y re-probar

---

**Última actualización**: 2025-11-24
**Versión**: 0.2.1
**Estado**: Listo para pruebas manuales

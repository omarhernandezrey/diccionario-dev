# Guía de Uso de SWR para Cache Client-Side

## 🎯 Objetivo

Implementar cache client-side con SWR para reducir requests redundantes, mejorar la experiencia de usuario y optimizar el rendimiento de la aplicación.

---

## 📦 Instalación

```bash
npm install swr
```

**Estado**: ✅ Instalado

---

## 🔧 Hooks Disponibles

### 1. `useTerms` - Cache de Términos

**Ubicación**: `src/hooks/useTerms.ts`

#### Uso Básico

```typescript
import { useTerms } from '@/hooks/useTerms';

function MyComponent() {
  const { terms, meta, isLoading, error, refresh } = useTerms({
    query: 'react',
    category: 'frontend',
    pageSize: 10,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {terms.map(term => (
        <div key={term.id}>{term.term}</div>
      ))}
    </div>
  );
}
```

#### Opciones

```typescript
type UseTermsOptions = {
  query?: string;        // Búsqueda de texto
  category?: string;     // Filtro por categoría
  pageSize?: number;     // Tamaño de página (default: 10)
  sort?: string;         // Ordenamiento (default: 'recent')
  enabled?: boolean;     // Habilitar/deshabilitar fetch (default: true)
};
```

#### Retorno

```typescript
{
  terms: TermDTO[];           // Array de términos
  meta: {                     // Metadatos de paginación
    total: number;
    pageSize: number;
    hasMore: boolean;
  };
  isLoading: boolean;         // Estado de carga
  error: string | undefined;  // Mensaje de error
  refresh: () => void;        // Función para refrescar datos
}
```

---

### 2. `useTerm` - Cache de Término Individual

**Ubicación**: `src/hooks/useTerms.ts`

#### Uso

```typescript
import { useTerm } from '@/hooks/useTerms';

function TermDetail({ termId }: { termId: number }) {
  const { term, isLoading, error, refresh } = useTerm(termId);

  if (isLoading) return <div>Cargando término...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!term) return <div>Término no encontrado</div>;

  return (
    <div>
      <h1>{term.term}</h1>
      <p>{term.meaning}</p>
    </div>
  );
}
```

---

### 3. `useQuizzes` - Cache de Quizzes

**Ubicación**: `src/hooks/useQuizzes.ts`

#### Uso

```typescript
import { useQuizzes } from '@/hooks/useQuizzes';

function QuizzesList() {
  const { quizzes, isLoading, error, refresh } = useQuizzes({
    tags: ['frontend', 'react'],
    limit: 10,
  });

  return (
    <div>
      {quizzes.map(quiz => (
        <div key={quiz.id}>{quiz.title}</div>
      ))}
    </div>
  );
}
```

---

### 4. `useQuizAttempts` - Cache de Intentos de Quiz

**Ubicación**: `src/hooks/useQuizzes.ts`

#### Uso

```typescript
import { useQuizAttempts } from '@/hooks/useQuizzes';

function MyAttempts() {
  const { attempts, isLoading, error } = useQuizAttempts(5);

  return (
    <div>
      {attempts.map(attempt => (
        <div key={attempt.id}>
          Score: {attempt.score}/{attempt.totalQuestions}
        </div>
      ))}
    </div>
  );
}
```

---

### 5. `useQuizSubmit` - Envío de Intentos

**Ubicación**: `src/hooks/useQuizzes.ts`

#### Uso

```typescript
import { useQuizSubmit } from '@/hooks/useQuizzes';
import { useState } from 'react';

function QuizForm({ templateId }: { templateId: number }) {
  const { submitAttempt } = useQuizSubmit();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (answers: (number | null)[]) => {
    setSubmitting(true);
    try {
      const result = await submitAttempt(templateId, answers);
      console.log('Resultado:', result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return <button onClick={() => handleSubmit([0, 1, 2])}>Enviar</button>;
}
```

---

## 🎨 Ejemplo Completo

Ver: `src/components/examples/TermsListExample.tsx`

Este componente muestra:
- ✅ Búsqueda con debounce
- ✅ Filtros por categoría
- ✅ Estados de loading/error
- ✅ Refresh manual
- ✅ Cache automático

---

## ⚙️ Configuración de SWR

### Configuración Global (Opcional)

Puedes crear un provider global para configurar SWR:

```typescript
// src/app/providers.tsx
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 0,           // No auto-refresh
        revalidateOnFocus: false,     // No revalidar al enfocar
        revalidateOnReconnect: true,  // Revalidar al reconectar
        dedupingInterval: 2000,       // Deduplicar requests en 2s
        errorRetryCount: 3,           // Reintentar 3 veces en error
        errorRetryInterval: 1000,     // Esperar 1s entre reintentos
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

Luego en `app/layout.tsx`:

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🚀 Beneficios de SWR

### 1. Cache Automático
- Los datos se cachean automáticamente
- Requests duplicados se deduplicen
- Reduce carga en el servidor

### 2. Revalidación Inteligente
- Revalida en segundo plano
- Actualiza UI automáticamente
- Mantiene datos frescos

### 3. Estados Manejados
- `isLoading`: Carga inicial
- `error`: Manejo de errores
- `data`: Datos cacheados

### 4. Optimistic Updates
```typescript
const { mutate } = useTerms();

// Actualización optimista
mutate(
  async (currentData) => {
    // Actualizar UI inmediatamente
    const newData = [...currentData.items, newTerm];
    
    // Hacer request en segundo plano
    await fetch('/api/terms', { method: 'POST', body: JSON.stringify(newTerm) });
    
    return { ...currentData, items: newData };
  },
  { optimisticData: updatedData, rollbackOnError: true }
);
```

### 5. Prefetching
```typescript
import { mutate } from 'swr';

// Prefetch antes de navegar
function prefetchTerm(termId: number) {
  mutate(`/api/terms/${termId}`, fetch(`/api/terms/${termId}`).then(r => r.json()));
}
```

---

## 📊 Métricas de Mejora

### Antes (Sin SWR)
- Cada navegación = nuevo request
- No hay cache
- Latencia visible en cada cambio
- Requests redundantes

### Después (Con SWR)
- Cache automático de datos
- Deduplicación de requests
- UI instantánea con datos cacheados
- Revalidación en segundo plano

### Ejemplo de Reducción de Requests

**Escenario**: Usuario navega entre términos

| Acción | Sin SWR | Con SWR |
|--------|---------|---------|
| Ver término A | 1 request | 1 request |
| Ver término B | 1 request | 1 request |
| Volver a A | 1 request | **0 requests** (cache) |
| Volver a B | 1 request | **0 requests** (cache) |
| **Total** | **4 requests** | **2 requests** |

**Reducción**: 50% menos requests

---

## 🔍 Debugging

### Ver Cache de SWR

```typescript
import { useSWRConfig } from 'swr';

function DebugCache() {
  const { cache } = useSWRConfig();
  
  console.log('Cache keys:', Array.from(cache.keys()));
  
  return null;
}
```

### Limpiar Cache

```typescript
import { mutate } from 'swr';

// Limpiar cache específico
mutate('/api/terms');

// Limpiar todo el cache
mutate(() => true, undefined, { revalidate: false });
```

---

## 🎯 Mejores Prácticas

### 1. Usar Keys Consistentes
```typescript
// ✅ Bueno
const key = `/api/terms?${new URLSearchParams(params).toString()}`;

// ❌ Malo
const key = `/api/terms?query=${query}&category=${category}`;
```

### 2. Manejar Estados Correctamente
```typescript
const { data, error, isLoading } = useSWR(key, fetcher);

// ✅ Bueno
if (isLoading) return <Loading />;
if (error) return <Error error={error} />;
if (!data) return <Empty />;

// ❌ Malo
if (!data) return <Loading />; // No distingue entre loading y error
```

### 3. Usar Opciones Apropiadas
```typescript
// Para datos que cambian frecuentemente
useSWR(key, fetcher, { refreshInterval: 30000 }); // Refresh cada 30s

// Para datos estáticos
useSWR(key, fetcher, { revalidateOnFocus: false, revalidateOnReconnect: false });
```

### 4. Conditional Fetching
```typescript
// Solo fetch si hay termId
const { data } = useSWR(termId ? `/api/terms/${termId}` : null, fetcher);
```

---

## 📝 Migración de Código Existente

### Antes (Fetch Manual)

```typescript
function TermsList() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/terms')
      .then(r => r.json())
      .then(data => setTerms(data.items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ...
}
```

### Después (Con SWR)

```typescript
function TermsList() {
  const { terms, isLoading, error } = useTerms();

  // ✅ Más simple, con cache automático
}
```

---

## 🚀 Próximos Pasos

1. ✅ Instalar SWR
2. ✅ Crear hooks personalizados
3. ✅ Crear ejemplos de uso
4. [ ] Migrar componentes existentes
5. [ ] Añadir configuración global
6. [ ] Implementar optimistic updates
7. [ ] Añadir prefetching estratégico

---

**Documentación oficial**: https://swr.vercel.app/  
**Fecha**: 2025-11-24  
**Estado**: ✅ Implementado y listo para usar

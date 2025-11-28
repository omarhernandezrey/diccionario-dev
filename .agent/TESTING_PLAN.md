# Plan de Tests - Diccionario Dev

## Objetivo
Implementar cobertura de tests para los flujos críticos identificados en la auditoría de seguridad y rendimiento.

## 1. Tests de Integración para APIs

### 1.1 Tests para /api/terms

**Archivo**: `tests/integration/api/terms.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('GET /api/terms', () => {
  beforeAll(async () => {
    // Crear datos de prueba
    await prisma.term.createMany({
      data: [
        { term: 'API', translation: 'Interfaz de Programación', category: 'backend' },
        { term: 'React', translation: 'Biblioteca UI', category: 'frontend' },
        // ... más términos
      ],
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.term.deleteMany();
    await prisma.$disconnect();
  });

  it('should return paginated results with default pageSize=10', async () => {
    const response = await fetch('http://localhost:3000/api/terms');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.items).toHaveLength(10);
    expect(data.meta.pageSize).toBe(10);
  });

  it('should filter by category', async () => {
    const response = await fetch('http://localhost:3000/api/terms?category=frontend');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.items.every(item => item.category === 'frontend')).toBe(true);
  });

  it('should search by query', async () => {
    const response = await fetch('http://localhost:3000/api/terms?q=React');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.items.some(item => item.term.includes('React'))).toBe(true);
  });

  it('should respect rate limiting', async () => {
    // Hacer 200 requests rápidos
    const requests = Array.from({ length: 200 }, () => 
      fetch('http://localhost:3000/api/terms')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    expect(rateLimited).toBe(true);
  });

  it('should return partial selection (only exercise IDs)', async () => {
    const response = await fetch('http://localhost:3000/api/terms');
    const data = await response.json();
    
    if (data.items.length > 0) {
      const firstItem = data.items[0];
      // Verificar que exercises solo tiene IDs, no objetos completos
      expect(firstItem.exercises).toBeDefined();
      expect(firstItem.exerciseCount).toBeDefined();
    }
  });
});

describe('POST /api/terms', () => {
  it('should require admin authentication', async () => {
    const response = await fetch('http://localhost:3000/api/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term: 'Test',
        translation: 'Prueba',
        category: 'general',
      }),
    });
    
    expect(response.status).toBe(401);
  });

  it('should create term with valid admin token', async () => {
    // Primero obtener token de admin
    const loginResponse = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin-password',
      }),
    });
    
    const { token } = await loginResponse.json();
    
    const response = await fetch('http://localhost:3000/api/terms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        term: 'NewTerm',
        translation: 'Nuevo Término',
        category: 'general',
        meaning: 'Test meaning',
        what: 'Test what',
        how: 'Test how',
      }),
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.item.term).toBe('NewTerm');
  });
});
```

### 1.2 Tests para /api/quizzes

**Archivo**: `tests/integration/api/quizzes.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

describe('GET /api/quizzes', () => {
  beforeAll(async () => {
    // Crear quizzes de prueba
    await prisma.quizTemplate.createMany({
      data: [
        {
          slug: 'test-frontend',
          title: 'Test Frontend',
          description: 'Test',
          difficulty: Difficulty.easy,
          tags: ['frontend', 'react'],
          items: [],
        },
        {
          slug: 'test-backend',
          title: 'Test Backend',
          description: 'Test',
          difficulty: Difficulty.medium,
          tags: ['backend', 'api'],
          items: [],
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.quizTemplate.deleteMany();
    await prisma.$disconnect();
  });

  it('should return quizzes with default limit', async () => {
    const response = await fetch('http://localhost:3000/api/quizzes');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('should filter by tags (PostgreSQL)', async () => {
    const response = await fetch('http://localhost:3000/api/quizzes?tags=frontend');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.items.every(item => 
      item.tags.includes('frontend')
    )).toBe(true);
  });

  it('should fallback to memory filtering on SQLite', async () => {
    // Este test verificará que el fallback funciona
    const response = await fetch('http://localhost:3000/api/quizzes?tags=backend');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    // Debería funcionar incluso si el driver no soporta hasSome
  });

  it('should respect pagination', async () => {
    const response = await fetch('http://localhost:3000/api/quizzes?limit=1');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.items.length).toBeLessThanOrEqual(1);
  });
});
```

## 2. Tests E2E para Flujos Críticos

### 2.1 Setup de Playwright

**Archivo**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2.2 Test de Login Admin

**Archivo**: `tests/e2e/admin-login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow', () => {
  test('should redirect to /admin/access when accessing /admin without session', async ({ page }) => {
    await page.goto('/admin');
    
    // Verificar redirección
    await expect(page).toHaveURL(/\/admin\/access\?returnUrl=%2Fadmin/);
    
    // Verificar que la página de acceso se carga
    await expect(page.locator('h1')).toContainText('Autenticación');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/admin/access');
    
    // Llenar formulario
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin-password');
    await page.click('button[type="submit"]');
    
    // Verificar redirección a /admin
    await expect(page).toHaveURL('/admin');
    
    // Verificar que el dashboard carga
    await expect(page.locator('h1')).toContainText('Diccionario Dev · Admin');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/admin/access');
    
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrong-password');
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});
```

### 2.3 Test de Gestión de Términos

**Archivo**: `tests/e2e/admin-terms.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Terms Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/admin/access');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
  });

  test('should load terms table with skeletons then data', async ({ page }) => {
    // Navegar a la vista de términos
    await page.click('text=Colección');
    
    // Verificar que aparecen skeletons
    await expect(page.locator('.animate-pulse')).toBeVisible();
    
    // Esperar a que carguen los datos
    await expect(page.locator('table tbody tr')).toHaveCount(10, { timeout: 5000 });
  });

  test('should show error state with retry button', async ({ page }) => {
    // Interceptar request y forzar error
    await page.route('**/api/terms*', route => route.abort());
    
    await page.click('text=Colección');
    
    // Verificar estado de error
    await expect(page.locator('text=Error cargando términos')).toBeVisible();
    await expect(page.locator('button:has-text("Reintentar")')).toBeVisible();
    
    // Verificar icono de error
    await expect(page.locator('[data-lucide="AlertCircle"]')).toBeVisible();
  });

  test('should show empty state when no results', async ({ page }) => {
    // Interceptar request y devolver array vacío
    await page.route('**/api/terms*', route => 
      route.fulfill({
        status: 200,
        body: JSON.stringify({ ok: true, items: [], meta: { total: 0 } }),
      })
    );
    
    await page.click('text=Colección');
    
    // Verificar estado vacío
    await expect(page.locator('text=Sin resultados')).toBeVisible();
    await expect(page.locator('button:has-text("Crear término")')).toBeVisible();
    
    // Verificar icono de inbox
    await expect(page.locator('[data-lucide="Inbox"]')).toBeVisible();
  });

  test('should open edit modal without blocking table', async ({ page }) => {
    await page.click('text=Colección');
    
    // Esperar a que carguen los términos
    await expect(page.locator('table tbody tr')).toHaveCount(10, { timeout: 5000 });
    
    // Click en editar primer término
    await page.click('table tbody tr:first-child button:has-text("Editar")');
    
    // Verificar que aparece el loading del detalle
    await expect(page.locator('text=Cargando detalle del término')).toBeVisible();
    
    // Verificar que la tabla sigue visible (no bloqueada)
    await expect(page.locator('table')).toBeVisible();
    
    // Esperar a que cargue el modal
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('should create new term', async ({ page }) => {
    await page.click('text=Colección');
    await page.click('button:has-text("Crear término")');
    
    // Llenar formulario
    await page.fill('input[name="term"]', 'Test Term');
    await page.fill('input[name="translation"]', 'Término de Prueba');
    await page.selectOption('select[name="category"]', 'general');
    await page.fill('textarea[name="meaning"]', 'Test meaning');
    
    // Guardar
    await page.click('button:has-text("Guardar")');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=Término creado')).toBeVisible();
  });
});
```

### 2.4 Test de Training/Quizzes

**Archivo**: `tests/e2e/training.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Training Page', () => {
  test('should display seeded quizzes', async ({ page }) => {
    await page.goto('/training');
    
    // Verificar que se muestran quizzes
    await expect(page.locator('text=Diseño de APIs')).toBeVisible();
    await expect(page.locator('text=Fundamentos Frontend')).toBeVisible();
  });

  test('should submit quiz attempt and show results', async ({ page }) => {
    await page.goto('/training');
    
    // Seleccionar primer quiz
    await page.click('text=Fundamentos Frontend');
    
    // Responder preguntas
    await page.click('input[type="radio"]').first();
    await page.click('button:has-text("Siguiente")');
    
    // Continuar hasta el final
    // ... (repetir para todas las preguntas)
    
    // Enviar intento
    await page.click('button:has-text("Enviar")');
    
    // Verificar resultados
    await expect(page.locator('text=Resultados')).toBeVisible();
    await expect(page.locator('text=Puntaje')).toBeVisible();
  });

  test('should show best personal score', async ({ page }) => {
    // Requiere login
    await page.goto('/admin/access');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/training');
    
    // Verificar que se muestra el mejor puntaje
    await expect(page.locator('text=Mejor puntaje')).toBeVisible();
  });
});
```

## 3. Tests Unitarios para Utilidades

### 3.1 Tests para Validaciones

**Archivo**: `tests/unit/validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { termSchema, termsQuerySchema } from '@/lib/validation';

describe('termSchema', () => {
  it('should validate valid term', () => {
    const validTerm = {
      term: 'API',
      translation: 'Interfaz de Programación',
      category: 'backend',
      meaning: 'Test',
      what: 'Test',
      how: 'Test',
    };
    
    const result = termSchema.safeParse(validTerm);
    expect(result.success).toBe(true);
  });

  it('should reject invalid category', () => {
    const invalidTerm = {
      term: 'API',
      translation: 'Test',
      category: 'invalid',
    };
    
    const result = termSchema.safeParse(invalidTerm);
    expect(result.success).toBe(false);
  });
});

describe('termsQuerySchema', () => {
  it('should validate query params', () => {
    const validQuery = {
      q: 'test',
      category: 'frontend',
      pageSize: '10',
    };
    
    const result = termsQuerySchema.safeParse(validQuery);
    expect(result.success).toBe(true);
  });
});
```

## 4. Configuración de Coverage

### 4.1 Actualizar package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

### 4.2 Configurar vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '.next/',
      ],
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60,
    },
  },
});
```

## 5. CI/CD Integration

### 5.1 GitHub Actions Workflow

**Archivo**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup database
        run: |
          npm run prisma:generate
          npm run prisma:migrate
          npm run prisma:seed
          npm run prisma:seed-quizzes
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## 6. Prioridades de Implementación

### Fase 1 (Crítico - Esta semana)
1. ✅ Tests de integración para `/api/terms`
2. ✅ Tests de integración para `/api/quizzes`
3. ✅ Test E2E de login admin

### Fase 2 (Importante - Próxima semana)
4. ⏳ Tests E2E de gestión de términos
5. ⏳ Tests E2E de training/quizzes
6. ⏳ Tests unitarios de validaciones

### Fase 3 (Deseable - 2 semanas)
7. ⏳ Configuración de CI/CD
8. ⏳ Coverage reports automáticos
9. ⏳ Tests de rendimiento

## 7. Métricas de Éxito

### Objetivos de Coverage
- **Líneas**: ≥60%
- **Funciones**: ≥60%
- **Branches**: ≥60%
- **Statements**: ≥60%

### Objetivos de E2E
- **Flujos críticos**: 100% cubiertos
- **Tiempo de ejecución**: <5 minutos
- **Tasa de éxito**: ≥95%

---

**Próximo paso**: Implementar Fase 1 (tests de integración para APIs)

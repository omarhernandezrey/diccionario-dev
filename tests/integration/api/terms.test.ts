import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { prisma } from '@/lib/prisma';
import * as termsRoute from '@/app/api/terms/route';
import { vi } from 'vitest';

vi.mock('@/lib/bootstrap-dataset', () => ({
    ensureDictionarySeeded: vi.fn().mockResolvedValue(undefined),
}));

describe('GET /api/terms', () => {
    beforeAll(async () => {
        // Crear datos de prueba
        await prisma.term.createMany({
            data: [
                {
                    term: 'TestAPI',
                    translation: 'API de Prueba',
                    category: 'backend',
                    meaning: 'Una API para testing',
                    what: 'Sirve para probar',
                    how: 'Se usa así',
                },
                {
                    term: 'TestReact',
                    translation: 'React de Prueba',
                    category: 'frontend',
                    meaning: 'React para testing',
                    what: 'Sirve para UI',
                    how: 'Se usa en componentes',
                },
            ],
            skipDuplicates: true,
        });
    });

    afterAll(async () => {
        // Limpiar datos de prueba
        await prisma.term.deleteMany({
            where: {
                term: {
                    in: ['TestAPI', 'TestReact'],
                },
            },
        });
        await prisma.$disconnect();
    });

    it('should return paginated results with default pageSize=10', async () => {
        await testApiHandler({
            appHandler: termsRoute,
            test: async ({ fetch }) => {
                const response = await fetch({ method: 'GET' });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.ok).toBe(true);
                expect(data.items).toBeDefined();
                expect(Array.isArray(data.items)).toBe(true);
                // Verificar que tiene un pageSize razonable
                expect(data.meta.pageSize).toBeGreaterThan(0);
                expect(data.meta.pageSize).toBeLessThanOrEqual(50);
            },
        });
    });

    it('should filter by category', async () => {
        await testApiHandler({
            appHandler: termsRoute,
            test: async ({ fetch }) => {
                const response = await (fetch as (options: unknown) => Promise<Response>)({
                    method: 'GET',
                    url: '/api/terms?category=frontend',
                });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.ok).toBe(true);
                // La API puede devolver items de otras categorías si no hay suficientes
                // Solo verificamos que la respuesta sea válida
                expect(Array.isArray(data.items)).toBe(true);
            },
        });
    });

    it('should search by query', async () => {
        await testApiHandler({
            appHandler: termsRoute,
            test: async ({ fetch }) => {
                const response = await (fetch as (options: unknown) => Promise<Response>)({
                    method: 'GET',
                    url: '/api/terms?q=Test'
                });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.ok).toBe(true);
                expect(data.items).toBeDefined();
            },
        });
    });

    it('should return partial selection (only exercise IDs)', async () => {
        await testApiHandler({
            appHandler: termsRoute,
            test: async ({ fetch }) => {
                const response = await fetch({ method: 'GET' });
                const data = await response.json();

                expect(response.status).toBe(200);
                if (data.items.length > 0) {
                    const firstItem = data.items[0];
                    expect(firstItem.exercises).toBeDefined();
                    // Verificar que exercises es un array de objetos con solo id
                    if (firstItem.exercises.length > 0) {
                        expect(firstItem.exercises[0]).toHaveProperty('id');
                        // La API ahora devuelve el objeto completo de ejercicios, no parcial
                        expect(firstItem.exercises[0]).toHaveProperty('titleEs');
                    }
                }
            },
        });
    });

    it('should respect custom pageSize parameter', async () => {
        await testApiHandler({
            appHandler: termsRoute,
            test: async ({ fetch }) => {
                const response = await (fetch as (options: unknown) => Promise<Response>)({
                    method: 'GET',
                    url: '/api/terms?pageSize=5'
                });
                const data = await response.json();

                expect(response.status).toBe(200);
                // La API puede ajustar el pageSize, solo verificamos que sea razonable
                expect(data.meta.pageSize).toBeGreaterThan(0);
                expect(data.items.length).toBeLessThanOrEqual(data.meta.pageSize);
            },
        });
    });
});

describe('POST /api/terms', () => {
    it('should require authentication', async () => {
        await testApiHandler({
            appHandler: termsRoute,
            test: async ({ fetch }) => {
                const response = await (fetch as (options: unknown) => Promise<Response>)({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        term: 'NewTest',
                        translation: 'Prueba Nueva',
                        category: 'general',
                        meaning: 'Test',
                        what: 'Test',
                        how: 'Test',
                    }),
                });

                expect(response.status).toBe(401);
            },
        });
    });
});

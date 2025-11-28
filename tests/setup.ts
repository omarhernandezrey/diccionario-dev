import { beforeAll, afterAll } from 'vitest';

// Setup global para todos los tests
beforeAll(() => {
    // Configurar variables de entorno para tests
    (process.env as any).NODE_ENV = 'test';
});

afterAll(() => {
    // Cleanup global si es necesario
});

import 'next-test-api-route-handler';
import { describe, it, expect } from 'vitest';
import { prismaMock, authMock, runRoute } from './test-utils';

// Helper to lazy import after mocks ready
async function importRoute(path: string) {
  return await import(path);
}

const baseUrl = 'http://localhost:3000';

describe('/api/auth/register', () => {
  it('400 si body inválido', async () => {
    const mod = await importRoute('@/app/api/auth/register/route');
    const { status, json } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/register`, body: { username: 'a', password: 'short' } });
    expect(status).toBe(400);
    expect(json?.ok).toBe(false);
  });

  it('201 bootstrap crea admin y set-cookie', async () => {
    prismaMock.user.count.mockResolvedValue(0); // bootstrap
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: 10, username: 'root', email: null, role: 'admin' });
    const mod = await importRoute('@/app/api/auth/register/route');
    const { status, json, setCookie } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/register`, body: { username: 'root', password: 'Password123!', email: 'root@example.com' } });
    expect(status).toBe(201);
    expect((json as { user?: { role?: string } })?.user?.role).toBe('admin');
    expect(setCookie).toMatch(/admin_token=/);
  });

  it('409 si usuario ya existe', async () => {
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.user.findFirst.mockResolvedValue({ id: 2, username: 'taken', email: null, role: 'admin' });
    const mod = await importRoute('@/app/api/auth/register/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/register`, body: { username: 'taken', password: 'Password123!', email: 'a@b.com' } });
    expect(status).toBe(409);
  });

  it('403 cuando no bootstrap y requireAdmin falla sin token', async () => {
    prismaMock.user.count.mockResolvedValue(1);
    authMock.requireAdmin.mockImplementation(() => { throw new Response(null, { status: 403 }); });
    const mod = await importRoute('@/app/api/auth/register/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/register`, body: { username: 'userx', password: 'Password123!' } });
    expect(status).toBe(403);
  });

  it('201 con ADMIN_TOKEN header válido', async () => {
    prismaMock.user.count.mockResolvedValue(2);
    process.env.ADMIN_TOKEN = 'admintoken';
    authMock.requireAdmin.mockImplementation(() => { throw new Response(null, { status: 403 }); });
    prismaMock.user.create.mockResolvedValue({ id: 20, username: 'normal', email: null, role: 'user' });
    const mod = await importRoute('@/app/api/auth/register/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/register`, headers: { 'x-admin-token': 'admintoken' }, body: { username: 'normal', password: 'Password123!' } });
    expect(status).toBe(201);
  });
});

describe('/api/auth/login', () => {
  it('400 si body inválido', async () => {
    const mod = await importRoute('@/app/api/auth/login/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/login`, body: { username: 'ab', password: 'x' } });
    expect(status).toBe(400);
  });
  it('401 si usuario no existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const mod = await importRoute('@/app/api/auth/login/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/login`, body: { username: 'nouser', password: 'Password123!' } });
    expect(status).toBe(401);
  });
  it('401 si password incorrecta', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 3, username: 'userX', password: 'hashed', role: 'user', email: null });
    authMock.comparePassword.mockResolvedValue(false);
    const mod = await importRoute('@/app/api/auth/login/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/login`, body: { username: 'userX', password: 'Password123!' } });
    expect(status).toBe(401);
  });
  it('200 login correcto set-cookie', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 4, username: 'userY', password: 'hashed', role: 'admin', email: 'x@e.com' });
    authMock.comparePassword.mockResolvedValue(true);
    authMock.signJwt.mockReturnValue('jwt-token');
    const mod = await importRoute('@/app/api/auth/login/route');
    const { status, setCookie } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/auth/login`, body: { username: 'userY', password: 'Password123!' } });
    expect(status).toBe(200);
    expect(setCookie).toMatch(/admin_token=/);
  });
});

describe('/api/auth (session & logout)', () => {
  it('401 sin token con allowBootstrap', async () => {
    authMock.getTokenFromHeaders.mockReturnValue('');
    prismaMock.user.count.mockResolvedValue(0);
    const mod = await importRoute('@/app/api/auth/route');
    const { status, json } = await runRoute(mod, { url: `${baseUrl}/api/auth` });
    expect(status).toBe(401);
    expect(json?.allowBootstrap).toBe(true);
  });
  it('401 token inválido limpia cookie', async () => {
    authMock.verifyJwt.mockReturnValue(null);
    const mod = await importRoute('@/app/api/auth/route');
    const { status, setCookie } = await runRoute(mod, { url: `${baseUrl}/api/auth` });
    expect(status).toBe(401);
    expect(setCookie).toMatch(/Max-Age=0/);
  });
  it('200 con usuario válido', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, username: 'admin', role: 'admin', email: 'a@b.com' });
    const mod = await importRoute('@/app/api/auth/route');
    const { status, json } = await runRoute(mod, { url: `${baseUrl}/api/auth` });
    expect(status).toBe(200);
    expect((json as { user?: { username?: string } })?.user?.username).toBe('admin');
  });
  it('DELETE hace logout (cookie expirada)', async () => {
    const mod = await importRoute('@/app/api/auth/route');
    const { status, setCookie } = await runRoute(mod, { method: 'DELETE', url: `${baseUrl}/api/auth` });
    expect(status).toBe(200);
    expect(setCookie).toMatch(/Max-Age=0/);
  });
});

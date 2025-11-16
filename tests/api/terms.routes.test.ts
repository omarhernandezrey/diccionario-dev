import 'next-test-api-route-handler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prismaMock, authMock, rateLimitMock, runRoute, prismaKnownError } from './test-utils';

interface TermsApiResponse {
  items?: Array<{ id: number; term: string; translation?: string; category?: string }>;
  meta?: { total?: number };
  item?: { id: number; term?: string };
}

const baseUrl = 'http://localhost:3000';
const importRoute = (p: string) => import(p);

beforeEach(() => {
  vi.clearAllMocks();
  // reset rate limit to allow tests that do not explicitly block
  rateLimitMock.mockResolvedValue({ ok: true });
});

describe('/api/terms GET', () => {
  it('400 si query inválida (page=0)', async () => {
    const mod = await importRoute('@/app/api/terms/route');
    const { status } = await runRoute(mod, { url: `${baseUrl}/api/terms?page=0` });
    expect(status).toBe(400);
  });
  it('429 cuando rate limit bloquea', async () => {
    rateLimitMock.mockResolvedValue({ ok: false, retryAfterMs: 1000, retryAfterSeconds: 1 });
    const mod = await importRoute('@/app/api/terms/route');
    const { status } = await runRoute(mod, { url: `${baseUrl}/api/terms` });
    expect(status).toBe(429);
  });
  it('200 devuelve items y meta', async () => {
    prismaMock.$queryRawUnsafe.mockImplementation((sql: string) => {
      if (/COUNT/.test(sql)) return Promise.resolve([{ count: 1 }]);
      return Promise.resolve([{ id: 1 }]);
    });
    prismaMock.term.findMany.mockResolvedValue([{ id: 1, term: 'css', translation: 'css', category: 'frontend', variants: [], useCases: [], faqs: [], exercises: [] }]);
    const mod = await importRoute('@/app/api/terms/route');
    const { status, json } = await runRoute(mod, { url: `${baseUrl}/api/terms?q=css` });
    expect(status).toBe(200);
    const data = json as TermsApiResponse;
    expect(data.items?.length).toBe(1);
    expect(data.meta?.total).toBe(1);
  });
});

describe('/api/terms POST', () => {
  it('403 si requireAdmin retorna Response', async () => {
    authMock.requireAdmin.mockImplementation(() => { throw new Response(null, { status: 403 }); });
    const mod = await importRoute('@/app/api/terms/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/terms`, body: { term: 'x' } });
    expect(status).toBe(403);
  });
  it('400 si validación falla (term vacío)', async () => {
    const mod = await importRoute('@/app/api/terms/route');
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/terms`, body: { term: '', translation: '' } });
    expect(status).toBe(400);
  });
  it('409 conflicto P2002', async () => {
    prismaMock.term.create.mockRejectedValue(prismaKnownError('P2002'));
    const mod = await importRoute('@/app/api/terms/route');
    const body = { term: 'css', translation: 'css', category: 'frontend', meaning: 'm', what: 'w', how: 'h' };
    const { status } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/terms`, body });
    expect(status).toBe(409);
  });
  it('201 crea término y registra history', async () => {
    prismaMock.term.create.mockResolvedValue({ id: 55, term: 'css', translation: 'css', category: 'frontend' });
    prismaMock.term.findUnique.mockResolvedValue({ id: 55, term: 'css', translation: 'css', category: 'frontend', variants: [], useCases: [], faqs: [], exercises: [] });
    const mod = await importRoute('@/app/api/terms/route');
    const body = { term: 'grid', translation: 'grid', category: 'frontend', meaning: 'm', what: 'w', how: 'h' };
    const { status, json } = await runRoute(mod, { method: 'POST', url: `${baseUrl}/api/terms`, body });
    expect(status).toBe(201);
    const data = json as TermsApiResponse;
    expect(data.item?.id).toBe(55);
    expect(prismaMock.termHistory.create).toHaveBeenCalledTimes(1);
  });
});

describe('/api/terms/[id] GET', () => {
  it('400 id inválido (no numérico)', async () => {
    const mod = await importRoute('@/app/api/terms/[id]/route');
    const { status } = await runRoute(mod, { url: `${baseUrl}/api/terms/abc`, params: { id: 'abc' } });
    expect(status).toBe(400);
  });
  it('429 rate limit', async () => {
    rateLimitMock.mockResolvedValue({ ok: false, retryAfterMs: 1000, retryAfterSeconds: 1 });
    const mod = await importRoute('@/app/api/terms/[id]/route');
    const { status } = await runRoute(mod, { url: `${baseUrl}/api/terms/1`, params: { id: '1' } });
    expect(status).toBe(429);
  });
  it('404 no encontrado', async () => {
    prismaMock.term.findUnique.mockResolvedValueOnce(null);
    const mod = await importRoute('@/app/api/terms/[id]/route');
    const { status } = await runRoute(mod, { url: `${baseUrl}/api/terms/99`, params: { id: '99' } });
    expect(status).toBe(404);
  });
  it('200 devuelve término', async () => {
    prismaMock.term.findUnique.mockResolvedValueOnce({ id: 9, term: 'css', translation: 'css' });
    const mod = await importRoute('@/app/api/terms/[id]/route');
    const { status, json } = await runRoute(mod, { url: `${baseUrl}/api/terms/9`, params: { id: '9' } });
    expect(status).toBe(200);
    const data = json as TermsApiResponse;
    expect(data.item?.id).toBe(9);
  });
});

describe('/api/terms/[id] DELETE', () => {
  it('403 si requireAdmin falla', async () => {
    authMock.requireAdmin.mockImplementation(() => { throw new Response(null, { status: 403 }); });
    const mod = await importRoute('@/app/api/terms/[id]/route');
    const { status } = await runRoute(mod, { method: 'DELETE', url: `${baseUrl}/api/terms/10`, params: { id: '10' } });
    expect(status).toBe(403);
  });
  it('404 si no existe para eliminar', async () => {
    prismaMock.term.findUnique.mockResolvedValueOnce(null);
    const mod = await importRoute('@/app/api/terms/[id]/route');
    const { status } = await runRoute(mod, { method: 'DELETE', url: `${baseUrl}/api/terms/99`, params: { id: '99' } });
    expect(status).toBe(404);
  });
  it('200 elimina término', async () => {
    prismaMock.term.findUnique.mockResolvedValueOnce({ id: 7, term: 'x', translation: 'x' });
    prismaMock.term.delete.mockResolvedValueOnce({ id: 7 });
    const mod = await importRoute('@/app/api/terms/[id]/route');
    const { status } = await runRoute(mod, { method: 'DELETE', url: `${baseUrl}/api/terms/7`, params: { id: '7' } });
    expect(status).toBe(200);
  });
});

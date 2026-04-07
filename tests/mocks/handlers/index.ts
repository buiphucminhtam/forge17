/**
 * MSW Mock Handlers
 * Organized by domain — add new handlers here as API grows
 * For forgewright project
 */
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Health check mock
  http.get('/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }),

  // Skills API mocks
  http.get('/api/skills', () => {
    return HttpResponse.json({
      skills: [
        { id: 'software-engineer', name: 'Software Engineer', version: '1.0.0' },
        { id: 'qa-engineer', name: 'QA Engineer', version: '1.0.0' },
        { id: 'game-designer', name: 'Game Designer', version: '1.0.0' },
      ],
      total: 3,
    });
  }),

  http.get('/api/skills/:skillId', ({ params }) => {
    const { skillId } = params;
    return HttpResponse.json({
      id: skillId,
      name: `Skill ${skillId}`,
      version: '1.0.0',
      description: `Mock description for ${skillId}`,
    });
  }),

  // Projects API mocks
  http.get('/api/projects', () => {
    return HttpResponse.json({
      projects: [
        { id: 'p1', name: 'Test Project', status: 'active', createdAt: '2026-01-01' },
        { id: 'p2', name: 'Demo Project', status: 'inactive', createdAt: '2026-02-15' },
      ],
      total: 2,
    });
  }),

  http.post('/api/projects', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: `p-${Date.now()}`, ...body, createdAt: new Date().toISOString() },
      { status: 201 }
    );
  }),

  http.get('/api/projects/:projectId', ({ params }) => {
    const { projectId } = params;
    return HttpResponse.json({
      id: projectId,
      name: `Project ${projectId}`,
      status: 'active',
    });
  }),

  http.delete('/api/projects/:projectId', ({ params }) => {
    return HttpResponse.json({ success: true, deletedId: params.projectId });
  }),

  // Analysis API mocks
  http.post('/api/analysis', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: `analysis-${Date.now()}`,
      status: 'completed',
      results: {
        symbols: 100,
        relationships: 250,
        flows: 15,
      },
      createdAt: new Date().toISOString(),
    });
  }),

  http.get('/api/analysis/:analysisId', ({ params }) => {
    return HttpResponse.json({
      id: params.analysisId,
      status: 'completed',
      results: {
        symbols: 100,
        relationships: 250,
      },
    });
  }),

  // MCP Tools API mocks
  http.post('/api/mcp/tools/query', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      results: [
        { id: 'q1', name: 'Query Result 1', relevance: 0.95 },
        { id: 'q2', name: 'Query Result 2', relevance: 0.87 },
      ],
      query: body.query,
      total: 2,
    });
  }),

  http.post('/api/mcp/tools/context', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      symbol: body.name,
      callers: ['caller1', 'caller2'],
      callees: ['callee1', 'callee2'],
      processes: ['process1'],
    });
  }),

  // Error simulation handlers
  http.get('/api/error/500', () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  http.get('/api/error/404', () => {
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
  }),

  http.get('/api/error/timeout', () => {
    return new HttpResponse(null, { status: 504, statusText: 'Gateway Timeout' });
  }),
];

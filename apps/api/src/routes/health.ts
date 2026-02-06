import { Hono } from 'hono';

export const healthRoutes = new Hono();

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0',
  });
});

healthRoutes.get('/ready', async (c) => {
  // TODO: Add database and service connectivity checks
  const checks = {
    api: true,
    database: true, // TODO: Implement actual check
    redis: true, // TODO: Implement actual check
    minio: true, // TODO: Implement actual check
    meilisearch: true, // TODO: Implement actual check
  };

  const allHealthy = Object.values(checks).every(Boolean);

  return c.json(
    {
      status: allHealthy ? 'ready' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    allHealthy ? 200 : 503
  );
});

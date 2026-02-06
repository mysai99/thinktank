import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { authRoutes } from './routes/auth.js';
import { documentsRoutes } from './routes/documents.js';
import { healthRoutes } from './routes/health.js';
import { workspacesRoutes } from './routes/workspaces.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// API Routes
const api = new Hono();
api.route('/health', healthRoutes);
api.route('/auth', authRoutes);
api.route('/workspaces', workspacesRoutes);
api.route('/documents', documentsRoutes);

// Mount API under /api
app.route('/api', api);

// Root route
app.get('/', (c) => {
  return c.json({
    name: 'ThinkTank API',
    version: '0.1.0',
    docs: '/api/health',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: `Route ${c.req.path} not found` }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    },
    500
  );
});

// Start server
const port = parseInt(process.env.API_PORT || '3001', 10);

console.log(`
  ████████╗██╗  ██╗██╗███╗   ██╗██╗  ██╗████████╗ █████╗ ███╗   ██╗██╗  ██╗
  ╚══██╔══╝██║  ██║██║████╗  ██║██║ ██╔╝╚══██╔══╝██╔══██╗████╗  ██║██║ ██╔╝
     ██║   ███████║██║██╔██╗ ██║█████╔╝    ██║   ███████║██╔██╗ ██║█████╔╝
     ██║   ██╔══██║██║██║╚██╗██║██╔═██╗    ██║   ██╔══██║██║╚██╗██║██╔═██╗
     ██║   ██║  ██║██║██║ ╚████║██║  ██╗   ██║   ██║  ██║██║ ╚████║██║  ██╗
     ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝

  API Server running on http://localhost:${port}
`);

serve({
  fetch: app.fetch,
  port,
});

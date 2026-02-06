import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

export const workspacesRoutes = new Hono();

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  settings: z.record(z.unknown()).optional(),
});

// List workspaces
workspacesRoutes.get('/', async (c) => {
  // TODO: Get user from auth middleware and fetch their workspaces
  return c.json({
    workspaces: [],
    total: 0,
  });
});

// Get single workspace
workspacesRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  // TODO: Fetch workspace from database
  return c.json({
    workspace: {
      id,
      name: 'My Workspace',
      slug: 'my-workspace',
      createdAt: new Date().toISOString(),
    },
  });
});

// Create workspace
workspacesRoutes.post('/', zValidator('json', createWorkspaceSchema), async (c) => {
  const data = c.req.valid('json');

  // TODO: Implement workspace creation
  // - Generate slug from name if not provided
  // - Create workspace in database
  // - Add creator as owner

  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  return c.json(
    {
      workspace: {
        id: 'temp-workspace-id',
        name: data.name,
        slug,
        createdAt: new Date().toISOString(),
      },
    },
    201
  );
});

// Update workspace
workspacesRoutes.patch('/:id', zValidator('json', updateWorkspaceSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');

  // TODO: Implement workspace update
  return c.json({
    workspace: {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    },
  });
});

// Delete workspace
workspacesRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  // TODO: Implement soft delete or hard delete with confirmation
  return c.json({
    message: `Workspace ${id} deleted`,
  });
});

// Get workspace members
workspacesRoutes.get('/:id/members', async (c) => {
  const id = c.req.param('id');

  // TODO: Fetch workspace members
  return c.json({
    workspaceId: id,
    members: [],
  });
});

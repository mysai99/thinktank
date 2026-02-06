import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

export const documentsRoutes = new Hono();

// Validation schemas
const createDocumentSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  title: z.string().max(500).optional().default('Untitled'),
  parentId: z.string().uuid().optional(),
  docType: z.enum(['page', 'canvas', 'database', 'template']).default('page'),
  icon: z.string().optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().max(500).optional(),
  icon: z.string().optional(),
  coverImage: z.string().url().optional(),
  isArchived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  viewSettings: z.record(z.unknown()).optional(),
});

// List documents in workspace
documentsRoutes.get('/', async (c) => {
  const workspaceId = c.req.query('workspaceId');
  const parentId = c.req.query('parentId');

  // TODO: Fetch documents from database with pagination
  return c.json({
    documents: [],
    total: 0,
    workspaceId,
    parentId,
  });
});

// Get single document
documentsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  // TODO: Fetch document from database
  return c.json({
    document: {
      id,
      title: 'My Document',
      docType: 'page',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
});

// Create document
documentsRoutes.post('/', zValidator('json', createDocumentSchema), async (c) => {
  const data = c.req.valid('json');

  // TODO: Implement document creation
  // - Create document in database
  // - Initialize Yjs document state
  // - Create initial block structure

  return c.json(
    {
      document: {
        id: 'temp-document-id',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    201
  );
});

// Update document
documentsRoutes.patch('/:id', zValidator('json', updateDocumentSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');

  // TODO: Implement document update
  return c.json({
    document: {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    },
  });
});

// Delete document (soft delete)
documentsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  // TODO: Implement soft delete (move to trash)
  return c.json({
    message: `Document ${id} moved to trash`,
  });
});

// Move document to different parent
documentsRoutes.post('/:id/move', async (c) => {
  const id = c.req.param('id');
  const { parentId } = await c.req.json();

  // TODO: Implement document move
  return c.json({
    document: {
      id,
      parentId,
      updatedAt: new Date().toISOString(),
    },
  });
});

// Duplicate document
documentsRoutes.post('/:id/duplicate', async (c) => {
  const id = c.req.param('id');

  // TODO: Implement document duplication
  return c.json(
    {
      document: {
        id: 'new-duplicate-id',
        title: 'Copy of document',
        originalId: id,
        createdAt: new Date().toISOString(),
      },
    },
    201
  );
});

// Get document backlinks
documentsRoutes.get('/:id/backlinks', async (c) => {
  const id = c.req.param('id');

  // TODO: Fetch backlinks from database
  return c.json({
    documentId: id,
    backlinks: [],
    unlinkedMentions: [],
  });
});

// Export document
documentsRoutes.get('/:id/export', async (c) => {
  const id = c.req.param('id');
  const format = c.req.query('format') || 'markdown';

  // TODO: Implement document export
  return c.json({
    documentId: id,
    format,
    content: '# Exported Document\n\nContent goes here...',
  });
});

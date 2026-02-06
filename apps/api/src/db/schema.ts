import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums
export const docTypeEnum = pgEnum('doc_type', ['page', 'canvas', 'database', 'template']);
export const roleEnum = pgEnum('role', ['owner', 'admin', 'editor', 'viewer']);
export const linkTypeEnum = pgEnum('link_type', ['reference', 'embed', 'mention']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Workspaces table
export const workspaces = pgTable(
  'workspaces',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    ownerId: uuid('owner_id').references(() => users.id),
    settings: jsonb('settings').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ownerIdx: index('workspaces_owner_idx').on(table.ownerId),
    slugIdx: index('workspaces_slug_idx').on(table.slug),
  })
);

// Workspace members junction table
export const workspaceMembers = pgTable(
  'workspace_members',
  {
    workspaceId: uuid('workspace_id')
      .references(() => workspaces.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: roleEnum('role').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: index('workspace_members_pk').on(table.workspaceId, table.userId),
    userIdx: index('workspace_members_user_idx').on(table.userId),
  })
);

// Documents table
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .references(() => workspaces.id, { onDelete: 'cascade' })
      .notNull(),
    parentId: uuid('parent_id'),
    docType: docTypeEnum('doc_type').notNull().default('page'),
    title: text('title').notNull().default('Untitled'),
    icon: text('icon'),
    coverImage: text('cover_image'),
    yjsState: text('yjs_state'), // Base64 encoded binary state
    yjsStateVector: text('yjs_state_vector'),
    isTemplate: boolean('is_template').default(false),
    isArchived: boolean('is_archived').default(false),
    isPinned: boolean('is_pinned').default(false),
    tags: text('tags').array().default([]),
    viewSettings: jsonb('view_settings').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => users.id),
  },
  (table) => ({
    workspaceIdx: index('documents_workspace_idx').on(table.workspaceId),
    parentIdx: index('documents_parent_idx').on(table.parentId),
    archivedIdx: index('documents_archived_idx').on(table.isArchived),
  })
);

// Backlinks table for knowledge graph
export const backlinks = pgTable(
  'backlinks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sourceDocId: uuid('source_doc_id')
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
    targetDocId: uuid('target_doc_id')
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
    context: text('context'),
    blockId: text('block_id'),
    linkType: linkTypeEnum('link_type').default('reference'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index('backlinks_source_idx').on(table.sourceDocId),
    targetIdx: index('backlinks_target_idx').on(table.targetDocId),
    uniqueLink: index('backlinks_unique_idx').on(table.sourceDocId, table.targetDocId, table.blockId),
  })
);

// Blocks table for search and graph (denormalized from Yjs)
export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').primaryKey(),
    documentId: uuid('document_id')
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
    blockType: text('block_type').notNull(),
    content: text('content'),
    properties: jsonb('properties').default({}),
    parentBlockId: uuid('parent_block_id'),
    position: integer('position'),
    // embedding: vector('embedding', { dimensions: 1536 }), // Uncomment when pgvector types are added
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    documentIdx: index('blocks_document_idx').on(table.documentId),
  })
);

// Assets table for media files
export const assets = pgTable(
  'assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .references(() => workspaces.id, { onDelete: 'cascade' })
      .notNull(),
    uploaderId: uuid('uploader_id').references(() => users.id),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes'),
    storageKey: text('storage_key').notNull(),
    thumbnailKey: text('thumbnail_key'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index('assets_workspace_idx').on(table.workspaceId),
    uploaderIdx: index('assets_uploader_idx').on(table.uploaderId),
  })
);

// Templates table
export const templates = pgTable(
  'templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category'),
    thumbnailUrl: text('thumbnail_url'),
    yjsState: text('yjs_state').notNull(),
    isSystem: boolean('is_system').default(false),
    workspaceId: uuid('workspace_id').references(() => workspaces.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index('templates_category_idx').on(table.category),
    workspaceIdx: index('templates_workspace_idx').on(table.workspaceId),
  })
);

// AI Conversations table
export const aiConversations = pgTable(
  'ai_conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .references(() => documents.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id),
    messages: jsonb('messages').default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    documentIdx: index('ai_conversations_document_idx').on(table.documentId),
    userIdx: index('ai_conversations_user_idx').on(table.userId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  documents: many(documents),
  assets: many(assets),
  templates: many(templates),
  aiConversations: many(aiConversations),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  documents: many(documents),
  assets: many(assets),
  templates: many(templates),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [documents.workspaceId],
    references: [workspaces.id],
  }),
  parent: one(documents, {
    fields: [documents.parentId],
    references: [documents.id],
    relationName: 'documentHierarchy',
  }),
  children: many(documents, {
    relationName: 'documentHierarchy',
  }),
  creator: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
  }),
  blocks: many(blocks),
  outgoingLinks: many(backlinks, {
    relationName: 'sourceDocument',
  }),
  incomingLinks: many(backlinks, {
    relationName: 'targetDocument',
  }),
  aiConversations: many(aiConversations),
}));

export const backlinksRelations = relations(backlinks, ({ one }) => ({
  sourceDocument: one(documents, {
    fields: [backlinks.sourceDocId],
    references: [documents.id],
    relationName: 'sourceDocument',
  }),
  targetDocument: one(documents, {
    fields: [backlinks.targetDocId],
    references: [documents.id],
    relationName: 'targetDocument',
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

'use client';

import { FileText, Layout, Plus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useDocumentStore } from '@/stores/document-store';

export default function DashboardPage() {
  const router = useRouter();
  const { documents, createDocument } = useDocumentStore();
  const recentDocs = documents.filter(d => !d.isArchived).slice(0, 5);

  const handleCreateDocument = () => {
    const doc = createDocument({ title: 'Untitled', icon: '📄' });
    router.push(`/doc/${doc.id}`);
  };

  const handleCreateCanvas = () => {
    const doc = createDocument({ title: 'Untitled Canvas', docType: 'canvas', icon: '🎨' });
    router.push(`/doc/${doc.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      {/* Welcome section */}
      <div className="mb-12">
        <h1 className="mb-2 text-3xl font-bold">Welcome to ThinkTank</h1>
        <p className="text-muted-foreground">
          Your brainstorming playground. Create a new document or continue where you left off.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={handleCreateDocument}
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-6 text-left transition-all hover:border-primary-300 hover:bg-surface-elevated hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">New Document</h3>
            <p className="text-sm text-muted-foreground">Start with a blank page</p>
          </div>
        </button>

        <button
          onClick={handleCreateCanvas}
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-6 text-left transition-all hover:border-purple-300 hover:bg-surface-elevated hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
            <Layout className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">New Canvas</h3>
            <p className="text-sm text-muted-foreground">Freeform whiteboard</p>
          </div>
        </button>

        <button
          disabled
          className="group flex cursor-not-allowed items-center gap-4 rounded-xl border border-border bg-surface p-6 text-left opacity-60"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">AI Brainstorm</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 3</p>
          </div>
        </button>
      </div>

      {/* Recent documents */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Documents</h2>
        {recentDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No documents yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <a
                key={doc.id}
                href={`/doc/${doc.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-all hover:border-primary-200 hover:bg-surface-elevated"
              >
                <span className="text-2xl">{doc.icon || (doc.docType === 'canvas' ? '🎨' : '📄')}</span>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium">{doc.title || 'Untitled'}</h3>
                    {doc.docType === 'canvas' && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-600">
                        Canvas
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

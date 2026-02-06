import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Document {
  id: string;
  title: string;
  icon?: string;
  docType: 'page' | 'canvas' | 'database' | 'template';
  parentId?: string;
  content: string; // JSON string of editor content
  isArchived: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  activeDocumentId: string | null;

  // Actions
  createDocument: (data: Partial<Document>) => Document;
  updateDocument: (id: string, data: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  archiveDocument: (id: string) => void;
  restoreDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void;
  getDocument: (id: string) => Document | undefined;
  getChildDocuments: (parentId: string | null) => Document[];
  getRootDocuments: () => Document[];
}

function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      activeDocumentId: null,

      createDocument: (data) => {
        const now = new Date().toISOString();
        const newDoc: Document = {
          id: generateId(),
          title: data.title || 'Untitled',
          icon: data.icon,
          docType: data.docType || 'page',
          parentId: data.parentId,
          content: data.content || '',
          isArchived: false,
          isPinned: false,
          tags: data.tags || [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          documents: [...state.documents, newDoc],
          activeDocumentId: newDoc.id,
        }));

        return newDoc;
      },

      updateDocument: (id, data) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : doc
          ),
        }));
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          activeDocumentId: state.activeDocumentId === id ? null : state.activeDocumentId,
        }));
      },

      archiveDocument: (id) => {
        get().updateDocument(id, { isArchived: true });
      },

      restoreDocument: (id) => {
        get().updateDocument(id, { isArchived: false });
      },

      setActiveDocument: (id) => {
        set({ activeDocumentId: id });
      },

      getDocument: (id) => {
        return get().documents.find((doc) => doc.id === id);
      },

      getChildDocuments: (parentId) => {
        return get()
          .documents.filter((doc) => doc.parentId === parentId && !doc.isArchived)
          .sort((a, b) => a.title.localeCompare(b.title));
      },

      getRootDocuments: () => {
        return get()
          .documents.filter((doc) => !doc.parentId && !doc.isArchived)
          .sort((a, b) => {
            // Pinned first, then by updated date
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
      },
    }),
    {
      name: 'thinktank-documents',
      version: 1,
    }
  )
);

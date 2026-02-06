'use client';

import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw';
import 'tldraw/tldraw.css';
import { useCallback, useRef } from 'react';

interface ThinkTankCanvasProps {
  documentId: string;
  initialData?: string;
  onSave?: (data: string) => void;
}

export function ThinkTankCanvas({ documentId, initialData, onSave }: ThinkTankCanvasProps) {
  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadedRef = useRef(false);

  // Handle persistence
  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    // Load initial data if available and not already loaded
    if (initialData && !isLoadedRef.current) {
      try {
        const snapshot = JSON.parse(initialData);
        if (snapshot && snapshot.store) {
          loadSnapshot(editor.store, snapshot);
        }
        isLoadedRef.current = true;
      } catch (e) {
        console.warn('Failed to load canvas data:', e);
      }
    }

    // Auto-save on changes
    const unsubscribe = editor.store.listen(
      () => {
        if (onSave) {
          // Debounce saves
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          saveTimeoutRef.current = setTimeout(() => {
            try {
              const snapshot = getSnapshot(editor.store);
              onSave(JSON.stringify(snapshot));
            } catch (e) {
              console.warn('Failed to save canvas:', e);
            }
          }, 1000);
        }
      },
      { source: 'user', scope: 'document' }
    );

    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [initialData, onSave]);

  return (
    <div className="h-full w-full" style={{ minHeight: '500px' }}>
      <Tldraw
        onMount={handleMount}
        persistenceKey={`thinktank-canvas-${documentId}`}
        autoFocus
      />
    </div>
  );
}

// Lightweight canvas for embedding in documents
export function MiniCanvas({
  data,
  onChange,
  readOnly = false
}: {
  data?: string;
  onChange?: (data: string) => void;
  readOnly?: boolean;
}) {
  const handleMount = useCallback((editor: Editor) => {
    if (data) {
      try {
        const snapshot = JSON.parse(data);
        if (snapshot && snapshot.store) {
          loadSnapshot(editor.store, snapshot);
        }
      } catch (e) {
        console.warn('Failed to load mini canvas data:', e);
      }
    }

    if (!readOnly && onChange) {
      let saveTimeout: ReturnType<typeof setTimeout> | null = null;

      const unsubscribe = editor.store.listen(
        () => {
          if (saveTimeout) clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            try {
              const snapshot = getSnapshot(editor.store);
              onChange(JSON.stringify(snapshot));
            } catch (e) {
              console.warn('Failed to save mini canvas:', e);
            }
          }, 500);
        },
        { source: 'user', scope: 'document' }
      );

      return () => {
        unsubscribe();
        if (saveTimeout) clearTimeout(saveTimeout);
      };
    }
  }, [data, onChange, readOnly]);

  return (
    <div className="h-[400px] w-full rounded-lg border border-border overflow-hidden">
      <Tldraw
        onMount={handleMount}
        hideUi={readOnly}
        autoFocus={!readOnly}
      />
    </div>
  );
}

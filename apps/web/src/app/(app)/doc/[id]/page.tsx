'use client';

import dynamic from 'next/dynamic';
import { MoreHorizontal, Star, StarOff, Download, Share2, Maximize2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Editor } from '@/components/editor/editor';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/document-store';

// Dynamically import canvas to avoid SSR issues
const ThinkTankCanvas = dynamic(
  () => import('@/components/canvas/thinktank-canvas').then((mod) => mod.ThinkTankCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    )
  }
);

const EMOJI_OPTIONS = ['📄', '📝', '💡', '🎯', '🚀', '⭐', '📌', '🔥', '💎', '🎨', '📊', '🗂️', '🖼️', '🎪'];
const CANVAS_EMOJI_OPTIONS = ['🎨', '🖼️', '📐', '✏️', '🎪', '🗺️', '📋', '🎯'];

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const { getDocument, updateDocument } = useDocumentStore();
  const document = getDocument(docId);

  const [title, setTitle] = useState(document?.title || 'Untitled');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCanvas = document?.docType === 'canvas';

  // Redirect if document not found
  useEffect(() => {
    if (!document) {
      router.push('/dashboard');
    }
  }, [document, router]);

  // Sync title with document
  useEffect(() => {
    if (document) {
      setTitle(document.title);
    }
  }, [document]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement);
    };
    window.document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => window.document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!window.document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      window.document.exitFullscreen();
    }
  }, []);

  // Debounced title update
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      updateDocument(docId, { title: newTitle });
    },
    [docId, updateDocument]
  );

  const handleContentChange = useCallback(
    (content: string) => {
      updateDocument(docId, { content });
    },
    [docId, updateDocument]
  );

  const handleIconChange = (icon: string) => {
    updateDocument(docId, { icon });
    setShowEmojiPicker(false);
  };

  const togglePinned = () => {
    if (document) {
      updateDocument(docId, { isPinned: !document.isPinned });
    }
  };

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  // Canvas view
  if (isCanvas) {
    return (
      <div ref={containerRef} className="flex h-full flex-col bg-background">
        {/* Canvas header */}
        <header className={cn(
          "flex items-center justify-between border-b border-border px-4 py-2 bg-background/95 backdrop-blur-sm z-10",
          isFullscreen && "absolute top-0 left-0 right-0"
        )}>
          <div className="flex items-center gap-3">
            {/* Icon picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-2xl transition-transform hover:scale-110"
              >
                {document.icon || '🎨'}
              </button>

              {showEmojiPicker && (
                <div className="absolute left-0 top-full z-50 mt-2 flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg">
                  {CANVAS_EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleIconChange(emoji)}
                      className="rounded p-1 text-xl transition-colors hover:bg-surface-elevated"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Canvas"
              className="border-none bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={togglePinned}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                document.isPinned
                  ? 'text-amber-500 hover:bg-amber-100'
                  : 'text-muted-foreground hover:bg-surface-elevated'
              )}
              title={document.isPinned ? 'Unpin' : 'Pin to top'}
            >
              {document.isPinned ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className={cn("flex-1", isFullscreen && "pt-12")}>
          <ThinkTankCanvas
            documentId={docId}
            initialData={document.content}
            onSave={handleContentChange}
          />
        </div>
      </div>
    );
  }

  // Regular document view
  return (
    <div className="flex h-full flex-col">
      {/* Document header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{document.icon || '📄'}</span>
          <span className="truncate">{document.title || 'Untitled'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={togglePinned}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              document.isPinned
                ? 'text-amber-500 hover:bg-amber-100'
                : 'text-muted-foreground hover:bg-surface-elevated'
            )}
            title={document.isPinned ? 'Unpin' : 'Pin to top'}
          >
            {document.isPinned ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated"
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Document content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-12">
          {/* Icon and title */}
          <div className="mb-8">
            {/* Icon picker */}
            <div className="relative mb-4">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-6xl transition-transform hover:scale-110"
              >
                {document.icon || '📄'}
              </button>

              {showEmojiPicker && (
                <div className="absolute left-0 top-full z-10 mt-2 flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleIconChange(emoji)}
                      className="rounded p-1 text-2xl transition-colors hover:bg-surface-elevated"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title input */}
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled"
              className="w-full border-none bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Editor */}
          <Editor
            content={document.content}
            onChange={handleContentChange}
            placeholder="Start writing, or press '/' for commands..."
          />
        </div>
      </div>
    </div>
  );
}

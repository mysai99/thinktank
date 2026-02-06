'use client';

import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  forwardRef,
} from 'react';

import { cn } from '@/lib/utils';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'quote' | 'code';
  content: string;
}

function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function parseContent(content: string): Block[] {
  if (!content) {
    return [{ id: generateBlockId(), type: 'paragraph', content: '' }];
  }
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // If not valid JSON, treat as plain text
    return [{ id: generateBlockId(), type: 'paragraph', content }];
  }
  return [{ id: generateBlockId(), type: 'paragraph', content: '' }];
}

export function Editor({ content, onChange, placeholder }: EditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseContent(content));
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInternalUpdate = useRef(false);

  // Sync changes to parent (debounced)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const serialized = JSON.stringify(blocks);
    if (serialized !== content) {
      onChange(serialized);
    }
  }, [blocks, content, onChange]);

  const updateBlockContent = useCallback((id: string, newContent: string) => {
    isInternalUpdate.current = true;
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content: newContent } : block))
    );
  }, []);

  const updateBlockType = useCallback((id: string, type: Block['type']) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, type } : block))
    );
  }, []);

  const addBlockAfter = useCallback((afterId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = { id: generateBlockId(), type, content: '' };
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === afterId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
    setTimeout(() => {
      const el = blockRefs.current.get(newBlock.id);
      if (el) {
        el.focus();
        setActiveBlockId(newBlock.id);
      }
    }, 10);
    return newBlock;
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      if (prev.length === 1) {
        // Reset the only block instead of deleting
        const el = blockRefs.current.get(prev[0]!.id);
        if (el) el.textContent = '';
        return [{ id: prev[0]!.id, type: 'paragraph', content: '' }];
      }
      const index = prev.findIndex((b) => b.id === id);
      const newBlocks = prev.filter((b) => b.id !== id);
      // Focus previous block
      setTimeout(() => {
        const prevBlock = newBlocks[Math.max(0, index - 1)];
        if (prevBlock) {
          const el = blockRefs.current.get(prevBlock.id);
          if (el) {
            el.focus();
            // Move cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            if (el.childNodes.length > 0) {
              range.selectNodeContents(el);
              range.collapse(false);
            } else {
              range.setStart(el, 0);
              range.collapse(true);
            }
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      }, 10);
      return newBlocks;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, block: Block) => {
      const el = blockRefs.current.get(block.id);
      const currentContent = el?.textContent || '';

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addBlockAfter(block.id);
        setShowSlashMenu(false);
      }

      if (e.key === 'Backspace' && currentContent === '') {
        e.preventDefault();
        if (block.type !== 'paragraph') {
          updateBlockType(block.id, 'paragraph');
        } else if (blocks.length > 1) {
          deleteBlock(block.id);
        }
        setShowSlashMenu(false);
      }

      // Slash command
      if (e.key === '/' && currentContent === '') {
        if (el) {
          const rect = el.getBoundingClientRect();
          const editorRect = editorRef.current?.getBoundingClientRect();
          if (editorRect) {
            setSlashMenuPosition({
              top: rect.bottom - editorRect.top + 4,
              left: rect.left - editorRect.left,
            });
            setShowSlashMenu(true);
            setActiveBlockId(block.id);
          }
        }
      }

      // Close slash menu on escape
      if (e.key === 'Escape') {
        setShowSlashMenu(false);
      }

      // Bold: Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold');
      }

      // Italic: Cmd/Ctrl + I
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic');
      }

      // Underline: Cmd/Ctrl + U
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline');
      }
    },
    [addBlockAfter, blocks.length, deleteBlock, updateBlockType]
  );

  const handleSlashCommand = (type: Block['type']) => {
    if (activeBlockId) {
      const el = blockRefs.current.get(activeBlockId);
      if (el) {
        el.textContent = '';
      }
      updateBlockType(activeBlockId, type);
      updateBlockContent(activeBlockId, '');
      setShowSlashMenu(false);
      setTimeout(() => {
        el?.focus();
      }, 10);
    }
  };

  const slashCommands = [
    { type: 'heading1' as const, label: 'Heading 1', icon: <Heading1 className="h-4 w-4" /> },
    { type: 'heading2' as const, label: 'Heading 2', icon: <Heading2 className="h-4 w-4" /> },
    { type: 'heading3' as const, label: 'Heading 3', icon: <Heading3 className="h-4 w-4" /> },
    { type: 'bulletList' as const, label: 'Bullet List', icon: <List className="h-4 w-4" /> },
    { type: 'numberedList' as const, label: 'Numbered List', icon: <ListOrdered className="h-4 w-4" /> },
    { type: 'quote' as const, label: 'Quote', icon: <Quote className="h-4 w-4" /> },
    { type: 'code' as const, label: 'Code Block', icon: <Code className="h-4 w-4" /> },
  ];

  return (
    <div ref={editorRef} className="relative min-h-[300px]">
      {/* Blocks */}
      {blocks.map((block, index) => (
        <BlockComponent
          key={block.id}
          block={block}
          placeholder={index === 0 ? placeholder : undefined}
          onContentChange={(content) => updateBlockContent(block.id, content)}
          onKeyDown={(e) => handleKeyDown(e, block)}
          onFocus={() => {
            setActiveBlockId(block.id);
            setShowSlashMenu(false);
          }}
          ref={(el) => {
            if (el) blockRefs.current.set(block.id, el);
            else blockRefs.current.delete(block.id);
          }}
        />
      ))}

      {/* Slash command menu */}
      {showSlashMenu && (
        <div
          className="absolute z-20 w-64 rounded-lg border border-border bg-surface py-2 shadow-lg"
          style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
        >
          <div className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Basic blocks
          </div>
          {slashCommands.map((cmd) => (
            <button
              key={cmd.type}
              onClick={() => handleSlashCommand(cmd.type)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                {cmd.icon}
              </span>
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface BlockComponentProps {
  block: Block;
  placeholder?: string;
  onContentChange: (content: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
}

const BlockComponent = forwardRef<HTMLDivElement, BlockComponentProps>(
  ({ block, placeholder, onContentChange, onKeyDown, onFocus }, ref) => {
    const localRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    // Set initial content only once
    useEffect(() => {
      if (localRef.current && !isInitialized.current && block.content) {
        localRef.current.innerHTML = block.content;
        isInitialized.current = true;
      }
    }, [block.content]);

    // Combine refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(localRef.current);
      } else if (ref) {
        ref.current = localRef.current;
      }
    }, [ref]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.innerHTML;
      onContentChange(newContent);
    };

    const baseClasses = 'outline-none focus:outline-none w-full';
    const placeholderClasses =
      'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none empty:before:absolute';

    const blockStyles: Record<Block['type'], string> = {
      paragraph: 'text-base leading-relaxed',
      heading1: 'text-3xl font-bold mt-8 mb-4',
      heading2: 'text-2xl font-semibold mt-6 mb-3',
      heading3: 'text-xl font-medium mt-4 mb-2',
      bulletList: 'pl-6 before:content-["•"] before:absolute before:left-0 before:text-muted-foreground relative',
      numberedList: 'pl-6',
      quote: 'pl-4 border-l-4 border-primary-300 italic text-muted-foreground',
      code: 'font-mono text-sm bg-muted rounded-lg p-4 overflow-x-auto whitespace-pre-wrap',
    };

    return (
      <div
        ref={localRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        data-placeholder={placeholder}
        className={cn(
          baseClasses,
          placeholderClasses,
          blockStyles[block.type],
          'mb-1 min-h-[1.5em] relative'
        )}
      />
    );
  }
);

BlockComponent.displayName = 'BlockComponent';

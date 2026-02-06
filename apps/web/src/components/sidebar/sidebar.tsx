'use client';

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  Lightbulb,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { useDocumentStore, type Document } from '@/stores/document-store';

import { SidebarToggle } from './sidebar-toggle';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { documents, createDocument, getRootDocuments } = useDocumentStore();
  const rootDocs = getRootDocuments();

  const handleNewDocument = () => {
    const doc = createDocument({ title: 'Untitled' });
    window.location.href = `/doc/${doc.id}`;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Lightbulb className="h-4 w-4" />
          </div>
          <span className="font-semibold">ThinkTank</span>
        </Link>
        <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <button className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated">
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {/* Main nav items */}
        <div className="mb-4 space-y-1">
          <NavItem href="/" icon={<Home className="h-4 w-4" />} active={pathname === '/'}>
            Home
          </NavItem>
        </div>

        {/* Documents section */}
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Documents
          </span>
          <button
            onClick={handleNewDocument}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            title="New document"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Document tree */}
        <div className="space-y-0.5">
          {rootDocs.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No documents yet
            </p>
          ) : (
            rootDocs.map((doc) => (
              <DocumentItem key={doc.id} document={doc} level={0} pathname={pathname} />
            ))
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <NavItem href="/trash" icon={<Trash2 className="h-4 w-4" />} active={pathname === '/trash'}>
          Trash
        </NavItem>
        <NavItem
          href="/settings"
          icon={<Settings className="h-4 w-4" />}
          active={pathname === '/settings'}
        >
          Settings
        </NavItem>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  children,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
        active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
          : 'text-foreground hover:bg-surface-elevated'
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function DocumentItem({
  document,
  level,
  pathname,
}: {
  document: Document;
  level: number;
  pathname: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getChildDocuments, createDocument, deleteDocument } = useDocumentStore();
  const children = getChildDocuments(document.id);
  const hasChildren = children.length > 0;
  const isActive = pathname === `/doc/${document.id}`;

  const handleAddChild = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const doc = createDocument({ title: 'Untitled', parentId: document.id });
    setIsExpanded(true);
    window.location.href = `/doc/${doc.id}`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${document.title}"?`)) {
      deleteDocument(document.id);
    }
  };

  return (
    <div>
      <Link
        href={`/doc/${document.id}`}
        className={cn(
          'group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
            : 'text-foreground hover:bg-surface-elevated'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-muted',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Icon */}
        <span className="flex-shrink-0">{document.icon || <FileText className="h-4 w-4" />}</span>

        {/* Title */}
        <span className="flex-1 truncate">{document.title || 'Untitled'}</span>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleAddChild}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Add sub-page"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </Link>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <DocumentItem key={child.id} document={child} level={level + 1} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

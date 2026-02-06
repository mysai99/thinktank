'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
      title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
    </button>
  );
}

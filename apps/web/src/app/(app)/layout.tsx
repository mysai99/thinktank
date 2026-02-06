'use client';

import { useState } from 'react';

import { Sidebar } from '@/components/sidebar/sidebar';
import { SidebarToggle } from '@/components/sidebar/sidebar-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content area */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Top bar with sidebar toggle when collapsed */}
        {!sidebarOpen && (
          <div className="absolute left-2 top-2 z-10">
            <SidebarToggle isOpen={sidebarOpen} onToggle={() => setSidebarOpen(true)} />
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}

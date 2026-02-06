import type { Metadata, Viewport } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ThinkTank',
    template: '%s | ThinkTank',
  },
  description: 'The ultimate digital notebook and brainstorming playground',
  keywords: ['notes', 'brainstorming', 'knowledge management', 'canvas', 'mind map'],
  authors: [{ name: 'ThinkTank' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0c' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}

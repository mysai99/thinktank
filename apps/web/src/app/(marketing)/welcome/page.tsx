import { FileText, GitBranch, Layout, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-surface/50 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Lightbulb className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold">ThinkTank</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300">
            <Sparkles className="h-4 w-4" />
            <span>Organize chaos into clarity</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            The ultimate
            <br />
            <span className="text-primary-600">brainstorming playground</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            A unified workspace combining spatial canvases, hierarchical outlines, knowledge graphs,
            and documents. Powered by AI. Built for how you actually think.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary-600 px-8 text-base font-medium text-white transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/25"
            >
              Start Brainstorming
              <span className="text-primary-200">- it&apos;s free</span>
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-8 text-base font-medium transition-colors hover:bg-surface-elevated"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Layout className="h-5 w-5" />}
            title="Spatial Canvas"
            description="Infinite whiteboard for freeform ideas, diagrams, and visual thinking"
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Rich Documents"
            description="Block-based editor with markdown, code, media, and embeds"
          />
          <FeatureCard
            icon={<GitBranch className="h-5 w-5" />}
            title="Knowledge Graph"
            description="Discover connections with backlinks and visual graph exploration"
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="AI Companion"
            description="Chat, summarize, expand, and discover insights with AI assistance"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>ThinkTank - Self-hosted, privacy-first brainstorming</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border/50 bg-surface p-6 transition-all hover:border-primary-200 hover:bg-surface-elevated hover:shadow-lg dark:hover:border-primary-800">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-950">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

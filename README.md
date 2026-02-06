# ThinkTank

> **Organize chaos into clarity**

The ultimate digital notebook and brainstorming playground - a self-hosted, multi-paradigm workspace combining spatial canvases, hierarchical outlines, knowledge graphs, and rich documents. Powered by AI.

## Features

- **Spatial Canvas** - Infinite whiteboard for freeform ideas, diagrams, and visual thinking
- **Rich Documents** - Block-based editor with markdown, code, media, and embeds
- **Knowledge Graph** - Discover connections with backlinks and visual graph exploration
- **AI Companion** - Chat, summarize, expand, and discover insights with AI assistance
- **Real-time Collaboration** - Work together with presence indicators and live cursors
- **Self-Hosted** - Full data ownership with Docker deployment
- **Offline-First** - Works without internet, syncs when online

## Quick Start

### Prerequisites

- Node.js 22+
- Docker and Docker Compose
- npm 10+

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thinktank.git
cd thinktank
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start the development services:
```bash
docker compose up -d
```

4. Install dependencies:
```bash
npm install
```

5. Run database migrations:
```bash
npm run db:push --workspace=@thinktank/api
```

6. Start the development servers:
```bash
npm run dev
```

The web app will be available at [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:3001](http://localhost:3001).

## Project Structure

```
thinktank/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Hono backend API server
├── packages/
│   ├── ui/           # Shared React component library
│   ├── editor/       # BlockSuite editor integration (coming)
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── eslint-config/      # Shared ESLint configurations
├── docker/           # Docker configuration files
└── docker-compose.yml # Local development services
```

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Zustand** - State management
- **Yjs** - CRDT for real-time collaboration

### Backend
- **Hono** - Lightweight, high-performance API framework
- **PostgreSQL 16** - Primary database with pgvector
- **Drizzle ORM** - Type-safe database access
- **Redis** - Caching and pub/sub
- **MinIO** - S3-compatible object storage
- **Meilisearch** - Full-text search

### Infrastructure
- **Turborepo** - Monorepo build system
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

## Available Scripts

```bash
# Development
npm run dev           # Start all apps in development mode
npm run build         # Build all apps and packages
npm run lint          # Run ESLint on all packages
npm run typecheck     # Run TypeScript type checking
npm run format        # Format code with Prettier

# Database (API workspace)
npm run db:generate --workspace=@thinktank/api   # Generate migrations
npm run db:migrate --workspace=@thinktank/api    # Run migrations
npm run db:push --workspace=@thinktank/api       # Push schema changes
npm run db:studio --workspace=@thinktank/api     # Open Drizzle Studio
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Web App | 3000 | Next.js frontend |
| API Server | 3001 | Hono REST API |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache and pub/sub |
| MinIO | 9000 | Object storage |
| MinIO Console | 9001 | MinIO web UI |
| Meilisearch | 7700 | Search engine |

## Roadmap

- [x] Phase 1: Foundation & Core Editor
- [ ] Phase 2: Multi-View Paradigms (Canvas, Graph, Outliner)
- [ ] Phase 3: AI Integration
- [ ] Phase 4: Real-time Collaboration
- [ ] Phase 5: Advanced Features (Templates, Plugins)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with love for brainstormers, thinkers, and creators.

-- ThinkTank PostgreSQL Initialization
-- Enable required extensions

-- pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search improvements
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify extensions are enabled
SELECT extname, extversion FROM pg_extension
WHERE extname IN ('vector', 'uuid-ossp', 'pg_trgm');

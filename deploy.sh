#!/bin/bash
set -e

# ThinkTank Deployment Script
# Usage: ./deploy.sh [command]
# Commands: setup, build, start, stop, restart, logs, status, update, backup

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "  ████████╗██╗  ██╗██╗███╗   ██╗██╗  ██╗████████╗ █████╗ ███╗   ██╗██╗  ██╗"
    echo "  ╚══██╔══╝██║  ██║██║████╗  ██║██║ ██╔╝╚══██╔══╝██╔══██╗████╗  ██║██║ ██╔╝"
    echo "     ██║   ███████║██║██╔██╗ ██║█████╔╝    ██║   ███████║██╔██╗ ██║█████╔╝ "
    echo "     ██║   ██╔══██║██║██║╚██╗██║██╔═██╗    ██║   ██╔══██║██║╚██╗██║██╔═██╗ "
    echo "     ██║   ██║  ██║██║██║ ╚████║██║  ██╗   ██║   ██║  ██║██║ ╚████║██║  ██╗"
    echo "     ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝"
    echo -e "${NC}"
    echo -e "${GREEN}Deployment Script${NC}"
    echo ""
}

check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        echo -e "${RED}Error: Docker Compose plugin is not installed${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Docker and Docker Compose are available${NC}"
}

check_env() {
    if [ ! -f .env.production ]; then
        echo -e "${RED}Error: .env.production file not found${NC}"
        echo -e "${YELLOW}Run './deploy.sh setup' first${NC}"
        exit 1
    fi
}

generate_secrets() {
    echo -e "${YELLOW}Generating secure secrets...${NC}"

    POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    REDIS_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    MINIO_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    MEILI_KEY=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
    JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
    SESSION_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)

    echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
    echo "REDIS_PASSWORD=$REDIS_PASSWORD"
    echo "MINIO_ROOT_PASSWORD=$MINIO_PASSWORD"
    echo "MEILI_MASTER_KEY=$MEILI_KEY"
    echo "JWT_SECRET=$JWT_SECRET"
    echo "SESSION_SECRET=$SESSION_SECRET"
}

setup() {
    echo -e "${YELLOW}Setting up ThinkTank...${NC}"

    if [ -f .env.production ]; then
        echo -e "${YELLOW}Warning: .env.production already exists${NC}"
        read -p "Overwrite? (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo "Skipping .env.production creation"
            return
        fi
    fi

    read -p "Enter your domain (e.g., thinktank.example.com): " DOMAIN

    echo -e "${YELLOW}Generating secure configuration...${NC}"

    cat > .env.production << EOF
# ThinkTank Production Configuration
# Generated on $(date)

# Application
APP_URL=http://${DOMAIN}
NODE_ENV=production

# PostgreSQL
POSTGRES_USER=thinktank
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
POSTGRES_DB=thinktank

# Redis
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)

# MinIO
MINIO_ROOT_USER=thinktank_admin
MINIO_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
MINIO_BUCKET=thinktank-assets

# Meilisearch
MEILI_MASTER_KEY=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)

# Security
JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
SESSION_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
EOF

    chmod 600 .env.production

    echo -e "${GREEN}✓ Configuration created: .env.production${NC}"
    echo -e "${YELLOW}Important: Keep this file secure and backed up!${NC}"
}

build() {
    check_env
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
    echo -e "${GREEN}✓ Build complete${NC}"
}

start() {
    check_env
    echo -e "${YELLOW}Starting ThinkTank...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.production up -d
    echo -e "${GREEN}✓ ThinkTank is starting...${NC}"
    echo ""
    echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
    sleep 10
    status
}

stop() {
    echo -e "${YELLOW}Stopping ThinkTank...${NC}"
    docker compose -f docker-compose.prod.yml down
    echo -e "${GREEN}✓ ThinkTank stopped${NC}"
}

restart() {
    stop
    start
}

logs() {
    SERVICE=${2:-}
    if [ -n "$SERVICE" ]; then
        docker compose -f docker-compose.prod.yml logs -f "$SERVICE"
    else
        docker compose -f docker-compose.prod.yml logs -f
    fi
}

status() {
    echo -e "${YELLOW}Service Status:${NC}"
    docker compose -f docker-compose.prod.yml ps
    echo ""
    echo -e "${YELLOW}Health Checks:${NC}"

    # Check each service
    services=("postgres" "redis" "minio" "meilisearch" "api" "web" "nginx")
    for service in "${services[@]}"; do
        status=$(docker inspect --format='{{.State.Health.Status}}' "thinktank-$service" 2>/dev/null || echo "not running")
        if [ "$status" == "healthy" ]; then
            echo -e "  ${GREEN}✓${NC} $service: $status"
        elif [ "$status" == "starting" ]; then
            echo -e "  ${YELLOW}○${NC} $service: $status"
        else
            echo -e "  ${RED}✗${NC} $service: $status"
        fi
    done
}

update() {
    echo -e "${YELLOW}Updating ThinkTank...${NC}"

    # Pull latest code
    git pull origin main

    # Rebuild and restart
    build

    echo -e "${YELLOW}Restarting services...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.production up -d

    echo -e "${GREEN}✓ Update complete${NC}"
}

backup() {
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    echo -e "${YELLOW}Creating backup in $BACKUP_DIR...${NC}"

    # Backup PostgreSQL
    echo "Backing up PostgreSQL..."
    docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U thinktank thinktank > "$BACKUP_DIR/postgres.sql"

    # Backup environment
    cp .env.production "$BACKUP_DIR/.env.production"

    # Compress
    tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
    rm -rf "$BACKUP_DIR"

    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR.tar.gz${NC}"
}

# Main
print_header
check_requirements

case "${1:-}" in
    setup)
        setup
        ;;
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$@"
        ;;
    status)
        status
        ;;
    update)
        update
        ;;
    backup)
        backup
        ;;
    secrets)
        generate_secrets
        ;;
    *)
        echo "Usage: $0 {setup|build|start|stop|restart|logs|status|update|backup}"
        echo ""
        echo "Commands:"
        echo "  setup    - Create .env.production with secure secrets"
        echo "  build    - Build Docker images"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs (optionally: logs <service>)"
        echo "  status   - Show service status"
        echo "  update   - Pull latest code and redeploy"
        echo "  backup   - Create database backup"
        exit 1
        ;;
esac

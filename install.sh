#!/bin/bash
#
# ThinkTank One-Line Installer
# Run on your server: curl -fsSL https://raw.githubusercontent.com/mysai99/thinktank/main/install.sh | bash
#
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ████████╗██╗  ██╗██╗███╗   ██╗██╗  ██╗████████╗ █████╗ ███╗   ██╗██╗  ██╗"
echo "  ╚══██╔══╝██║  ██║██║████╗  ██║██║ ██╔╝╚══██╔══╝██╔══██╗████╗  ██║██║ ██╔╝"
echo "     ██║   ███████║██║██╔██╗ ██║█████╔╝    ██║   ███████║██╔██╗ ██║█████╔╝ "
echo "     ██║   ██╔══██║██║██║╚██╗██║██╔═██╗    ██║   ██╔══██║██║╚██╗██║██╔═██╗ "
echo "     ██║   ██║  ██║██║██║ ╚████║██║  ██╗   ██║   ██║  ██║██║ ╚████║██║  ██╗"
echo "     ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${GREEN}One-Line Installer${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Note: Running without root. Some commands may require sudo.${NC}"
fi

# Check for Docker
echo -e "${YELLOW}Checking requirements...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Installing...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✓ Docker installed${NC}"
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose plugin not found.${NC}"
    echo "Please install Docker Compose plugin and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are available${NC}"

# Check for git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Installing git...${NC}"
    apt-get update && apt-get install -y git
fi

# Set install directory
INSTALL_DIR="/opt/thinktank"

# Clone or update repository
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}ThinkTank directory exists. Updating...${NC}"
    cd "$INSTALL_DIR"
    git pull origin main
else
    echo -e "${YELLOW}Cloning ThinkTank...${NC}"
    git clone https://github.com/mysai99/thinktank.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Make scripts executable
chmod +x deploy.sh

# Get server IP/domain
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
echo -e "${YELLOW}Detected server IP: ${SERVER_IP}${NC}"
read -p "Enter domain or press Enter to use IP [$SERVER_IP]: " DOMAIN
DOMAIN=${DOMAIN:-$SERVER_IP}

# Generate secure configuration
echo -e "${YELLOW}Generating secure configuration...${NC}"

cat > .env.production << EOF
# ThinkTank Production Configuration
# Generated on $(date)
# Server: ${DOMAIN}

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
echo -e "${GREEN}✓ Configuration created${NC}"

# Build Docker images
echo ""
echo -e "${YELLOW}Building Docker images (this may take a few minutes)...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production build

# Start services
echo ""
echo -e "${YELLOW}Starting ThinkTank...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for services to be healthy
echo ""
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 15

# Show status
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ThinkTank Installation Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}URL:${NC} http://${DOMAIN}"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo "    cd $INSTALL_DIR"
echo "    ./deploy.sh status   # Check service status"
echo "    ./deploy.sh logs     # View logs"
echo "    ./deploy.sh restart  # Restart services"
echo "    ./deploy.sh backup   # Backup database"
echo ""
echo -e "  ${YELLOW}Configuration:${NC} $INSTALL_DIR/.env.production"
echo ""

# Check health
echo -e "${YELLOW}Service Status:${NC}"
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"

echo ""
echo -e "${GREEN}Enjoy ThinkTank! 🚀${NC}"

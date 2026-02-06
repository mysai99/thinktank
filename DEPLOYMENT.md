# ThinkTank Deployment Guide

This guide will help you deploy ThinkTank to your dedicated server.

## Prerequisites

- Ubuntu/Debian server with root access
- Docker installed (v20.10+)
- Docker Compose plugin (v2.0+)
- Domain name pointing to your server (optional but recommended)
- At least 2GB RAM, 20GB storage

## Quick Start

### 1. Clone the Repository

```bash
# On your server
git clone https://github.com/yourusername/thinktank.git
cd thinktank
```

### 2. Run Setup

```bash
./deploy.sh setup
```

This will:
- Prompt for your domain name
- Generate secure passwords and secrets
- Create `.env.production` file

### 3. Build and Start

```bash
./deploy.sh build
./deploy.sh start
```

### 4. Verify Deployment

```bash
./deploy.sh status
```

Your ThinkTank instance should now be running at `http://your-domain.com`

---

## Manual Setup (Step by Step)

### Step 1: Transfer Files to Server

From your local machine:
```bash
# Create a tarball of the project
tar -czf thinktank.tar.gz --exclude=node_modules --exclude=.next --exclude=.git .

# Copy to server
scp thinktank.tar.gz user@your-server:/home/user/

# On server, extract
ssh user@your-server
mkdir -p /opt/thinktank
cd /opt/thinktank
tar -xzf ~/thinktank.tar.gz
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.production.example .env.production

# Edit with your settings
nano .env.production
```

**Important settings to change:**
```env
APP_URL=http://your-domain.com
POSTGRES_PASSWORD=your-secure-password-here
REDIS_PASSWORD=your-secure-password-here
MINIO_ROOT_PASSWORD=your-secure-password-here
MEILI_MASTER_KEY=your-32-char-key-here
JWT_SECRET=your-64-char-secret-here
```

Generate secure secrets:
```bash
# Generate random passwords
openssl rand -base64 32
```

### Step 3: Build Docker Images

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build
```

### Step 4: Start Services

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Step 5: Verify Services

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test the application
curl http://localhost/health
```

---

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_URL` | Public URL of your app | `http://thinktank.example.com` |
| `POSTGRES_PASSWORD` | Database password | (auto-generated) |
| `REDIS_PASSWORD` | Redis password | (auto-generated) |
| `MINIO_ROOT_PASSWORD` | Storage password | (auto-generated) |
| `MEILI_MASTER_KEY` | Search API key | (auto-generated) |
| `JWT_SECRET` | Auth token secret | (auto-generated) |

### Ports

| Service | Internal Port | External Port |
|---------|--------------|---------------|
| Nginx | 80, 443 | 80, 443 |
| Web App | 3000 | (via nginx) |
| API | 3001 | (via nginx) |
| PostgreSQL | 5432 | (internal only) |
| Redis | 6379 | (internal only) |
| MinIO | 9000, 9001 | (internal only) |
| Meilisearch | 7700 | (internal only) |

---

## Maintenance

### View Logs

```bash
# All services
./deploy.sh logs

# Specific service
./deploy.sh logs web
./deploy.sh logs api
./deploy.sh logs postgres
```

### Restart Services

```bash
./deploy.sh restart
```

### Update Application

```bash
./deploy.sh update
```

### Backup Database

```bash
./deploy.sh backup
```

Backups are stored in the `backups/` directory.

### Restore from Backup

```bash
# Extract backup
tar -xzf backups/20240101_120000.tar.gz

# Restore database
cat backups/20240101_120000/postgres.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U thinktank thinktank
```

---

## Troubleshooting

### Services not starting

```bash
# Check Docker logs
docker compose -f docker-compose.prod.yml logs

# Check specific service
docker logs thinktank-api
docker logs thinktank-web
```

### Database connection issues

```bash
# Verify PostgreSQL is running
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Check database logs
docker logs thinktank-postgres
```

### Port conflicts

```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service or change port in docker-compose.prod.yml
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a

# Check disk usage
df -h
```

---

## Security Recommendations

1. **Enable HTTPS**: Use Caddy or configure Let's Encrypt with nginx
2. **Firewall**: Only expose ports 80 and 443
3. **Updates**: Regularly run `./deploy.sh update`
4. **Backups**: Schedule daily backups with cron
5. **Monitoring**: Set up uptime monitoring

### Firewall Setup (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Automatic Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /opt/thinktank && ./deploy.sh backup
```

---

## Adding HTTPS (Optional)

To add HTTPS support, replace nginx with Caddy:

1. Create `docker/caddy/Caddyfile`:
```
your-domain.com {
    reverse_proxy web:3000

    handle_path /api/* {
        reverse_proxy api:3001
    }
}
```

2. Update `docker-compose.prod.yml` to use Caddy instead of nginx.

---

## Support

For issues, please open a GitHub issue or check the documentation.

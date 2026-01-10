# Complete Deployment Guide: CI/CD, Dev, Staging, and Production

This comprehensive guide will walk you through setting up CI/CD pipelines, configuring dev/staging/production environments, deploying to Digital Ocean, and configuring domains from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Digital Ocean Server Setup](#digital-ocean-server-setup)
3. [Domain Configuration](#domain-configuration)
4. [Server Initial Setup](#server-initial-setup)
5. [Environment Configuration](#environment-configuration)
6. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
7. [Deployment Scripts](#deployment-scripts)
8. [Deployment Process](#deployment-process)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account with repository access
- [ ] Digital Ocean account
- [ ] Domain name (or subdomains)
- [ ] SSH key pair generated
- [ ] Basic knowledge of Linux commands
- [ ] Docker and Docker Compose installed locally (for testing)

### Generate SSH Key (if you don't have one)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Save to: ~/.ssh/id_ed25519
# Add passphrase for security
```

---

## Digital Ocean Server Setup

### Step 1: Create Droplets

Create three droplets for dev, staging, and production:

#### Development Server
- **Name**: `second-bloom-dev`
- **Region**: Choose closest to your team
- **Image**: Ubuntu 22.04 LTS
- **Plan**: Basic - Regular Intel with 2GB RAM / 1 vCPU ($12/month)
- **Authentication**: SSH keys (add your public key)
- **Hostname**: `dev-api.yourdomain.com`

#### Staging Server
- **Name**: `second-bloom-staging`
- **Region**: Same as production
- **Image**: Ubuntu 22.04 LTS
- **Plan**: Basic - Regular Intel with 4GB RAM / 2 vCPU ($24/month)
- **Authentication**: SSH keys
- **Hostname**: `staging-api.yourdomain.com`

#### Production Server
- **Name**: `second-bloom-prod`
- **Region**: Choose based on your users' location
- **Image**: Ubuntu 22.04 LTS
- **Plan**: Basic - Regular Intel with 8GB RAM / 4 vCPU ($48/month) or higher
- **Authentication**: SSH keys
- **Hostname**: `api.yourdomain.com`

### Step 2: Create Firewall Rules

1. Go to **Networking** → **Firewalls** → **Create Firewall**
2. Name: `second-bloom-firewall`
3. **Inbound Rules**:
   - HTTP (80) - Allow all
   - HTTPS (443) - Allow all
   - SSH (22) - Allow from your IP only (for security)
   - Custom (3000) - Allow from specific IPs if needed
4. **Outbound Rules**: Allow all
5. Apply to all three droplets

### Step 3: Create Database (Optional - Managed Database)

For production, consider using Digital Ocean Managed Database:

1. Go to **Databases** → **Create Database**
2. Choose **PostgreSQL 16**
3. **Plan**: Production-grade (start with $15/month)
4. **Region**: Same as production server
5. **Database Name**: `second_bloom_prod`
6. **User**: `second_bloom_user`
7. Save connection details securely

**Note**: For dev/staging, you can use Docker containers on the same server.

---

## Domain Configuration

### Step 1: Configure DNS Records

In your domain registrar (or Digital Ocean DNS):

#### For Development
```
Type: A
Name: dev-api
Value: [DEV_SERVER_IP]
TTL: 3600
```

#### For Staging
```
Type: A
Name: staging-api
Value: [STAGING_SERVER_IP]
TTL: 3600
```

#### For Production
```
Type: A
Name: api
Value: [PROD_SERVER_IP]
TTL: 3600
```

#### Wildcard (Optional - for subdomains)
```
Type: A
Name: *
Value: [PROD_SERVER_IP]
TTL: 3600
```

### Step 2: Verify DNS Propagation

```bash
# Check DNS propagation
dig dev-api.yourdomain.com
dig staging-api.yourdomain.com
dig api.yourdomain.com

# Or use online tools like:
# https://www.whatsmydns.net/
```

---

## Server Initial Setup

### Step 1: Connect to Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Create Deployment User

```bash
# Create user
adduser deploy
usermod -aG sudo deploy

# Add SSH key for deploy user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Switch to deploy user
su - deploy
```

### Step 3: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deploy

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Install Git
sudo apt install git -y

# Install Node.js (for Prisma CLI if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Logout and login again for docker group to take effect
exit
```

### Step 4: Create Application Directory

```bash
ssh deploy@YOUR_SERVER_IP

# Create app directory
mkdir -p ~/second-bloom-backend
cd ~/second-bloom-backend
```

### Step 5: Clone Repository

```bash
# For production, use main branch
git clone https://github.com/YOUR_USERNAME/second-bloom-backend.git .

# For staging, use develop branch
git checkout develop

# For dev, use develop or feature branches
```

---

## Environment Configuration

### Step 1: Create Environment Files

On each server, create environment-specific `.env` files:

#### Development Server (`~/second-bloom-backend/.env`)

```bash
nano ~/second-bloom-backend/.env
```

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
POSTGRES_DB=second_bloom_dev
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:CHANGE_THIS_STRONG_PASSWORD@postgres:5432/second_bloom_dev?schema=public&connection_limit=10&pool_timeout=20

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
REDIS_URL=redis://:CHANGE_THIS_REDIS_PASSWORD@redis:6379

# JWT
JWT_SECRET=CHANGE_THIS_DEV_JWT_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=CHANGE_THIS_DEV_REFRESH_SECRET_MIN_32_CHARS
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-dev-bucket

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://dev.yourdomain.com

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs

# SMS (if applicable)
SMS_API_KEY=your_sms_key
SMS_API_URL=https://api.sms-provider.com

# Payment Gateways (if applicable)
PAYME_MERCHANT_ID=your_payme_id
PAYME_SECRET_KEY=your_payme_secret
CLICK_MERCHANT_ID=your_click_id
CLICK_SECRET_KEY=your_click_secret
CLICK_SERVICE_ID=your_click_service

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_ENABLED=true

# Firebase (if applicable)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_DATABASE_URL=your_database_url

# Telegram (if applicable)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Logging
LOG_LEVEL=debug
```

#### Staging Server (Similar but with staging values)

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://staging.yourdomain.com
SWAGGER_ENABLED=true
LOG_LEVEL=info
# ... other values similar to dev but with staging credentials
```

#### Production Server (Most secure)

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
SWAGGER_ENABLED=false
LOG_LEVEL=warn
# ... use production credentials and secrets
```

### Step 2: Secure Environment Files

```bash
# Set proper permissions
chmod 600 ~/second-bloom-backend/.env

# Backup environment files securely
# Store backups in password manager or secure vault
```

---

## CI/CD Pipeline Setup

### Step 1: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

#### For Development
- `DEV_HOST`: dev-api.yourdomain.com
- `DEV_USER`: deploy
- `DEV_SSH_KEY`: Your private SSH key
- `DEV_SSH_PASSPHRASE`: SSH key passphrase (if any)

#### For Staging
- `STAGING_HOST`: staging-api.yourdomain.com
- `STAGING_USER`: deploy
- `STAGING_SSH_KEY`: Your private SSH key
- `STAGING_SSH_PASSPHRASE`: SSH key passphrase (if any)

#### For Production
- `PROD_HOST`: api.yourdomain.com
- `PROD_USER`: deploy
- `PROD_SSH_KEY`: Your private SSH key
- `PROD_SSH_PASSPHRASE`: SSH key passphrase (if any)

#### Common Secrets
- `DOCKER_HUB_USERNAME`: Your Docker Hub username (if using)
- `DOCKER_HUB_TOKEN`: Your Docker Hub access token

### Step 2: Update CI/CD Workflow

The CI/CD workflow file (`.github/workflows/deploy.yml`) will be created in the next section. It will handle:
- Running tests
- Building Docker images
- Deploying to appropriate environment based on branch
- Running database migrations
- Health checks

---

## Deployment Scripts

### Step 1: Create Deployment Script

Create `scripts/deploy.sh` on the server:

```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-production}
APP_DIR="$HOME/second-bloom-backend"
COMPOSE_FILE="docker-compose.prod.yml"

if [ "$ENVIRONMENT" = "dev" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
fi

cd "$APP_DIR"

echo "🔄 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

if [ "$ENVIRONMENT" = "dev" ]; then
  git reset --hard origin/develop
fi

echo "🏗️  Building Docker images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

echo "🔄 Running database migrations..."
docker-compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy

echo "🚀 Starting services..."
docker-compose -f "$COMPOSE_FILE" up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed!"
echo "📊 Checking service status..."
docker-compose -f "$COMPOSE_FILE" ps
```

Make it executable:
```bash
chmod +x ~/second-bloom-backend/scripts/deploy.sh
```

### Step 2: Create Health Check Script

Create `scripts/health-check.sh`:

```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-production}
APP_DIR="$HOME/second-bloom-backend"
HEALTH_URL="http://localhost:3000/health"

cd "$APP_DIR"

echo "🏥 Running health check..."
for i in {1..30}; do
  if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ Health check passed!"
    exit 0
  fi
  echo "⏳ Waiting for service to be healthy... ($i/30)"
  sleep 2
done

echo "❌ Health check failed!"
exit 1
```

---

## CI/CD Pipeline Setup (Detailed)

The enhanced CI/CD workflow will be created in `.github/workflows/deploy.yml`. This workflow will:

1. **On push to `develop` branch**: Deploy to staging
2. **On push to `main` branch**: Deploy to production
3. **On pull request**: Run tests and linting only
4. **Manual deployment**: Allow manual triggers

---

## Deployment Process

### Automatic Deployment (via CI/CD)

1. **Push to `develop` branch** → Auto-deploys to staging
2. **Push to `main` branch** → Auto-deploys to production
3. **Monitor GitHub Actions** for deployment status

### Manual Deployment

```bash
# SSH into server
ssh deploy@YOUR_SERVER_IP

# Run deployment script
cd ~/second-bloom-backend
./scripts/deploy.sh production  # or 'dev' for development
```

### First-Time Deployment

```bash
# SSH into server
ssh deploy@YOUR_SERVER_IP

# Navigate to app directory
cd ~/second-bloom-backend

# Create .env file (see Environment Configuration section)
nano .env

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Seed database (if needed)
docker-compose -f docker-compose.prod.yml run --rm app npm run prisma:seed

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## Nginx Configuration

### Step 1: Configure Nginx for Each Environment

#### Development (`/etc/nginx/sites-available/dev-api.yourdomain.com`)

```nginx
server {
    listen 80;
    server_name dev-api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Staging (`/etc/nginx/sites-available/staging-api.yourdomain.com`)

```nginx
server {
    listen 80;
    server_name staging-api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Production (`/etc/nginx/sites-available/api.yourdomain.com`)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (no rate limiting)
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

### Step 2: Enable Sites

```bash
# Create symlinks
sudo ln -s /etc/nginx/sites-available/dev-api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/staging-api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Setup SSL with Let's Encrypt

```bash
# For each domain
sudo certbot --nginx -d dev-api.yourdomain.com
sudo certbot --nginx -d staging-api.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Monitoring and Maintenance

### Step 1: Setup Log Monitoring

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### Step 2: Setup Log Rotation

Create `/etc/logrotate.d/docker-containers`:

```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

### Step 3: Monitor Server Resources

```bash
# Install monitoring tools
sudo apt install htop iotop -y

# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Check running containers
docker ps

# Check container stats
docker stats
```

### Step 4: Database Backups

Create backup script `scripts/backup-db.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ENVIRONMENT=${1:-production}

mkdir -p "$BACKUP_DIR"

docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres second_bloom_${ENVIRONMENT} | gzip > "$BACKUP_DIR/db_backup_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "db_backup_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete

echo "✅ Backup created: db_backup_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /home/deploy/second-bloom-backend/scripts/backup-db.sh production
```

---

## Troubleshooting

### Common Issues

#### 1. Application won't start
```bash
# Check logs
docker-compose logs app

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Restart services
docker-compose restart
```

#### 2. Database connection errors
```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d second_bloom_prod
```

#### 3. SSL certificate issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

#### 4. Nginx 502 errors
```bash
# Check if app is running
docker-compose ps

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

#### 5. Out of disk space
```bash
# Clean Docker
docker system prune -a --volumes

# Clean old images
docker image prune -a

# Check disk usage
df -h
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong, unique passwords for each environment
- [ ] Enable firewall rules
- [ ] Restrict SSH access to specific IPs
- [ ] Use SSH keys instead of passwords
- [ ] Enable SSL/TLS certificates
- [ ] Keep system and Docker updated
- [ ] Regular security audits
- [ ] Monitor logs for suspicious activity
- [ ] Setup automated backups
- [ ] Use environment-specific secrets
- [ ] Disable Swagger in production
- [ ] Implement rate limiting
- [ ] Regular dependency updates

---

## Next Steps

1. ✅ Complete server setup for all environments
2. ✅ Configure domains and DNS
3. ✅ Setup CI/CD pipeline
4. ✅ Deploy to development
5. ✅ Test thoroughly
6. ✅ Deploy to staging
7. ✅ Perform staging tests
8. ✅ Deploy to production
9. ✅ Monitor and maintain

---

## Support and Resources

- [Digital Ocean Documentation](https://docs.digitalocean.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: January 2025
**Maintained By**: Development Team

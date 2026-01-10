#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
APP_DIR="${HOME}/second-bloom-backend"

# Determine compose file based on environment
case "$ENVIRONMENT" in
  dev|development)
    COMPOSE_FILE="docker-compose.dev.yml"
    BRANCH="develop"
    ;;
  staging)
    COMPOSE_FILE="docker-compose.staging.yml"
    BRANCH="develop"
    ;;
  prod|production)
    COMPOSE_FILE="docker-compose.prod.yml"
    BRANCH="main"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

cd "$APP_DIR" || exit 1

echo -e "${GREEN}🚀 Starting deployment to $ENVIRONMENT environment...${NC}"

# Pull latest changes
echo -e "${YELLOW}🔄 Pulling latest changes from $BRANCH branch...${NC}"
git fetch origin
git reset --hard "origin/$BRANCH"

# Build Docker images
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker-compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy || {
  echo -e "${RED}❌ Migration failed!${NC}"
  exit 1
}

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
for i in {1..30}; do
  if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Health check failed after 60 seconds!${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50 app
    exit 1
  fi
  echo -e "${YELLOW}⏳ Waiting for service to be healthy... ($i/30)${NC}"
  sleep 2
done

# Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker image prune -f

# Show service status
echo -e "${GREEN}📊 Service status:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo -e "${GREEN}✅ Deployment to $ENVIRONMENT completed successfully!${NC}"

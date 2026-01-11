#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="${HOME}/second-bloom-backend"

cd "$APP_DIR" || exit 1

echo -e "${GREEN}🚀 Starting deployment...${NC}"

echo -e "${YELLOW}🔄 Pulling latest changes from main branch...${NC}"
git fetch origin
git reset --hard origin/main

echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker-compose run --rm app npx prisma migrate deploy || {
  echo -e "${RED}❌ Migration failed!${NC}"
  exit 1
}

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

echo -e "${YELLOW}🏥 Running health check...${NC}"
for i in {1..30}; do
  if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Health check failed after 60 seconds!${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    docker-compose logs --tail=50 app
    exit 1
  fi
  echo -e "${YELLOW}⏳ Waiting for service to be healthy... ($i/30)${NC}"
  sleep 2
done

echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker image prune -f

echo -e "${GREEN}📊 Service status:${NC}"
docker-compose ps

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

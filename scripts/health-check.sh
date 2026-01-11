#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="${HOME}/second-bloom-backend"
HEALTH_URL="http://localhost:3000/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

cd "$APP_DIR" || exit 1

echo -e "${YELLOW}🏥 Running health check...${NC}"

for i in $(seq 1 $MAX_RETRIES); do
  if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    
    echo -e "${YELLOW}📊 Health status details:${NC}"
    curl -s "$HEALTH_URL" | python3 -m json.tool 2>/dev/null || curl -s "$HEALTH_URL"
    
    exit 0
  fi
  
  if [ $i -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Health check failed after $((MAX_RETRIES * RETRY_INTERVAL)) seconds!${NC}"
    echo -e "${YELLOW}📋 Checking service logs...${NC}"
    docker-compose logs --tail=50 app || true
    exit 1
  fi
  
  echo -e "${YELLOW}⏳ Waiting for service to be healthy... ($i/$MAX_RETRIES)${NC}"
  sleep $RETRY_INTERVAL
done

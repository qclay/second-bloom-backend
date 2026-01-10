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
HEALTH_URL="http://localhost:3000/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

cd "$APP_DIR" || exit 1

echo -e "${YELLOW}🏥 Running health check for $ENVIRONMENT environment...${NC}"

for i in $(seq 1 $MAX_RETRIES); do
  if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    
    # Get detailed health status
    echo -e "${YELLOW}📊 Health status details:${NC}"
    curl -s "$HEALTH_URL" | python3 -m json.tool 2>/dev/null || curl -s "$HEALTH_URL"
    
    exit 0
  fi
  
  if [ $i -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Health check failed after $((MAX_RETRIES * RETRY_INTERVAL)) seconds!${NC}"
    echo -e "${YELLOW}📋 Checking service logs...${NC}"
    
    # Determine compose file
    case "$ENVIRONMENT" in
      dev|development)
        COMPOSE_FILE="docker-compose.dev.yml"
        ;;
      staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        ;;
      prod|production)
        COMPOSE_FILE="docker-compose.prod.yml"
        ;;
    esac
    
    docker-compose -f "$COMPOSE_FILE" logs --tail=50 app || true
    exit 1
  fi
  
  echo -e "${YELLOW}⏳ Waiting for service to be healthy... ($i/$MAX_RETRIES)${NC}"
  sleep $RETRY_INTERVAL
done

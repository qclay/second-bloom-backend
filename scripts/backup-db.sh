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
BACKUP_DIR="${HOME}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Determine compose file and database name
case "$ENVIRONMENT" in
  dev|development)
    COMPOSE_FILE="docker-compose.dev.yml"
    DB_NAME="second_bloom_dev"
    ;;
  staging)
    COMPOSE_FILE="docker-compose.staging.yml"
    DB_NAME="second_bloom_staging"
    ;;
  prod|production)
    COMPOSE_FILE="docker-compose.prod.yml"
    DB_NAME="second_bloom_prod"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

cd "$APP_DIR" || exit 1

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}💾 Creating database backup for $ENVIRONMENT environment...${NC}"

# Create backup
BACKUP_FILE="$BACKUP_DIR/db_backup_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"
docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✅ Backup created successfully!${NC}"
  echo -e "   File: $BACKUP_FILE"
  echo -e "   Size: $BACKUP_SIZE"
else
  echo -e "${RED}❌ Backup failed!${NC}"
  exit 1
fi

# Keep only last 7 days of backups
echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 7 days)...${NC}"
find "$BACKUP_DIR" -name "db_backup_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete

# List remaining backups
echo -e "${GREEN}📋 Remaining backups:${NC}"
ls -lh "$BACKUP_DIR"/db_backup_${ENVIRONMENT}_*.sql.gz 2>/dev/null || echo "No backups found"

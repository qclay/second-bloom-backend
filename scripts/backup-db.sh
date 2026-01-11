#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="${HOME}/second-bloom-backend"
BACKUP_DIR="${HOME}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-second_bloom_prod}"

cd "$APP_DIR" || exit 1

mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}💾 Creating database backup...${NC}"

BACKUP_FILE="$BACKUP_DIR/db_backup_${TIMESTAMP}.sql.gz"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
docker-compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✅ Backup created successfully!${NC}"
  echo -e "   File: $BACKUP_FILE"
  echo -e "   Size: $BACKUP_SIZE"
else
  echo -e "${RED}❌ Backup failed!${NC}"
  exit 1
fi

echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 7 days)...${NC}"
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete

echo -e "${GREEN}📋 Remaining backups:${NC}"
ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null || echo "No backups found"

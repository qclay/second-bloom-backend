#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="${HOME}/second-bloom-backend"
BACKUP_DIR="${HOME}/backups"

if [ -z "$1" ]; then
  echo -e "${RED}❌ Usage: $0 <backup_file.sql.gz>${NC}"
  echo -e "${YELLOW}Available backups:${NC}"
  ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${POSTGRES_DB:-second_bloom_prod}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

cd "$APP_DIR" || exit 1

echo -e "${YELLOW}⚠️  WARNING: This will replace all data in the database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${YELLOW}Cancelled.${NC}"
  exit 0
fi

echo -e "${GREEN}🔄 Restoring database from backup...${NC}"

# Create a temporary backup before restore
echo -e "${YELLOW}💾 Creating safety backup before restore...${NC}"
"$APP_DIR/scripts/backup-db.sh" || echo -e "${YELLOW}⚠️  Could not create safety backup${NC}"

# Drop and recreate database (or just restore)
echo -e "${YELLOW}🔄 Restoring database...${NC}"

# Method 1: Drop and recreate (clean restore)
docker-compose exec -T postgres psql -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};" || true
docker-compose exec -T postgres psql -U "$POSTGRES_USER" -c "CREATE DATABASE ${DB_NAME};" || true

# Restore from backup
gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres psql -U "$POSTGRES_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database restored successfully!${NC}"
  echo -e "${YELLOW}⚠️  You may need to restart the application container.${NC}"
else
  echo -e "${RED}❌ Database restore failed!${NC}"
  exit 1
fi

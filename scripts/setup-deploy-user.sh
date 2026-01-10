#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ This script must be run as root${NC}"
  echo "Usage: sudo ./setup-deploy-user.sh"
  exit 1
fi

echo -e "${GREEN}👤 Setting up deploy user...${NC}"

# Create deploy user if it doesn't exist
if ! id "deploy" &>/dev/null; then
  echo -e "${YELLOW}📝 Creating deploy user...${NC}"
  adduser --disabled-password --gecos "" deploy
  echo -e "${GREEN}✅ Deploy user created${NC}"
else
  echo -e "${GREEN}✅ Deploy user already exists${NC}"
fi

# Add deploy user to sudo group
echo -e "${YELLOW}🔐 Adding deploy user to sudo group...${NC}"
usermod -aG sudo deploy

# Add deploy user to docker group (if docker is installed)
if command -v docker &> /dev/null; then
  echo -e "${YELLOW}🐳 Adding deploy user to docker group...${NC}"
  usermod -aG docker deploy
fi

# Setup SSH directory and keys
echo -e "${YELLOW}🔑 Setting up SSH keys...${NC}"
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Copy root's authorized_keys if it exists, or create new one
if [ -f /root/.ssh/authorized_keys ]; then
  cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
  echo -e "${GREEN}✅ Copied SSH keys from root${NC}"
else
  echo -e "${YELLOW}⚠️  No SSH keys found in /root/.ssh/authorized_keys${NC}"
  echo -e "${YELLOW}   You'll need to add your public key manually:${NC}"
  echo -e "${YELLOW}   echo 'YOUR_PUBLIC_KEY' >> /home/deploy/.ssh/authorized_keys${NC}"
fi

# Set proper permissions
chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Create app directory
APP_DIR="/home/deploy/second-bloom-backend"
if [ ! -d "$APP_DIR" ]; then
  echo -e "${YELLOW}📁 Creating application directory...${NC}"
  mkdir -p "$APP_DIR"
  chown deploy:deploy "$APP_DIR"
  echo -e "${GREEN}✅ Application directory created${NC}"
else
  echo -e "${GREEN}✅ Application directory already exists${NC}"
fi

# Create backups directory
BACKUP_DIR="/home/deploy/backups"
if [ ! -d "$BACKUP_DIR" ]; then
  echo -e "${YELLOW}💾 Creating backups directory...${NC}"
  mkdir -p "$BACKUP_DIR"
  chown deploy:deploy "$BACKUP_DIR"
  echo -e "${GREEN}✅ Backups directory created${NC}"
else
  echo -e "${GREEN}✅ Backups directory already exists${NC}"
fi

echo -e "${GREEN}✅ Deploy user setup completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Switch to deploy user: ${GREEN}su - deploy${NC}"
echo -e "   2. Or SSH directly as deploy: ${GREEN}ssh deploy@YOUR_SERVER_IP${NC}"
echo -e "   3. Clone repository: ${GREEN}cd ~ && git clone YOUR_REPO_URL second-bloom-backend${NC}"
echo -e "   4. Run setup: ${GREEN}cd ~/second-bloom-backend && ./scripts/setup-server.sh${NC}"

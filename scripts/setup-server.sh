#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up server for deployment...${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}❌ Please do not run this script as root. Run as deploy user.${NC}"
  exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}🐳 Installing Docker...${NC}"
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker "$USER"
  rm get-docker.sh
  echo -e "${GREEN}✅ Docker installed${NC}"
else
  echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
  echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
  echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
  sudo apt install nginx -y
  echo -e "${GREEN}✅ Nginx installed${NC}"
else
  echo -e "${GREEN}✅ Nginx already installed${NC}"
fi

# Install Certbot
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}🔒 Installing Certbot...${NC}"
  sudo apt install certbot python3-certbot-nginx -y
  echo -e "${GREEN}✅ Certbot installed${NC}"
else
  echo -e "${GREEN}✅ Certbot already installed${NC}"
fi

# Install Git
if ! command -v git &> /dev/null; then
  echo -e "${YELLOW}📥 Installing Git...${NC}"
  sudo apt install git -y
  echo -e "${GREEN}✅ Git installed${NC}"
else
  echo -e "${GREEN}✅ Git already installed${NC}"
fi

# Install Node.js (for Prisma CLI)
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}📦 Installing Node.js...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  echo -e "${GREEN}✅ Node.js installed${NC}"
else
  echo -e "${GREEN}✅ Node.js already installed${NC}"
fi

# Install monitoring tools
echo -e "${YELLOW}📊 Installing monitoring tools...${NC}"
sudo apt install htop iotop -y

# Setup log rotation for Docker
echo -e "${YELLOW}📝 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/docker-containers > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Create app directory
APP_DIR="$HOME/second-bloom-backend"
if [ ! -d "$APP_DIR" ]; then
  echo -e "${YELLOW}📁 Creating application directory...${NC}"
  mkdir -p "$APP_DIR"
  echo -e "${GREEN}✅ Directory created: $APP_DIR${NC}"
else
  echo -e "${GREEN}✅ Application directory already exists${NC}"
fi

# Make scripts executable
if [ -d "$APP_DIR/scripts" ]; then
  echo -e "${YELLOW}🔧 Making scripts executable...${NC}"
  chmod +x "$APP_DIR/scripts"/*.sh 2>/dev/null || true
fi

echo -e "${GREEN}✅ Server setup completed!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Logout and login again for Docker group to take effect"
echo -e "   2. Clone your repository to $APP_DIR"
echo -e "   3. Create .env file with your configuration"
echo -e "   4. Run deployment script: ./scripts/deploy.sh [environment]"

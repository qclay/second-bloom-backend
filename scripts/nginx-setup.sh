#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DOMAIN=""

case "$ENVIRONMENT" in
  dev|development)
    DOMAIN="dev-api.yourdomain.com"
    ;;
  staging)
    DOMAIN="staging-api.yourdomain.com"
    ;;
  prod|production)
    DOMAIN="api.yourdomain.com"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [dev|staging|prod] [domain]"
    exit 1
    ;;
esac

# Override domain if provided
if [ -n "$2" ]; then
  DOMAIN="$2"
fi

echo -e "${GREEN}🔧 Setting up Nginx for $DOMAIN ($ENVIRONMENT)${NC}"

# Create Nginx configuration
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"

if [ "$ENVIRONMENT" = "prod" ] || [ "$ENVIRONMENT" = "production" ]; then
  # Production configuration with rate limiting
  sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
EOF
else
  # Development/Staging configuration
  sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF
fi

# Enable site
sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$DOMAIN"

# Test configuration
echo -e "${YELLOW}🧪 Testing Nginx configuration...${NC}"
if sudo nginx -t; then
  echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
  
  # Reload Nginx
  echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
  sudo systemctl reload nginx
  
  echo -e "${GREEN}✅ Nginx setup completed!${NC}"
  echo -e "${YELLOW}📝 Next step: Run SSL setup with certbot${NC}"
  echo -e "   sudo certbot --nginx -d $DOMAIN"
else
  echo -e "${RED}❌ Nginx configuration test failed!${NC}"
  exit 1
fi

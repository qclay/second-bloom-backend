#!/bin/bash

# Flower Marketplace Backend - Docker Quick Start Script

set -e

echo "🌸 Flower Marketplace Backend - Docker Setup"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing!"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "🐳 Starting Docker containers..."
echo ""

# Start services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if postgres is healthy
echo "🔍 Checking database connection..."
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"
echo ""

# Check if redis is healthy
echo "🔍 Checking Redis connection..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "   Waiting for Redis..."
    sleep 2
done

echo "✅ Redis is ready!"
echo ""

# Run migrations
echo "📦 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy || {
    echo "⚠️  Migrations failed. Running initial migration..."
    docker-compose exec -T app npx prisma migrate dev --name init || true
}

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Service URLs:"
echo "   - API: http://localhost:3000"
echo "   - Swagger: http://localhost:3000/api/docs"
echo "   - PgAdmin: http://localhost:5050"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker-compose logs -f app"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo ""
echo "🎉 Happy coding!"


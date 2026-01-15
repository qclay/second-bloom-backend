# Second Bloom Backend

Flower marketplace backend API built with NestJS, PostgreSQL, and Prisma.

## 🚀 Features

- **Authentication**: OTP-based authentication with JWT tokens
- **Products**: Full CRUD operations with search and filtering
- **Auctions**: Real-time auction system with auto-extension
- **Orders**: Order management with status tracking
- **Chat**: WebSocket-based real-time messaging
- **Notifications**: Push notifications via Firebase
- **File Upload**: Secure file upload to Digital Ocean Spaces (S3-compatible)
- **Seller Dashboard**: Analytics and statistics for sellers

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Digital Ocean Spaces (for file storage)
- Firebase account (for push notifications)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd second-bloom-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Seed database (optional)
npm run prisma:seed
```

5. **Start the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the server is running, access Swagger documentation at:
- Development: `http://localhost:3000/api/docs`
- Production: Disabled by default (set `SWAGGER_ENABLED=true` to enable)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
src/
├── modules/          # Feature modules
│   ├── auth/        # Authentication
│   ├── user/        # User management
│   ├── product/     # Products
│   ├── auction/     # Auctions
│   ├── order/       # Orders
│   └── ...
├── common/          # Shared utilities
│   ├── decorators/  # Custom decorators
│   ├── filters/     # Exception filters
│   ├── guards/      # Auth guards
│   └── interceptors/# Request/response interceptors
├── config/          # Configuration
├── infrastructure/   # External services (Storage, Firebase, SMS)
└── prisma/          # Database service
```

## 🔐 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (per-user)
- JWT authentication
- Input validation
- SQL injection protection (Prisma)
- Request size limits
- Request timeout handling

## 📊 Health Checks

- Basic: `GET /api/v1/health`
- Detailed: `GET /api/v1/health/detailed`
- Readiness: `GET /api/v1/health/readiness`
- Liveness: `GET /api/v1/health/liveness`

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

## 📝 API Response Format

All responses follow a standardized format:

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {...},
  "timestamp": "2026-01-08T...",
  "path": "/api/v1/...",
  "requestId": "uuid",
  "meta": {
    "pagination": {...}
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [...]
  },
  "statusCode": 400,
  "timestamp": "2026-01-08T...",
  "path": "/api/v1/...",
  "requestId": "uuid"
}
```


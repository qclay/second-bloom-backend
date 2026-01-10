# API Changelog

All notable changes to the Second Bloom API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-08

### Added

#### Authentication
- **POST** `/api/v1/auth/send-otp` - Send OTP to phone number
- **POST** `/api/v1/auth/verify-otp` - Verify OTP and get access/refresh tokens
- **POST** `/api/v1/auth/refresh` - Refresh access token using refresh token
- **POST** `/api/v1/auth/logout` - Logout and invalidate refresh token

#### Users
- **GET** `/api/v1/users/me` - Get current user profile
- **PATCH** `/api/v1/users/me` - Update current user profile
- **GET** `/api/v1/users/:id` - Get user by ID (public profile)

#### Categories
- **GET** `/api/v1/categories` - List all categories (cached)
- **GET** `/api/v1/categories/:id` - Get category by ID (cached)
- **POST** `/api/v1/categories` - Create category (Admin/Moderator only)
- **PATCH** `/api/v1/categories/:id` - Update category (Admin/Moderator only)
- **DELETE** `/api/v1/categories/:id` - Delete category (Admin/Moderator only)

#### Products
- **GET** `/api/v1/products` - List products with filtering, pagination, and search
- **GET** `/api/v1/products/:id` - Get product by ID (cached)
- **POST** `/api/v1/products` - Create product (Seller only)
- **PATCH** `/api/v1/products/:id` - Update product (Seller/Admin only)
- **DELETE** `/api/v1/products/:id` - Delete product (Seller/Admin only)

#### Auctions
- **GET** `/api/v1/auctions` - List auctions with filtering and pagination
- **GET** `/api/v1/auctions/:id` - Get auction by ID
- **POST** `/api/v1/auctions` - Create auction (Seller only)
- **PATCH** `/api/v1/auctions/:id` - Update auction (Creator/Admin only)
- **DELETE** `/api/v1/auctions/:id` - Delete auction (Creator/Admin only)

#### Bids
- **GET** `/api/v1/auctions/:auctionId/bids` - List bids for an auction
- **POST** `/api/v1/auctions/:auctionId/bids` - Place a bid (Authenticated users)

#### Orders
- **GET** `/api/v1/orders` - List orders (filtered by user role)
- **GET** `/api/v1/orders/:id` - Get order by ID
- **POST** `/api/v1/orders` - Create order (Buyer only)
- **PATCH** `/api/v1/orders/:id` - Update order status (Seller/Buyer/Admin)
- **DELETE** `/api/v1/orders/:id` - Cancel order (Buyer/Admin only)

#### Reviews
- **GET** `/api/v1/products/:productId/reviews` - List reviews for a product
- **POST** `/api/v1/products/:productId/reviews` - Create review (Buyer only)
- **PATCH** `/api/v1/reviews/:id` - Update review (Reviewer only)
- **DELETE** `/api/v1/reviews/:id` - Delete review (Reviewer/Admin only)

#### Files
- **POST** `/api/v1/files/upload` - Upload file to S3
- **GET** `/api/v1/files/:id` - Get file metadata
- **DELETE** `/api/v1/files/:id` - Delete file

#### Notifications
- **GET** `/api/v1/notifications` - List user notifications
- **GET** `/api/v1/notifications/:id` - Get notification by ID
- **PATCH** `/api/v1/notifications/:id/read` - Mark notification as read
- **PATCH** `/api/v1/notifications/read-all` - Mark all notifications as read

#### Chat
- **GET** `/api/v1/chat/conversations` - List user conversations
- **GET** `/api/v1/chat/conversations/:id` - Get conversation with messages
- **POST** `/api/v1/chat/conversations` - Create conversation
- **POST** `/api/v1/chat/conversations/:id/messages` - Send message
- **WebSocket** `/chat` - Real-time messaging gateway

#### Seller Dashboard
- **GET** `/api/v1/seller/stats` - Get seller statistics
- **GET** `/api/v1/seller/income` - Get seller income analytics
- **GET** `/api/v1/seller/products` - Get seller's products

#### Health & Metrics
- **GET** `/api/v1/health` - Basic health check
- **GET** `/api/v1/health/detailed` - Detailed health check
- **GET** `/api/v1/health/readiness` - Readiness probe
- **GET** `/api/v1/health/liveness` - Liveness probe
- **GET** `/api/v1/metrics` - Prometheus metrics

### Features
- OTP-based authentication with JWT tokens
- Role-based access control (Admin, Moderator, Seller, User)
- Redis caching for Categories and Products
- Real-time auction system with auto-extension
- WebSocket-based chat system
- Push notifications via Firebase
- File upload to AWS S3
- Background job processing (Bull queues)
- Comprehensive error handling
- Request ID tracking
- Standardized API responses
- Swagger API documentation

### Security
- Helmet.js security headers
- CORS configuration
- Rate limiting (per-user, role-based)
- Input validation
- SQL injection protection (Prisma)
- XSS protection
- Request size limits (10MB)
- Request timeout (30s)

---

## [Unreleased]

### Planned
- API versioning strategy
- Webhook system
- GraphQL support (optional)
- Advanced analytics endpoints
- Bulk operations endpoints

---

## Version History

- **v1.0.0** (2026-01-08) - Initial release

---

## Breaking Changes

None yet. This is the first version.

---

## Migration Guide

### From Development to Production

1. Update environment variables:
   - Set `NODE_ENV=production`
   - Configure production database URL
   - Set strong JWT secrets
   - Configure AWS S3 credentials
   - Set up Firebase credentials
   - Configure payment gateway credentials

2. Database migrations:
   ```bash
   npm run prisma:migrate:deploy
   ```

3. Disable Swagger in production:
   - Set `SWAGGER_ENABLED=false` or remove from environment

4. Configure CORS:
   - Set `CORS_ORIGIN` to your frontend domain(s)

---

## Deprecation Notices

None currently.

---

## Support

For API support, please refer to:
- Swagger Documentation: `/api/docs` (development)
- README.md for setup instructions
- DEPLOYMENT.md for deployment guide

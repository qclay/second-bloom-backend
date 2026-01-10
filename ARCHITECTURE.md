# Architecture Documentation

## Overview

Second Bloom Backend is a RESTful API built with NestJS, following a modular architecture with clear separation of concerns.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                  (Web, Mobile, Admin Panel)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NestJS Application                                  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Middleware Stack                               │  │  │
│  │  │  - Helmet (Security)                             │  │  │
│  │  │  - CORS                                          │  │  │
│  │  │  - Compression                                   │  │  │
│  │  │  - Rate Limiting                                 │  │  │
│  │  │  - Request ID                                    │  │  │
│  │  │  - Logging                                       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Controllers                                    │  │  │
│  │  │  - AuthController                               │  │  │
│  │  │  - ProductController                            │  │  │
│  │  │  - AuctionController                            │  │  │
│  │  │  - OrderController                              │  │  │
│  │  │  - ...                                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Services                                       │  │  │
│  │  │  - AuthService                                  │  │  │
│  │  │  - ProductService                               │  │  │
│  │  │  - AuctionService                               │  │  │
│  │  │  - OrderService                                 │  │  │
│  │  │  - ...                                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Repositories                                   │  │  │
│  │  │  - ProductRepository                            │  │  │
│  │  │  - AuctionRepository                            │  │  │
│  │  │  - OrderRepository                              │  │  │
│  │  │  - ...                                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   PostgreSQL   │  │     Redis      │  │  Background     │
│   Database     │  │     Cache       │  │     Jobs       │
│                │  │                 │  │   (Bull Queue) │
└────────────────┘  └─────────────────┘  └────────────────┘
        │                   │
        │                   │
┌───────▼───────────────────▼───────────────────────────────┐
│              External Services                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ AWS S3   │  │ Firebase │  │   SMS    │  │ Payment  │  │
│  │ (Files)  │  │   (FCM)  │  │ Service  │  │ Gateways │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## Application Architecture

### Module Structure

```
src/
├── modules/              # Feature modules (Domain-driven)
│   ├── auth/            # Authentication & Authorization
│   ├── user/            # User management
│   ├── product/         # Product management
│   ├── category/        # Category management
│   ├── auction/         # Auction system
│   ├── bid/             # Bidding system
│   ├── order/           # Order management
│   ├── review/          # Product reviews
│   ├── notification/    # Push notifications
│   ├── chat/            # Real-time messaging
│   ├── file/            # File upload/management
│   └── seller/          # Seller dashboard
│
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators (@Public, @Roles, etc.)
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards (JWT, Roles)
│   ├── interceptors/    # Request/Response interceptors
│   ├── dto/             # Shared DTOs
│   └── services/        # Shared services (Cache, Sentry)
│
├── config/              # Configuration management
│   ├── env.validation.ts
│   └── *.config.ts      # Feature-specific configs
│
├── prisma/              # Database layer
│   └── prisma.service.ts
│
├── redis/               # Redis client
│   └── redis.service.ts
│
├── infrastructure/      # External service integrations
│   ├── aws/             # AWS S3
│   ├── firebase/        # Firebase FCM
│   ├── sms/             # SMS service
│   └── telegram/        # Telegram notifications
│
├── health/              # Health checks
├── metrics/             # Metrics collection
└── jobs/                # Background jobs (Bull queues)
```

---

## Design Patterns

### 1. Repository Pattern

Each domain module uses a repository pattern to abstract database access:

```typescript
// Interface
interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  // ...
}

// Implementation
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}
  // ...
}
```

**Benefits:**
- Testability (easy to mock)
- Flexibility (can swap implementations)
- Separation of concerns

---

### 2. Service Layer Pattern

Business logic is encapsulated in service classes:

```typescript
@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cacheService: CacheService,
  ) {}
  
  async findAll(query: ProductQueryDto) {
    // Business logic here
    // - Validation
    // - Caching
    // - Data transformation
  }
}
```

**Benefits:**
- Single responsibility
- Reusability
- Easy to test

---

### 3. DTO Pattern

Data Transfer Objects for input/output validation:

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;
  
  @IsNumber()
  @Min(0)
  price!: number;
  // ...
}
```

**Benefits:**
- Type safety
- Validation
- API documentation (Swagger)

---

### 4. Dependency Injection

NestJS built-in DI container:

```typescript
@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cacheService: CacheService,
  ) {}
}
```

**Benefits:**
- Loose coupling
- Testability
- Maintainability

---

## Data Flow

### Request Flow

```
1. Client Request
   ↓
2. Middleware Stack
   - Helmet (Security)
   - CORS
   - Compression
   - Rate Limiting
   - Request ID Generation
   ↓
3. Guards
   - JwtAuthGuard (Authentication)
   - RolesGuard (Authorization)
   ↓
4. Interceptors
   - LoggingInterceptor
   - ResponseTimeInterceptor
   - RequestIdInterceptor
   ↓
5. Controller
   - Route handler
   - Parameter validation
   ↓
6. Service
   - Business logic
   - Cache check
   - Repository calls
   ↓
7. Repository
   - Database queries (Prisma)
   ↓
8. Response
   - ResponseInterceptor (standardize format)
   - Error handling
   ↓
9. Client Response
```

---

## Database Architecture

### Entity Relationship Diagram

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│   User   │──────│ Product  │──────│ Category │
└────┬─────┘      └────┬─────┘      └──────────┘
     │                 │
     │                 │
     │            ┌────▼─────┐
     │            │ Auction  │
     │            └────┬─────┘
     │                 │
     │            ┌────▼─────┐
     │            │   Bid    │
     │            └──────────┘
     │
     │            ┌──────────┐
     └────────────│  Order   │
                  └──────────┘
```

### Key Models

- **User**: Authentication, profiles, roles
- **Product**: Products with images, categories
- **Category**: Hierarchical categories
- **Auction**: Time-based auctions
- **Bid**: Auction bids
- **Order**: Purchase orders
- **Review**: Product reviews
- **Notification**: Push notifications
- **Conversation/Message**: Chat system
- **File**: File metadata

---

## Caching Strategy

### Cache-Aside Pattern

```
1. Check cache
   ↓
2. Cache hit? → Return cached data
   ↓
3. Cache miss? → Query database
   ↓
4. Store in cache
   ↓
5. Return data
```

### Cached Entities

- **Categories**: TTL 1 hour, invalidated on mutations
- **Products**: TTL 1 hour, invalidated on mutations
- **Product Lists**: TTL 30 minutes (only page 1, no search)

### Cache Keys

- Entity: `{prefix}:{id}` (e.g., `product:product-123`)
- List: `{prefix}:list:{hash}` (e.g., `product:list:abc123`)

---

## Background Jobs

### Job Queues (Bull)

1. **Auction Queue**
   - `end-expired` - End expired auctions (every 5 minutes)

2. **Auth Queue**
   - `clean-expired-otps` - Clean expired OTPs (every hour)

### Job Configuration

- **Retries**: 3 attempts
- **Backoff**: Exponential (2s, 4s, 8s)
- **Remove on complete**: true
- **Remove on fail**: false (for debugging)

---

## Security Architecture

### Authentication Flow

```
1. User sends phone number
   ↓
2. OTP sent via SMS
   ↓
3. User verifies OTP
   ↓
4. Access token + Refresh token issued
   ↓
5. Access token used for API calls
   ↓
6. Refresh token used to get new access token
```

### Authorization

- **Role-Based Access Control (RBAC)**
  - Admin: Full access
  - Moderator: Content moderation
  - Seller: Product management
  - User: Basic access

- **Resource-Based Authorization**
  - Users can only modify their own resources
  - Sellers can only modify their own products

---

## Error Handling

### Exception Filter Chain

```
1. ValidationExceptionFilter
   ↓ (if BadRequestException)
2. HttpExceptionFilter
   ↓ (if HttpException)
3. AllExceptionsFilter
   ↓ (catch-all)
4. Sentry (if enabled)
   ↓
5. Standardized error response
```

### Error Response Format

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

---

## API Design Principles

### RESTful Conventions

- **GET** - Retrieve resources
- **POST** - Create resources
- **PATCH** - Update resources (partial)
- **DELETE** - Delete resources

### Response Standardization

All responses follow consistent format:
- Success responses include `success: true`, `data`, `meta`
- Error responses include `success: false`, `error`, `statusCode`
- Paginated responses include `meta.pagination`

### API Versioning

- Current version: `v1`
- Configurable via `API_VERSION` environment variable
- Path: `/api/v1/...`

---

## Performance Optimizations

### Database

- **Connection Pooling**: Max 20, Min 5 (production)
- **Indexes**: On foreign keys, search fields, status fields
- **Query Optimization**: Raw SQL for analytics
- **Slow Query Monitoring**: Logs queries > threshold

### Caching

- **Redis**: In-memory caching
- **Cache-Aside Pattern**: Service-level caching
- **TTL-Based Expiration**: Automatic cache invalidation
- **Cache Invalidation**: On mutations (create/update/delete)

### Background Jobs

- **Async Processing**: Heavy operations in queues
- **Retry Logic**: Automatic retries with backoff
- **Job Scheduling**: Cron-based scheduling

---

## Deployment Architecture

### Docker Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Stack             │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   App    │  │ Postgres │  │ Redis  │ │
│  │ Container│  │Container│  │Container││
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
```

### Production Setup

- **Multi-stage Docker builds**
- **Non-root user** in containers
- **Health checks** configured
- **Resource limits** set
- **Graceful shutdown** handling

---

## Monitoring & Observability

### Health Checks

- `/api/v1/health` - Basic health
- `/api/v1/health/detailed` - Detailed metrics
- `/api/v1/health/readiness` - Readiness probe
- `/api/v1/health/liveness` - Liveness probe

### Metrics

- `/api/v1/metrics` - Prometheus format
- Response time tracking
- Slow query monitoring
- Connection pool monitoring

### Logging

- **Winston** - Structured JSON logging
- **Request ID** - Track requests across services
- **Log Levels** - Environment-based (info in prod, debug in dev)

---

## Technology Stack

### Core

- **NestJS** - Framework
- **TypeScript** - Language
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Cache & Queues

### External Services

- **AWS S3** - File storage
- **Firebase** - Push notifications
- **SMS Service** - OTP delivery
- **Payment Gateways** - Payme, Click

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Bull** - Job queues
- **Sentry** - Error tracking

---

## Scalability Considerations

### Horizontal Scaling

- **Stateless API** - Can scale horizontally
- **Redis** - Shared state (cache, sessions, queues)
- **Database Pooling** - Connection management
- **Load Balancer Ready** - No sticky sessions needed

### Vertical Scaling

- **Connection Pool** - Configurable pool size
- **Resource Limits** - Docker resource constraints
- **Background Jobs** - Separate worker processes

---

## Future Improvements

### Planned

- [ ] Read replicas for database
- [ ] CDN for static assets
- [ ] API Gateway (Kong/AWS API Gateway)
- [ ] GraphQL support
- [ ] Webhook system
- [ ] Advanced analytics

---

**Last Updated:** January 2026

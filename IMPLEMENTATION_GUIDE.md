# Implementation Guide: Production Readiness Improvements

This guide provides step-by-step instructions for implementing the critical production readiness improvements.

---

## 🔴 **1. Testing (Critical)**

### 1.1 Add Unit Tests for Critical Services

#### Step 1: Create Unit Test for ProductService

**File:** `src/modules/product/product.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from '../category/repositories/category.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/services/cache.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatus, UserRole } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: jest.Mocked<ProductRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let prismaService: jest.Mocked<PrismaService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            findById: jest.fn(),
            findBySlug: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            product: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            productImage: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            invalidateEntity: jest.fn(),
            generateKey: jest.fn(),
            generateListKey: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(ProductRepository);
    categoryRepository = module.get(CategoryRepository);
    prismaService = module.get(PrismaService);
    cacheService = module.get(CacheService);
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const dto: CreateProductDto = {
        title: 'Test Product',
        description: 'Test description',
        price: 100000,
        categoryId: 'category-1',
      };
      const sellerId = 'seller-1';

      categoryRepository.findById.mockResolvedValue({
        id: 'category-1',
        name: 'Test Category',
        isActive: true,
        deletedAt: null,
      } as any);

      productRepository.findBySlug.mockResolvedValue(null);
      prismaService.productImage.findMany.mockResolvedValue([]);
      productRepository.create.mockResolvedValue({
        id: 'product-1',
        ...dto,
        sellerId,
        status: ProductStatus.ACTIVE,
      } as any);

      cacheService.invalidateEntity.mockResolvedValue(undefined);

      const result = await service.createProduct(dto, sellerId);

      expect(result).toBeDefined();
      expect(productRepository.create).toHaveBeenCalled();
      expect(cacheService.invalidateEntity).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      const dto: CreateProductDto = {
        title: 'Test Product',
        categoryId: 'invalid-category',
      };

      categoryRepository.findById.mockResolvedValue(null);

      await expect(service.createProduct(dto, 'seller-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if product with same title exists', async () => {
      const dto: CreateProductDto = {
        title: 'Existing Product',
        categoryId: 'category-1',
      };

      categoryRepository.findById.mockResolvedValue({
        id: 'category-1',
        isActive: true,
        deletedAt: null,
      } as any);

      productRepository.findBySlug.mockResolvedValue({
        id: 'existing-product',
      } as any);

      await expect(service.createProduct(dto, 'seller-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return product from cache if available', async () => {
      const productId = 'product-1';
      const cachedProduct = { id: productId, title: 'Cached Product' };

      cacheService.generateKey.mockReturnValue('product:product-1');
      cacheService.get.mockResolvedValue(cachedProduct as any);

      const result = await service.findById(productId, false);

      expect(result).toEqual(cachedProduct);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      const productId = 'invalid-product';

      cacheService.generateKey.mockReturnValue('product:invalid-product');
      cacheService.get.mockResolvedValue(null);
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findById(productId, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

#### Step 2: Create Unit Test for OrderService

**File:** `src/modules/order/order.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderRepository } from './repositories/order.repository';
import { ProductRepository } from '../product/repositories/product.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: jest.Mocked<OrderRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            order: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get(OrderRepository);
    productRepository = module.get(ProductRepository);
    prismaService = module.get(PrismaService);
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const dto: CreateOrderDto = {
        productId: 'product-1',
        quantity: 1,
      };
      const userId = 'user-1';

      productRepository.findById.mockResolvedValue({
        id: 'product-1',
        price: 100000,
        quantity: 5,
        status: 'ACTIVE',
      } as any);

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(prismaService);
      });

      orderRepository.create.mockResolvedValue({
        id: 'order-1',
        ...dto,
        userId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      } as any);

      const result = await service.createOrder(dto, userId);

      expect(result).toBeDefined();
      expect(orderRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      const dto: CreateOrderDto = {
        productId: 'invalid-product',
        quantity: 1,
      };

      productRepository.findById.mockResolvedValue(null);

      await expect(service.createOrder(dto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

#### Step 3: Run Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### 1.2 Add Integration Tests

#### Step 1: Create Integration Test for Auth Flow

**File:** `test/integration/auth.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { cleanupTestData, createTestVerificationCode } from '../helpers/test-helpers';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /api/v1/auth/send-otp', () => {
    it('should send OTP successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({ phoneNumber: '+998901234567' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toBeDefined();
        });
    });

    it('should return 400 for invalid phone number', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({ phoneNumber: 'invalid' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should verify OTP and return tokens', async () => {
      const phoneNumber = '+998901234568';
      
      // Create verification code
      await createTestVerificationCode(phoneNumber, '123456');

      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phoneNumber,
          code: '123456',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.accessToken).toBeDefined();
          expect(res.body.data.refreshToken).toBeDefined();
        });
    });

    it('should return 401 for invalid OTP', async () => {
      const phoneNumber = '+998901234569';
      await createTestVerificationCode(phoneNumber, '123456');

      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phoneNumber,
          code: 'wrong-code',
        })
        .expect(401);
    });
  });
});
```

#### Step 2: Create Integration Test for Order Creation

**File:** `test/integration/order.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  cleanupTestData,
  createTestUser,
  createTestProduct,
} from '../helpers/test-helpers';
import { AuthService } from '../../src/modules/auth/auth.service';

describe('Order Creation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let accessToken: string;
  let userId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>();
    authService = moduleFixture.get<AuthService>();

    // Create test user and get token
    const user = await createTestUser();
    userId = user.id;
    
    // Create test product
    const product = await createTestProduct({ sellerId: userId });
    productId = product.id;

    // Get access token (simplified - in real test, use actual auth flow)
    const tokens = await authService.verifyOtp({
      phoneNumber: user.phoneNumber,
      code: '123456',
    });
    accessToken = tokens.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /api/v1/orders', () => {
    it('should create an order successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId,
          quantity: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.status).toBe('PENDING');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          productId,
          quantity: 1,
        })
        .expect(401);
    });
  });
});
```

#### Step 3: Update Jest E2E Config

**File:** `test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "setupFilesAfterEnv": ["<rootDir>/setup.ts"],
  "testTimeout": 30000
}
```

---

## 🟡 **2. Monitoring & Alerting (Important)**

### 2.1 Set Up Sentry Alerts

#### Step 1: Configure Sentry Alerts in Sentry Dashboard

1. **Go to Sentry Dashboard** → Your Project → Alerts
2. **Create Alert Rule:**
   - **Name:** "High Error Rate"
   - **Condition:** When the number of events in the last 5 minutes is greater than 50
   - **Action:** Send email/Slack notification
   - **Frequency:** Once per 5 minutes

3. **Create Alert Rule for Critical Errors:**
   - **Name:** "Critical Errors (5xx)"
   - **Condition:** When an issue's level is "error" and status code is 5xx
   - **Action:** Send immediate notification

#### Step 2: Add Sentry Alert Configuration in Code

**File:** `src/config/sentry.config.ts` (update)

```typescript
import * as Sentry from '@sentry/node';
import * as SentryTracing from '@sentry/profiling-node';

export const initSentry = () => {
  if (process.env.SENTRY_DSN && process.env.SENTRY_ENABLED === 'true') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Alert configuration
      beforeSend(event, hint) {
        // Filter out non-critical errors in production
        if (process.env.NODE_ENV === 'production') {
          // Only send errors with status >= 500
          if (event.level === 'error' && event.contexts?.response?.status_code < 500) {
            return null;
          }
        }
        return event;
      },
      
      // Set release version
      release: process.env.npm_package_version || '1.0.0',
      
      // Configure integrations
      integrations: [
        new SentryTracing.ProfilingIntegration(),
      ],
    });
  }
};
```

#### Step 3: Add Custom Error Tracking

**File:** `src/common/services/sentry.service.ts` (update)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);

  captureException(exception: unknown, context?: Record<string, unknown>) {
    if (process.env.SENTRY_ENABLED === 'true') {
      Sentry.captureException(exception, {
        tags: {
          component: 'backend',
        },
        extra: context,
      });
    } else {
      this.logger.error('Exception (Sentry disabled):', exception);
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (process.env.SENTRY_ENABLED === 'true') {
      Sentry.captureMessage(message, level);
    } else {
      this.logger.log(`Message (Sentry disabled): ${message}`);
    }
  }

  // Add custom metric tracking
  trackMetric(name: string, value: number, tags?: Record<string, string>) {
    if (process.env.SENTRY_ENABLED === 'true') {
      Sentry.metrics.distribution(name, value, {
        tags,
        unit: 'none',
      });
    }
  }
}
```

### 2.2 Set Up Uptime Monitoring

#### Option 1: Using UptimeRobot (Free)

1. **Sign up at** https://uptimerobot.com
2. **Add Monitor:**
   - **Type:** HTTP(s)
   - **URL:** `https://your-api.com/api/v1/health/readiness`
   - **Interval:** 5 minutes
   - **Alert Contacts:** Your email/Slack

#### Option 2: Using Pingdom (Paid)

1. **Sign up at** https://www.pingdom.com
2. **Create Check:**
   - **URL:** `https://your-api.com/api/v1/health/readiness`
   - **Interval:** 1 minute
   - **Alert:** Email/SMS/Slack

#### Option 3: Self-Hosted Monitoring

If you prefer self-hosted monitoring, you can use:
- **Prometheus + Grafana** for metrics and alerting
- **Nagios** for infrastructure monitoring
- **Zabbix** for comprehensive monitoring

Or set up a simple cron job:
```bash
# Add to crontab: */5 * * * * curl -f http://localhost:3000/api/v1/health/readiness || echo "API down" | mail -s "Alert" admin@example.com
```

---

## 🟡 **3. Database Backups (Important)**

### 3.1 Set Up Automated Backups

#### Option 1: Using Cloud Provider (Recommended)

**AWS RDS:**
- Enable automated backups in RDS console
- Set backup retention period (7-35 days)
- Enable point-in-time recovery

**Google Cloud SQL:**
- Enable automated backups
- Set backup window
- Configure retention period

**DigitalOcean:**
- Enable daily backups in database settings
- Set retention period

#### Option 2: Using Managed Database Service

Most managed PostgreSQL services (Heroku Postgres, Supabase, Neon, etc.) provide:
- Automatic daily backups
- Point-in-time recovery
- Backup retention policies

#### Option 3: Manual Backup Commands

**Create backup:**
```bash
pg_dump -h localhost -U postgres -d second_bloom | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Restore backup:**
```bash
gunzip -c backup_20260101.sql.gz | psql -h localhost -U postgres -d second_bloom
```

**Schedule with cron (if self-hosted):**
```bash
# Add to crontab (daily at 2 AM)
0 2 * * * pg_dump -h localhost -U postgres -d second_bloom | gzip > /backups/backup_$(date +\%Y\%m\%d).sql.gz
```

### 3.2 Document Backup Strategy

Update `DEPLOYMENT.md` with:
- Backup frequency
- Backup retention policy
- Restore procedures
- Backup verification steps

---

## 📋 **Quick Start Checklist**

### Week 1: Critical Items

- [ ] **Day 1-2:** Add unit tests for ProductService, OrderService, AuctionService
- [ ] **Day 3:** Add integration tests for auth flow and order creation
- [ ] **Day 4:** Set up Sentry alerts (dashboard configuration)
- [ ] **Day 5:** Set up uptime monitoring (UptimeRobot or script)
- [ ] **Day 5:** Create database backup scripts

### Week 2: Important Items

- [ ] Set up automated backup cron job
- [ ] Test backup restore procedure
- [ ] Add APM tool (optional)
- [ ] Create monitoring dashboards
- [ ] Performance testing

---

## 🧪 **Testing Commands**

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test -- product.service.spec.ts

# Watch mode
npm run test:watch
```

---

## 📊 **Monitoring Commands**

```bash
# Check health endpoint
curl -X GET http://localhost:3000/api/v1/health

# Check readiness
curl -X GET http://localhost:3000/api/v1/health/readiness

# Manual database backup
pg_dump -h localhost -U postgres -d second_bloom | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore backup (CAREFUL!)
gunzip -c backup_20260101.sql.gz | psql -h localhost -U postgres -d second_bloom
```

---

## 🔗 **Useful Resources**

- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **NestJS Testing:** https://docs.nestjs.com/fundamentals/testing
- **Sentry Alerts:** https://docs.sentry.io/product/alerts/
- **UptimeRobot:** https://uptimerobot.com
- **PostgreSQL Backup:** https://www.postgresql.org/docs/current/backup.html

---

**Next Steps:** Start with unit tests, then move to integration tests, then set up monitoring and backups.

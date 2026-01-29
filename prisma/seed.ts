import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('🧹 Cleaning existing data...');
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.condition.deleteMany();
  await prisma.size.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Seeding users...');
  const admin = await prisma.user.create({
    data: {
      phoneNumber: '+998901234567',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@secondbloom.uz',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      balance: 0,
      publicationCredits: 100,
      region: 'Tashkent',
      city: 'Tashkent',
      district: 'Yunusabad',
    },
  });

  const moderator = await prisma.user.create({
    data: {
      phoneNumber: '+998901234568',
      firstName: 'Moderator',
      lastName: 'User',
      email: 'moderator@secondbloom.uz',
      role: 'MODERATOR',
      isVerified: true,
      isActive: true,
      balance: 0,
      publicationCredits: 50,
      region: 'Tashkent',
      city: 'Tashkent',
      district: 'Chilanzar',
    },
  });

  const sellers = await Promise.all([
    prisma.user.create({
      data: {
        phoneNumber: '+998901234569',
        firstName: 'Ali',
        lastName: 'Karimov',
        email: 'ali.karimov@example.com',
        role: 'USER',
        isVerified: true,
        isActive: true,
        balance: 500000,
        publicationCredits: 20,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Mirobod',
        rating: 4.8,
        totalRatings: 15,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+998901234570',
        firstName: 'Dilshod',
        lastName: 'Rakhimov',
        email: 'dilshod.rakhimov@example.com',
        role: 'USER',
        isVerified: true,
        isActive: true,
        balance: 300000,
        publicationCredits: 15,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Uchtepa',
        rating: 4.5,
        totalRatings: 8,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+998901234571',
        firstName: 'Malika',
        lastName: 'Toshmatova',
        email: 'malika.toshmatova@example.com',
        role: 'USER',
        isVerified: true,
        isActive: true,
        balance: 750000,
        publicationCredits: 30,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Sergeli',
        rating: 4.9,
        totalRatings: 25,
      },
    }),
  ]);

  const buyers = await Promise.all([
    prisma.user.create({
      data: {
        phoneNumber: '+998901234572',
        firstName: 'Bobur',
        lastName: 'Ismoilov',
        email: 'bobur.ismoilov@example.com',
        role: 'USER',
        isVerified: true,
        isActive: true,
        balance: 200000,
        publicationCredits: 5,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Yakkasaroy',
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+998901234573',
        firstName: 'Gulnora',
        lastName: 'Saidova',
        email: 'gulnora.saidova@example.com',
        role: 'USER',
        isVerified: true,
        isActive: true,
        balance: 150000,
        publicationCredits: 3,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Olmazor',
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+998901234574',
        firstName: 'Javohir',
        lastName: 'Nurmatov',
        email: 'javohir.nurmatov@example.com',
        role: 'USER',
        isVerified: false,
        isActive: true,
        balance: 0,
        publicationCredits: 0,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Shaykhontohur',
      },
    }),
  ]);

  const allUsers = [admin, moderator, ...sellers, ...buyers];
  console.log(`✅ Created ${allUsers.length} users`);

  console.log('📁 Seeding categories...');
  const flowersCategory = await prisma.category.create({
    data: {
      name: 'Flowers',
      slug: 'flowers',
      description: 'Fresh and beautiful flowers for all occasions',
      order: 1,
    },
  });

  const rosesCategory = await prisma.category.create({
    data: {
      name: 'Roses',
      slug: 'roses',
      description: 'Various types of roses',
      parentId: flowersCategory.id,
      order: 1,
    },
  });

  const tulipsCategory = await prisma.category.create({
    data: {
      name: 'Tulips',
      slug: 'tulips',
      description: 'Colorful tulips',
      parentId: flowersCategory.id,
      order: 2,
    },
  });

  const orchidsCategory = await prisma.category.create({
    data: {
      name: 'Orchids',
      slug: 'orchids',
      description: 'Exotic orchids',
      parentId: flowersCategory.id,
      order: 3,
    },
  });

  const bouquetsCategory = await prisma.category.create({
    data: {
      name: 'Bouquets',
      slug: 'bouquets',
      description: 'Beautiful flower bouquets',
      parentId: flowersCategory.id,
      order: 4,
    },
  });

  const plantsCategory = await prisma.category.create({
    data: {
      name: 'Plants',
      slug: 'plants',
      description: 'Indoor and outdoor plants',
      order: 2,
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Flower accessories and supplies',
      order: 3,
    },
  });

  const categories = [
    flowersCategory,
    rosesCategory,
    tulipsCategory,
    orchidsCategory,
    bouquetsCategory,
    plantsCategory,
    accessoriesCategory,
  ];
  console.log(`✅ Created ${categories.length} categories`);

  console.log('📋 Seeding conditions...');
  const [
    conditionFreshest,
    conditionGoodCondition,
    conditionLosingFreshness,
    conditionSlightlyWilted,
    conditionNoticeablyWilting,
    conditionWilted,
  ] = await Promise.all([
    prisma.condition.create({
      data: { name: 'Freshest', slug: 'freshest' },
    }),
    prisma.condition.create({
      data: { name: 'Good condition', slug: 'good-condition' },
    }),
    prisma.condition.create({
      data: { name: 'Losing freshness', slug: 'losing-freshness' },
    }),
    prisma.condition.create({
      data: { name: 'Slightly wilted', slug: 'slightly-wilted' },
    }),
    prisma.condition.create({
      data: { name: 'Noticeably wilting', slug: 'noticeably-wilting' },
    }),
    prisma.condition.create({
      data: { name: 'Wilted', slug: 'wilted' },
    }),
  ]);
  console.log('✅ Created 6 conditions');

  console.log('📐 Seeding sizes...');
  const [sizeSmall, sizeMedium, sizeVoluminous, sizeLarge, sizeHuge] =
    await Promise.all([
      prisma.size.create({
        data: { name: 'Small', slug: 'small' },
      }),
      prisma.size.create({
        data: { name: 'Medium', slug: 'medium' },
      }),
      prisma.size.create({
        data: { name: 'Voluminous', slug: 'voluminous' },
      }),
      prisma.size.create({
        data: { name: 'Large', slug: 'large' },
      }),
      prisma.size.create({
        data: { name: 'Huge', slug: 'huge' },
      }),
    ]);
  console.log('✅ Created 5 sizes');

  console.log('🌹 Seeding products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Red Roses Bouquet',
        slug: 'red-roses-bouquet',
        description:
          'Beautiful fresh red roses bouquet perfect for romantic occasions. 12 stems of premium quality roses.',
        price: 150000,
        currency: 'UZS',
        categoryId: rosesCategory.id,
        tags: ['roses', 'bouquet', 'romantic', 'red'],
        type: 'FRESH',
        conditionId: conditionFreshest.id,
        sizeId: sizeLarge.id,
        quantity: 10,
        status: 'ACTIVE',
        isFeatured: true,
        views: 45,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Mirobod',
        sellerId: sellers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'White Tulips',
        slug: 'white-tulips',
        description:
          'Fresh white tulips, perfect for weddings and special events. 20 stems.',
        price: 120000,
        currency: 'UZS',
        categoryId: tulipsCategory.id,
        tags: ['tulips', 'white', 'wedding', 'fresh'],
        type: 'FRESH',
        conditionId: conditionFreshest.id,
        sizeId: sizeMedium.id,
        quantity: 15,
        status: 'ACTIVE',
        isFeatured: false,
        views: 32,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Mirobod',
        sellerId: sellers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Mixed Flower Bouquet',
        slug: 'mixed-flower-bouquet',
        description:
          'Colorful mixed flower bouquet with roses, tulips, and baby breath. Perfect gift.',
        price: 200000,
        currency: 'UZS',
        categoryId: bouquetsCategory.id,
        tags: ['bouquet', 'mixed', 'colorful', 'gift'],
        type: 'FRESH',
        conditionId: conditionFreshest.id,
        sizeId: sizeVoluminous.id,
        quantity: 8,
        status: 'ACTIVE',
        isFeatured: true,
        views: 67,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Mirobod',
        sellerId: sellers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Pink Orchids',
        slug: 'pink-orchids',
        description:
          'Exotic pink orchids in elegant pot. Perfect for home decoration.',
        price: 180000,
        currency: 'UZS',
        categoryId: orchidsCategory.id,
        tags: ['orchids', 'pink', 'pot', 'decoration'],
        type: 'FRESH',
        conditionId: conditionGoodCondition.id,
        sizeId: sizeMedium.id,
        quantity: 5,
        status: 'ACTIVE',
        isFeatured: false,
        views: 28,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Uchtepa',
        sellerId: sellers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Yellow Roses',
        slug: 'yellow-roses',
        description:
          'Bright yellow roses, symbol of friendship and joy. 15 stems.',
        price: 140000,
        currency: 'UZS',
        categoryId: rosesCategory.id,
        tags: ['roses', 'yellow', 'friendship', 'joy'],
        type: 'FRESH',
        conditionId: conditionFreshest.id,
        sizeId: sizeLarge.id,
        quantity: 12,
        status: 'ACTIVE',
        isFeatured: false,
        views: 19,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Uchtepa',
        sellerId: sellers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Wedding Flower Arrangement',
        slug: 'wedding-flower-arrangement',
        description:
          'Elegant wedding flower arrangement with white roses and eucalyptus. Perfect for ceremonies.',
        price: 350000,
        currency: 'UZS',
        categoryId: bouquetsCategory.id,
        tags: ['wedding', 'arrangement', 'white', 'elegant'],
        type: 'FRESH',
        conditionId: conditionFreshest.id,
        sizeId: sizeHuge.id,
        quantity: 3,
        status: 'ACTIVE',
        isFeatured: true,
        views: 89,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Sergeli',
        sellerId: sellers[2].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Purple Tulips',
        slug: 'purple-tulips',
        description: 'Beautiful purple tulips, rare and elegant. 18 stems.',
        price: 160000,
        currency: 'UZS',
        categoryId: tulipsCategory.id,
        tags: ['tulips', 'purple', 'rare', 'elegant'],
        type: 'FRESH',
        conditionId: conditionFreshest.id,
        sizeId: sizeMedium.id,
        quantity: 7,
        status: 'ACTIVE',
        isFeatured: false,
        views: 41,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Sergeli',
        sellerId: sellers[2].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Indoor Plant Collection',
        slug: 'indoor-plant-collection',
        description:
          'Set of 3 beautiful indoor plants: Monstera, Fiddle Leaf Fig, and Snake Plant.',
        price: 250000,
        currency: 'UZS',
        categoryId: plantsCategory.id,
        tags: ['plants', 'indoor', 'collection', 'decorative'],
        type: 'RESALE',
        conditionId: conditionGoodCondition.id,
        sizeId: sizeLarge.id,
        quantity: 4,
        status: 'ACTIVE',
        isFeatured: false,
        views: 56,
        region: 'Tashkent',
        city: 'Tashkent',
        district: 'Sergeli',
        sellerId: sellers[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  console.log('📦 Seeding orders...');
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-1`,
        buyerId: buyers[0].id,
        productId: products[0].id,
        amount: 150000,
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        shippingAddress: 'Yakkasaroy district, Amir Temur street, 45',
        notes: 'Please deliver in the morning',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-2`,
        buyerId: buyers[1].id,
        productId: products[3].id,
        amount: 180000,
        status: 'SHIPPED',
        paymentStatus: 'COMPLETED',
        shippingAddress: 'Olmazor district, Navoi street, 12',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-3`,
        buyerId: buyers[0].id,
        productId: products[5].id,
        amount: 350000,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingAddress: 'Yakkasaroy district, Bunyodkor avenue, 78',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} orders`);

  console.log('🔨 Seeding auctions...');
  const auctions = await Promise.all([
    prisma.auction.create({
      data: {
        productId: products[1].id,
        creatorId: sellers[0].id,
        startPrice: 100000,
        currentPrice: 100000,
        bidIncrement: 5000,
        minBidAmount: 5000,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
        durationHours: 24,
        status: 'ACTIVE',
        autoExtend: true,
        extendMinutes: 5,
        views: 23,
        totalBids: 0,
      },
    }),
    prisma.auction.create({
      data: {
        productId: products[4].id,
        creatorId: sellers[1].id,
        startPrice: 120000,
        currentPrice: 135000,
        bidIncrement: 10000,
        minBidAmount: 10000,
        startTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 19 * 60 * 60 * 1000),
        durationHours: 24,
        status: 'ACTIVE',
        autoExtend: true,
        extendMinutes: 5,
        views: 45,
        totalBids: 2,
        lastBidAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    prisma.auction.create({
      data: {
        productId: products[7].id,
        creatorId: sellers[2].id,
        startPrice: 200000,
        currentPrice: 200000,
        bidIncrement: 15000,
        minBidAmount: 15000,
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        durationHours: 24,
        status: 'ENDED',
        autoExtend: false,
        views: 67,
        totalBids: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${auctions.length} auctions`);

  console.log('💰 Seeding bids...');
  const bids = await Promise.all([
    prisma.bid.create({
      data: {
        auctionId: auctions[1].id,
        bidderId: buyers[0].id,
        amount: 125000,
        isWinning: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.bid.create({
      data: {
        auctionId: auctions[1].id,
        bidderId: buyers[1].id,
        amount: 135000,
        isWinning: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
  ]);

  await prisma.auction.update({
    where: { id: auctions[1].id },
    data: { winnerId: buyers[1].id },
  });

  console.log(`✅ Created ${bids.length} bids`);

  console.log('⭐ Seeding reviews...');
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        reviewerId: buyers[0].id,
        revieweeId: sellers[0].id,
        productId: products[0].id,
        orderId: orders[0].id,
        rating: 5,
        comment:
          'Excellent quality roses! Very fresh and beautiful. Highly recommended!',
        isVerified: true,
        helpfulCount: 3,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.review.create({
      data: {
        reviewerId: buyers[1].id,
        revieweeId: sellers[1].id,
        productId: products[3].id,
        orderId: orders[1].id,
        rating: 4,
        comment: 'Good quality orchids, arrived in perfect condition.',
        isVerified: true,
        helpfulCount: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  console.log('❤️ Seeding favorites...');
  const favorites = await Promise.all([
    prisma.favorite.create({
      data: {
        userId: buyers[0].id,
        productId: products[2].id,
      },
    }),
    prisma.favorite.create({
      data: {
        userId: buyers[0].id,
        productId: products[5].id,
      },
    }),
    prisma.favorite.create({
      data: {
        userId: buyers[1].id,
        productId: products[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        userId: buyers[1].id,
        productId: products[6].id,
      },
    }),
  ]);

  console.log(`✅ Created ${favorites.length} favorites`);

  console.log('🔔 Seeding notifications...');
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: buyers[0].id,
        type: 'ORDER_CONFIRMED',
        title: 'Order Confirmed',
        message: 'Your order ORD-123 has been confirmed',
        data: { orderId: orders[0].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: buyers[1].id,
        type: 'ORDER_SHIPPED',
        title: 'Order Shipped',
        message: 'Your order ORD-456 has been shipped',
        data: { orderId: orders[1].id },
        isRead: true,
        readAt: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        userId: sellers[0].id,
        type: 'SYSTEM',
        title: 'New Order',
        message: 'You have received a new order',
        data: { orderId: orders[0].id },
      },
    }),
  ]);

  console.log(`✅ Created ${notifications.length} notifications`);

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${allUsers.length}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Orders: ${orders.length}`);
  console.log(`   - Auctions: ${auctions.length}`);
  console.log(`   - Bids: ${bids.length}`);
  console.log(`   - Reviews: ${reviews.length}`);
  console.log(`   - Favorites: ${favorites.length}`);
  console.log(`   - Notifications: ${notifications.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

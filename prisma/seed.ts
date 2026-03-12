import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const connectionString = process.env.DATABASE_URL;
if (connectionString.includes('sslmode=require')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const pool = new Pool({
  connectionString,
  ...(connectionString.includes('sslmode=require') && {
    ssl: { rejectUnauthorized: false },
  }),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('🧹 Cleaning existing data...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  console.log('   - Basic product models cleaned');
  await prisma.district.deleteMany();
  await prisma.city.deleteMany();
  await prisma.region.deleteMany();
  await prisma.country.deleteMany();
  console.log('   - Location models cleaned');
  await prisma.condition.deleteMany();
  await prisma.size.deleteMany();
  await prisma.category.deleteMany();
  console.log('   - Taxonomy models cleaned');
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.file.deleteMany();
  await prisma.publicationPricing.deleteMany();
  console.log('   - User and metadata cleaned');

  console.log('📍 Seeding locations (Uzbekistan)...');
  const tr = (en: string, ru: string, uz: string) => ({ en, ru, uz });

  const uzbekistan = await prisma.country.create({
    data: {
      name: tr('Uzbekistan', 'Узбекистан', "O'zbekiston"),
      code: 'UZ',
      isActive: true,
    },
  });

  const regionsData: { name: ReturnType<typeof tr> }[] = [
    { name: tr('Tashkent', 'Ташкент', 'Toshkent') },
    { name: tr('Tashkent City', 'Город Ташкент', 'Toshkent shahri') },
    { name: tr('Andijan', 'Андижан', 'Andijon') },
    { name: tr('Bukhara', 'Бухара', 'Buxoro') },
    { name: tr('Fergana', 'Фергана', "Farg'ona") },
    { name: tr('Jizzakh', 'Джизак', 'Jizzax') },
    { name: tr('Namangan', 'Наманган', 'Namangan') },
    { name: tr('Navoiy', 'Навои', 'Navoiy') },
    { name: tr('Qashqadaryo', 'Кашкадарья', 'Qashqadaryo') },
    { name: tr('Samarqand', 'Самарканд', 'Samarqand') },
    { name: tr('Sirdaryo', 'Сырдарья', 'Sirdaryo') },
    { name: tr('Surxondaryo', 'Сурхандарья', 'Surxondaryo') },
    { name: tr('Xorazm', 'Хорезм', 'Xorazm') },
    {
      name: tr(
        'Republic of Karakalpakstan',
        'Республика Каракалпакстан',
        "Qoraqalpog'iston Respublikasi",
      ),
    },
  ];
  const regions = await Promise.all(
    regionsData.map((r) =>
      prisma.region.create({
        data: {
          countryId: uzbekistan.id,
          name: r.name,
          isActive: true,
        },
      }),
    ),
  );

  const byRegionName = (key: string) =>
    regions.find((r) => (r.name as { en: string }).en === key)!;
  const tashkentRegion = byRegionName('Tashkent');
  const tashkentCityRegion = byRegionName('Tashkent City');
  const andijanRegion = byRegionName('Andijan');
  const bukharaRegion = byRegionName('Bukhara');
  const ferganaRegion = byRegionName('Fergana');
  const jizzakhRegion = byRegionName('Jizzakh');
  const namanganRegion = byRegionName('Namangan');
  const navoiyRegion = byRegionName('Navoiy');
  const qashqadaryoRegion = byRegionName('Qashqadaryo');
  const samarqandRegion = byRegionName('Samarqand');
  const sirdaryoRegion = byRegionName('Sirdaryo');
  const surxondaryoRegion = byRegionName('Surxondaryo');
  const xorazmRegion = byRegionName('Xorazm');
  const karakalpakstanRegion = byRegionName('Republic of Karakalpakstan');

  const citiesData: { name: ReturnType<typeof tr>; regionId: string }[] = [
    {
      name: tr('Tashkent', 'Ташкент', 'Toshkent'),
      regionId: tashkentRegion.id,
    },
    {
      name: tr('Tashkent', 'Ташкент', 'Toshkent'),
      regionId: tashkentCityRegion.id,
    },
    { name: tr('Andijan', 'Андижан', 'Andijon'), regionId: andijanRegion.id },
    { name: tr('Bukhara', 'Бухара', 'Buxoro'), regionId: bukharaRegion.id },
    { name: tr('Fergana', 'Фергана', "Farg'ona"), regionId: ferganaRegion.id },
    { name: tr('Jizzakh', 'Джизак', 'Jizzax'), regionId: jizzakhRegion.id },
    {
      name: tr('Namangan', 'Наманган', 'Namangan'),
      regionId: namanganRegion.id,
    },
    { name: tr('Navoiy', 'Навои', 'Navoiy'), regionId: navoiyRegion.id },
    { name: tr('Qarshi', 'Карши', 'Qarshi'), regionId: qashqadaryoRegion.id },
    {
      name: tr('Samarqand', 'Самарканд', 'Samarqand'),
      regionId: samarqandRegion.id,
    },
    {
      name: tr('Kattakurgan', 'Каттакурган', "Kattaqo'rg'on"),
      regionId: samarqandRegion.id,
    },
    {
      name: tr('Guliston', 'Гулистан', 'Guliston'),
      regionId: sirdaryoRegion.id,
    },
    { name: tr('Termiz', 'Термез', 'Termiz'), regionId: surxondaryoRegion.id },
    { name: tr('Urgench', 'Ургенч', 'Urganch'), regionId: xorazmRegion.id },
    { name: tr('Nukus', 'Нукус', 'Nukus'), regionId: karakalpakstanRegion.id },
    {
      name: tr('Nurafshon', 'Нурафшон', 'Nurafshon'),
      regionId: tashkentRegion.id,
    },
    { name: tr('Olmaliq', 'Олмалиқ', 'Olmaliq'), regionId: tashkentRegion.id },
    { name: tr('Angren', 'Ангрен', 'Angren'), regionId: tashkentRegion.id },
    { name: tr('Bekabad', 'Бекабад', 'Bekobod'), regionId: tashkentRegion.id },
    { name: tr('Chirchiq', 'Чирчик', 'Chirchiq'), regionId: tashkentRegion.id },
    {
      name: tr('Yangiyoʻl', 'Янгийўл', "Yangiyo'l"),
      regionId: tashkentRegion.id,
    },
    {
      name: tr('Oqqoʻrgʻon', 'Оққўрғон', "Oqqo'rg'on"),
      regionId: tashkentRegion.id,
    },
    { name: tr('Parkent', 'Паркент', 'Parkent'), regionId: tashkentRegion.id },
    { name: tr('Piskent', 'Пискент', 'Piskent'), regionId: tashkentRegion.id },
    { name: tr('Chinoz', 'Чиназ', 'Chinoz'), regionId: tashkentRegion.id },
    { name: tr('Keles', 'Келес', 'Keles'), regionId: tashkentRegion.id },
    {
      name: tr('Doʻstobod', 'Дўстобод', "Do'stobod"),
      regionId: tashkentRegion.id,
    },
    {
      name: tr('Bulungʻur', 'Булунғур', "Bulung'ur"),
      regionId: samarqandRegion.id,
    },
    {
      name: tr('Ishtixon', 'Иштихан', 'Ishtixon'),
      regionId: samarqandRegion.id,
    },
    { name: tr('Jomboy', 'Джомбой', 'Jomboy'), regionId: samarqandRegion.id },
    { name: tr('Payariq', 'Паяриқ', 'Payariq'), regionId: samarqandRegion.id },
    { name: tr('Urgut', 'Ургут', 'Urgut'), regionId: samarqandRegion.id },
    { name: tr('Oqtosh', 'Оқтош', 'Oqtosh'), regionId: samarqandRegion.id },
    { name: tr('Nurobod', 'Нуробод', 'Nurobod'), regionId: samarqandRegion.id },
    { name: tr('Toyloq', 'Тойлоқ', 'Toyloq'), regionId: samarqandRegion.id },
  ];
  const cities = await Promise.all(
    citiesData.map((c) =>
      prisma.city.create({
        data: {
          regionId: c.regionId,
          name: c.name,
          isActive: true,
        },
      }),
    ),
  );

  const tashkentCity = cities.find(
    (c) =>
      (c.name as { en: string }).en === 'Tashkent' &&
      c.regionId === tashkentCityRegion.id,
  )!;

  const tashkentCityDistricts: ReturnType<typeof tr>[] = [
    tr('Bektemir', 'Бектемир', 'Bektemir'),
    tr('Chilanzar', 'Чиланзар', 'Chilanzar'),
    tr('Yashnobod', 'Яшнабад', 'Yashnobod'),
    tr('Mirobod', 'Мирабад', 'Mirobod'),
    tr('Mirzo Ulugbek', 'Мирзо Улугбек', "Mirzo Ulug'bek"),
    tr('Sergeli', 'Сергели', 'Sergeli'),
    tr('Shayxontoxur', 'Шайхантохур', 'Shayxontoxur'),
    tr('Olmazor', 'Олмазор', 'Olmazor'),
    tr('Uchtepa', 'Учтепа', 'Uchtepa'),
    tr('Yakkasaray', 'Яккасарай', 'Yakkasaray'),
    tr('Yunusabad', 'Юнусабад', 'Yunusobod'),
    tr('Yangihayot', 'Янгихаёт', 'Yangihayot'),
  ];
  await Promise.all(
    tashkentCityDistricts.map((name) =>
      prisma.district.create({
        data: {
          cityId: tashkentCity.id,
          name,
          isActive: true,
        },
      }),
    ),
  );
  const tashkentDistricts = await prisma.district.findMany({
    where: { cityId: tashkentCity.id },
  });
  const byDistrictName = (en: string) =>
    tashkentDistricts.find((d) => (d.name as { en: string }).en === en)!;

  console.log(
    `   ${regions.length} regions, ${cities.length} cities, ${tashkentCityDistricts.length} districts (Tashkent city)`,
  );

  console.log('👤 Seeding files (avatars and product images)...');
  const avatarUrls = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
    'https://images.unsplash.com/photo-1548013146-72479768bbaa',
    'https://images.unsplash.com/photo-1520323232471-99b328329d5b',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  ];
  const avatarFiles = await Promise.all(
    avatarUrls.map((url, i) =>
      prisma.file.create({
        data: {
          url,
          key: `avatars/user${i + 1}.jpg`,
          filename: `user${i + 1}.jpg`,
          originalName: `avatar${i + 1}.jpg`,
          mimeType: 'image/jpeg',
          size: 1024 + i * 100,
          fileType: 'IMAGE',
        },
      }),
    ),
  );
  const dummyFiles = [
    ...avatarFiles,
    await prisma.file.create({
      data: {
        url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        key: 'products/roses.jpg',
        filename: 'roses.jpg',
        originalName: 'roses.jpg',
        mimeType: 'image/jpeg',
        size: 5120,
        fileType: 'IMAGE',
      },
    }),
    await prisma.file.create({
      data: {
        url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11',
        key: 'products/tulips.jpg',
        filename: 'tulips.jpg',
        originalName: 'tulips.jpg',
        mimeType: 'image/jpeg',
        size: 4096,
        fileType: 'IMAGE',
      },
    }),
  ];

  console.log('👥 Seeding users...');
  const phoneCountryCode = '+998';
  const admin = await prisma.user.create({
    data: {
      phoneCountryCode,
      phoneNumber: '901234567',
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
      avatarId: avatarFiles[0].id,
    },
  });

  const moderator = await prisma.user.create({
    data: {
      phoneCountryCode,
      phoneNumber: '901234568',
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
      avatarId: avatarFiles[1].id,
    },
  });

  const administrationChatUser = await prisma.user.create({
    data: {
      phoneCountryCode,
      phoneNumber: '904440041',
      firstName: 'SECOND BLOOM',
      lastName: 'Administration',
      role: 'ADMIN',
      isAdministrationChat: true,
      isVerified: true,
      isActive: true,
      balance: 0,
      publicationCredits: 0,
    },
  });

  const sellers = await Promise.all([
    prisma.user.create({
      data: {
        phoneCountryCode,
        phoneNumber: '901234569',
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
        avatarId: avatarFiles[2].id,
      },
    }),
    prisma.user.create({
      data: {
        phoneCountryCode,
        phoneNumber: '901234570',
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
        avatarId: avatarFiles[3].id,
      },
    }),
    prisma.user.create({
      data: {
        phoneCountryCode,
        phoneNumber: '901234571',
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
        avatarId: avatarFiles[4].id,
      },
    }),
  ]);

  const buyers = await Promise.all([
    prisma.user.create({
      data: {
        phoneCountryCode,
        phoneNumber: '901234572',
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
        avatarId: avatarFiles[5].id,
      },
    }),
    prisma.user.create({
      data: {
        phoneCountryCode,
        phoneNumber: '901234573',
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
        avatarId: avatarFiles[6].id,
      },
    }),
    prisma.user.create({
      data: {
        phoneCountryCode,
        phoneNumber: '901234574',
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

  const allUsers = [
    admin,
    moderator,
    administrationChatUser,
    ...sellers,
    ...buyers,
  ];
  console.log(
    `✅ Created ${allUsers.length} users (incl. administration chat)`,
  );

  console.log('📁 Seeding categories...');
  const flowersCategory = await prisma.category.create({
    data: {
      name: tr('Flowers', 'Цветы', 'Gullar'),
      slug: 'flowers',
      description: tr(
        'Fresh and beautiful flowers for all occasions',
        'Свежие и красивые цветы на любой случай',
        'Barcha tadbirlar uchun yangi va chiroyli gullar',
      ),
      order: 1,
    },
  });

  const rosesCategory = await prisma.category.create({
    data: {
      name: tr('Roses', 'Розы', 'Atirgullar'),
      slug: 'roses',
      description: tr(
        'Various types of roses',
        'Различные виды роз',
        'Turli xil atirgullar',
      ),
      parentId: flowersCategory.id,
      order: 1,
    },
  });

  const tulipsCategory = await prisma.category.create({
    data: {
      name: tr('Tulips', 'Тюльпаны', 'Lolalar'),
      slug: 'tulips',
      description: tr(
        'Colorful tulips',
        'Яркие тюльпаны',
        'Rang-barang lolalar',
      ),
      parentId: flowersCategory.id,
      order: 2,
    },
  });

  const orchidsCategory = await prisma.category.create({
    data: {
      name: tr('Orchids', 'Орхидеи', 'Orxideyalar'),
      slug: 'orchids',
      description: tr(
        'Exotic orchids',
        'Экзотические орхидеи',
        'Eksotik orxideyalar',
      ),
      parentId: flowersCategory.id,
      order: 3,
    },
  });

  const bouquetsCategory = await prisma.category.create({
    data: {
      name: tr('Bouquets', 'Букеты', 'Buketlar'),
      slug: 'bouquets',
      description: tr(
        'Beautiful flower bouquets',
        'Красивые цветочные букеты',
        'Chiroyli gul buketlari',
      ),
      parentId: flowersCategory.id,
      order: 4,
    },
  });

  const plantsCategory = await prisma.category.create({
    data: {
      name: tr('Plants', 'Растения', "O'simliklar"),
      slug: 'plants',
      description: tr(
        'Indoor and outdoor plants',
        'Комнатные и садовые растения',
        "Uy va bog' o'simliklari",
      ),
      order: 2,
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: tr('Accessories', 'Аксессуары', 'Aksessuarlar'),
      slug: 'accessories',
      description: tr(
        'Flower accessories and supplies',
        'Аксессуары и принадлежности для цветов',
        'Gul aksessuarlari va materiallari',
      ),
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
  const conditions = await Promise.all([
    prisma.condition.create({
      data: {
        name: tr('Freshest', 'Свежайшие', 'Eng yangi'),
        slug: 'freshest',
      },
    }),
    prisma.condition.create({
      data: {
        name: tr('Good condition', 'Хорошее состояние', 'Yaxshi holat'),
        slug: 'good-condition',
      },
    }),
    prisma.condition.create({
      data: {
        name: tr(
          'Losing freshness',
          'Теряет свежесть',
          "Yangilikni yo'qotmoqda",
        ),
        slug: 'losing-freshness',
      },
    }),
    prisma.condition.create({
      data: {
        name: tr('Slightly wilted', 'Немного увядшие', "Biroz so'lgan"),
        slug: 'slightly-wilted',
      },
    }),
    prisma.condition.create({
      data: {
        name: tr('Noticeably wilting', 'Заметно вянут', "Aniq so'lmoqda"),
        slug: 'noticeably-wilting',
      },
    }),
    prisma.condition.create({
      data: {
        name: tr('Wilted', 'Увядшие', "So'lgan"),
        slug: 'wilted',
      },
    }),
  ]);
  console.log('✅ Created 6 conditions');

  console.log('📐 Seeding sizes...');
  const sizes = await Promise.all([
    prisma.size.create({
      data: { name: tr('Small', 'Маленький', 'Kichik'), slug: 'small' },
    }),
    prisma.size.create({
      data: { name: tr('Medium', 'Средний', "O'rta"), slug: 'medium' },
    }),
    prisma.size.create({
      data: {
        name: tr('Voluminous', 'Объёмный', 'Hajmli'),
        slug: 'voluminous',
      },
    }),
    prisma.size.create({
      data: { name: tr('Large', 'Большой', 'Katta'), slug: 'large' },
    }),
    prisma.size.create({
      data: { name: tr('Huge', 'Огромный', 'Juda katta'), slug: 'huge' },
    }),
  ]);
  console.log('✅ Created 5 sizes');

  console.log('🌹 Seeding products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: tr(
          'Red Roses Bouquet',
          'Букет красных роз',
          'Qizil atirgullar buketi',
        ),
        slug: 'red-roses-bouquet',
        description: tr(
          'Beautiful fresh red roses bouquet perfect for romantic occasions. 12 stems of premium quality roses.',
          'Красивый букет свежих красных роз для романтических поводов. 12 стеблей роз премиум качества.',
          'Romantik tadbirlar uchun yangi qizil atirgullar buketi. 12 ta premium sifatida gul.',
        ),
        price: 150000,
        currency: 'UZS',
        categoryId: rosesCategory.id,
        tags: ['roses', 'bouquet', 'romantic', 'red'],
        type: 'FRESH',
        conditionId: conditions[0].id,
        sizeId: sizes[3].id,
        quantity: 10,
        status: 'PUBLISHED',
        isFeatured: true,
        views: 45,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Mirobod').id,
        sellerId: sellers[0].id,
        images: {
          create: [{ fileId: dummyFiles[8].id, displayOrder: 0 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: tr('White Tulips', 'Белые тюльпаны', 'Oq lolalar'),
        slug: 'white-tulips',
        description: tr(
          'Fresh white tulips, perfect for weddings and special events. 20 stems.',
          'Свежие белые тюльпаны для свадеб и торжеств. 20 стеблей.',
          "To'ylar va maxsus tadbirlar uchun yangi oq lolalar. 20 ta.",
        ),
        price: 120000,
        currency: 'UZS',
        categoryId: tulipsCategory.id,
        tags: ['tulips', 'white', 'wedding', 'fresh'],
        type: 'FRESH',
        conditionId: conditions[0].id,
        sizeId: sizes[1].id,
        quantity: 15,
        status: 'PUBLISHED',
        isFeatured: false,
        views: 32,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Mirobod').id,
        sellerId: sellers[0].id,
        images: {
          create: [{ fileId: dummyFiles[9].id, displayOrder: 0 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: tr(
          'Mixed Flower Bouquet',
          'Смешанный букет',
          'Aralash gul buketi',
        ),
        slug: 'mixed-flower-bouquet',
        description: tr(
          'Colorful mixed flower bouquet with roses, tulips, and baby breath. Perfect gift.',
          'Яркий смешанный букет из роз, тюльпанов и гипсофилы. Идеальный подарок.',
          "Atirgul, lola va boshqa gullardan aralash buket. Mukammal sovg'a.",
        ),
        price: 200000,
        currency: 'UZS',
        categoryId: bouquetsCategory.id,
        tags: ['bouquet', 'mixed', 'colorful', 'gift'],
        type: 'FRESH',
        conditionId: conditions[0].id,
        sizeId: sizes[2].id,
        quantity: 8,
        status: 'PUBLISHED',
        isFeatured: true,
        views: 67,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Mirobod').id,
        sellerId: sellers[0].id,
        images: {
          create: [{ fileId: dummyFiles[8].id, displayOrder: 0 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: tr('Pink Orchids', 'Розовые орхидеи', 'Pushti orxideyalar'),
        slug: 'pink-orchids',
        description: tr(
          'Exotic pink orchids in elegant pot. Perfect for home decoration.',
          'Экзотические розовые орхидеи в элегантном горшке. Идеально для интерьера.',
          'Elegant idishda eksotik pushti orxideyalar. Uy bezagi uchun.',
        ),
        price: 180000,
        currency: 'UZS',
        categoryId: orchidsCategory.id,
        tags: ['orchids', 'pink', 'pot', 'decoration'],
        type: 'FRESH',
        conditionId: conditions[1].id,
        sizeId: sizes[1].id,
        quantity: 5,
        status: 'PUBLISHED',
        isFeatured: false,
        views: 28,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Uchtepa').id,
        sellerId: sellers[1].id,
        images: {
          create: [{ fileId: dummyFiles[9].id, displayOrder: 0 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: tr('Yellow Roses', 'Жёлтые розы', 'Sariq atirgullar'),
        slug: 'yellow-roses',
        description: tr(
          'Bright yellow roses, symbol of friendship and joy. 15 stems.',
          'Яркие жёлтые розы — символ дружбы и радости. 15 стеблей.',
          "Do'stlik va quvonch ramzi — sariq atirgullar. 15 ta.",
        ),
        price: 140000,
        currency: 'UZS',
        categoryId: rosesCategory.id,
        tags: ['roses', 'yellow', 'friendship', 'joy'],
        type: 'FRESH',
        conditionId: conditions[0].id,
        sizeId: sizes[3].id,
        quantity: 12,
        status: 'PUBLISHED',
        isFeatured: false,
        views: 19,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Uchtepa').id,
        sellerId: sellers[1].id,
        images: {
          create: [{ fileId: dummyFiles[8].id, displayOrder: 0 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: tr(
          'Wedding Flower Arrangement',
          'Свадебная композиция',
          "To'y gul kompozitsiyasi",
        ),
        slug: 'wedding-flower-arrangement',
        description: tr(
          'Elegant wedding flower arrangement with white roses and eucalyptus. Perfect for ceremonies.',
          'Элегантная свадебная композиция из белых роз и эвкалипта. Идеально для церемоний.',
          "Oq atirgul va evkaliptdan to'y kompozitsiyasi. Marosimlar uchun.",
        ),
        price: 350000,
        currency: 'UZS',
        categoryId: bouquetsCategory.id,
        tags: ['wedding', 'arrangement', 'white', 'elegant'],
        type: 'FRESH',
        conditionId: conditions[0].id,
        sizeId: sizes[4].id,
        quantity: 3,
        status: 'PUBLISHED',
        isFeatured: true,
        views: 89,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Sergeli').id,
        sellerId: sellers[2].id,
        images: {
          create: [{ fileId: dummyFiles[9].id, displayOrder: 0 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: tr('Purple Tulips', 'Фиолетовые тюльпаны', 'Binafsha lolalar'),
        slug: 'purple-tulips',
        description: tr(
          'Beautiful purple tulips, rare and elegant. 18 stems.',
          'Красивые фиолетовые тюльпаны, редкие и элегантные. 18 стеблей.',
          'Kam uchraydigan binafsha lolalar. 18 ta.',
        ),
        price: 160000,
        currency: 'UZS',
        categoryId: tulipsCategory.id,
        tags: ['tulips', 'purple', 'rare', 'elegant'],
        type: 'FRESH',
        conditionId: conditions[0].id,
        sizeId: sizes[1].id,
        quantity: 7,
        status: 'PUBLISHED',
        isFeatured: false,
        views: 41,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Sergeli').id,
        sellerId: sellers[2].id,
        images: {
          create: [{ fileId: dummyFiles[8].id, displayOrder: 0 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: tr(
          'Indoor Plant Collection',
          'Коллекция комнатных растений',
          "Uy o'simliklari to'plami",
        ),
        slug: 'indoor-plant-collection',
        description: tr(
          'Set of 3 beautiful indoor plants: Monstera, Fiddle Leaf Fig, and Snake Plant.',
          'Набор из 3 комнатных растений: Монстера, Фикус лирата и Сансевиерия.',
          "3 ta uy o'simligi: Monstera, Fikus va Sanseviyeriya.",
        ),
        price: 250000,
        currency: 'UZS',
        categoryId: plantsCategory.id,
        tags: ['plants', 'indoor', 'collection', 'decorative'],
        type: 'RESALE',
        conditionId: conditions[1].id,
        sizeId: sizes[3].id,
        quantity: 4,
        status: 'PUBLISHED',
        isFeatured: false,
        views: 56,
        countryId: uzbekistan.id,
        regionId: tashkentCityRegion.id,
        cityId: tashkentCity.id,
        districtId: byDistrictName('Sergeli').id,
        sellerId: sellers[2].id,
        images: {
          create: [{ fileId: dummyFiles[9].id, displayOrder: 0 }],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);


  console.log('📦 Seeding orders...');
  const orderBase = Date.now();
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: `ORD-${orderBase}-1`,
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
        orderNumber: `ORD-${orderBase}-2`,
        buyerId: buyers[1].id,
        productId: products[3].id,
        amount: 180000,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingAddress: 'Yakkasaroy district, Bunyodkor avenue, 78',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `ORD-${orderBase}-3`,
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

  console.log('💬 Seeding conversations and messages...');
  const conversation = await prisma.conversation.create({
    data: {
      productId: products[0].id,
      orderId: orders[0].id,
      participants: {
        create: [
          { userId: admin.id, unreadCount: 0 },
          { userId: sellers[0].id, unreadCount: 1 },
        ],
      },
    },
  });

  const message1 = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: admin.id,
      content: 'Hello, I am interested in your Red Roses!',
    },
  });

  const message2 = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: sellers[0].id,
      content: 'Hello! Yes, they are very fresh. When would you like them?',
    },
  });

  const message3 = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: admin.id,
      content: 'I would like to have them by tomorrow evening. Is that possible?',
    },
  });

  const message4 = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: sellers[0].id,
      content: 'Yes, absolutely! I will prepare the bouquet for you.',
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageId: message4.id,
      lastMessageAt: message4.createdAt,
    },
  });

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${allUsers.length}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Conditions: 6`);
  console.log(`   - Sizes: 5`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Orders: ${orders.length}`);
  console.log(`   - Auctions: ${auctions.length}`);
  console.log(`   - Bids: ${bids.length}`);
  console.log(`   - Favorites: ${favorites.length}`);
  console.log(`   - Notifications: ${notifications.length}`);
  console.log(`   - Conversations: 1`);
  console.log(`   - Messages: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(JSON.stringify(e, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2));
    if (e.code === 'P2002') {
      console.error('Unique constraint failed on fields:', e.meta?.target);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

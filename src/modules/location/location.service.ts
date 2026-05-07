import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { TranslationRecord } from '../../common/i18n/translation.util';
import {
  CountryResponseDto,
  RegionResponseDto,
  DistrictResponseDto,
  CountrySelectionResponseDto,
} from './dto/location-response.dto';

const CITY_SLUG_TO_EN: Record<string, string> = {
  tashkent: 'Tashkent',
  samarkand: 'Samarqand',
  bukhara: 'Bukhara',
  khiva: 'Khiva',
  namangan: 'Namangan',
  andijan: 'Andijan',
  fergana: 'Fergana',
  karshi: 'Qarshi',
  nukus: 'Nukus',
  urgench: 'Urgench',
  jizzakh: 'Jizzakh',
  navoi: 'Navoiy',
  termez: 'Termiz',
  gulistan: 'Guliston',

  //kz
  almaty: 'Almaty',
  astana: 'Astana',
  shymkent: 'Shymkent',
  karaganda: 'Karaganda',
  aktobe: 'Aktobe',
  taraz: 'Taraz',
  pavlodar: 'Pavlodar',
  'ust-kamenogorsk': 'Ust-Kamenogorsk',
  semey: 'Semey',
  kostanay: 'Kostanay',
  kyzylorda: 'Kyzylorda',
  uralsk: 'Uralsk',
  petropavlovsk: 'Petropavlovsk',
  aktau: 'Aktau',
  atyrau: 'Atyrau',
  taldykorgan: 'Taldykorgan',
  kokshetau: 'Kokshetau',
  turkestan: 'Turkestan',
};

const COUNTRY_SLUG_TO_ISO: Record<string, string> = {
  uzbekistan: 'UZ',
  kazakhstan: 'KZ',
};

const STATIC_COUNTRIES: any[] = [
  {
    id: 'uzbekistan',
    name: { en: 'Uzbekistan', ru: 'Узбекистан', uz: "O'zbekiston" },
    countryCode: 'UZ',
    dialCode: '+998',
    cities: [
      { id: 'tashkent', name: { en: 'Tashkent', ru: 'Ташкент', uz: 'Toshkent' } },
      { id: 'samarkand', name: { en: 'Samarkand', ru: 'Самарканд', uz: 'Samarqand' } },
      { id: 'bukhara', name: { en: 'Bukhara', ru: 'Бухара', uz: 'Buxoro' } },
      { id: 'khiva', name: { en: 'Khiva', ru: 'Хива', uz: 'Xiva' } },
      { id: 'namangan', name: { en: 'Namangan', ru: 'Наманган', uz: 'Namangan' } },
      { id: 'andijan', name: { en: 'Andijan', ru: 'Андижан', uz: 'Andijon' } },
      { id: 'fergana', name: { en: 'Fergana', ru: 'Фергана', uz: "Farg'ona" } },
      { id: 'karshi', name: { en: 'Karshi', ru: 'Карши', uz: 'Qarshi' } },
      { id: 'nukus', name: { en: 'Nukus', ru: 'Нукус', uz: 'Nukus' } },
      { id: 'urgench', name: { en: 'Urgench', ru: 'Ургенч', uz: 'Urganch' } },
      { id: 'jizzakh', name: { en: 'Jizzakh', ru: 'Джизак', uz: 'Jizzax' } },
      { id: 'navoi', name: { en: 'Navoi', ru: 'Навои', uz: 'Navoiy' } },
      { id: 'termez', name: { en: 'Termez', ru: 'Термез', uz: 'Termiz' } },
      { id: 'gulistan', name: { en: 'Gulistan', ru: 'Гулистан', uz: 'Guliston' } },
    ],
  },
  {
    id: 'kazakhstan',
    name: { en: 'Kazakhstan', ru: 'Казахстан', uz: 'Qozogiston' },
    countryCode: 'KZ',
    dialCode: '+7',
    cities: [
      { id: 'almaty', name: { en: 'Almaty', ru: 'Алматы', uz: 'Almati' } },
      { id: 'astana', name: { en: 'Astana', ru: 'Астана', uz: 'Astana' } },
      { id: 'shymkent', name: { en: 'Shymkent', ru: 'Шымкент', uz: 'Shimkent' } },
      { id: 'karaganda', name: { en: 'Karaganda', ru: 'Караганда', uz: 'Karaganda' } },
      { id: 'aktobe', name: { en: 'Aktobe', ru: 'Актобе', uz: 'Aktobe' } },
      { id: 'taraz', name: { en: 'Taraz', ru: 'Тараз', uz: 'Taraz' } },
      { id: 'pavlodar', name: { en: 'Pavlodar', ru: 'Павлодар', uz: 'Pavlodar' } },
      { id: 'ust-kamenogorsk', name: { en: 'Ust-Kamenogorsk', ru: 'Усть-Каменогорск', uz: 'Ust-Kamenogorsk' } },
      { id: 'semey', name: { en: 'Semey', ru: 'Семей', uz: 'Semey' } },
      { id: 'kostanay', name: { en: 'Kostanay', ru: 'Костанай', uz: 'Kostanay' } },
      { id: 'kyzylorda', name: { en: 'Kyzylorda', ru: 'Кызылорда', uz: 'Kizilorda' } },
      { id: 'uralsk', name: { en: 'Uralsk', ru: 'Уральск', uz: 'Uralsk' } },
      { id: 'petropavlovsk', name: { en: 'Petropavlovsk', ru: 'Петропавловск', uz: 'Petropavlovsk' } },
      { id: 'aktau', name: { en: 'Aktau', ru: 'Актау', uz: 'Aktau' } },
      { id: 'atyrau', name: { en: 'Atyrau', ru: 'Атырау', uz: 'Atirau' } },
      { id: 'taldykorgan', name: { en: 'Taldykorgan', ru: 'Талдыкорган', uz: 'Taldikorgan' } },
      { id: 'kokshetau', name: { en: 'Kokshetau', ru: 'Кокшетау', uz: 'Kokshetau' } },
      { id: 'turkestan', name: { en: 'Turkestan', ru: 'Туркестан', uz: 'Turkistan' } },
    ],
  },
];

type NameJson = { en?: string; ru?: string; uz?: string };

function getPriorityScore(nameJson: NameJson | undefined): number {
  if (!nameJson) return 0;
  const en = (nameJson.en ?? '').toLowerCase();
  const ru = (nameJson.ru ?? '').toLowerCase();
  const uz = (nameJson.uz ?? '').toLowerCase();

  const isUzbekistan =
    en.includes('uzbekistan') ||
    ru.includes('узбекистан') ||
    uz.includes("o'zbekiston") ||
    uz.includes('ozbekiston');

  const isKazakhstan =
    en.includes('kazakhstan') ||
    ru.includes('казахстан') ||
    uz.includes("qozog'iston") ||
    uz.includes('qozogiston');

  const isDubai =
    en.includes('dubai') ||
    ru.includes('дубай') ||
    uz.includes('dubay') ||
    en.includes('uae') ||
    ru.includes('оаэ');

  const isTashkent =
    en.includes('tashkent') ||
    ru.includes('ташкент') ||
    uz.includes('toshkent');
  const isSamarkand =
    en.includes('samarkand') ||
    ru.includes('самарканд') ||
    uz.includes('samarqand');

  if (isUzbekistan) return 500;
  if (isKazakhstan) return 400;
  if (isDubai) return 300;
  if (isTashkent) return 200;
  if (isSamarkand) return 100;
  return 0;
}

function sortByName<T extends { name: unknown }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const scoreA = getPriorityScore(a.name as NameJson);
    const scoreB = getPriorityScore(b.name as NameJson);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    const na = (a.name as NameJson)?.en ?? '';
    const nb = (b.name as NameJson)?.en ?? '';
    return na.localeCompare(nb);
  });
}

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCities(
    search?: string,
    id?: string,
    countryCode?: string,
  ): Promise<CountrySelectionResponseDto[]> {
    const normalizedSearch = search?.trim().toLowerCase();
    const normalizedId = id?.trim().toLowerCase();
    const normalizedCode = countryCode
      ?.trim()
      .toLowerCase()
      .replace(/^\+/, '');

    const dbCities = await this.prisma.city.findMany({
      where: { isActive: true },
      include: { districts: { where: { isActive: true } } },
    });
 
    const enToCity = new Map<string, any>();
    for (const city of dbCities) {
      const nameObj = city.name as Record<string, string> | null;
      const en = nameObj?.en?.toLowerCase().trim();
      if (en) {
        enToCity.set(en, city);
      }
    }
 
    const resolvedCountries: CountrySelectionResponseDto[] = STATIC_COUNTRIES.map(
      (country) => ({
        ...country,
        cities: country.cities.map((c: any) => {
          const enName = CITY_SLUG_TO_EN[c.id]?.toLowerCase().trim();
          const dbCity = enName ? enToCity.get(enName) : undefined;
          return {
            id: dbCity?.id ?? c.id,
            name: dbCity?.name ?? c.name,
            districts:
              dbCity?.districts.map((d: any) => ({
                id: d.id,
                name: d.name,
              })) ?? [],
          };
        }),
      }),
    ) as CountrySelectionResponseDto[];

    return resolvedCountries.filter((country) => {
      if (normalizedId && country.id.toLowerCase() !== normalizedId) {
        return false;
      }

      if (normalizedCode) {
        const iso = country.countryCode.toLowerCase();
        const dial = country.dialCode.toLowerCase().replace(/^\+/, '');
        if (iso !== normalizedCode && dial !== normalizedCode) {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [country.name, country.countryCode, country.dialCode]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }

  async getCountries(): Promise<CountryResponseDto[]> {
    const countries = await this.prisma.country.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
    return sortByName(
      countries.map((c) => ({
        id: c.id,
        name: c.name as string | TranslationRecord,
        code: c.code ?? undefined,
      })),
    );
  }

  async getRegions(countryId?: string): Promise<RegionResponseDto[]> {
    const regions = await this.prisma.region.findMany({
      where: {
        isActive: true,
        ...(countryId && { countryId }),
      },
      select: {
        id: true,
        name: true,
        countryId: true,
      },
    });
    return sortByName(
      regions.map((r) => ({
        id: r.id,
        name: r.name as string | TranslationRecord,
        countryId: r.countryId,
      })),
    );
  }

  async getDistricts(cityId?: string): Promise<DistrictResponseDto[]> {
    const districts = await this.prisma.district.findMany({
      where: {
        isActive: true,
        ...(cityId && { cityId }),
      },
      select: {
        id: true,
        name: true,
        cityId: true,
      },
    });
    return sortByName(
      districts.map((d) => ({
        id: d.id,
        name: d.name as string | TranslationRecord,
        cityId: d.cityId,
      })),
    );
  }
}

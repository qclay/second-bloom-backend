import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { TranslationRecord } from '../../common/i18n/translation.util';
import {
  CountryResponseDto,
  RegionResponseDto,
  CityResponseDto,
  DistrictResponseDto,
  CountrySelectionResponseDto,
} from './dto/location-response.dto';

const COUNTRY_SELECTION_OPTIONS: CountrySelectionResponseDto[] = [
  {
    id: 'uzbekistan',
    name: 'Uzbekistan',
    countryCode: 'UZ',
    dialCode: '+998',
    cities: [{ id: 'tashkent', name: 'Tashkent' }],
  },
  {
    id: 'kazakhstan',
    name: 'Kazakhstan',
    countryCode: 'KZ',
    dialCode: '+7',
    cities: [{ id: 'almaty', name: 'Almaty' }],
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

  getCountrySelection(filters?: {
    search?: string;
    id?: string;
    countryCode?: string;
  }): CountrySelectionResponseDto[] {
    const normalizedSearch = filters?.search?.trim().toLowerCase();
    const normalizedId = filters?.id?.trim().toLowerCase();
    const normalizedCode = filters?.countryCode
      ?.trim()
      .toLowerCase()
      .replace(/^\+/, '');

    return COUNTRY_SELECTION_OPTIONS.filter((country) => {
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

  async getCities(
    regionId?: string,
    countryId?: string,
  ): Promise<CityResponseDto[]> {
    const cities = await this.prisma.city.findMany({
      where: {
        isActive: true,
        ...(regionId && { regionId }),
        ...(countryId && { region: { countryId } }),
      },
      select: {
        id: true,
        name: true,
        regionId: true,
      },
    });
    return sortByName(
      cities.map((c) => ({
        id: c.id,
        name: c.name as string | TranslationRecord,
        regionId: c.regionId,
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

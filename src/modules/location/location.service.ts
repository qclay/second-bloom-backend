import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CountryResponseDto,
  RegionResponseDto,
  CityResponseDto,
  DistrictResponseDto,
} from './dto/location-response.dto';

type NameJson = { en?: string; ru?: string; uz?: string };

function sortByName<T extends { name: unknown }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const na = (a.name as NameJson)?.en ?? '';
    const nb = (b.name as NameJson)?.en ?? '';
    return na.localeCompare(nb);
  });
}

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

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
        name: c.name,
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
        name: r.name,
        countryId: r.countryId,
      })),
    );
  }

  async getCities(regionId?: string): Promise<CityResponseDto[]> {
    const cities = await this.prisma.city.findMany({
      where: {
        isActive: true,
        ...(regionId && { regionId }),
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
        name: c.name,
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
        name: d.name,
        cityId: d.cityId,
      })),
    );
  }
}

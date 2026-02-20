import { Controller, Get, Query } from '@nestjs/common';
import { LocationService } from './location.service';
import {
  CountryResponseDto,
  RegionResponseDto,
  CityResponseDto,
  DistrictResponseDto,
} from './dto/location-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('countries')
  @Public()
  @ApiOperation({
    summary: 'List countries',
    description:
      'Returns active countries. Use for product location and filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of countries',
    type: CountryResponseDto,
    isArray: true,
  })
  async getCountries(): Promise<CountryResponseDto[]> {
    return this.locationService.getCountries();
  }

  @Get('regions')
  @Public()
  @ApiOperation({
    summary: 'List regions',
    description:
      'Returns regions, optionally filtered by countryId. Use for product location and filters.',
  })
  @ApiQuery({
    name: 'countryId',
    required: false,
    description: 'Filter regions by country ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of regions',
    type: RegionResponseDto,
    isArray: true,
  })
  async getRegions(
    @Query('countryId') countryId?: string,
  ): Promise<RegionResponseDto[]> {
    return this.locationService.getRegions(countryId);
  }

  @Get('cities')
  @Public()
  @ApiOperation({
    summary: 'List cities',
    description:
      'Returns cities, optionally filtered by regionId. Use for product location and filters.',
  })
  @ApiQuery({
    name: 'regionId',
    required: false,
    description: 'Filter cities by region ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cities',
    type: CityResponseDto,
    isArray: true,
  })
  async getCities(
    @Query('regionId') regionId?: string,
  ): Promise<CityResponseDto[]> {
    return this.locationService.getCities(regionId);
  }

  @Get('districts')
  @Public()
  @ApiOperation({
    summary: 'List districts',
    description:
      'Returns districts, optionally filtered by cityId. Use for product location and filters.',
  })
  @ApiQuery({
    name: 'cityId',
    required: false,
    description: 'Filter districts by city ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of districts',
    type: DistrictResponseDto,
    isArray: true,
  })
  async getDistricts(
    @Query('cityId') cityId?: string,
  ): Promise<DistrictResponseDto[]> {
    return this.locationService.getDistricts(cityId);
  }
}

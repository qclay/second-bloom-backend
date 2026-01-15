import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdatePublicationPriceDto } from './dto/update-publication-price.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('publication-price')
  @ApiOperation({ summary: 'Get current active publication price' })
  @ApiResponse({
    status: 200,
    description: 'Current publication price',
  })
  async getPublicationPricing() {
    return this.settingsService.getPublicationPricing();
  }

  @Get('publication-price/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get publication price history (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Publication price history',
  })
  async getAllPublicationPricing() {
    return this.settingsService.getAllPublicationPricing();
  }

  @Post('publication-price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update publication price per post (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Publication price updated',
  })
  async updatePublicationPrice(@Body() dto: UpdatePublicationPriceDto) {
    return this.settingsService.updatePublicationPrice(
      dto.price,
      dto.updatedBy,
      dto.description,
    );
  }

  @Patch('publication-price/:id/activate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate specific price (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Price activated',
  })
  async activatePricing(@Param('id') id: string) {
    return this.settingsService.activatePricing(id);
  }
}

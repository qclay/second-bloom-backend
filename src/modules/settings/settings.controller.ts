import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { SettingsService } from './settings.service';
import { UpdatePublicationPriceDto } from './dto/update-publication-price.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('publication-price')
  @ApiOperation({ summary: 'Get current active publication price' })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Current publication price',
  })
  async getPublicationPricing() {
    return this.settingsService.getPublicationPricing();
  }

  @Post('publication-price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update publication price per post (Admin only)' })
  @ApiCommonErrorResponses({ conflict: false, notFound: false })
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
}

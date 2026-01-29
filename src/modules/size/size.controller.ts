import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SizeService } from './size.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { SizeQueryDto } from './dto/size-query.dto';
import { SizeResponseDto } from './dto/size-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { SanitizePipe } from '../../common/pipes/sanitize.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

@ApiTags('Sizes')
@Controller('sizes')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create size',
    description:
      'Create a product size (e.g. Quite large). Use returned id as sizeId in POST/PATCH /products.',
  })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'Size created.',
    type: SizeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Name already exists.',
    type: ApiErrorResponseDto,
  })
  async create(
    @Body() dto: CreateSizeDto,
    @CurrentUser('id') userId: string,
  ): Promise<SizeResponseDto> {
    return this.sizeService.create(dto, userId);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List sizes',
    description:
      'Paginated list. Query: adminOnly (true = admin-created only), page, limit. For product dropdown.',
  })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiPaginatedResponse(
    SizeResponseDto,
    'Paginated list of sizes (data + meta.pagination)',
  )
  async findAll(@Query() query: SizeQueryDto) {
    return this.sizeService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get size by ID',
    description: 'Single size by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Size UUID' })
  @ApiResponse({ status: 200, description: 'Size.', type: SizeResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Not found.',
    type: ApiErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<SizeResponseDto> {
    return this.sizeService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update size',
    description: 'Partial update. Creator or admin only.',
  })
  @ApiParam({ name: 'id', description: 'Size UUID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({ status: 200, description: 'Updated.', type: SizeResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    type: ApiErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSizeDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<SizeResponseDto> {
    return this.sizeService.update(id, dto, userId, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete size',
    description: 'Soft delete. Creator or admin only.',
  })
  @ApiParam({ name: 'id', description: 'Size UUID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({ status: 204, description: 'Deleted.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    type: ApiErrorResponseDto,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return this.sizeService.remove(id, userId, role);
  }
}

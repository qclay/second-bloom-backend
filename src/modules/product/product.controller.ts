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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ModerateProductDto } from './dto/moderate-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductSearchDto } from './dto/product-search.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { SanitizePipe } from '../../common/pipes/sanitize.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import {
  ApiPaginatedResponse,
  ApiSuccessResponse,
} from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { ProductCountsResponseDto } from './dto/product-counts-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create product',
    description: 'Create a product with or without an auction',
  })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'Product created.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
    type: ApiErrorResponseDto,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.createProduct(createProductDto, userId);
  }

  @Get('counts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'My products: total counts only',
    description:
      'Returns total number of products for current user in each phase: all, inAuction, sold, inDelivery. No product list. Use for badges/counters.',
  })
  @ApiSuccessResponse(
    200,
    'My product counts by phase',
    ProductCountsResponseDto,
  )
  async getProductCounts(@CurrentUser() user: { id: string }) {
    return this.productService.getProductCounts(user.id);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List products',
    description:
      'Paginated list of active products. Query: page, limit, categoryId, sellerId, conditionId, sizeId, region, city, minPrice, maxPrice, sortBy, sortOrder.',
  })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiPaginatedResponse(
    ProductResponseDto,
    'Paginated list of products (data + meta.pagination)',
    200,
  )
  async findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Post('search')
  @Public()
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Search products (POST)',
    description:
      'Search with filters in body: search, categoryIds, conditionIds, sizeIds, minPrice, maxPrice, page, limit.',
  })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiPaginatedResponse(
    ProductResponseDto,
    'Paginated search results (data + meta.pagination)',
    200,
  )
  async search(@Body() searchDto: ProductSearchDto) {
    return this.productService.searchProducts(searchDto);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve or reject product in moderation (Admin/Moderator only)',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product after moderation.',
    type: ProductResponseDto,
  })
  @ApiCommonErrorResponses({ conflict: false })
  async moderate(
    @Param('id') id: string,
    @Body() dto: ModerateProductDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<ProductResponseDto> {
    return this.productService.moderateProduct(id, userId, role, dto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get product by ID',
    description:
      'Product detail. Includes category, condition, size, seller, images; activeAuction when product has an active auction. Use activeAuction.id for GET /bids?auctionId=:auctionId.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiQuery({
    name: 'incrementViews',
    required: false,
    type: String,
    description: '"true" to increment view count',
  })
  @ApiResponse({
    status: 200,
    description: 'Product with relations and activeAuction.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found.',
    type: ApiErrorResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @Query('incrementViews') incrementViews?: string,
  ): Promise<ProductResponseDto> {
    return this.productService.findById(id, incrementViews === 'true');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product',
    description: [
      'Partial update. Owner or admin only. Send only the fields you want to change.',
      '',
      '**Images:** To set or replace product images, send `imageIds` (array of file UUIDs from GET /files or upload). Include existing image IDs to keep them; order is preserved. All IDs are validated (files must exist and not be deleted). Omit `imageIds` to leave images unchanged. Max 10 images.',
    ].join('\n'),
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Updated product.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    type: ApiErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(
      id,
      updateProductDto,
      userId,
      role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete product',
    description: 'Soft delete. Owner or admin only.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
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
    return this.productService.deleteProduct(id, userId, role);
  }
}

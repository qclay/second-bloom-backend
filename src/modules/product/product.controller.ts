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
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

const PRODUCT_LIST_EXAMPLE: ProductResponseDto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Red Roses Bouquet',
    slug: 'red-roses-bouquet',
    description: 'Beautiful fresh red roses bouquet. 12 stems.',
    price: 150000,
    currency: 'UZS',
    categoryId: '550e8400-e29b-41d4-a716-446655440010',
    tags: ['roses', 'bouquet', 'romantic'],
    type: 'FRESH',
    condition: {
      id: '550e8400-e29b-41d4-a716-446655440020',
      name: 'New',
      slug: 'new',
    },
    quantity: 10,
    status: 'ACTIVE',
    isFeatured: true,
    views: 45,
    region: 'Tashkent',
    city: 'Tashkent',
    district: 'Mirobod',
    sellerId: '550e8400-e29b-41d4-a716-446655440030',
    createdAt: new Date('2026-01-04T17:15:29.000Z'),
    updatedAt: new Date('2026-01-04T17:15:29.000Z'),
    deletedAt: null,
    category: {
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Roses',
      slug: 'roses',
    },
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440030',
      firstName: 'Ali',
      lastName: 'Karimov',
      phoneNumber: '+998901234569',
    },
  } as ProductResponseDto,
];

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
    description:
      'Create a flower/bouquet listing. Fixed price: send price. With auction: set createAuction: true and auction (startPrice, endTime). Use categoryId from GET /categories; optional conditionId, sizeId from GET /conditions, GET /sizes.',
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
    PRODUCT_LIST_EXAMPLE,
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
    PRODUCT_LIST_EXAMPLE,
  )
  async search(@Body() searchDto: ProductSearchDto) {
    return this.productService.searchProducts(searchDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get product by ID',
    description:
      'Product detail. Includes category, condition, size, seller, images; activeAuction when product has an active auction. Use activeAuction.id for GET /bids/auction/:auctionId.',
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
    description:
      'Partial update. Owner or admin only. Send only fields to change.',
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

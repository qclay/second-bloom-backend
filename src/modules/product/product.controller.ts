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
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.createProduct(createProductDto, userId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products (simple query)' })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Post('search')
  @Public()
  @UsePipes(new SanitizePipe())
  @ApiOperation({ summary: 'Search products with complex filters (POST)' })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Body() searchDto: ProductSearchDto) {
    return this.productService.searchProducts(searchDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
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
  @ApiOperation({ summary: 'Update product' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ProductResponseDto,
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
  @ApiOperation({ summary: 'Delete product' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return this.productService.deleteProduct(id, userId, role);
  }
}

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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
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
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Public()
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a category',
    description:
      'Creates a new product category (e.g. Flowers, Bouquets). No auth required. ' +
      'Slug is auto-generated from name. Optional: parentId (for subcategories), imageId (from File API), description, order, isActive.',
  })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description:
      'Category created. Use returned id as categoryId when creating products.',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists.',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'List of categories. Each category includes activeProductCount (number of active products).',
  })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiPaginatedResponse(
    CategoryResponseDto,
    'Paginated list of categories (data + meta.pagination)',
  )
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get category by ID',
    description:
      'Category detail with activeProductCount. Use includeChildren=true for child categories.',
  })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    conflict: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: ApiErrorResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @Query('includeChildren') includeChildren?: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findById(id, includeChildren === 'true');
  }

  @Get(':id/children')
  @Public()
  @ApiOperation({ summary: 'Get child categories' })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiResponse({ status: 200, description: 'List of child categories' })
  async findChildren(@Param('id') id: string): Promise<CategoryResponseDto[]> {
    return this.categoryService.findChildren(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('role') role: UserRole,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.updateCategory(id, updateCategoryDto, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with children',
    type: ApiErrorResponseDto,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return this.categoryService.deleteCategory(id, role);
  }
}

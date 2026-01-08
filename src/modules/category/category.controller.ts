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

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('role') role: UserRole,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.createCategory(createCategoryDto, role);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(
    @Param('id') id: string,
    @Query('includeChildren') includeChildren?: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findById(id, includeChildren === 'true');
  }

  @Get(':id/children')
  @Public()
  @ApiOperation({ summary: 'Get child categories' })
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
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with children',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return this.categoryService.deleteCategory(id, role);
  }
}

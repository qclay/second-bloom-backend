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
import { ConditionService } from './condition.service';
import { CreateConditionDto } from './dto/create-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { ConditionQueryDto } from './dto/condition-query.dto';
import { ConditionResponseDto } from './dto/condition-response.dto';
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

@ApiTags('Conditions')
@Controller('conditions')
export class ConditionController {
  constructor(private readonly conditionService: ConditionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create condition',
    description:
      'Create a product condition (e.g. Like New). Use returned id as conditionId in POST/PATCH /products.',
  })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'Condition created.',
    type: ConditionResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Name already exists.',
    type: ApiErrorResponseDto,
  })
  async create(
    @Body() dto: CreateConditionDto,
    @CurrentUser('id') userId: string,
  ): Promise<ConditionResponseDto> {
    return this.conditionService.create(dto, userId);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List conditions',
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
    ConditionResponseDto,
    'Paginated list of conditions (data + meta.pagination)',
  )
  async findAll(@Query() query: ConditionQueryDto) {
    return this.conditionService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get condition by ID',
    description: 'Single condition by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Condition UUID' })
  @ApiResponse({
    status: 200,
    description: 'Condition.',
    type: ConditionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found.',
    type: ApiErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ConditionResponseDto> {
    return this.conditionService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update condition',
    description: 'Partial update. Creator or admin only.',
  })
  @ApiParam({ name: 'id', description: 'Condition UUID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Updated.',
    type: ConditionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    type: ApiErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateConditionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<ConditionResponseDto> {
    return this.conditionService.update(id, dto, userId, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete condition',
    description: 'Soft delete. Creator or admin only.',
  })
  @ApiParam({ name: 'id', description: 'Condition UUID' })
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
    return this.conditionService.remove(id, userId, role);
  }
}

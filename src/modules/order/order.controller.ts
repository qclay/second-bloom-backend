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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
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

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates a purchase request for a product or an order from a completed auction. Requires authentication.',
  })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Order already exists for this product/auction',
    type: ApiErrorResponseDto,
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') userId: string,
  ): Promise<OrderResponseDto> {
    return await this.orderService.createOrder(createOrderDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all orders',
    description:
      'Retrieves a paginated list of orders. Users see their own orders, admins see all orders.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiPaginatedResponse(
    OrderResponseDto,
    'Paginated list of orders (data + meta.pagination)',
  )
  async findAll(
    @Query() query: OrderQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return await this.orderService.findAll(query, userId, role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Retrieves detailed information about a specific order. Users can only view their own orders unless they are admins.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
    type: OrderResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<OrderResponseDto> {
    return await this.orderService.findById(id, userId, role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Updates order status (e.g., accept/reject purchase request, mark as shipped/delivered). Sellers can accept/reject, admins can update any status.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<OrderResponseDto> {
    return await this.orderService.updateOrder(
      id,
      updateOrderDto,
      userId,
      role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete order',
    description:
      'Soft deletes an order. Cannot delete delivered orders. Only buyers or admins can delete orders.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 204,
    description: 'Order deleted successfully',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return await this.orderService.deleteOrder(id, userId, role);
  }
}

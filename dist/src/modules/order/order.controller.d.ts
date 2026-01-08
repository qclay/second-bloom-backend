import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UserRole } from '@prisma/client';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: CreateOrderDto, userId: string): Promise<OrderResponseDto>;
    findAll(query: OrderQueryDto, userId: string, role: UserRole): Promise<{
        data: OrderResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, role: UserRole): Promise<OrderResponseDto>;
    update(id: string, updateOrderDto: UpdateOrderDto, userId: string, role: UserRole): Promise<OrderResponseDto>;
    remove(id: string, userId: string, role: UserRole): Promise<void>;
}

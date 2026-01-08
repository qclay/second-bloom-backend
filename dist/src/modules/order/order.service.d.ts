import { OrderRepository } from './repositories/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductRepository } from '../product/repositories/product.repository';
import { AuctionRepository } from '../auction/repositories/auction.repository';
export declare class OrderService {
    private readonly orderRepository;
    private readonly productRepository;
    private readonly auctionRepository;
    private readonly prisma;
    private readonly logger;
    constructor(orderRepository: OrderRepository, productRepository: ProductRepository, auctionRepository: AuctionRepository, prisma: PrismaService);
    createOrder(dto: CreateOrderDto, buyerId: string): Promise<OrderResponseDto>;
    findAll(query: OrderQueryDto, userId?: string, userRole?: UserRole): Promise<{
        data: OrderResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, userId?: string, userRole?: UserRole): Promise<OrderResponseDto>;
    updateOrder(id: string, dto: UpdateOrderDto, userId: string, userRole: UserRole): Promise<OrderResponseDto>;
    deleteOrder(id: string, userId: string, userRole: UserRole): Promise<void>;
    private validateStatusTransition;
}

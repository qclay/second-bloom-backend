import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  Req,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidQueryDto } from './dto/bid-query.dto';
import { BidResponseDto } from './dto/bid-response.dto';
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
import type { Request } from 'express';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

@ApiTags('Bids')
@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Place a bid',
    description:
      'Place a bid on an auction. Body: auctionId, amount. Amount must be >= current price + bid increment.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 201,
    description: 'Bid placed successfully',
    type: BidResponseDto,
  })
  async create(
    @Body() createBidDto: CreateBidDto,
    @CurrentUser('id') userId: string,
    @Req() request: Request,
  ): Promise<BidResponseDto> {
    return await this.bidService.createBid(createBidDto, userId, request);
  }

  @Get('my-bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user bids',
    description:
      'Returns all bids placed by the authenticated user, with optional filtering by auction status',
  })
  @ApiPaginatedResponse(
    BidResponseDto,
    'Paginated list of user bids (data + meta.pagination)',
  )
  async getMyBids(
    @Query() query: BidQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.bidService.getUserBids(userId, query);
  }

  @Get('auction/:auctionId')
  @Public()
  @ApiOperation({
    summary: 'Get bids for an auction',
    description:
      'List of bids for an auction. view: all (last on top), new (unread by owner), top (highest first), rejected (owner-rejected). Owner can use view=new and PATCH :id/read or PATCH auction/:auctionId/read-all to mark as read.',
  })
  @ApiParam({
    name: 'auctionId',
    description: 'Auction UUID (e.g. from product.activeAuction.id)',
  })
  @ApiPaginatedResponse(
    BidResponseDto,
    'Paginated list of bids for auction (data + meta.pagination + meta.counts)',
  )
  async getAuctionBids(
    @Param('auctionId') auctionId: string,
    @Query() query: BidQueryDto,
  ) {
    return await this.bidService.getAuctionBids(auctionId, query);
  }

  @Patch('auction/:auctionId/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark all new bids in auction as read (auction owner)',
    description:
      'One HTTP call to mark all unread bids in this auction as read. Use this instead of many PATCH :id/read when opening the Applications page or clicking "Mark all as read".',
  })
  @ApiParam({ name: 'auctionId', description: 'Auction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Number of bids marked as read',
    schema: { properties: { markedCount: { type: 'number' } } },
  })
  async markAllBidsAsRead(
    @Param('auctionId') auctionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ markedCount: number }> {
    return await this.bidService.markAllBidsAsRead(auctionId, userId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark bid as read (auction owner)',
    description:
      'Auction owner marks a bid as read so it no longer appears under "new".',
  })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  @ApiResponse({ status: 204, description: 'Bid marked as read' })
  async markBidAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.bidService.markBidAsRead(id, userId);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore a rejected bid (auction owner)',
    description:
      'Auction owner can restore a bid they had previously removed. Only works for bids rejected by owner; auction must still be active. Returns the restored bid.',
  })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  @ApiResponse({
    status: 200,
    description: 'Bid restored',
    type: BidResponseDto,
  })
  async restoreBid(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<BidResponseDto> {
    return await this.bidService.restoreBid(id, userId, role);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all bids' })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiPaginatedResponse(
    BidResponseDto,
    'Paginated list of bids (data + meta.pagination)',
  )
  async findAll(@Query() query: BidQueryDto) {
    return await this.bidService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get bid by ID' })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  @ApiResponse({
    status: 200,
    description: 'Bid details',
    type: BidResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Bid not found',
    type: ApiErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<BidResponseDto> {
    return await this.bidService.findById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retract or remove a bid',
    description:
      'Bidder can retract their own bid, auction owner can remove any bid, admin can remove any bid. Only works while auction is active.',
  })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({ status: 204, description: 'Bid retracted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return await this.bidService.retractBid(id, userId, role);
  }
}

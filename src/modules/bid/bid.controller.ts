import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
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
  @ApiResponse({ status: 200, description: 'List of user bids' })
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
      'List of bids for an auction. Use auction id from product.activeAuction.id on product detail page.',
  })
  @ApiParam({
    name: 'auctionId',
    description: 'Auction UUID (e.g. from product.activeAuction.id)',
  })
  @ApiResponse({ status: 200, description: 'List of bids for auction' })
  async getAuctionBids(@Param('auctionId') auctionId: string) {
    return await this.bidService.getAuctionBids(auctionId);
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
  @ApiResponse({ status: 200, description: 'List of bids' })
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
  @ApiResponse({ status: 404, description: 'Bid not found' })
  async findOne(@Param('id') id: string): Promise<BidResponseDto> {
    return await this.bidService.findById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retract a bid',
    description:
      'Only bidder or admin. Bid can be retracted before auction ends.',
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

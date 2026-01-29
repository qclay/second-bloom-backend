import {
  Controller,
  Get,
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
import { AuctionService } from './auction.service';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';
import { AuctionResponseDto } from './dto/auction-response.dto';
import { ParticipantsResponseDto } from './dto/participant-response.dto';
import { WinnersResponseDto } from './dto/winner-response.dto';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all auctions',
    description:
      'Paginated list of auctions. Use query params for status, productId, etc.',
  })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiPaginatedResponse(
    AuctionResponseDto,
    'Paginated list of auctions (data + meta.pagination)',
  )
  async findAll(@Query() query: AuctionQueryDto) {
    return await this.auctionService.findAll(query);
  }

  @Get(':id/participants')
  @Public()
  @ApiOperation({
    summary: 'Get auction participants',
    description:
      'List of bidders with bid counts and highest bid. Use for participant list on auction detail.',
  })
  @ApiParam({ name: 'id', description: 'Auction UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of participants with bid statistics',
    type: ParticipantsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Auction not found',
    type: ApiErrorResponseDto,
  })
  async getParticipants(
    @Param('id') id: string,
  ): Promise<ParticipantsResponseDto> {
    return await this.auctionService.getParticipants(id);
  }

  @Get(':id/winners')
  @Public()
  @ApiOperation({
    summary: 'Get top winners',
    description:
      'Top 3 bidders by highest bid. Use after auction ends for winners leaderboard.',
  })
  @ApiParam({ name: 'id', description: 'Auction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Top 3 winners ranked by bid amount',
    type: WinnersResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Auction not found',
    type: ApiErrorResponseDto,
  })
  async getWinners(@Param('id') id: string): Promise<WinnersResponseDto> {
    return await this.auctionService.getWinners(id);
  }

  @Get(':id/leaderboard')
  @Public()
  @ApiOperation({
    summary: 'Get auction leaderboard',
    description: 'All bidders ranked by highest bid. Optional limit (max 100).',
  })
  @ApiParam({ name: 'id', description: 'Auction UUID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of entries to return (default: all, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard of all bidders ranked by bid amount',
    type: LeaderboardResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Auction not found',
    type: ApiErrorResponseDto,
  })
  async getLeaderboard(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<LeaderboardResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return await this.auctionService.getLeaderboard(id, limitNum);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get auction by ID',
    description:
      'Auction detail. Product detail page can use GET /products/:productId instead; response includes activeAuction with id for linking to bids.',
  })
  @ApiParam({ name: 'id', description: 'Auction UUID' })
  @ApiQuery({
    name: 'incrementViews',
    required: false,
    type: Boolean,
    description: 'Whether to increment the view count',
  })
  @ApiResponse({
    status: 200,
    description: 'Auction details',
    type: AuctionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Auction not found',
    type: ApiErrorResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @Query('incrementViews') incrementViews?: string,
  ): Promise<AuctionResponseDto> {
    return await this.auctionService.findById(id, incrementViews === 'true');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update auction',
    description: 'Only owner or admin.',
  })
  @ApiParam({ name: 'id', description: 'Auction UUID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Auction updated',
    type: AuctionResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<AuctionResponseDto> {
    return await this.auctionService.updateAuction(
      id,
      updateAuctionDto,
      userId,
      role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete auction',
    description: 'Only owner or admin.',
  })
  @ApiParam({ name: 'id', description: 'Auction UUID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({ status: 204, description: 'Auction deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return await this.auctionService.deleteAuction(id, userId, role);
  }
}

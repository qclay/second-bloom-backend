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
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all auctions' })
  @ApiCommonErrorResponses({
    unauthorized: false,
    forbidden: false,
    notFound: false,
    conflict: false,
  })
  @ApiResponse({ status: 200, description: 'List of auctions' })
  async findAll(@Query() query: AuctionQueryDto) {
    return await this.auctionService.findAll(query);
  }

  @Get(':id/participants')
  @Public()
  @ApiOperation({
    summary: 'Get auction participants',
    description:
      'Returns list of all bidders who placed bids, grouped by user with their bid counts and highest bid amount',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants with bid statistics',
    type: ParticipantsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Auction not found' })
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
      'Returns top 3 bidders ranked by highest bid amount. Used for displaying winners leaderboard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top 3 winners ranked by bid amount',
    type: WinnersResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  async getWinners(@Param('id') id: string): Promise<WinnersResponseDto> {
    return await this.auctionService.getWinners(id);
  }

  @Get(':id/leaderboard')
  @Public()
  @ApiOperation({
    summary: 'Get auction leaderboard',
    description:
      'Returns all bidders ranked by highest bid amount, with their bid counts and statistics',
  })
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
  @ApiResponse({ status: 404, description: 'Auction not found' })
  async getLeaderboard(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<LeaderboardResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return await this.auctionService.getLeaderboard(id, limitNum);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get auction by ID' })
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
  @ApiResponse({ status: 404, description: 'Auction not found' })
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
  @ApiOperation({ summary: 'Update auction' })
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
  @ApiOperation({ summary: 'Delete auction' })
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

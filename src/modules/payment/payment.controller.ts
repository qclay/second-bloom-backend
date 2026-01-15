import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
  Req,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment invoice for publication posts' })
  @ApiResponse({
    status: 201,
    description: 'Payment invoice created successfully',
  })
  async createInvoice(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.createInvoice(req.user.id, dto);
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle payment webhook from gateway' })
  @ApiHeader({
    name: 'x-signature',
    description: 'HMAC SHA256 signature',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid signature',
  })
  async handleWebhook(
    @Headers('x-signature') signature: string,
    @Body() payload: WebhookPayloadDto,
  ) {
    return this.paymentService.handleWebhook(signature, payload);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved',
    type: [PaymentResponseDto],
  })
  async getPaymentHistory(@Req() req: AuthenticatedRequest) {
    return this.paymentService.getUserPayments(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  async getPayment(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }
}

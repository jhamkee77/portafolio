import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('intent')
  @ApiOperation({ summary: 'Create a payment intent for an order' })
  createIntent(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPaymentIntent(userId, dto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm a payment (simulate Stripe webhook)' })
  confirm(
    @Param('id') paymentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.confirmPayment(paymentId, userId);
  }

  @Patch(':id/refund')
  @Roles('admin')
  @ApiOperation({ summary: 'Refund a payment (admin only)' })
  refund(
    @Param('id') paymentId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.paymentsService.refund(paymentId, adminId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my payment history' })
  findMyPayments(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.findByUser(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}

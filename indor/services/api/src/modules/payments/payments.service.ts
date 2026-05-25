import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    private stripe: StripeService,
  ) {}

  async createPaymentIntent(userId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentId) throw new BadRequestException('Order already has a payment');

    const intent = await this.stripe.createPaymentIntent(dto.amount, 'usd', {
      orderId: dto.orderId,
      userId,
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: dto.amount,
        method: dto.method || 'card',
        status: PaymentStatus.pending,
        stripeIntentId: intent.id,
      },
    });

    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { paymentId: payment.id },
    });

    await this.auditLogs.create({
      userId,
      action: 'payment.created',
      entityType: 'payment',
      entityId: payment.id,
      metadata: { orderId: dto.orderId, amount: dto.amount },
    });

    return { payment, clientSecret: intent.clientSecret };
  }

  async confirmPayment(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const result = await this.stripe.confirmPaymentIntent(payment.stripeIntentId!);

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.succeeded,
        stripeChargeId: result.id,
        receiptUrl: result.receiptUrl,
      },
    });

    await this.auditLogs.create({
      userId,
      action: 'payment.confirmed',
      entityType: 'payment',
      entityId: paymentId,
      metadata: { status: 'succeeded' },
    });

    return updated;
  }

  async refund(paymentId: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.succeeded) {
      throw new BadRequestException('Can only refund succeeded payments');
    }

    await this.stripe.refund(payment.stripeIntentId!, payment.amount);

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.refunded },
    });

    await this.auditLogs.create({
      userId: adminId,
      action: 'payment.refunded',
      entityType: 'payment',
      entityId: paymentId,
      metadata: { amount: payment.amount },
    });

    return updated;
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId };
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { order: { select: { id: true, status: true } } },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data: payments, total, page, limit };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true, user: { select: { id: true, email: true, name: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}

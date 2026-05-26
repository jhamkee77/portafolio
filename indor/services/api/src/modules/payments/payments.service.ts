import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    private stripe: StripeService,
    private notifications: NotificationsService,
  ) {}

  async createPaymentIntent(userId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new ForbiddenException('Order does not belong to user');
    }
    if (order.paymentId) throw new BadRequestException('Order already has a payment');
    if (!order.totalAmount || order.totalAmount <= 0) {
      throw new BadRequestException('Order does not have a payable total');
    }

    const intent = await this.stripe.createPaymentIntent(order.totalAmount, 'usd', {
      orderId: dto.orderId,
      userId,
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: order.totalAmount,
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
      metadata: { orderId: dto.orderId, amount: order.totalAmount },
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

    await this.notifications.createForUser({
      userId: payment.userId,
      type: 'payment_succeeded',
      title: 'Payment processed',
      body: 'Your INDOR payment was processed successfully.',
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

  async handleStripeWebhook(payload: Buffer | string, signature?: string) {
    const event = this.stripe.constructWebhookEvent(payload, signature);
    const paymentIntent = event?.data?.object;
    const intentId = paymentIntent?.id;

    await this.auditLogs.create({
      action: 'payment.webhook_received',
      entityType: 'stripe_event',
      entityId: event?.id || intentId || 'unknown',
      metadata: { type: event?.type },
    });

    if (!intentId) {
      return { received: true, type: event?.type || 'unknown' };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { stripeIntentId: intentId },
    });
    if (!payment) {
      return { received: true, type: event.type };
    }

    const nextStatus = this.mapWebhookStatus(event.type);
    if (!nextStatus || payment.status === nextStatus) {
      return { received: true, type: event.type };
    }

    const charge = this.extractCharge(paymentIntent);
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        stripeChargeId: charge?.id,
        receiptUrl: charge?.receiptUrl,
      },
    });

    await this.auditLogs.create({
      userId: payment.userId,
      action: `payment.${nextStatus}`,
      entityType: 'payment',
      entityId: payment.id,
      metadata: { stripeIntentId: intentId, eventType: event.type },
    });

    if (nextStatus === PaymentStatus.succeeded) {
      await this.notifications.createForUser({
        userId: payment.userId,
        type: 'payment_succeeded',
        title: 'Payment processed',
        body: 'Your INDOR payment was processed successfully.',
      });
    }

    if (nextStatus === PaymentStatus.failed) {
      await this.notifications.createForUser({
        userId: payment.userId,
        type: 'payment_failed',
        title: 'Payment failed',
        body: 'Your INDOR payment could not be processed.',
      });
    }

    return { received: true, type: event.type };
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

  private mapWebhookStatus(eventType: string): PaymentStatus | undefined {
    const statuses: Record<string, PaymentStatus> = {
      'payment_intent.processing': PaymentStatus.processing,
      'payment_intent.succeeded': PaymentStatus.succeeded,
      'payment_intent.payment_failed': PaymentStatus.failed,
      'charge.refunded': PaymentStatus.refunded,
    };
    return statuses[eventType];
  }

  private extractCharge(paymentIntent: any) {
    const latestCharge = paymentIntent?.latest_charge;
    if (latestCharge && typeof latestCharge === 'object') {
      return { id: latestCharge.id, receiptUrl: latestCharge.receipt_url };
    }
    const charge = paymentIntent?.charges?.data?.[0];
    if (charge) {
      return { id: charge.id, receiptUrl: charge.receipt_url };
    }
    return undefined;
  }
}

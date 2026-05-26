import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditLogs = { create: jest.fn() };
  const mockStripe = {
    createPaymentIntent: jest.fn(),
    confirmPaymentIntent: jest.fn(),
    refund: jest.fn(),
    constructWebhookEvent: jest.fn(),
  };
  const mockNotifications = { createForUser: jest.fn() };

  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentsService(
      mockPrisma as any,
      mockAuditLogs as any,
      mockStripe as any,
      mockNotifications as any,
    );
  });

  it('creates a payment intent using the order total instead of a client amount', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      paymentId: null,
      totalAmount: 199.5,
    });
    mockStripe.createPaymentIntent.mockResolvedValue({
      id: 'pi_test_1',
      clientSecret: 'secret',
    });
    mockPrisma.payment.create.mockResolvedValue({
      id: 'pay-1',
      userId: 'user-1',
      amount: 199.5,
      status: PaymentStatus.pending,
    });
    mockPrisma.order.update.mockResolvedValue({});

    const result = await service.createPaymentIntent('user-1', {
      orderId: 'order-1',
    });

    expect(mockStripe.createPaymentIntent).toHaveBeenCalledWith(199.5, 'usd', {
      orderId: 'order-1',
      userId: 'user-1',
    });
    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: 199.5, stripeIntentId: 'pi_test_1' }),
    });
    expect(result.clientSecret).toBe('secret');
  });

  it('rejects payment intent creation when the order belongs to another user', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'other-user',
      paymentId: null,
      totalAmount: 120,
    });

    await expect(
      service.createPaymentIntent('user-1', { orderId: 'order-1' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects payment intent creation when an order has no payable total', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      paymentId: null,
      totalAmount: null,
    });

    await expect(
      service.createPaymentIntent('user-1', { orderId: 'order-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates payment status idempotently from a Stripe succeeded webhook', async () => {
    mockStripe.constructWebhookEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_1',
          latest_charge: 'ch_123',
          charges: { data: [{ id: 'ch_123', receipt_url: 'https://receipt.test' }] },
        },
      },
    });
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      userId: 'user-1',
      status: PaymentStatus.pending,
      stripeIntentId: 'pi_test_1',
    });
    mockPrisma.payment.update.mockResolvedValue({
      id: 'pay-1',
      status: PaymentStatus.succeeded,
    });

    const result = await service.handleStripeWebhook(Buffer.from('{}'), 'sig');

    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay-1' },
      data: expect.objectContaining({
        status: PaymentStatus.succeeded,
        stripeChargeId: 'ch_123',
        receiptUrl: 'https://receipt.test',
      }),
    });
    expect(mockNotifications.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        type: 'payment_succeeded',
      }),
    );
    expect(result).toEqual({ received: true, type: 'payment_intent.succeeded' });
  });

  it('does not rewrite an already succeeded payment from a duplicate webhook', async () => {
    mockStripe.constructWebhookEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_1' } },
    });
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      userId: 'user-1',
      status: PaymentStatus.succeeded,
      stripeIntentId: 'pi_test_1',
    });

    await service.handleStripeWebhook(Buffer.from('{}'), 'sig');

    expect(mockPrisma.payment.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when confirming an unknown payment', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null);

    await expect(service.confirmPayment('missing', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});


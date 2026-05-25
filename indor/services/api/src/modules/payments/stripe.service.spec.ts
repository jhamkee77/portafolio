import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';

describe('StripeService (stub)', () => {
  let service: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('sk_test_stub') },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  describe('createPaymentIntent', () => {
    it('should return a stub payment intent with client secret', async () => {
      const result = await service.createPaymentIntent(99.99);

      expect(result.id).toMatch(/^pi_stub_/);
      expect(result.amount).toBe(9999); // cents
      expect(result.currency).toBe('usd');
      expect(result.status).toBe('requires_payment_method');
      expect(result.clientSecret).toBeDefined();
    });

    it('should accept metadata', async () => {
      const result = await service.createPaymentIntent(50, 'usd', {
        orderId: 'order-1',
      });
      expect(result.metadata.orderId).toBe('order-1');
    });
  });

  describe('confirmPaymentIntent', () => {
    it('should return succeeded status', async () => {
      const result = await service.confirmPaymentIntent('pi_test_123');

      expect(result.id).toBe('pi_test_123');
      expect(result.status).toBe('succeeded');
      expect(result.receiptUrl).toBeDefined();
    });
  });

  describe('refund', () => {
    it('should return a refund object', async () => {
      const result = await service.refund('pi_test_123', 5000);

      expect(result.id).toMatch(/^re_stub_/);
      expect(result.paymentIntent).toBe('pi_test_123');
      expect(result.status).toBe('succeeded');
    });
  });
});

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Stripe service stub for MVP (test mode).
 * Will integrate with real Stripe SDK in Phase 3.
 */
@Injectable()
export class StripeService {
  private readonly stripeKey: string;

  constructor(private config: ConfigService) {
    this.stripeKey = this.config.get('STRIPE_SECRET_KEY', 'sk_test_stub');
  }

  async createPaymentIntent(amount: number, currency = 'usd', metadata?: Record<string, string>) {
    // Stub: returns a mock payment intent for MVP
    return {
      id: `pi_stub_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_stub_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
      metadata: metadata || {},
    };
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      receiptUrl: `https://pay.stripe.com/receipts/stub/${paymentIntentId}`,
    };
  }

  async refund(paymentIntentId: string, amount?: number) {
    return {
      id: `re_stub_${Date.now()}`,
      paymentIntent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      status: 'succeeded',
    };
  }
}

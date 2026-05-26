import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripeKey: string;
  private readonly webhookSecret?: string;
  private readonly stripe?: any;

  constructor(private config: ConfigService) {
    this.stripeKey = this.config.get('STRIPE_SECRET_KEY', 'sk_test_stub');
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (this.shouldUseStripeSdk()) {
      this.stripe = new Stripe(this.stripeKey);
    }
  }

  async createPaymentIntent(amount: number, currency = 'usd', metadata?: Record<string, string>) {
    const cents = Math.round(amount * 100);
    if (this.stripe) {
      const intent = await this.stripe.paymentIntents.create({
        amount: cents,
        currency,
        metadata,
        automatic_payment_methods: { enabled: true },
      });
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        clientSecret: intent.client_secret,
        metadata: intent.metadata,
      };
    }

    return {
      id: `pi_stub_${Date.now()}`,
      amount: cents,
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_stub_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
      metadata: metadata || {},
    };
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    if (this.stripe) {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['latest_charge'],
      });
      const charge = typeof intent.latest_charge === 'object' ? intent.latest_charge : undefined;
      return {
        id: intent.id,
        status: intent.status,
        receiptUrl: charge && 'receipt_url' in charge ? charge.receipt_url : undefined,
      };
    }

    return {
      id: paymentIntentId,
      status: 'succeeded',
      receiptUrl: `https://pay.stripe.com/receipts/stub/${paymentIntentId}`,
    };
  }

  async refund(paymentIntentId: string, amount?: number) {
    if (this.stripe) {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return {
        id: refund.id,
        paymentIntent: refund.payment_intent,
        amount: refund.amount,
        status: refund.status,
      };
    }

    return {
      id: `re_stub_${Date.now()}`,
      paymentIntent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      status: 'succeeded',
    };
  }

  constructWebhookEvent(payload: Buffer | string, signature?: string) {
    const rawPayload = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
    if (this.stripe && this.webhookSecret && signature) {
      return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    }
    return rawPayload ? JSON.parse(rawPayload) : {};
  }

  private shouldUseStripeSdk() {
    return Boolean(
      this.stripeKey &&
        this.stripeKey.startsWith('sk_') &&
        !this.stripeKey.includes('stub') &&
        !this.stripeKey.includes('replace'),
    );
  }
}

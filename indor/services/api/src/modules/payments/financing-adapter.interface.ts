/**
 * FinancingAdapter interface for Synchrony integration (Phase 4+).
 * This is a stub defining the contract for financing providers.
 */
export interface FinancingAdapter {
  checkEligibility(userId: string, amount: number): Promise<FinancingEligibility>;
  createApplication(userId: string, orderId: string, amount: number): Promise<FinancingApplication>;
  getApplicationStatus(applicationId: string): Promise<FinancingApplication>;
}

export interface FinancingEligibility {
  eligible: boolean;
  maxAmount?: number;
  terms?: string;
  provider: string;
}

export interface FinancingApplication {
  id: string;
  status: 'pending' | 'approved' | 'denied' | 'funded';
  amount: number;
  provider: string;
  terms?: string;
  createdAt: Date;
}

/**
 * Stub implementation for MVP — always returns ineligible.
 */
export class SynchronyAdapterStub implements FinancingAdapter {
  async checkEligibility(_userId: string, _amount: number): Promise<FinancingEligibility> {
    return {
      eligible: false,
      provider: 'synchrony',
      terms: 'Financing not yet available — coming in Phase 4',
    };
  }

  async createApplication(_userId: string, _orderId: string, _amount: number): Promise<FinancingApplication> {
    return {
      id: `sync_stub_${Date.now()}`,
      status: 'pending',
      amount: _amount,
      provider: 'synchrony',
      terms: 'Stub — not connected to Synchrony API',
      createdAt: new Date(),
    };
  }

  async getApplicationStatus(applicationId: string): Promise<FinancingApplication> {
    return {
      id: applicationId,
      status: 'pending',
      amount: 0,
      provider: 'synchrony',
      createdAt: new Date(),
    };
  }
}

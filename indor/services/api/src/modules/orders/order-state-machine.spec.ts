import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';
import { validateTransition, getNextStatuses } from './order-state-machine';

describe('Order State Machine', () => {
  describe('validateTransition', () => {
    // ─── Valid transitions ────────────────────────────────
    const validTransitions: [OrderStatus, OrderStatus, UserRole][] = [
      [OrderStatus.Requested, OrderStatus.Confirmed, UserRole.admin],
      [OrderStatus.Confirmed, OrderStatus.ProviderAssigned, UserRole.admin],
      [OrderStatus.ProviderAssigned, OrderStatus.OnTheWay, UserRole.provider],
      [OrderStatus.ProviderAssigned, OrderStatus.OnTheWay, UserRole.admin],
      [OrderStatus.OnTheWay, OrderStatus.Arrived, UserRole.provider],
      [OrderStatus.Arrived, OrderStatus.WorkInProgress, UserRole.provider],
      [OrderStatus.WorkInProgress, OrderStatus.EstimateSent, UserRole.provider],
      [OrderStatus.WorkInProgress, OrderStatus.Completed, UserRole.provider],
      [OrderStatus.EstimateSent, OrderStatus.Completed, UserRole.provider],
      [OrderStatus.Completed, OrderStatus.Reviewed, UserRole.homeowner],
      [OrderStatus.Completed, OrderStatus.Reviewed, UserRole.renter],
      [OrderStatus.Reviewed, OrderStatus.SavedToPropertyRecord, UserRole.admin],
      [OrderStatus.Completed, OrderStatus.SavedToPropertyRecord, UserRole.admin],
    ];

    it.each(validTransitions)(
      'should allow %s → %s for role %s',
      (from, to, role) => {
        expect(() => validateTransition(from, to, role)).not.toThrow();
      },
    );

    // ─── Invalid state transitions ────────────────────────
    const invalidTransitions: [OrderStatus, OrderStatus][] = [
      [OrderStatus.Requested, OrderStatus.OnTheWay],
      [OrderStatus.Requested, OrderStatus.Completed],
      [OrderStatus.Confirmed, OrderStatus.Arrived],
      [OrderStatus.OnTheWay, OrderStatus.Completed],
      [OrderStatus.Completed, OrderStatus.Requested],
      [OrderStatus.Reviewed, OrderStatus.WorkInProgress],
      [OrderStatus.SavedToPropertyRecord, OrderStatus.Requested],
    ];

    it.each(invalidTransitions)(
      'should reject invalid transition %s → %s',
      (from, to) => {
        expect(() =>
          validateTransition(from, to, UserRole.admin),
        ).toThrow(BadRequestException);
      },
    );

    // ─── Role-based authorization ─────────────────────────
    it('should reject homeowner trying to confirm an order', () => {
      expect(() =>
        validateTransition(
          OrderStatus.Requested,
          OrderStatus.Confirmed,
          UserRole.homeowner,
        ),
      ).toThrow(ForbiddenException);
    });

    it('should reject provider trying to confirm an order', () => {
      expect(() =>
        validateTransition(
          OrderStatus.Requested,
          OrderStatus.Confirmed,
          UserRole.provider,
        ),
      ).toThrow(ForbiddenException);
    });

    it('should reject provider trying to save to property record', () => {
      expect(() =>
        validateTransition(
          OrderStatus.Reviewed,
          OrderStatus.SavedToPropertyRecord,
          UserRole.provider,
        ),
      ).toThrow(ForbiddenException);
    });

    it('should reject renter trying to assign provider', () => {
      expect(() =>
        validateTransition(
          OrderStatus.Confirmed,
          OrderStatus.ProviderAssigned,
          UserRole.renter,
        ),
      ).toThrow(ForbiddenException);
    });
  });

  describe('getNextStatuses', () => {
    it('should return [Confirmed] for Requested', () => {
      expect(getNextStatuses(OrderStatus.Requested)).toEqual([
        OrderStatus.Confirmed,
      ]);
    });

    it('should return [ProviderAssigned] for Confirmed', () => {
      expect(getNextStatuses(OrderStatus.Confirmed)).toEqual([
        OrderStatus.ProviderAssigned,
      ]);
    });

    it('should return [EstimateSent, Completed] for WorkInProgress', () => {
      const next = getNextStatuses(OrderStatus.WorkInProgress);
      expect(next).toContain(OrderStatus.EstimateSent);
      expect(next).toContain(OrderStatus.Completed);
      expect(next).toHaveLength(2);
    });

    it('should return [Reviewed, SavedToPropertyRecord] for Completed', () => {
      const next = getNextStatuses(OrderStatus.Completed);
      expect(next).toContain(OrderStatus.Reviewed);
      expect(next).toContain(OrderStatus.SavedToPropertyRecord);
      expect(next).toHaveLength(2);
    });

    it('should return [] for SavedToPropertyRecord (terminal state)', () => {
      expect(getNextStatuses(OrderStatus.SavedToPropertyRecord)).toEqual([]);
    });
  });
});

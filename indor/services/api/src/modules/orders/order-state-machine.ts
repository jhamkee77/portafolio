import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';

/**
 * INDOR Order Lifecycle State Machine
 *
 * 10 states: Requested → Confirmed → ProviderAssigned → OnTheWay → Arrived
 *            → WorkInProgress → EstimateSent → Completed → Reviewed → SavedToPropertyRecord
 *
 * Each transition has:
 *  - allowed source statuses
 *  - roles authorized to perform the transition
 */

type TransitionRule = {
  from: OrderStatus[];
  allowedRoles: UserRole[];
};

const TRANSITIONS: Record<OrderStatus, TransitionRule> = {
  [OrderStatus.Requested]: {
    from: [], // initial state, set on creation
    allowedRoles: [UserRole.homeowner, UserRole.renter, UserRole.property_manager],
  },
  [OrderStatus.Confirmed]: {
    from: [OrderStatus.Requested],
    allowedRoles: [UserRole.admin],
  },
  [OrderStatus.ProviderAssigned]: {
    from: [OrderStatus.Confirmed],
    allowedRoles: [UserRole.admin],
  },
  [OrderStatus.OnTheWay]: {
    from: [OrderStatus.ProviderAssigned],
    allowedRoles: [UserRole.provider, UserRole.admin],
  },
  [OrderStatus.Arrived]: {
    from: [OrderStatus.OnTheWay],
    allowedRoles: [UserRole.provider, UserRole.admin],
  },
  [OrderStatus.WorkInProgress]: {
    from: [OrderStatus.Arrived],
    allowedRoles: [UserRole.provider, UserRole.admin],
  },
  [OrderStatus.EstimateSent]: {
    from: [OrderStatus.WorkInProgress],
    allowedRoles: [UserRole.provider, UserRole.admin],
  },
  [OrderStatus.Completed]: {
    from: [OrderStatus.EstimateSent, OrderStatus.WorkInProgress],
    allowedRoles: [UserRole.provider, UserRole.admin],
  },
  [OrderStatus.Reviewed]: {
    from: [OrderStatus.Completed],
    allowedRoles: [UserRole.homeowner, UserRole.renter, UserRole.property_manager, UserRole.admin],
  },
  [OrderStatus.SavedToPropertyRecord]: {
    from: [OrderStatus.Reviewed, OrderStatus.Completed],
    allowedRoles: [UserRole.admin],
  },
};

export function validateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  userRole: UserRole,
): void {
  const rule = TRANSITIONS[newStatus];

  if (!rule) {
    throw new BadRequestException(`Invalid target status: ${newStatus}`);
  }

  if (!rule.from.includes(currentStatus)) {
    throw new BadRequestException(
      `Cannot transition from "${currentStatus}" to "${newStatus}". ` +
      `Allowed source states: [${rule.from.join(', ')}]`,
    );
  }

  if (!rule.allowedRoles.includes(userRole)) {
    throw new ForbiddenException(
      `Role "${userRole}" is not authorized to transition an order to "${newStatus}"`,
    );
  }
}

export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return Object.entries(TRANSITIONS)
    .filter(([, rule]) => rule.from.includes(currentStatus))
    .map(([status]) => status as OrderStatus);
}

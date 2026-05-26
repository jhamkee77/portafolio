import { OrderStatus, UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    property: {
      update: jest.fn(),
    },
  };
  const mockAuditLogs = { create: jest.fn() };
  const mockNotifications = { createForUser: jest.fn() };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      mockPrisma as any,
      mockAuditLogs as any,
      mockNotifications as any,
    );
  });

  it('emits a notification when an order status changes', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      propertyId: 'prop-1',
      status: OrderStatus.Requested,
    });
    mockPrisma.order.update.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      propertyId: 'prop-1',
      status: OrderStatus.Confirmed,
      service: { name: 'HVAC Tune-Up' },
    });

    await service.transition(
      'order-1',
      OrderStatus.Confirmed,
      'admin-1',
      UserRole.admin,
    );

    expect(mockNotifications.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        orderId: 'order-1',
        type: 'order_status_changed',
      }),
    );
  });

  it('refreshes the property maintenance score when saved to property record', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      propertyId: 'prop-1',
      status: OrderStatus.Completed,
    });
    mockPrisma.order.update.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      propertyId: 'prop-1',
      status: OrderStatus.SavedToPropertyRecord,
      service: { name: 'HVAC Tune-Up' },
    });

    await service.transition(
      'order-1',
      OrderStatus.SavedToPropertyRecord,
      'admin-1',
      UserRole.admin,
    );

    expect(mockPrisma.property.update).toHaveBeenCalledWith({
      where: { id: 'prop-1' },
      data: { maintenanceScore: expect.any(Number) },
    });
  });
});


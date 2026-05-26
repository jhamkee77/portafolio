import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const mockPrisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService(mockPrisma as any);
  });

  it('creates a persisted in-app notification by default', async () => {
    mockPrisma.notification.create.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-1',
      channel: 'in_app',
      title: 'Payment received',
    });

    const result = await service.createForUser({
      userId: 'user-1',
      type: 'payment_succeeded',
      title: 'Payment received',
      body: 'Your payment was processed.',
    });

    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        channel: 'in_app',
        status: 'queued',
      }),
    });
    expect(result.id).toBe('notif-1');
  });

  it('lists current user notifications newest first', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([{ id: 'n1' }]);
    mockPrisma.notification.count.mockResolvedValue(1);

    const result = await service.findByUser('user-1', 1, 10);

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(result.total).toBe(1);
  });

  it('prevents users from marking someone else notification as read', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({
      id: 'n1',
      userId: 'other-user',
    });

    await expect(service.markRead('n1', 'user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws when marking a missing notification as read', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue(null);

    await expect(service.markRead('missing', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});


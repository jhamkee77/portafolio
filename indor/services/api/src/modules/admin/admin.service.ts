import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProperties,
      totalOrders,
      activeOrders,
      totalProviders,
      pendingProviders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count(),
      this.prisma.order.count(),
      this.prisma.order.count({
        where: {
          status: {
            notIn: ['Completed', 'Reviewed', 'SavedToPropertyRecord'],
          },
        },
      }),
      this.prisma.provider.count(),
      this.prisma.provider.count({ where: { status: 'pending' } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'succeeded' },
      }),
    ]);

    return {
      totalUsers,
      totalProperties,
      totalOrders,
      activeOrders,
      totalProviders,
      pendingProviders,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getOrdersByStatus() {
    const orders = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    return orders.map((o) => ({ status: o.status, count: o._count.id }));
  }

  async getRecentActivity(limit = 20) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
  }

  async deactivateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await this.auditLogs.create({
      userId: adminId,
      action: 'admin.deactivated_user',
      entityType: 'user',
      entityId: userId,
      metadata: { email: user.email },
    });

    return user;
  }

  async reactivateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    await this.auditLogs.create({
      userId: adminId,
      action: 'admin.reactivated_user',
      entityType: 'user',
      entityId: userId,
      metadata: { email: user.email },
    });

    return user;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: any;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll(page = 1, limit = 50, entityType?: string) {
    const skip = (page - 1) * limit;
    const where = entityType ? { entityType } : {};
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data: logs, total, page, limit };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    });
  }
}

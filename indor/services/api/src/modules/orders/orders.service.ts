import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { validateTransition, getNextStatuses } from './order-state-machine';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, userId },
    });
    if (!property) {
      throw new ForbiddenException('Property does not belong to user');
    }

    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        propertyId: dto.propertyId,
        serviceId: dto.serviceId,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        notes: dto.notes,
        addOns: dto.addOns,
        totalAmount: dto.totalAmount ?? service.basePrice,
        status: OrderStatus.Requested,
        bookingDate: new Date(),
      },
      include: {
        property: true,
        service: true,
      },
    });

    await this.auditLogs.create({
      userId,
      action: 'order.created',
      entityType: 'order',
      entityId: order.id,
      metadata: { status: OrderStatus.Requested, serviceId: dto.serviceId },
    });

    return order;
  }

  async transition(
    orderId: string,
    newStatus: OrderStatus,
    userId: string,
    userRole: UserRole,
    notes?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;
    validateTransition(oldStatus, newStatus, userRole);

    const updateData: any = { status: newStatus };
    if (notes) updateData.notes = notes;
    if (newStatus === OrderStatus.Completed) {
      updateData.completedDate = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        property: true,
        service: true,
        provider: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    await this.auditLogs.create({
      userId,
      action: 'order.status_changed',
      entityType: 'order',
      entityId: orderId,
      metadata: { from: oldStatus, to: newStatus, notes },
    });

    return { ...updated, previousStatus: oldStatus };
  }

  async assignProvider(orderId: string, providerId: string, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    validateTransition(order.status, OrderStatus.ProviderAssigned, UserRole.admin);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        providerId,
        status: OrderStatus.ProviderAssigned,
      },
      include: {
        property: true,
        service: true,
        provider: true,
      },
    });

    await this.auditLogs.create({
      userId: adminId,
      action: 'admin.assigned_provider',
      entityType: 'order',
      entityId: orderId,
      metadata: { providerId, providerName: provider.contactName },
    });

    return updated;
  }

  async findAll(page = 1, limit = 20, filters?: { status?: OrderStatus; userId?: string }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { id: true, address: true, city: true } },
          service: { select: { id: true, name: true, category: true } },
          provider: { select: { id: true, contactName: true, companyName: true } },
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total, page, limit };
  }

  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        property: true,
        service: true,
        provider: true,
        user: { select: { id: true, email: true, name: true, role: true } },
        payment: true,
        documents: true,
        reviews: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return { ...order, nextStatuses: getNextStatuses(order.status) };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    return this.findAll(page, limit, { userId });
  }

  async findByProperty(propertyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { propertyId };
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { id: true, name: true, category: true } },
          provider: { select: { id: true, contactName: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: orders, total, page, limit };
  }
}

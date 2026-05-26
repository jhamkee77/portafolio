import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateHomeSystemDto } from './dto/create-home-system.dto';

export interface HouseFactsTimelineEvent {
  id: string;
  type: string;
  title: string;
  date: Date;
  description?: string;
  amount?: number | null;
}

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: { ...dto, userId },
      include: { homeSystems: true },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId };
    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          homeSystems: true,
          _count: { select: { orders: true, documents: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);
    return { data: properties, total, page, limit };
  }

  async findOne(propertyId: string, userId?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        homeSystems: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { service: { select: { id: true, name: true, category: true } } },
        },
        documents: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (userId && property.userId !== userId) {
      throw new ForbiddenException('Property does not belong to user');
    }
    return property;
  }

  async getHouseFacts(propertyId: string, userId?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { homeSystems: true },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (userId && property.userId !== userId) {
      throw new ForbiddenException('Property does not belong to user');
    }

    const [orders, documents] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          propertyId,
          status: {
            in: [
              OrderStatus.Completed,
              OrderStatus.Reviewed,
              OrderStatus.SavedToPropertyRecord,
            ],
          },
        },
        orderBy: [{ completedDate: 'desc' }, { createdAt: 'desc' }],
        include: {
          service: { select: { id: true, name: true, category: true } },
          provider: { select: { id: true, contactName: true, companyName: true } },
          payment: true,
          documents: true,
        },
      }),
      this.prisma.document.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const maintenanceScore = this.calculateMaintenanceScore(
      property.homeSystems.length,
      orders.length,
      documents.length,
    );
    const timeline = this.buildHouseFactsTimeline(orders, documents);

    return {
      property: {
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
      },
      maintenanceScore,
      homeSystems: property.homeSystems,
      timeline,
      documents,
      riskSignals: this.getRiskSignals(property.homeSystems.length, orders.length, documents.length),
    };
  }

  async update(propertyId: string, userId: string, dto: UpdatePropertyDto) {
    await this.findOne(propertyId, userId);
    return this.prisma.property.update({
      where: { id: propertyId },
      data: dto,
      include: { homeSystems: true },
    });
  }

  async remove(propertyId: string, userId: string) {
    await this.findOne(propertyId, userId);
    await this.prisma.property.delete({ where: { id: propertyId } });
    return { deleted: true };
  }

  // ─── Home Systems ─────────────────────────────────────

  async addHomeSystem(propertyId: string, userId: string, dto: CreateHomeSystemDto) {
    await this.findOne(propertyId, userId);
    return this.prisma.homeSystem.create({
      data: {
        ...dto,
        propertyId,
        installDate: dto.installDate ? new Date(dto.installDate) : undefined,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
      },
    });
  }

  async getHomeSystems(propertyId: string) {
    return this.prisma.homeSystem.findMany({
      where: { propertyId },
      orderBy: { type: 'asc' },
    });
  }

  async removeHomeSystem(homeSystemId: string, userId: string) {
    const hs = await this.prisma.homeSystem.findUnique({
      where: { id: homeSystemId },
      include: { property: { select: { userId: true } } },
    });
    if (!hs) throw new NotFoundException('Home system not found');
    if (hs.property.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }
    await this.prisma.homeSystem.delete({ where: { id: homeSystemId } });
    return { deleted: true };
  }

  // ─── Property Record (admin) ──────────────────────────

  async findAllAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { orders: true, documents: true, homeSystems: true } },
        },
      }),
      this.prisma.property.count(),
    ]);
    return { data: properties, total, page, limit };
  }

  private calculateMaintenanceScore(homeSystemCount: number, orderCount: number, documentCount: number) {
    const score =
      25 +
      Math.min(homeSystemCount, 5) * 8 +
      Math.min(orderCount, 5) * 7 +
      Math.min(documentCount, 5) * 4;
    return Math.min(100, score);
  }

  private buildHouseFactsTimeline(orders: any[], documents: any[]): HouseFactsTimelineEvent[] {
    const orderEvents = orders.map((order) => ({
      id: `order:${order.id}`,
      type: 'service_completed',
      title: order.service?.name || 'Service completed',
      date: order.completedDate || order.createdAt,
      description: order.provider?.companyName || order.provider?.contactName,
      amount: order.totalAmount,
    }));
    const documentEvents = documents.map((document) => ({
      id: `document:${document.id}`,
      type: 'document_added',
      title: document.fileName,
      date: document.createdAt,
      description: document.type,
    }));
    return [...orderEvents, ...documentEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  private getRiskSignals(homeSystemCount: number, orderCount: number, documentCount: number) {
    const signals: string[] = [];
    if (homeSystemCount === 0) signals.push('No home systems documented yet');
    if (orderCount < 2) signals.push('Property record has limited service history');
    if (documentCount === 0) signals.push('No property documents uploaded yet');
    return signals;
  }
}

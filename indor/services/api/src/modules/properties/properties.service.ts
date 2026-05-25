import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateHomeSystemDto } from './dto/create-home-system.dto';

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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async findAll(page = 1, limit = 20, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (category) where.category = category;

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.service.count({ where }),
    ]);
    return { data: services, total, page, limit };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
    return { deactivated: true };
  }

  async getCategories() {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return services.map((s) => s.category);
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProviderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateProviderDto, userId?: string) {
    const existing = await this.prisma.provider.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Provider email already registered');

    return this.prisma.provider.create({
      data: { ...dto, userId },
    });
  }

  async findAll(page = 1, limit = 20, status?: ProviderStatus) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [providers, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.provider.count({ where }),
    ]);
    return { data: providers, total, page, limit };
  }

  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            service: { select: { name: true, category: true } },
            property: { select: { address: true, city: true } },
          },
        },
      },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async update(id: string, dto: UpdateProviderDto) {
    await this.findOne(id);
    return this.prisma.provider.update({ where: { id }, data: dto });
  }

  async approve(id: string, adminId: string) {
    const provider = await this.findOne(id);
    const updated = await this.prisma.provider.update({
      where: { id },
      data: { status: ProviderStatus.approved, isVerified: true },
    });

    await this.auditLogs.create({
      userId: adminId,
      action: 'provider.approved',
      entityType: 'provider',
      entityId: id,
      metadata: { providerName: provider.contactName },
    });

    return updated;
  }

  async suspend(id: string, adminId: string) {
    const provider = await this.findOne(id);
    const updated = await this.prisma.provider.update({
      where: { id },
      data: { status: ProviderStatus.suspended },
    });

    await this.auditLogs.create({
      userId: adminId,
      action: 'provider.suspended',
      entityType: 'provider',
      entityId: id,
      metadata: { providerName: provider.contactName },
    });

    return updated;
  }

  async findByUserId(userId: string) {
    const provider = await this.prisma.provider.findFirst({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('No provider profile found');
    return provider;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('ProvidersService', () => {
  let service: ProvidersService;

  const mockPrisma = {
    provider: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAuditLogs = {
    create: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a provider', async () => {
      const dto = {
        contactName: 'John Smith',
        email: 'john@hvac.com',
        companyName: 'Smith HVAC',
      };
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      mockPrisma.provider.create.mockResolvedValue({ id: 'prov-1', ...dto });

      const result = await service.create(dto);
      expect(result.contactName).toBe(dto.contactName);
    });

    it('should throw ConflictException if email already registered', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ contactName: 'X', email: 'existing@test.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('approve', () => {
    it('should set status to approved and log audit', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({
        id: 'prov-1',
        contactName: 'John',
        orders: [],
      });
      mockPrisma.provider.update.mockResolvedValue({
        id: 'prov-1',
        status: 'approved',
        isVerified: true,
      });

      const result = await service.approve('prov-1', 'admin-1');

      expect(result.status).toBe('approved');
      expect(mockAuditLogs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'provider.approved',
          entityType: 'provider',
          entityId: 'prov-1',
        }),
      );
    });
  });

  describe('suspend', () => {
    it('should set status to suspended and log audit', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({
        id: 'prov-1',
        contactName: 'John',
        orders: [],
      });
      mockPrisma.provider.update.mockResolvedValue({
        id: 'prov-1',
        status: 'suspended',
      });

      const result = await service.suspend('prov-1', 'admin-1');

      expect(result.status).toBe('suspended');
      expect(mockAuditLogs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'provider.suspended',
        }),
      );
    });
  });

  describe('findByUserId', () => {
    it('should throw NotFoundException if no provider profile', async () => {
      mockPrisma.provider.findFirst.mockResolvedValue(null);

      await expect(service.findByUserId('user-99')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

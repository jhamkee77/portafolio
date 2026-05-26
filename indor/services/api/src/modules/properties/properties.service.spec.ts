import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PropertiesService', () => {
  let service: PropertiesService;

  const mockPrisma = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    homeSystem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    document: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a property for the user', async () => {
      const dto = { address: '123 Main St', city: 'Charlotte', state: 'NC' };
      mockPrisma.property.create.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-1',
        ...dto,
      });

      const result = await service.create('user-1', dto);

      expect(result.address).toBe(dto.address);
      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'user-1' },
        include: { homeSystems: true },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if property does not exist', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-1',
      });

      await expect(service.findOne('prop-1', 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return property when user matches', async () => {
      const prop = { id: 'prop-1', userId: 'user-1', address: '123 Main St' };
      mockPrisma.property.findUnique.mockResolvedValue(prop);

      const result = await service.findOne('prop-1', 'user-1');
      expect(result.id).toBe('prop-1');
    });

    it('should skip ownership check when no userId provided (admin)', async () => {
      const prop = { id: 'prop-1', userId: 'user-1', address: '123 Main St' };
      mockPrisma.property.findUnique.mockResolvedValue(prop);

      const result = await service.findOne('prop-1');
      expect(result.id).toBe('prop-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.property.findMany.mockResolvedValue([
        { id: 'p1' },
        { id: 'p2' },
      ]);
      mockPrisma.property.count.mockResolvedValue(2);

      const result = await service.findAll('user-1', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });

  describe('removeHomeSystem', () => {
    it('should throw ForbiddenException if user does not own property', async () => {
      mockPrisma.homeSystem.findUnique.mockResolvedValue({
        id: 'hs-1',
        property: { userId: 'user-1' },
      });

      await expect(
        service.removeHomeSystem('hs-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete home system if user owns the property', async () => {
      mockPrisma.homeSystem.findUnique.mockResolvedValue({
        id: 'hs-1',
        property: { userId: 'user-1' },
      });
      mockPrisma.homeSystem.delete.mockResolvedValue({});

      const result = await service.removeHomeSystem('hs-1', 'user-1');
      expect(result.deleted).toBe(true);
    });
  });

  describe('getHouseFacts', () => {
    it('returns a property technical timeline and deterministic maintenance score', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-1',
        address: '123 Main St',
        maintenanceScore: 0,
        homeSystems: [
          { id: 'hs-1', type: 'hvac', brand: 'Carrier', warrantyStatus: 'active' },
        ],
      });
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          status: 'SavedToPropertyRecord',
          completedDate: new Date('2026-05-01T12:00:00Z'),
          createdAt: new Date('2026-04-20T12:00:00Z'),
          totalAmount: 250,
          service: { id: 'svc-1', name: 'HVAC Tune-Up', category: 'hvac' },
          provider: { id: 'prov-1', contactName: 'Alex Tech', companyName: 'Safe HVAC' },
          payment: { id: 'pay-1', status: 'succeeded', amount: 250 },
          documents: [{ id: 'doc-order', type: 'report', fileName: 'hvac-report.pdf' }],
        },
      ]);
      mockPrisma.document.findMany.mockResolvedValue([
        {
          id: 'doc-1',
          type: 'warranty',
          fileName: 'hvac-warranty.pdf',
          createdAt: new Date('2026-04-01T12:00:00Z'),
        },
      ]);

      const result = await service.getHouseFacts('prop-1', 'user-1');

      expect(result.property.id).toBe('prop-1');
      expect(result.maintenanceScore).toBeGreaterThan(0);
      expect(result.timeline[0]).toEqual(
        expect.objectContaining({
          type: 'service_completed',
          title: 'HVAC Tune-Up',
        }),
      );
      expect(result.riskSignals).toContain('Property record has limited service history');
    });

    it('throws ForbiddenException when requesting another user property facts', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'owner-1',
        homeSystems: [],
      });

      await expect(service.getHouseFacts('prop-1', 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

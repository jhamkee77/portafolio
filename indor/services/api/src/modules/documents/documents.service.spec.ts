import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  const mockPrisma = {
    property: { findFirst: jest.fn() },
    order: { findFirst: jest.fn() },
    homeSystem: { findFirst: jest.fn() },
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  const mockS3 = {
    getUploadUrl: jest.fn(),
    getDownloadUrl: jest.fn(),
    getKeyFromUrl: jest.fn(),
    deleteObject: jest.fn(),
  };

  let service: DocumentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DocumentsService(mockPrisma as any, mockS3 as any);
  });

  it('requires uploads to target a property, order, or home system', async () => {
    await expect(
      service.requestUpload('user-1', {
        fileName: 'photo.jpg',
        type: DocumentType.photo,
        mimeType: 'image/jpeg',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects unsupported MIME types', async () => {
    await expect(
      service.requestUpload('user-1', {
        fileName: 'script.exe',
        type: DocumentType.other,
        propertyId: 'prop-1',
        mimeType: 'application/x-msdownload',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects uploads for properties the user does not own', async () => {
    mockPrisma.property.findFirst.mockResolvedValue(null);

    await expect(
      service.requestUpload('user-1', {
        fileName: 'report.pdf',
        type: DocumentType.report,
        propertyId: 'prop-1',
        mimeType: 'application/pdf',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('creates a document after validation and returns a signed upload URL', async () => {
    mockPrisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
    mockS3.getUploadUrl.mockResolvedValue({
      uploadUrl: 'https://upload.test',
      fileUrl: 'https://file.test/report.pdf',
    });
    mockPrisma.document.create.mockResolvedValue({
      id: 'doc-1',
      fileName: 'report.pdf',
    });

    const result = await service.requestUpload('user-1', {
      fileName: 'report.pdf',
      type: DocumentType.report,
      propertyId: 'prop-1',
      mimeType: 'application/pdf',
      fileSize: 1024,
    });

    expect(mockS3.getUploadUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^report\//),
      'application/pdf',
    );
    expect(result.uploadUrl).toBe('https://upload.test');
  });
});


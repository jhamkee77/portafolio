import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from './s3.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]);
  private readonly maxFileSize = 10 * 1024 * 1024;

  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async requestUpload(userId: string, dto: UploadDocumentDto) {
    this.validateFile(dto);
    await this.validateUploadTarget(userId, dto);

    const ext = dto.fileName.split('.').pop() || 'bin';
    const key = `${dto.type}/${randomUUID()}.${ext}`;
    const { uploadUrl, fileUrl } = await this.s3.getUploadUrl(
      key,
      dto.mimeType || 'application/octet-stream',
    );

    const document = await this.prisma.document.create({
      data: {
        uploadedById: userId,
        fileName: dto.fileName,
        fileUrl,
        type: dto.type,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        description: dto.description,
        propertyId: dto.propertyId,
        orderId: dto.orderId,
        homeSystemId: dto.homeSystemId,
      },
    });

    return { document, uploadUrl };
  }

  async findByProperty(propertyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { propertyId };
    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { id: true, name: true } } },
      }),
      this.prisma.document.count({ where }),
    ]);
    return { data: documents, total, page, limit };
  }

  async findByOrder(orderId: string) {
    return this.prisma.document.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
  }

  async getDownloadUrl(documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const key = this.s3.getKeyFromUrl(doc.fileUrl);
    const downloadUrl = await this.s3.getDownloadUrl(key);
    return { document: doc, downloadUrl };
  }

  async remove(documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const key = this.s3.getKeyFromUrl(doc.fileUrl);
    await this.s3.deleteObject(key);
    await this.prisma.document.delete({ where: { id: documentId } });
    return { deleted: true };
  }

  private validateFile(dto: UploadDocumentDto) {
    if (dto.mimeType && !this.allowedMimeTypes.has(dto.mimeType)) {
      throw new BadRequestException('Unsupported file type');
    }
    if (dto.fileSize && dto.fileSize > this.maxFileSize) {
      throw new BadRequestException('File exceeds 10MB limit');
    }
  }

  private async validateUploadTarget(userId: string, dto: UploadDocumentDto) {
    if (!dto.propertyId && !dto.orderId && !dto.homeSystemId) {
      throw new BadRequestException('Document must be attached to a property, order, or home system');
    }

    if (dto.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: { id: dto.propertyId, userId },
      });
      if (!property) throw new ForbiddenException('Property does not belong to user');
    }

    if (dto.orderId) {
      const order = await this.prisma.order.findFirst({
        where: { id: dto.orderId, userId },
      });
      if (!order) throw new ForbiddenException('Order does not belong to user');
    }

    if (dto.homeSystemId) {
      const homeSystem = await this.prisma.homeSystem.findFirst({
        where: { id: dto.homeSystemId, property: { userId } },
      });
      if (!homeSystem) {
        throw new ForbiddenException('Home system does not belong to user');
      }
    }
  }
}

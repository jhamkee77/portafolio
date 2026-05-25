import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from './s3.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async requestUpload(userId: string, dto: UploadDocumentDto) {
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
}

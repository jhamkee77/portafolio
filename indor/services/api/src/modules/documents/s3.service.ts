import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * S3 service for document storage.
 * Uses MinIO locally, AWS S3 in production.
 * Stub implementation for MVP — returns mock signed URLs.
 */
@Injectable()
export class S3Service {
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('AWS_S3_BUCKET', 'indor-documents');
    this.endpoint = this.config.get('AWS_S3_ENDPOINT', 'http://localhost:9000');
  }

  async getUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    // Stub: in production, use @aws-sdk/s3-request-presigner
    const fileUrl = `${this.endpoint}/${this.bucket}/${key}`;
    return {
      uploadUrl: `${fileUrl}?X-Amz-Signature=stub_${Date.now()}`,
      fileUrl,
    };
  }

  async getDownloadUrl(key: string): Promise<string> {
    return `${this.endpoint}/${this.bucket}/${key}?X-Amz-Signature=stub_${Date.now()}&X-Amz-Expires=3600`;
  }

  async deleteObject(key: string): Promise<void> {
    // Stub: in production, call s3.deleteObject
  }

  getKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    return url.pathname.replace(`/${this.bucket}/`, '');
  }
}

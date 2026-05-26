import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly region: string;
  private readonly client?: S3Client;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('AWS_S3_BUCKET', 'indor-documents');
    this.endpoint = this.config.get('AWS_S3_ENDPOINT', 'http://localhost:9000');
    this.region = this.config.get('AWS_REGION', 'us-east-1');

    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (accessKeyId && secretAccessKey && !accessKeyId.includes('replace')) {
      this.client = new S3Client({
        region: this.region,
        endpoint: this.endpoint || undefined,
        forcePathStyle: Boolean(this.endpoint),
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  async getUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    const fileUrl = `${this.endpoint}/${this.bucket}/${key}`;
    if (this.client) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });
      return {
        uploadUrl: await getSignedUrl(this.client, command, { expiresIn: 900 }),
        fileUrl,
      };
    }

    return {
      uploadUrl: `${fileUrl}?X-Amz-Signature=stub_${Date.now()}`,
      fileUrl,
    };
  }

  async getDownloadUrl(key: string): Promise<string> {
    if (this.client) {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      return getSignedUrl(this.client, command, { expiresIn: 3600 });
    }
    return `${this.endpoint}/${this.bucket}/${key}?X-Amz-Signature=stub_${Date.now()}&X-Amz-Expires=3600`;
  }

  async deleteObject(key: string): Promise<void> {
    if (this.client) {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }
  }

  getKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    return url.pathname.replace(`/${this.bucket}/`, '');
  }
}

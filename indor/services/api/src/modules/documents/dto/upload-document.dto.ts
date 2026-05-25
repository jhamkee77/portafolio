import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({ example: 'inspection-report.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ enum: DocumentType, default: 'other' })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiPropertyOptional({ description: 'Property ID to attach to' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Order ID to attach to' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Home system ID to attach to' })
  @IsOptional()
  @IsString()
  homeSystemId?: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 1048576 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'Annual HVAC inspection report' })
  @IsOptional()
  @IsString()
  description?: string;
}

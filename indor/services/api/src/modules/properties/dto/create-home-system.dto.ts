import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HomeSystemType } from '@prisma/client';

export class CreateHomeSystemDto {
  @ApiProperty({ enum: HomeSystemType, example: 'hvac' })
  @IsEnum(HomeSystemType)
  type: HomeSystemType;

  @ApiPropertyOptional({ example: 'Carrier' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: '24ACC636A003' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'SN-123456' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ example: '2020-06-15' })
  @IsOptional()
  @IsDateString()
  installDate?: string;

  @ApiPropertyOptional({ example: '2030-06-15' })
  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  warrantyStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

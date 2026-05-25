import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'HVAC Maintenance' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'hvac' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Complete HVAC system maintenance and tune-up' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 149.99 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 99.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceRangeMin?: number;

  @ApiPropertyOptional({ example: 299.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceRangeMax?: number;

  @ApiPropertyOptional({ example: '2-4 hours' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'JSON array of booking questions' })
  @IsOptional()
  questions?: any;

  @ApiPropertyOptional({ description: 'JSON array of available add-ons' })
  @IsOptional()
  addOns?: any;
}

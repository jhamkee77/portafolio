import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Property ID for the service' })
  @IsString()
  propertyId: string;

  @ApiProperty({ description: 'Service ID being ordered' })
  @IsString()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Preferred scheduling date' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ example: 'Please call before arriving' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Selected add-ons as JSON' })
  @IsOptional()
  addOns?: any;

  @ApiPropertyOptional({ example: 149.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;
}

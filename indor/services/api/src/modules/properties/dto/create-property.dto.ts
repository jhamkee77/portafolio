import { IsString, IsOptional, IsInt, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 'Charlotte' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'NC' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '28202' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  beds?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baths?: number;

  @ApiPropertyOptional({ example: 2200 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sqft?: number;

  @ApiPropertyOptional({ example: 0.25 })
  @IsOptional()
  @IsNumber()
  lotSize?: number;

  @ApiPropertyOptional({ example: 1995 })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  yearBuilt?: number;

  @ApiPropertyOptional({ example: 350000 })
  @IsOptional()
  @IsNumber()
  homeValue?: number;
}

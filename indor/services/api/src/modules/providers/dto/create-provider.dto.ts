import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  contactName: string;

  @ApiProperty({ example: 'provider@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Smith HVAC Services' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: '+1-704-555-0100' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'company', description: 'individual or company' })
  @IsOptional()
  @IsString()
  providerType?: string;

  @ApiPropertyOptional({ description: 'JSON array of zip codes served' })
  @IsOptional()
  serviceAreas?: any;

  @ApiPropertyOptional({ description: 'JSON array of service category IDs' })
  @IsOptional()
  servicesOffered?: any;

  @ApiPropertyOptional({ description: 'JSON availability schedule' })
  @IsOptional()
  availability?: any;
}

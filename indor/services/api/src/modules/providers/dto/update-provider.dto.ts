import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderStatus } from '@prisma/client';
import { CreateProviderDto } from './create-provider.dto';

export class UpdateProviderDto extends PartialType(CreateProviderDto) {
  @ApiPropertyOptional({ enum: ProviderStatus })
  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID to pay for' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: 'card' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}

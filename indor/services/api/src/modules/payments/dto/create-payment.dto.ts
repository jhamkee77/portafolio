import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID to pay for' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 149.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: 'card' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}

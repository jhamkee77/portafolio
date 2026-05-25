import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'Order ID the message belongs to' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'Hi, what time will you arrive?' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'text', description: 'text | system | image' })
  @IsOptional()
  @IsString()
  type?: string;
}

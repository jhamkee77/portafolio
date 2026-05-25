import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private messagesGateway: MessagesGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Send a message in an order conversation' })
  async send(
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.messagesService.send(userId, dto);
    this.messagesGateway.emitNewMessage(dto.orderId, message);
    return message;
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get messages for an order' })
  findByOrder(
    @Param('orderId') orderId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.findByOrder(orderId, page, limit);
  }

  @Patch('order/:orderId/read')
  @ApiOperation({ summary: 'Mark all messages in an order as read' })
  markAsRead(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.markAsRead(orderId, userId);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread message count for current user' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }
}

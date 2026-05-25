import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(senderId: string, dto: SendMessageDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.message.create({
      data: {
        orderId: dto.orderId,
        senderId,
        content: dto.content,
        type: dto.type || 'text',
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async findByOrder(orderId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = { orderId };
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
      }),
      this.prisma.message.count({ where }),
    ]);
    return { data: messages, total, page, limit };
  }

  async markAsRead(orderId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        orderId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    const count = await this.prisma.message.count({
      where: {
        orderId: { in: orderIds },
        senderId: { not: userId },
        isRead: false,
      },
    });
    return { unreadCount: count };
  }
}

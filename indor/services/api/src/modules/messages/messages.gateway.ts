import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket gateway for real-time order tracking and messaging.
 * Clients join a room named `order:<orderId>` to receive updates.
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinOrder')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    client.join(`order:${data.orderId}`);
    return { event: 'joined', orderId: data.orderId };
  }

  @SubscribeMessage('leaveOrder')
  handleLeaveOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    client.leave(`order:${data.orderId}`);
    return { event: 'left', orderId: data.orderId };
  }

  emitNewMessage(orderId: string, message: any) {
    this.server.to(`order:${orderId}`).emit('newMessage', message);
  }

  emitOrderStatusChange(orderId: string, data: { from: string; to: string; order: any }) {
    this.server.to(`order:${orderId}`).emit('orderStatusChanged', data);
  }
}

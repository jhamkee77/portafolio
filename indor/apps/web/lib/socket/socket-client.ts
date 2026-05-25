'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/ws`, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function joinOrder(orderId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('joinOrder', { orderId });
}

export function leaveOrder(orderId: string) {
  const s = getSocket();
  s.emit('leaveOrder', { orderId });
}

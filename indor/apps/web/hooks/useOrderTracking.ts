'use client';

import { useEffect, useState } from 'react';
import { getSocket, joinOrder, leaveOrder } from '@/lib/socket/socket-client';
import type { OrderStatus } from '@/types';

interface OrderStatusEvent {
  from: string;
  to: string;
  order: any;
}

export function useOrderTracking(orderId: string | null) {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [lastEvent, setLastEvent] = useState<OrderStatusEvent | null>(null);

  useEffect(() => {
    if (!orderId) return;

    joinOrder(orderId);
    const socket = getSocket();

    const onStatusChange = (data: OrderStatusEvent) => {
      setStatus(data.to as OrderStatus);
      setLastEvent(data);
    };

    socket.on('orderStatusChanged', onStatusChange);

    return () => {
      socket.off('orderStatusChanged', onStatusChange);
      leaveOrder(orderId);
    };
  }, [orderId]);

  return { status, lastEvent };
}

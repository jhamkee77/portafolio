'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api/orders';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Order, OrderStatus } from '@/types';

const PROVIDER_TRANSITIONS: Record<string, OrderStatus> = {
  ProviderAssigned: 'OnTheWay',
  OnTheWay: 'Arrived',
  Arrived: 'WorkInProgress',
  WorkInProgress: 'Completed',
};

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    ordersApi.listMine(1, 50).then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleTransition = async (orderId: string, newStatus: OrderStatus) => {
    await ordersApi.transition(orderId, newStatus);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Jobs</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : orders.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-gray-400">No jobs assigned yet</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const nextStatus = PROVIDER_TRANSITIONS[o.status];
            return (
              <Card key={o.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{o.service?.name}</h3>
                    <p className="text-xs text-gray-500">{o.property?.address}</p>
                    <p className="text-xs text-gray-400 mt-1">{o.user?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    {nextStatus && (
                      <Button size="sm" onClick={() => handleTransition(o.id, nextStatus)}>
                        {nextStatus.replace(/([A-Z])/g, ' $1').trim()}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

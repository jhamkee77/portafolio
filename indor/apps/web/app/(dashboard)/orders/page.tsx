'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api/orders';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.listMine(1, 50).then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Track all your service orders</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet. Browse the marketplace to book a service.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{o.service?.name || 'Service'}</h3>
                    <p className="text-xs text-gray-500">{o.property?.address}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {o.scheduledDate ? new Date(o.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status} />
                    {o.totalAmount != null && (
                      <p className="text-sm font-medium mt-2">${o.totalAmount}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

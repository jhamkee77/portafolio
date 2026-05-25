'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api/orders';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/types';

const STATUSES: (OrderStatus | '')[] = ['', 'Requested', 'Confirmed', 'ProviderAssigned', 'OnTheWay', 'Arrived', 'WorkInProgress', 'Completed'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (status?: string) => {
    setLoading(true);
    ordersApi.listAll(1, 100, status || undefined).then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); load(s); }}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{o.service?.name}</h3>
                    <p className="text-xs text-gray-500">{o.user?.name} &mdash; {o.property?.address}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <StatusBadge status={o.status} />
                    {o.provider && <span className="text-xs text-gray-400">{o.provider.contactName}</span>}
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { propertiesApi } from '@/lib/api/properties';
import { ordersApi } from '@/lib/api/orders';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, ShoppingBag, ClipboardList, Plus } from 'lucide-react';
import type { Property, Order } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [propRes, orderRes] = await Promise.all([
          propertiesApi.list(1, 5),
          ordersApi.listMine(1, 5),
        ]);
        setProperties(propRes.data);
        setOrders(orderRes.data);
      } catch {
        // API may not be running
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s your home overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{properties.length}</p>
              <p className="text-sm text-gray-500">Properties</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-emerald-100 p-3">
              <ClipboardList className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-gray-500">Recent Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-amber-100 p-3">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <Link href="/marketplace" className="text-blue-600 hover:underline font-medium">
                Browse Services
              </Link>
              <p className="text-sm text-gray-500">Find a provider</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold">My Properties</h2>
            <Link href="/properties/add">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : properties.length === 0 ? (
              <p className="text-sm text-gray-400">No properties yet. Add your first property to get started.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {properties.map((p) => (
                  <li key={p.id} className="py-3">
                    <Link href={`/properties/${p.id}`} className="hover:text-blue-600">
                      <p className="font-medium text-sm">{p.address}</p>
                      <p className="text-xs text-gray-500">{[p.city, p.state, p.zipCode].filter(Boolean).join(', ')}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/orders">
              <Button size="sm" variant="outline">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders yet. Browse the marketplace to book a service.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <li key={o.id} className="py-3 flex items-center justify-between">
                    <Link href={`/orders/${o.id}`} className="hover:text-blue-600">
                      <p className="font-medium text-sm">{o.service?.name || 'Service'}</p>
                      <p className="text-xs text-gray-500">{o.property?.address}</p>
                    </Link>
                    <StatusBadge status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

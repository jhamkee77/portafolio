'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, Building2, ClipboardList, Truck, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalOrders: number;
  activeOrders: number;
  totalProviders: number;
  pendingProviders: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([]);

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setStats(r.data)).catch(() => {});
    api.get('/admin/orders-by-status').then((r) => setOrdersByStatus(r.data)).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'emerald' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ClipboardList, color: 'purple' },
    { label: 'Active Orders', value: stats.activeOrders, icon: ClipboardList, color: 'orange' },
    { label: 'Providers', value: stats.totalProviders, icon: Truck, color: 'indigo' },
    { label: 'Pending Approvals', value: stats.pendingProviders, icon: Truck, color: 'amber' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`rounded-lg bg-${s.color}-100 p-3`}>
                <s.icon className={`h-6 w-6 text-${s.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Orders by Status</h2></CardHeader>
        <CardContent>
          {ordersByStatus.length > 0 ? (
            <div className="space-y-2">
              {ordersByStatus.map((o) => (
                <div key={o.status} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{o.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm font-bold">{o.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

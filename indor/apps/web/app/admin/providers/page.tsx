'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProviderRow {
  id: string;
  contactName: string;
  companyName?: string;
  email: string;
  status: string;
  isVerified: boolean;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/providers', { params: { page: 1, limit: 100 } }).then((r) => setProviders(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    await api.patch(`/providers/${id}/approve`);
    load();
  };

  const handleSuspend = async (id: string) => {
    await api.patch(`/providers/${id}/suspend`);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Management</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : providers.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-gray-400">No providers registered yet</CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{p.contactName}</td>
                  <td className="py-3 px-4 text-gray-500">{p.companyName || '—'}</td>
                  <td className="py-3 px-4 text-gray-500">{p.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      p.status === 'approved' || p.status === 'active' ? 'bg-green-100 text-green-700' :
                      p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    {p.status === 'pending' && (
                      <Button size="sm" variant="secondary" onClick={() => handleApprove(p.id)}>Approve</Button>
                    )}
                    {(p.status === 'approved' || p.status === 'active') && (
                      <Button size="sm" variant="danger" onClick={() => handleSuspend(p.id)}>Suspend</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

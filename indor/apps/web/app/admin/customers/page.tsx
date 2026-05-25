'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';

interface UserRow { id: string; email: string; name: string; role: string; isActive: boolean; createdAt: string; }

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users', { params: { page: 1, limit: 100 } }).then((r) => setUsers(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3 px-4 capitalize">{u.role.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

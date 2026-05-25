'use client';

import { useAuthStore } from '@/lib/store/auth.store';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">Account Information</h2></CardHeader>
        <CardContent>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{user?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd className="font-medium capitalize">{user?.role?.replace('_', ' ')}</dd></div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

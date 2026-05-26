'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { NotificationRecord } from '@/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.listMine()
      .then((result) => setNotifications(result.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    const updated = await notificationsApi.markRead(id);
    setNotifications((items) => items.map((item) => item.id === id ? updated : item));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Notifications</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : notifications.length > 0 ? (
        <Card>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{notification.body}</p>
                    <p className="mt-1 text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                  {!notification.readAt && (
                    <Button variant="outline" size="sm" onClick={() => markRead(notification.id)}>
                      Mark read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Notifications from orders and payments will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

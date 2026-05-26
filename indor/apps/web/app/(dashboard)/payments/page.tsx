'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { paymentsApi } from '@/lib/api/payments';
import type { Payment } from '@/types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi.listMine()
      .then((result) => setPayments(result.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Payments</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : payments.length > 0 ? (
        <Card>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between py-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">${payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="capitalize text-gray-700">{payment.status}</p>
                    {payment.order && (
                      <Link href={`/orders/${payment.order.id}`} className="text-xs text-blue-600 hover:text-blue-700">
                        View order
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Payment history will appear here once you complete orders.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

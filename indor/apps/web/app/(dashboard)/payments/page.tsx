'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Payments</h1>
      <Card>
        <CardContent className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Payment history will appear here once you complete orders.</p>
        </CardContent>
      </Card>
    </div>
  );
}

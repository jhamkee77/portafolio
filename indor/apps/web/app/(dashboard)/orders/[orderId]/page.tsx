'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import { paymentsApi } from '@/lib/api/payments';
import { documentsApi } from '@/lib/api/documents';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { CreditCard, Upload } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const ORDER_TIMELINE: OrderStatus[] = [
  'Requested', 'Confirmed', 'ProviderAssigned', 'OnTheWay',
  'Arrived', 'WorkInProgress', 'EstimateSent', 'Completed',
  'Reviewed', 'SavedToPropertyRecord',
];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { status: liveStatus } = useOrderTracking(orderId);

  useEffect(() => {
    if (orderId) {
      ordersApi.get(orderId).then(setOrder).catch(() => {}).finally(() => setLoading(false));
    }
  }, [orderId]);

  const currentStatus = liveStatus || order?.status;

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!order) return <div className="text-center py-12 text-gray-400">Order not found</div>;

  const currentIndex = ORDER_TIMELINE.indexOf(currentStatus as OrderStatus);
  const refreshOrder = async () => {
    const next = await ordersApi.get(orderId);
    setOrder(next);
  };

  const handlePayment = async () => {
    if (!order) return;
    setPaymentLoading(true);
    setMessage('');
    try {
      const intent = await paymentsApi.createIntent(order.id);
      await paymentsApi.confirm(intent.payment.id);
      await refreshOrder();
      setMessage('Payment processed in test mode.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Payment could not be processed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleUpload = async (file?: File) => {
    if (!file || !order) return;
    setUploadLoading(true);
    setMessage('');
    try {
      const { uploadUrl } = await documentsApi.requestUpload({
        fileName: file.name,
        type: file.type.startsWith('image/') ? 'photo' : 'report',
        orderId: order.id,
        propertyId: order.propertyId,
        mimeType: file.type,
        fileSize: file.size,
      });
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      await refreshOrder();
      setMessage('Document uploaded.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Document upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.service?.name}</h1>
          <p className="text-sm text-gray-500">{order.property?.address}</p>
        </div>
        <StatusBadge status={currentStatus as OrderStatus} />
      </div>

      {/* Timeline */}
      <Card className="mb-8">
        <CardHeader><h2 className="font-semibold">Order Timeline</h2></CardHeader>
        <CardContent>
          <div className="flex items-center overflow-x-auto pb-2">
            {ORDER_TIMELINE.map((step, i) => {
              const done = i <= currentIndex;
              const active = i === currentIndex;
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      active ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                      done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {done && !active ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 text-center leading-tight ${active ? 'text-blue-600 font-semibold' : done ? 'text-green-600' : 'text-gray-400'}`}>
                      {step.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  {i < ORDER_TIMELINE.length - 1 && (
                    <div className={`h-0.5 w-8 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><h2 className="font-semibold">Order Details</h2></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Service</dt><dd className="font-medium">{order.service?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Property</dt><dd className="font-medium">{order.property?.address}</dd></div>
              {order.totalAmount != null && <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="font-bold">${order.totalAmount}</dd></div>}
              {order.scheduledDate && <div className="flex justify-between"><dt className="text-gray-500">Scheduled</dt><dd>{new Date(order.scheduledDate).toLocaleDateString()}</dd></div>}
              {order.notes && <div><dt className="text-gray-500 mb-1">Notes</dt><dd className="text-gray-700">{order.notes}</dd></div>}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">Provider</h2></CardHeader>
          <CardContent>
            {order.provider ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{order.provider.contactName}</dd></div>
                {order.provider.companyName && <div className="flex justify-between"><dt className="text-gray-500">Company</dt><dd>{order.provider.companyName}</dd></div>}
                {order.provider.phone && <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{order.provider.phone}</dd></div>}
              </dl>
            ) : (
              <p className="text-sm text-gray-400">Provider not yet assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader><h2 className="font-semibold">Payment</h2></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm mb-4">
              <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium capitalize">{order.payment?.status || 'Not started'}</dd></div>
              {order.totalAmount != null && <div className="flex justify-between"><dt className="text-gray-500">Amount</dt><dd className="font-bold">${order.totalAmount}</dd></div>}
            </dl>
            {order.payment?.receiptUrl && (
              <a className="text-sm text-blue-600 hover:text-blue-700" href={order.payment.receiptUrl} target="_blank" rel="noreferrer">View receipt</a>
            )}
            {!order.payment && (
              <Button onClick={handlePayment} loading={paymentLoading} className="w-full gap-2">
                <CreditCard className="h-4 w-4" />
                Pay in Test Mode
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">Documents</h2></CardHeader>
          <CardContent>
            <label className="mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-700">
              <Upload className="h-4 w-4" />
              {uploadLoading ? 'Uploading...' : 'Upload photo or PDF'}
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={uploadLoading}
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
            </label>
            {order.documents?.length ? (
              <ul className="divide-y divide-gray-100 text-sm">
                {order.documents.map((doc) => (
                  <li key={doc.id} className="py-2">
                    <p className="font-medium text-gray-900">{doc.fileName}</p>
                    <p className="text-xs text-gray-500 capitalize">{doc.type}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No documents attached yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}

      {/* Next statuses */}
      {order.nextStatuses && order.nextStatuses.length > 0 && (
        <Card className="mt-8">
          <CardHeader><h2 className="font-semibold">Available Actions</h2></CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400 mb-2">Next possible states:</p>
            <div className="flex gap-2">
              {order.nextStatuses.map((s) => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {s.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

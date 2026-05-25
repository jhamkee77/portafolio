import { clsx } from 'clsx';
import type { OrderStatus } from '@/types';

const statusColors: Record<OrderStatus, string> = {
  Requested: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  ProviderAssigned: 'bg-indigo-100 text-indigo-800',
  OnTheWay: 'bg-purple-100 text-purple-800',
  Arrived: 'bg-cyan-100 text-cyan-800',
  WorkInProgress: 'bg-orange-100 text-orange-800',
  EstimateSent: 'bg-amber-100 text-amber-800',
  Completed: 'bg-green-100 text-green-800',
  Reviewed: 'bg-emerald-100 text-emerald-800',
  SavedToPropertyRecord: 'bg-teal-100 text-teal-800',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const label = status.replace(/([A-Z])/g, ' $1').trim();
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[status] || 'bg-gray-100 text-gray-800')}>
      {label}
    </span>
  );
}

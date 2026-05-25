'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { servicesApi } from '@/lib/api/services';
import { propertiesApi } from '@/lib/api/properties';
import { ordersApi } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import type { Service, Property } from '@/types';

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (serviceId) {
      Promise.all([
        servicesApi.get(serviceId),
        propertiesApi.list(1, 50),
      ]).then(([s, p]) => {
        setService(s);
        setProperties(p.data);
        if (p.data.length > 0) setSelectedProperty(p.data[0].id);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [serviceId]);

  const handleBook = async () => {
    if (!selectedProperty || !service) return;
    setBooking(true);
    setError('');
    try {
      const order = await ordersApi.create({
        propertyId: selectedProperty,
        serviceId: service.id,
        notes: notes || undefined,
        totalAmount: service.basePrice,
      });
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!service) return <div className="text-center py-12 text-gray-400">Service not found</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <span className="text-xs text-blue-600 capitalize font-medium">{service.category}</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{service.name}</h1>
        {service.description && <p className="text-gray-500 mt-2">{service.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><h2 className="font-semibold">Service Details</h2></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Base Price</dt><dd className="font-bold text-lg">${service.basePrice}</dd></div>
              {service.priceRangeMin != null && <div className="flex justify-between"><dt className="text-gray-500">Price Range</dt><dd>${service.priceRangeMin} - ${service.priceRangeMax}</dd></div>}
              {service.duration && <div className="flex justify-between"><dt className="text-gray-500">Duration</dt><dd>{service.duration}</dd></div>}
              {service.rating != null && service.rating > 0 && (
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Rating</dt>
                  <dd className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500 fill-current" /> {service.rating.toFixed(1)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">Book This Service</h2></CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.address}</option>
                  ))}
                </select>
                {properties.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Add a property first to book services.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Any special instructions..."
                />
              </div>

              <Button
                onClick={handleBook}
                loading={booking}
                disabled={!selectedProperty}
                className="w-full"
                size="lg"
              >
                Book for ${service.basePrice}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

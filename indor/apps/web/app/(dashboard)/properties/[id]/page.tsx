'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api/properties';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import type { HouseFactsRecord } from '@/types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [houseFacts, setHouseFacts] = useState<HouseFactsRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        propertiesApi.get(id),
        propertiesApi.getHouseFacts(id).catch(() => null),
      ]).then(([propertyResult, houseFactsResult]) => {
        setProperty(propertyResult);
        setHouseFacts(houseFactsResult);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!property) return <div className="text-center py-12 text-gray-400">Property not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{property.address}</h1>
      <p className="text-sm text-gray-500 mb-8">{[property.city, property.state, property.zipCode].filter(Boolean).join(', ')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property details */}
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="font-semibold">Property Details</h2></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {property.beds != null && <div className="flex justify-between"><dt className="text-gray-500">Beds</dt><dd className="font-medium">{property.beds}</dd></div>}
              {property.baths != null && <div className="flex justify-between"><dt className="text-gray-500">Baths</dt><dd className="font-medium">{property.baths}</dd></div>}
              {property.sqft != null && <div className="flex justify-between"><dt className="text-gray-500">Sqft</dt><dd className="font-medium">{property.sqft.toLocaleString()}</dd></div>}
              {property.yearBuilt != null && <div className="flex justify-between"><dt className="text-gray-500">Year Built</dt><dd className="font-medium">{property.yearBuilt}</dd></div>}
              {property.homeValue != null && <div className="flex justify-between"><dt className="text-gray-500">Home Value</dt><dd className="font-medium">${property.homeValue.toLocaleString()}</dd></div>}
            </dl>
          </CardContent>
        </Card>

        {/* Home systems */}
        <Card className="lg:col-span-2">
          <CardHeader><h2 className="font-semibold">Home Systems</h2></CardHeader>
          <CardContent>
            {property.homeSystems?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.homeSystems.map((hs: any) => (
                  <div key={hs.id} className="border rounded-lg p-3">
                    <p className="font-medium text-sm capitalize">{hs.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{[hs.brand, hs.model].filter(Boolean).join(' ')}</p>
                    {hs.warrantyStatus && (
                      <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${hs.warrantyStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        Warranty: {hs.warrantyStatus}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No home systems registered yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {houseFacts && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">House Facts Record</h2>
              <div className="text-right">
                <p className="text-xs text-gray-500">Maintenance Score</p>
                <p className="text-2xl font-bold text-blue-600">{houseFacts.maintenanceScore}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {houseFacts.riskSignals.length > 0 && (
              <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                {houseFacts.riskSignals.join(' · ')}
              </div>
            )}
            {houseFacts.timeline.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {houseFacts.timeline.slice(0, 8).map((event) => (
                  <li key={event.id} className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{event.title}</p>
                        {event.description && <p className="text-xs text-gray-500">{event.description}</p>}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{new Date(event.date).toLocaleDateString()}</p>
                        {event.amount != null && <p>${event.amount}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">House Facts will build as services and documents are saved.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order history */}
      <Card className="mt-8">
        <CardHeader><h2 className="font-semibold">Service History (Property Record)</h2></CardHeader>
        <CardContent>
          {property.orders?.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {property.orders.map((o: any) => (
                <li key={o.id} className="py-3 flex items-center justify-between">
                  <Link href={`/orders/${o.id}`} className="hover:text-blue-600">
                    <p className="font-medium text-sm">{o.service?.name}</p>
                    <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </Link>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No service history for this property.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

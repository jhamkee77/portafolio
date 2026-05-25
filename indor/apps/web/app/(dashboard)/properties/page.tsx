'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api/properties';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus, ChevronRight } from 'lucide-react';
import type { Property } from '@/types';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesApi.list(1, 50).then((r) => setProperties(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your homes and property records</p>
        </div>
        <Link href="/properties/add">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Property</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No properties yet</p>
            <Link href="/properties/add">
              <Button>Add your first property</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.address}</h3>
                      <p className="text-sm text-gray-500">{[p.city, p.state, p.zipCode].filter(Boolean).join(', ')}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                  </div>
                  <div className="flex gap-4 mt-4 text-xs text-gray-500">
                    {p.beds != null && <span>{p.beds} bed</span>}
                    {p.baths != null && <span>{p.baths} bath</span>}
                    {p.sqft != null && <span>{p.sqft.toLocaleString()} sqft</span>}
                    {p.yearBuilt != null && <span>Built {p.yearBuilt}</span>}
                  </div>
                  {p._count && (
                    <div className="flex gap-4 mt-3 text-xs">
                      <span className="text-blue-600">{p._count.orders} orders</span>
                      <span className="text-emerald-600">{p._count.documents} docs</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { servicesApi } from '@/lib/api/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { Service } from '@/types';

export default function MarketplacePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesApi.getCategories().then(setCategories).catch(() => {});
    loadServices();
  }, []);

  const loadServices = (category?: string) => {
    setLoading(true);
    servicesApi.list(1, 50, category || undefined).then((r) => setServices(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const handleCategoryFilter = (cat: string) => {
    setSelectedCategory(cat);
    loadServices(cat);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Service Marketplace</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and book home services from verified providers</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          size="sm"
          variant={selectedCategory === '' ? 'primary' : 'outline'}
          onClick={() => handleCategoryFilter('')}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? 'primary' : 'outline'}
            onClick={() => handleCategoryFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s.id} href={`/marketplace/${s.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                      <span className="text-xs text-blue-600 capitalize">{s.category}</span>
                    </div>
                    {s.rating != null && s.rating > 0 && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{s.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                  )}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900">${s.basePrice}</span>
                      {s.priceRangeMax && (
                        <span className="text-xs text-gray-400 ml-1">- ${s.priceRangeMax}</span>
                      )}
                    </div>
                    {s.duration && <span className="text-xs text-gray-400">{s.duration}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertiesApi } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const schema = z.object({
  address: z.string().min(1, 'Address required'),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  beds: z.coerce.number().int().min(0).optional(),
  baths: z.coerce.number().min(0).optional(),
  sqft: z.coerce.number().int().min(0).optional(),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      await propertiesApi.create(data);
      router.push('/properties');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Property</h1>

      <Card>
        <CardContent className="pt-6">
          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input id="address" label="Address *" placeholder="123 Main Street" error={errors.address?.message} {...register('address')} />

            <div className="grid grid-cols-3 gap-4">
              <Input id="city" label="City" placeholder="Charlotte" {...register('city')} />
              <Input id="state" label="State" placeholder="NC" {...register('state')} />
              <Input id="zipCode" label="Zip Code" placeholder="28202" {...register('zipCode')} />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Input id="beds" label="Beds" type="number" placeholder="3" {...register('beds')} />
              <Input id="baths" label="Baths" type="number" step="0.5" placeholder="2.5" {...register('baths')} />
              <Input id="sqft" label="Sqft" type="number" placeholder="2200" {...register('sqft')} />
              <Input id="yearBuilt" label="Year Built" type="number" placeholder="1995" {...register('yearBuilt')} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading}>Save Property</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

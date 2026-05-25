'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['provider']}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}

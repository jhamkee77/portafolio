'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuthStore } from '@/lib/store/auth.store';
import {
  Home,
  Building2,
  ShoppingBag,
  ClipboardList,
  CreditCard,
  User,
  Shield,
  Wrench,
  LogOut,
  LayoutDashboard,
  Users,
  Truck,
  Bell,
} from 'lucide-react';

const homeownerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/marketplace', label: 'Services', icon: ShoppingBag },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'All Orders', icon: ClipboardList },
  { href: '/admin/providers', label: 'Providers', icon: Truck },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

const providerLinks = [
  { href: '/provider/orders', label: 'My Jobs', icon: Wrench },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'provider' ? providerLinks
    : homeownerLinks;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <Shield className="h-7 w-7 text-blue-400" />
        <span className="text-xl font-bold tracking-tight">INDOR</span>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-slate-800">
        <p className="text-sm font-medium truncate">{user?.name}</p>
        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        <span className="mt-1 inline-block rounded-full bg-blue-600/20 px-2 py-0.5 text-xs text-blue-300">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

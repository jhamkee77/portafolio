import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INDOR — Home Services Marketplace',
  description: 'DoorDash for home services + Carfax for properties',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

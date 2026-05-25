import Link from 'next/link';

export default function SplashPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          <span className="text-blue-400">INDOR</span>
        </h1>
        <p className="text-xl text-slate-300 mb-2">Home Services Marketplace + Home Operating System</p>
        <p className="text-sm text-slate-400 mb-10">
          Order home services like DoorDash, track providers like Uber, build your property record like Carfax.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-600 px-8 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-12 text-xs text-slate-500">
          Safe Project Solutions &mdash; Charlotte, NC
        </p>
      </div>
    </div>
  );
}

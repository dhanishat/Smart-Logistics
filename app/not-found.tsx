import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-extrabold text-white">404 - Corridor Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md">
        The requested highway telemetry route does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
      >
        Return to Overview
      </Link>
    </div>
  );
}

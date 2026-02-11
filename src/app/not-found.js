import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="text-8xl md:text-9xl font-black tracking-tighter text-gradient">
              404
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Page Not Found
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto">
              Oops! It looks like this database entry doesn't exist. The page you're looking for might have been deleted or moved.
            </p>
          </div>

          <div className="py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30">
              <Search size={48} className="text-primary opacity-50" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="group px-6 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 font-medium transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <Link
              href="/native/gta5"
              className="px-6 py-3 rounded-lg glass border border-border hover:border-primary/30 font-medium transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              Browse Database
            </Link>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-sm text-muted/70 uppercase tracking-wider font-semibold">
              Quick Links
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/native/gta5"
                className="p-3 glass rounded-lg border border-border hover:border-primary/30 text-sm hover:bg-surface/80 transition-all hover:scale-105 active:scale-95"
              >
                GTA V Natives
              </Link>
              <Link
                href="/bot"
                className="p-3 glass rounded-lg border border-border hover:border-primary/30 text-sm hover:bg-surface/80 transition-all hover:scale-105 active:scale-95"
              >
                Discord Bot
              </Link>
              <Link
                href="/converter"
                className="p-3 glass rounded-lg border border-border hover:border-primary/30 text-sm hover:bg-surface/80 transition-all hover:scale-105 active:scale-95"
              >
                Converter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

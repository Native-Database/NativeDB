import { GAMES } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Database, Zap, Cpu, ArrowRight, Code, Users } from 'lucide-react';

const DiscordIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-6xl mx-auto w-full">
        <div className="space-y-4 mb-12">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gradient">
            Native Database
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto font-light">
            A fast and powerful database explorer for game natives and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="group p-6 glass rounded-2xl border border-border hover:border-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {game.id === 'discord' ? <DiscordIcon /> : <Database size={80} />}
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  {game.name} <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-muted">{game.description}</p>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={game.id === 'discord' ? '/bot' : game.id === 'converter' ? '/converter' : `/native/${game.id}`}
                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1"
                  >
                    <Database size={14} />
                    Browse
                  </Link>
                  {game.id !== 'discord' && game.id !== 'converter' && (
                    <Link
                      href={`/generate/${game.id}`}
                      className="bg-surface hover:bg-surface/80 border border-border rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <Code size={14} />
                      Generate
                    </Link>
                  )}
                  {game.id == 'discord' && (
                    <Link
                      href="https://discord.gg/cyNP2bn9xE"
                      className="bg-surface hover:bg-surface/80 border border-border rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <Users size={14} />
                      Join Server
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* <Link 
            href="/catalog"
            className="group p-6 glass rounded-2xl border border-border hover:border-primary/30 transition-all hover:scale-[1.02] text-left"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-purple-400">
                Net Catalog <Cpu size={18} />
              </h3>
              <p className="text-sm text-muted">Browse GTA Online network catalog items.</p>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
}

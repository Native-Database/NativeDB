'use client';

import { useState } from 'react';
import { GAMES } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ChevronRight, Database } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ namespaces, activeNamespace, onNamespaceSelect, searchQuery, onSearchChange }) {
  const pathname = usePathname();

  return (
    <aside className="w-80 h-[calc(100vh-73px)] glass border-r border-border overflow-y-auto hidden md:block custom-scrollbar">
      <div className="p-4 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search namespaces..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="space-y-1">
          {namespaces.map((ns) => (
            <button
              key={ns.name}
              onClick={() => onNamespaceSelect(ns.name)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5 group",
                activeNamespace === ns.name ? "bg-primary/10 text-primary" : "text-muted"
              )}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{ns.name}</span>
                <span className="text-[10px] opacity-50">{ns.count} natives</span>
              </div>
              <ChevronRight size={14} className={cn("transition-transform", activeNamespace === ns.name && "rotate-90")} />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

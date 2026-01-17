'use client';

import { useState } from 'react';
import { GAMES } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ChevronRight, Database, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ namespaces, activeNamespace, onNamespaceSelect, searchQuery, onSearchChange, isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "w-80 h-full glass border-r border-border overflow-y-auto custom-scrollbar bg-background/95 md:bg-transparent",
        "fixed inset-y-0 left-0 z-50 md:static transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between md:hidden mb-2">
          <span className="font-bold text-lg">Namespaces</span>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

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
              onClick={() => {
                onNamespaceSelect(ns.name);
                if (window.innerWidth < 768) onClose(); // Close on mobile selection
              }}
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
    </>
  );
}

'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { User, Search, Image, Users, ArrowRight, Cpu, Trophy, ArrowRightLeft } from 'lucide-react';

const tools = [
  {
    id: 'lookup',
    name: 'ID Lookup',
    description: 'Convert Rockstar usernames to IDs and vice versa.',
    icon: ArrowRightLeft,
    href: '/rockstar/lookup',
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
  },
  {
    id: 'avatar',
    name: 'Avatar Lookup',
    description: 'Retrieve profile avatars from Rockstar Social Club IDs.',
    icon: Image,
    href: '/rockstar/avatar',
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'career',
    name: 'Career Tracker',
    description: 'Track your GTA Online progress, stats, and DLC completion.',
    icon: Trophy,
    href: '/rockstar/career',
    color: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    id: 'profile',
    name: 'Profile Lookup',
    description: 'View detailed player profiles and statistics.',
    icon: User,
    href: '/rockstar/profile',
    color: 'from-green-500/20 to-teal-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    id: 'crew',
    name: 'Crew Lookup',
    description: 'Search and explore Rockstar crews and clans.',
    icon: Users,
    href: '/rockstar/crew',
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/30',
    comingSoon: true,
  },
];

export default function RockstarPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl border border-red-500/30 mb-4">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient">
              Rockstar Tools
            </h1>
            <p className="text-lg text-muted max-w-lg mx-auto">
              A collection of tools for Rockstar Games. Lookup player avatars, profiles, crews and more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.comingSoon ? '#' : tool.href}
                className={`group p-6 glass rounded-2xl border ${tool.borderColor} hover:border-opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98] text-left relative overflow-hidden ${tool.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                    COMING SOON
                  </div>
                )}
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-bl ${tool.color}`}>
                  <tool.icon size={60} />
                </div>
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl border ${tool.borderColor} mb-4`}>
                    <tool.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    {tool.name} 
                    {!tool.comingSoon && (
                      <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    )}
                  </h3>
                  <p className="text-sm text-muted">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="glass rounded-2xl border border-border/50 p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Cpu size={20} className="text-primary" />
              About Rockstar Tools
            </h3>
            <p className="text-muted text-sm">
              These tools interact with Rockstar Games services to provide player information, 
              profile pictures, crew data, and more. All data is fetched from public Rockstar APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

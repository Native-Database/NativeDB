'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { User, Search, ExternalLink, Link as LinkIcon, Calendar, Gamepad2, AlertCircle, RefreshCw } from 'lucide-react';

export default function RockstarProfile() {
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    if (!playerId.trim()) {
      setError('Please enter a Rockstar ID or username');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const isNumeric = /^\d+$/.test(playerId.trim());
      const endpoint = isNumeric 
        ? `/api/rockstar/profile?id=${encodeURIComponent(playerId.trim())}`
        : `/api/rockstar/profile?username=${encodeURIComponent(playerId.trim())}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch profile');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('An error occurred while fetching the profile');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchProfile();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl border border-green-500/30 mb-4">
              <User className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient">
              Profile Lookup
            </h1>
            <p className="text-lg text-muted max-w-lg mx-auto">
              View detailed player profiles and statistics from Rockstar Social Club.
            </p>
          </div>

          <div className="glass rounded-2xl border border-border p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter Rockstar ID or username (e.g., 123456789)"
                  className="w-full bg-surface/50 border border-border rounded-xl pl-12 pr-4 py-3 text-lg placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                onClick={fetchProfile}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 min-w-[140px]"
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="glass rounded-2xl border border-border p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border-2 border-green-500/30 flex items-center justify-center">
                  <User size={64} className="text-green-400" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gradient mb-2">
                    {result.username || 'Unknown Player'}
                  </h2>
                  <p className="text-muted font-mono text-lg">
                    Rockstar ID: {result.rid}
                  </p>
                  {result.username && (
                    <p className="text-muted">@{result.username}</p>
                  )}
                </div>
              </div>

              {result.games && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Gamepad2 size={20} className="text-primary" />
                    Available Games
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(result.games).map(([gameId, game]) => (
                      <div 
                        key={gameId}
                        className="bg-surface/50 rounded-xl p-4 border border-border"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{game.name}</span>
                          {game.available ? (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              Available
                            </span>
                          ) : (
                            <span className="text-xs bg-muted/20 text-muted px-2 py-1 rounded">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <LinkIcon size={20} className="text-primary" />
                  Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={result.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-3 text-sm font-medium transition-all"
                  >
                    <ExternalLink size={16} />
                    View on Social Club
                  </a>
                </div>
              </div>

              {result.lastSeen && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Calendar size={16} />
                  <span>Last updated: {new Date(result.lastSeen).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          )}

          <div className="glass rounded-2xl border border-border/50 p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <User size={20} className="text-primary" />
              How to find your Rockstar ID
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted text-sm">
              <li>Go to <a href="https://socialclub.rockstargames.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Rockstar Social Club</a></li>
              <li>Sign in to your account</li>
              <li>Go to your profile settings</li>
              <li>Find your Rockstar ID in the account information</li>
              <li>Copy the numeric ID and paste it here</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

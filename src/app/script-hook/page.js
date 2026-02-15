'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Github, Download, Star, GitFork, Calendar, Loader2, Code2, ExternalLink, Tag } from 'lucide-react';

const GAME_CONFIG = {
  gta5: { name: 'GTA V', color: 'from-green-500 to-emerald-600', text: 'text-green-400' },
  rdr2: { name: 'RDR 2', color: 'from-red-500 to-red-600', text: 'text-red-400' },
  rdr: { name: 'RDR', color: 'from-orange-500 to-orange-600', text: 'text-orange-400' },
  mp3: { name: 'Max Payne 3', color: 'from-yellow-500 to-amber-600', text: 'text-yellow-400' }
};

function detectGame(assetName) {
  const name = assetName.toLowerCase();
  if (name.includes('rdr2') || name.includes('red dead 2') || name.includes('scripthookrdr2')) return 'rdr2';
  if ((name.includes('rdr') || name.includes('red dead')) && !name.includes('rdr2')) return 'rdr';
  if (name.includes('mp3') || name.includes('max payne 3') || name.includes('maxpayne3')) return 'mp3';
  if (name.includes('gta5') || name.includes('gta v') || name.includes('scripthookv') || name.includes('script hook v') || name.includes('scripthook') || name.includes('asi loader')) return 'gta5';
  return null;
}

export default function ScriptHookPage() {
  const [repoInfo, setRepoInfo] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [repoRes, releasesRes] = await Promise.all([
          fetch('https://api.github.com/repos/Vey-vy/Script-Hook-Universal'),
          fetch('https://api.github.com/repos/Vey-vy/Script-Hook-Universal/releases?per_page=100')
        ]);

        if (!repoRes.ok || !releasesRes.ok) {
          throw new Error('Failed to fetch GitHub data');
        }

        const repoData = await repoRes.json();
        const releasesData = await releasesRes.json();

        setRepoInfo(repoData);
        setReleases(releasesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const allGames = [...new Set(releases.flatMap(r => 
    r.assets?.map(a => detectGame(a.name)).filter(Boolean) || []
  ))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Script Hook Universal</h1>
            <p className="text-muted text-sm">Universal Script Hook for Rockstar games</p>
            <div className="flex gap-2 mt-2">
              {allGames.map(gameId => {
                const config = GAME_CONFIG[gameId];
                return (
                  <span 
                    key={gameId}
                    className={`px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${config?.color} text-white opacity-90`}
                  >
                    {config?.name || gameId}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="glass rounded-xl border border-border p-5 sticky top-24 space-y-5">
              {repoInfo?.description && (
                <p className="text-sm text-muted leading-relaxed">{repoInfo.description}</p>
              )}
              
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Stars</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {repoInfo?.stargazers_count?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Forks</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <GitFork className="w-4 h-4" />
                    {repoInfo?.forks_count?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Releases</span>
                  <span className="font-semibold">{releases.length}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border space-y-3">
                <a
                  href={`https://github.com/${repoInfo?.full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/80 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View Repository
                </a>
                {repoInfo?.homepage && (
                  <a
                    href={repoInfo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-surface border border-border hover:border-primary/50 py-2.5 rounded-lg font-medium transition-colors text-muted hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {releases.map(release => {
              const releaseGames = [...new Set(release.assets?.map(a => detectGame(a.name)).filter(Boolean) || [])];
              const dllFiles = release.assets?.filter(a => a.name.endsWith('.dll')) || [];
              const otherFiles = release.assets?.filter(a => !a.name.endsWith('.dll')) || [];
              
              return (
                <div key={release.id} className="glass rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
                  {/* Release Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-surface/80 to-surface/40 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{release.name || release.tag_name}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(release.published_at || release.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            {release.tag_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {releaseGames.map(gameId => {
                          const config = GAME_CONFIG[gameId];
                          return (
                            <span 
                              key={gameId}
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r ${config?.color} text-white shadow-sm`}
                            >
                              {config?.name || gameId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Downloads */}
                  <div className="p-5 space-y-4">
                    {dllFiles.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                          <span className="text-blue-400">●</span>
                          <span className="text-muted">DLL Files</span>
                          <span className="text-xs text-muted/60">({dllFiles.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {dllFiles.map((asset, idx) => (
                            <a
                              key={asset.id || idx}
                              href={asset.browser_download_url}
                              download
                              className="flex items-center gap-2.5 bg-background border border-border hover:border-blue-500/50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-blue-500 hover:text-white group"
                            >
                              <Download className="w-4 h-4 text-muted group-hover:text-white/80" />
                              <span className="max-w-[250px] truncate">{asset.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {otherFiles.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                          <span className="text-green-400">●</span>
                          <span className="text-muted">Other Files</span>
                          <span className="text-xs text-muted/60">({otherFiles.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {otherFiles.map((asset, idx) => (
                            <a
                              key={asset.id || idx}
                              href={asset.browser_download_url}
                              download
                              className="flex items-center gap-2.5 bg-background border border-border hover:border-green-500/50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-green-500 hover:text-white group"
                            >
                              <Download className="w-4 h-4 text-muted group-hover:text-white/80" />
                              <span className="max-w-[250px] truncate">{asset.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

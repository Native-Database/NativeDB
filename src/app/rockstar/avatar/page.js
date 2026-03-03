'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { User, Copy, Check, Download, ExternalLink, RefreshCw, Image, AlertCircle } from 'lucide-react';

export default function RockstarAvatar() {
  const [rockstarId, setRockstarId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [avatarType, setAvatarType] = useState('legacy');
  const [avatarNumber, setAvatarNumber] = useState(0);

  const getCurrentAvatar = () => {
    if (!result) return null;
    const type = result[avatarType];
    return avatarNumber === 0 ? type?.primary : type?.secondary;
  };

  const fetchAvatar = async () => {
    if (!rockstarId.trim()) {
      setError('Please enter a Rockstar ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/rockstar/avatar?id=${encodeURIComponent(rockstarId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch avatar');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('An error occurred while fetching the avatar');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async (url, filename) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchAvatar();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl border border-primary/30 mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient">
              Rockstar Avatar
            </h1>
            <p className="text-lg text-muted max-w-lg mx-auto">
              Retrieve avatar images from any Rockstar ID. Enter a Rockstar Social Club ID to get the profile picture.
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
                  value={rockstarId}
                  onChange={(e) => setRockstarId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Rockstar ID (e.g., 123456789)"
                  className="w-full bg-surface/50 border border-border rounded-xl pl-12 pr-4 py-3 text-lg placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                onClick={fetchAvatar}
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
                    <Image size={20} />
                    <span>Get Avatar</span>
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
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Version:</span>
                  <div className="flex bg-surface/50 rounded-lg p-1 border border-border">
                    <button
                      onClick={() => setAvatarType('legacy')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        avatarType === 'legacy'
                          ? 'bg-primary text-black'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      Legacy
                    </button>
                    <button
                      onClick={() => setAvatarType('enhanced')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        avatarType === 'enhanced'
                          ? 'bg-primary text-black'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      Enhanced
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Avatar:</span>
                  <div className="flex bg-surface/50 rounded-lg p-1 border border-border">
                    <button
                      onClick={() => setAvatarNumber(0)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        avatarNumber === 0
                          ? 'bg-primary text-black'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      1
                    </button>
                    <button
                      onClick={() => setAvatarNumber(1)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        avatarNumber === 1
                          ? 'bg-primary text-black'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      2
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-border bg-surface">
                    {getCurrentAvatar() ? (
                      <img
                        src={getCurrentAvatar()}
                        alt={`Rockstar Avatar ${result.rid} - ${avatarType} ${avatarNumber + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface">
                        <User size={48} className="text-muted/50" />
                      </div>
                    )}
                  </div>
                  {getCurrentAvatar() && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadImage(getCurrentAvatar(), `rockstar-${result.rid}-${avatarType}-${avatarNumber}.png`)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Rockstar ID</h3>
                      <p className="text-muted font-mono text-lg">{result.rid}</p>
                      {result.username && (
                        <p className="text-muted text-sm">@{result.username}</p>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.rid)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Copy ID"
                    >
                      {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                    </button>
                  </div>

                  <div className={`text-sm px-3 py-2 rounded-lg ${getCurrentAvatar() ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {getCurrentAvatar() 
                      ? `${avatarType === 'legacy' ? 'Legacy' : 'Enhanced'} Avatar ${avatarNumber + 1} found` 
                      : `${avatarType === 'legacy' ? 'Legacy' : 'Enhanced'} Avatar ${avatarNumber + 1} not available`}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={result.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    >
                      <ExternalLink size={16} />
                      Social Club
                    </a>
                    {getCurrentAvatar() && (
                      <button
                        onClick={() => copyToClipboard(getCurrentAvatar())}
                        className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-2 text-sm font-medium transition-all"
                      >
                        <Copy size={16} />
                        Copy URL
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {(result.legacy?.primary || result.legacy?.secondary || result.enhanced?.primary || result.enhanced?.secondary) && (
                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-medium text-muted mb-4">Download Options</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(result.legacy?.primary || result.legacy?.secondary) && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-muted uppercase tracking-wide">Legacy</h5>
                        {result.legacy?.primary && (
                          <button
                            onClick={() => downloadImage(result.legacy.primary, `rockstar-${result.rid}-legacy-0.png`)}
                            className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-2 text-sm font-medium transition-all w-full"
                          >
                            <Download size={16} />
                            Primary
                          </button>
                        )}
                        {result.legacy?.secondary && (
                          <button
                            onClick={() => downloadImage(result.legacy.secondary, `rockstar-${result.rid}-legacy-1.png`)}
                            className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-2 text-sm font-medium transition-all w-full"
                          >
                            <Download size={16} />
                            Secondary
                          </button>
                        )}
                      </div>
                    )}
                    {(result.enhanced?.primary || result.enhanced?.secondary) && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-muted uppercase tracking-wide">Enhanced</h5>
                        {result.enhanced?.primary && (
                          <button
                            onClick={() => downloadImage(result.enhanced.primary, `rockstar-${result.rid}-enhanced-0.png`)}
                            className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-2 text-sm font-medium transition-all w-full"
                          >
                            <Download size={16} />
                            Primary
                          </button>
                        )}
                        {result.enhanced?.secondary && (
                          <button
                            onClick={() => downloadImage(result.enhanced.secondary, `rockstar-${result.rid}-enhanced-1.png`)}
                            className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-2 text-sm font-medium transition-all w-full"
                          >
                            <Download size={16} />
                            Secondary
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="glass rounded-2xl border border-border/50 p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Image size={20} className="text-primary" />
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

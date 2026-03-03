'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { User, ArrowRightLeft, Search, RefreshCw, AlertCircle, CheckCircle, Hash, AtSign } from 'lucide-react';

export default function RockstarLookup() {
  const [activeTab, setActiveTab] = useState('name2rid');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!input.trim()) {
      setError('Please enter a value');
      return;
    }

    const isNumeric = /^\d+$/.test(input.trim());
    
    if (activeTab === 'name2rid' && isNumeric) {
      setError('Please enter a username, not a Rockstar ID');
      return;
    }
    
    if (activeTab === 'rid2name' && !isNumeric) {
      setError('Please enter a numeric Rockstar ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const endpoint = activeTab === 'name2rid' 
        ? `/api/rockstar/avatar?name=${encodeURIComponent(input.trim())}`
        : `/api/rockstar/avatar?rid=${encodeURIComponent(input.trim())}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.username || data.rid) {
        setResult(data);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Search error');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const swapTabs = () => {
    setActiveTab(activeTab === 'name2rid' ? 'rid2name' : 'name2rid');
    setInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
              <ArrowRightLeft size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Rockstar ID Lookup</h1>
            <p className="text-muted">
              Convert a Rockstar username to ID, or vice versa
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('name2rid')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'name2rid'
                  ? 'bg-primary text-black'
                  : 'bg-surface text-muted hover:text-foreground'
              }`}
            >
              <AtSign size={18} />
              Name → RID
            </button>
            <button
              onClick={() => setActiveTab('rid2name')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'rid2name'
                  ? 'bg-primary text-black'
                  : 'bg-surface text-muted hover:text-foreground'
              }`}
            >
              <Hash size={18} />
              RID → Name
            </button>
          </div>

          <div className="glass rounded-2xl border border-border p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  {activeTab === 'name2rid' ? <AtSign size={20} /> : <Hash size={20} />}
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={activeTab === 'name2rid' 
                    ? 'Enter a username (e.g., JohnDoe)' 
                    : 'Enter a Rockstar ID (e.g., 123456789)'}
                  className="w-full bg-surface/50 border border-border rounded-xl pl-12 pr-4 py-3 text-lg placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                onClick={handleLookup}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 min-w-[140px]"
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Search...</span>
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

            {result && (
              <div className={`border rounded-xl p-6 ${
                result.rid && result.username 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className={`flex items-center gap-2 mb-4 ${
                  result.rid && result.username ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {result.rid && result.username ? (
                    <>
                      <CheckCircle size={20} />
                      <span className="font-medium">Result found</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} />
                      <span className="font-medium">Partial information</span>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  {result.username && (
                    <div className="flex items-center justify-between bg-surface/50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <AtSign size={20} className="text-muted" />
                        <span className="text-muted">Username</span>
                      </div>
                      <span className="font-bold text-lg">{result.username}</span>
                    </div>
                  )}
                  
                  {result.rid && (
                    <div className="flex items-center justify-between bg-surface/50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Hash size={20} className="text-muted" />
                        <span className="text-muted">Rockstar ID</span>
                      </div>
                      <span className="font-bold text-lg">{result.rid}</span>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-surface/30 rounded-xl">
            <p className="text-sm text-muted text-center">
              <AtSign size={14} className="inline mr-1" />
              <strong>Name → RID</strong> : Enter a username to get their Rockstar ID
            </p>
            <p className="text-sm text-muted text-center mt-1">
              <Hash size={14} className="inline mr-1" />
              <strong>RID → Name</strong> : Enter a Rockstar ID to get their username
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

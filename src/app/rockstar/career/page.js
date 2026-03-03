'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { User, Search, Trophy, Clock, DollarSign, Gamepad2, Star, Target, RefreshCw, AlertCircle, CheckCircle, XCircle, Lock } from 'lucide-react';

const DLC_DATA = [
  { id: 'heists', name: 'Heists', color: '#FFD700' },
  { id: 'doomsday', name: 'Doomsday Heist', color: '#FF6B6B' },
  { id: 'smuggler', name: 'Smuggler Run', color: '#4ECDC4' },
  { id: 'import_export', name: 'Import/Export', color: '#45B7D1' },
  { id: 'gunrunning', name: 'Gunrunning', color: '#96CEB4' },
  { id: 'bikers', name: 'Bikers', color: '#DDA0DD' },
  { id: 'cunning_stunts', name: 'Cunning Stunts', color: '#FF8C42' },
  { id: 'finance_felonies', name: 'Finance & Felonies', color: '#2ECC71' },
  { id: 'arena_war', name: 'Arena War', color: '#E74C3C' },
  { id: 'south_central', name: 'South Central', color: '#9B59B6' },
  { id: 'los_santos_tuners', name: 'Los Santos Tuners', color: '#3498DB' },
  { id: 'contract', name: 'The Contract', color: '#F1C40F' },
  { id: 'dr_dre', name: 'Dr. Dre: The Contract', color: '#1ABC9C' },
  { id: 'bottomless', name: 'Bottomless Case', color: '#34495E' },
  { id: 'taxi', name: 'The Taxi Shop', color: '#F39C12' },
  { id: 'heritage', name: 'Heritage Race', color: '#8E44AD' },
  { id: 'holiday_gifts', name: 'Holiday Gifts', color: '#C0392B' },
  { id: 'summer_special', name: 'Summer Special', color: '#E67E22' },
  { id: 'cayo_perico', name: 'Cayo Perico Heist', color: '#16A085' },
  { id: 'paradise_lost', name: 'Paradise Lost', color: '#27AE60' },
];

export default function RockstarCareer() {
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDlc, setSelectedDlc] = useState(null);

  const fetchCareer = async () => {
    if (!playerId.trim()) {
      setError('Please enter a Rockstar ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/rockstar/career?id=${encodeURIComponent(playerId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch career data');
      } else {
        if (data.games?.gta5?.dlcCompleted) {
          data.games.gta5.dlcCompleted = data.games.gta5.dlcCompleted.map(dlc => {
            const dlcInfo = DLC_DATA.find(d => d.id === dlc.id);
            return {
              ...dlc,
              image: dlcInfo?.image || null,
              color: dlcInfo?.color || '#666',
            };
          });
        }
        setResult(data);
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
    return `$${amount}`;
  };

  const formatTime = (hours) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}j ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  const getCompletionPercentage = (dlcList) => {
    const completed = dlcList.filter(d => d.completed).length;
    return Math.round((completed / dlcList.length) * 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchCareer();
    }
  };

  const useSampleData = () => {
    const sampleData = {
      username: "Example_123",
      rockstarId: "123456789",
      games: {
        gta5: {
          name: "GTA Online",
          totalMoney: 2500000000,
          totalTimePlayed: 1250,
          level: 1350,
          kdRatio: 2.45,
          wins: 4523,
          losses: 2100,
          achievements: 78,
          totalAchievements: 126,
          dlcCompleted: DLC_DATA.slice(0, 17).map((dlc, i) => ({
            ...dlc,
            completed: i < 12,
            progress: i < 12 ? 100 : (i < 15 ? 50 : 0),
          })),
          missions: { completed: 1247, inProgress: 5 },
          properties: 12,
          vehicles: 87,
        },
      },
      lastUpdated: new Date().toISOString(),
    };
    setResult(sampleData);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-6xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl border border-red-500/30 mb-4">
              <Trophy className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient">
              Career Tracker
            </h1>
            <p className="text-lg text-muted max-w-lg mx-auto">
              Track your progress on GTA Online. Detailed stats, DLCs with images, achievements and more.
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
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Rockstar ID (e.g., 123456789)"
                  className="w-full bg-surface/50 border border-border rounded-xl pl-12 pr-4 py-3 text-lg placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                onClick={fetchCareer}
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
              {/* Player Header */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {result.username}
                    <span className="text-sm text-muted font-normal">#{result.rockstarId}</span>
                  </h2>
                  <p className="text-sm text-muted">
                    Last updated: {new Date(result.lastUpdated).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'overview' 
                        ? 'bg-primary text-black' 
                        : 'bg-surface text-muted hover:text-foreground'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('dlcs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'dlcs' 
                        ? 'bg-primary text-black' 
                        : 'bg-surface text-muted hover:text-foreground'
                    }`}
                  >
                    DLCs
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'stats' 
                        ? 'bg-primary text-black' 
                        : 'bg-surface text-muted hover:text-foreground'
                    }`}
                  >
                    Stats
                  </button>
                </div>
              </div>

              {activeTab === 'overview' && result.games.gta5 && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-muted mb-2">
                        <DollarSign size={16} />
                        <span className="text-sm">GTA Online Money</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">
                        {formatMoney(result.games.gta5.totalMoney)}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-muted mb-2">
                        <Clock size={16} />
                        <span className="text-sm">Time Played</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatTime(result.games.gta5.totalTimePlayed)}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-muted mb-2">
                        <Star size={16} />
                        <span className="text-sm">Level</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">
                        {result.games.gta5.level}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-muted mb-2">
                        <Target size={16} />
                        <span className="text-sm">K/D Ratio</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {result.games.gta5.kdRatio}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-muted mb-2">
                        <Trophy size={16} />
                        <span className="text-sm">Wins</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">
                        {result.games.gta5.wins?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-muted mb-2">
                        <Gamepad2 size={16} />
                        <span className="text-sm">Achievements</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {result.games.gta5.achievements}/{result.games.gta5.totalAchievements}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="text-muted mb-2">
                        <span className="text-sm">Properties</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {result.games.gta5.properties}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <div className="text-muted mb-2">
                        <span className="text-sm">Vehicles</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {result.games.gta5.vehicles}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* DLCs Tab */}
              {activeTab === 'dlcs' && result.games.gta5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">GTA Online DLCs</h3>
                    <span className="text-sm text-muted">
                      {getCompletionPercentage(result.games.gta5.dlcCompleted)}% completed ({result.games.gta5.dlcCompleted.filter(d => d.completed).length}/{result.games.gta5.dlcCompleted.length})
                    </span>
                  </div>
                  <div className="w-full bg-surface/50 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-primary h-3 rounded-full transition-all"
                      style={{ width: `${getCompletionPercentage(result.games.gta5.dlcCompleted)}%` }}
                    />
                  </div>
                  
                  {selectedDlc && (
                    <div className="glass rounded-2xl border border-border overflow-hidden">
                      <div className="relative h-48" style={{ backgroundColor: selectedDlc.color + '40' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Trophy size={64} style={{ color: selectedDlc.color }} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-2xl font-bold" style={{ color: selectedDlc.color }}>{selectedDlc.name}</h4>
                            <p className="text-sm text-muted">
                              {selectedDlc.completed ? 'Completed' : 'Not completed'}
                            </p>
                          </div>
                          {selectedDlc.completed ? (
                            <CheckCircle size={40} className="text-green-400" />
                          ) : (
                            <XCircle size={40} className="text-muted" />
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted">Progress</span>
                          <span className="font-bold">{selectedDlc.progress}%</span>
                        </div>
                        <div className="w-full bg-surface/50 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${selectedDlc.progress}%`,
                              backgroundColor: selectedDlc.completed ? '#22c55e' : selectedDlc.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {result.games.gta5.dlcCompleted.map((dlc) => (
                      <button
                        key={dlc.id}
                        onClick={() => setSelectedDlc(dlc)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                          selectedDlc?.id === dlc.id 
                            ? 'border-primary ring-2 ring-primary/50' 
                            : dlc.completed 
                              ? 'border-green-500/50 hover:border-green-400' 
                              : 'border-border hover:border-muted'
                        }`}
                      >
                        <div className="aspect-video relative" style={{ backgroundColor: dlc.color + '40' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Trophy size={32} style={{ color: dlc.color }} />
                          </div>
                          <div className={`absolute inset-0 ${dlc.completed ? 'bg-green-500/20' : 'bg-black/50'}`} />
                          <div className="absolute top-2 right-2">
                            {dlc.completed ? (
                              <CheckCircle size={20} className="text-green-400 drop-shadow-lg" />
                            ) : (
                              <Lock size={16} className="text-white/70" />
                            )}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                            <div 
                              className="h-full transition-all"
                              style={{ 
                                width: `${dlc.progress}%`,
                                backgroundColor: dlc.completed ? '#22c55e' : dlc.color
                              }}
                            />
                          </div>
                        </div>
                        <div className="p-2 bg-surface/90">
                          <p className={`text-xs font-medium truncate ${dlc.completed ? 'text-green-400' : 'text-muted'}`}>
                            {dlc.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && result.games.gta5 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Detailed Stats - GTA Online</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">Total Money Earned</p>
                      <p className="text-xl font-bold text-green-400">
                        {formatMoney(result.games.gta5.totalMoney)}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">Time Played</p>
                      <p className="text-xl font-bold">
                        {formatTime(result.games.gta5.totalTimePlayed)}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">Level</p>
                      <p className="text-xl font-bold text-yellow-400">
                        {result.games.gta5.level}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">K/D Ratio</p>
                      <p className="text-xl font-bold">
                        {result.games.gta5.kdRatio}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">Total Wins</p>
                      <p className="text-xl font-bold text-blue-400">
                        {result.games.gta5.wins?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">Losses</p>
                      <p className="text-xl font-bold text-red-400">
                        {result.games.gta5.losses?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">Achievements</p>
                      <p className="text-xl font-bold">
                        {result.games.gta5.achievements}/{result.games.gta5.totalAchievements}
                      </p>
                      <div className="w-full bg-surface/30 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(result.games.gta5.achievements / result.games.gta5.totalAchievements) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted mb-1">Missions Completed</p>
                      <p className="text-xl font-bold">
                        {result.games.gta5.missions?.completed?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="glass rounded-2xl border border-border/50 p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Trophy size={20} className="text-primary" />
              Track your GTA Online progress, stats, achievements and more.
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted text-sm">
              <li>Enter your Rockstar ID in the search field</li>
              <li>Click Search to retrieve your data</li>
              <li>Navigate between Overview, DLCs and Stats to see details</li>
              <li>Click on a DLC to see its image and progress</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

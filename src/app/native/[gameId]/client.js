'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import { GAMES, cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Copy, Check, ExternalLink, Code, Menu } from 'lucide-react';

export default function NativeExplorerClient() {
  const { gameId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const game = GAMES.find(g => g.id === gameId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [natives, setNatives] = useState({});
  const [activeNamespace, setActiveNamespace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nativeSearchQuery, setNativeSearchQuery] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedNative, setSelectedNative] = useState(null);
  const [copied, setCopied] = useState(false);
  const [searchMode, setSearchMode] = useState('namespace');
  const [returnTypeFilter, setReturnTypeFilter] = useState('');
  const [paramTypeFilter, setParamTypeFilter] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [snippetLang, setSnippetLang] = useState('cpp');

  useEffect(() => {
    async function fetchData() {
      if (!game) return;
      setLoading(true);
      try {
        const response = await fetch(game.url);
        if (!response.ok) throw new Error('Failed to fetch data');

        let data;
        if (game.type === 'header') {
          const text = await response.text();
          data = parseHeader(text);
        } else if (game.type === 'cpp_class') {
          const text = await response.text();
          data = parseCppClass(text);
        } else {
          data = await response.json();
        }

        setNatives(data);

        const hashParam = searchParams.get('hash');
        let found = false;

        if (hashParam) {
          for (const [ns, nsData] of Object.entries(data)) {
            const native = Array.isArray(nsData)
              ? nsData.find(n => n.hash === hashParam)
              : (nsData[hashParam] ? { ...nsData[hashParam], hash: hashParam } : null);

            if (native) {
              setSelectedNative(native);
              setActiveNamespace(ns);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          const firstNS = Object.keys(data).sort()[0];
          setActiveNamespace(firstNS);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [game]);

  const parseHeader = (text) => {
    const map = {};
    let currentNamespace = "UNK";
    const lines = text.split('\n');
    const nativeRegex = /^\s*static\s+(?<returns>[\w*&<>:\s]+)\s+(?<name>\w+)\s*\((?<params>.*?)\)/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nsMatch = line.match(/^namespace\s+(\w+)/);
      if (nsMatch) {
        currentNamespace = nsMatch[1];
        if (!map[currentNamespace]) map[currentNamespace] = {};
        continue;
      }
      const match = line.match(nativeRegex);
      if (match) {
        const { name, returns, params } = match.groups;
        let hash = "0x0000000000000000";
        if (i + 2 < lines.length) {
          const body = lines[i + 1] + lines[i + 2];
          const hashMatch = body.match(/Invoke\s*<\s*(0x[A-F0-9]{1,16})/i);
          if (hashMatch) hash = hashMatch[1];
        }
        map[currentNamespace][hash] = { name, hash, params, results: returns };
      }
    }
    return map;
  };

  const parseCppClass = (text) => {
    const map = {};
    const lines = text.split('\n');

    // Find all enum entries
    const enumRegex = /^\s*(\w+)\s*=\s*(0x[A-F0-9]{8}),?$/;
    const hashes = {};
    let inEnum = false;

    // First pass: collect all hashes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for enum start
      if (line.includes('enum class NativeHashes')) {
        inEnum = true;
        continue;
      }

      // Check for enum end
      if (inEnum && line.includes('};')) {
        inEnum = false;
        continue;
      }

      // Parse enum entries
      if (inEnum) {
        const enumMatch = line.match(enumRegex);
        if (enumMatch) {
          const [, name, hash] = enumMatch;
          hashes[name] = hash;
        }
      }
    }

    // Second pass: parse functions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for function definitions (single line format from the excerpt)
      const funcMatch = line.match(/static\s+inline\s+auto\s+(\w+)\s*\(([^)]*)\)\s*\{\s*return\s+NativeInvoke::Invoke<[^,]+,\s*std::to_underlying\(NativeHashes::(\w+)\),\s*([^>]+)>/);
      if (funcMatch) {
        const [, funcName, params, hashName, returnType] = funcMatch;

        // Get the hash value
        const hash = hashes[hashName];
        if (!hash) continue;

        // Parse parameters
        const paramList = params ? params.split(',').map(p => {
          const trimmed = p.trim();
          if (!trimmed || trimmed === 'void') return null;

          // Try to extract type and name
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
            const type = parts.slice(0, -1).join(' ');
            const name = parts[parts.length - 1];
            return { type, name };
          }
          return { type: trimmed, name: 'param' };
        }).filter(p => p) : [];

        // Use a default namespace
        const namespace = 'Natives';
        if (!map[namespace]) map[namespace] = [];

        map[namespace].push({
          name: funcName,
          hash: hash,
          params: paramList,
          results: returnType.trim()
        });
      }
    }

    return map;
  };

  const namespaces = useMemo(() => {
    return Object.keys(natives)
      .sort()
      .map(name => ({
        name,
        count: Object.keys(natives[name]).length
      }))
      .filter(ns => ns.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [natives, searchQuery]);

  const totalNatives = useMemo(() => {
    return Object.values(natives).reduce((total, ns) => total + Object.keys(ns).length, 0);
  }, [natives]);

  const filteredNatives = useMemo(() => {
    let candidates = [];

    if (searchMode === 'global' && globalSearchQuery) {
      Object.entries(natives).forEach(([ns, nsNatives]) => {
        Object.entries(nsNatives).forEach(([hash, data]) => {
          if (data.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
            hash.toLowerCase().includes(globalSearchQuery.toLowerCase())) {
            candidates.push({ hash, ...data, namespace: ns });
          }
        });
      });
    } else if (!activeNamespace || !natives[activeNamespace]) {
      return [];
    } else {
      // Namespace-specific search
      const entries = Object.entries(natives[activeNamespace]);
      candidates = entries.map(([hash, data]) => ({ hash, ...data }));
    }

    // Apply text search
    if ((searchMode === 'global' && globalSearchQuery) || (searchMode === 'namespace' && nativeSearchQuery)) {
      const query = searchMode === 'global' ? globalSearchQuery : nativeSearchQuery;
      candidates = candidates.filter(n =>
        n.name.toLowerCase().includes(query.toLowerCase()) ||
        n.hash.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply return type filter
    if (returnTypeFilter) {
      candidates = candidates.filter(n =>
        (n.results || n.return_type || 'void').toLowerCase().includes(returnTypeFilter.toLowerCase())
      );
    }

    // Apply parameter type filter
    if (paramTypeFilter) {
      candidates = candidates.filter(n => {
        if (!n.params) return false;
        const params = Array.isArray(n.params) ? n.params : [];
        return params.some(p => p.type && p.type.toLowerCase().includes(paramTypeFilter.toLowerCase()));
      });
    }

    return candidates;
  }, [natives, activeNamespace, nativeSearchQuery, searchMode, globalSearchQuery, returnTypeFilter, paramTypeFilter]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeSelect = (n) => {
    setSelectedNative(n);
    // Update URL without reloading page
    const params = new URLSearchParams(searchParams);
    params.set('hash', n.hash);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const getSnippet = (lang, native) => {
    if (!native) return '';
    const params = native.params || [];
    const paramNames = Array.isArray(params) ? params.map(p => p.name).join(', ') : '';
    const paramTyped = Array.isArray(params) ? params.map(p => `${p.type} ${p.name}`).join(', ') : '';
    const returnType = native.results || native.return_type || 'void';

    switch (lang) {
      case 'lua':
        return `-- ${returnType} ${native.name}\n${native.name}(${paramNames})`;
      case 'csharp':
        return `// ${returnType} ${native.name}\nFunction.Call(Hash.${native.name}, ${paramNames});`;
      case 'javascript':
        return `// ${returnType} ${native.name}\n${native.name}(${paramNames});`;
      case 'cpp':
      default:
        return `${returnType} ${native.name}(${paramTyped});`;
    }
  };

  if (!game) return <div>Game not found</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          namespaces={namespaces}
          activeNamespace={activeNamespace}
          onNamespaceSelect={setActiveNamespace}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-background/30">
          <div className="p-4 border-b border-border glass">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <h2 className="text-lg font-bold text-primary whitespace-nowrap">
                  {searchMode === 'global' ? 'Global Search' : activeNamespace}
                </h2>
                <div className="text-xs text-muted">
                  {filteredNatives.length} / {totalNatives} natives
                </div>
              </div>
              <Link
                href={`/generate/${gameId}`}
                className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2"
              >
                <Code size={16} />
                Generate Header
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchMode('namespace')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                    searchMode === 'namespace'
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-surface/80 text-muted"
                  )}
                >
                  Namespace
                </button>
                <button
                  onClick={() => setSearchMode('global')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                    searchMode === 'global'
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-surface/80 text-muted"
                  )}
                >
                  Global
                </button>
              </div>

              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={searchMode === 'global' ? "Search all natives..." : "Search natives in this namespace..."}
                  value={searchMode === 'global' ? globalSearchQuery : nativeSearchQuery}
                  onChange={(e) => searchMode === 'global' ? setGlobalSearchQuery(e.target.value) : setNativeSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Filters:</span>
                <input
                  type="text"
                  placeholder="Return type (e.g., void, int)..."
                  value={returnTypeFilter}
                  onChange={(e) => setReturnTypeFilter(e.target.value)}
                  className="w-40 bg-surface border border-border rounded px-3 py-1 text-xs focus:outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  placeholder="Param type (e.g., float, char*)..."
                  value={paramTypeFilter}
                  onChange={(e) => setParamTypeFilter(e.target.value)}
                  className="w-40 bg-surface border border-border rounded px-3 py-1 text-xs focus:outline-none focus:border-primary/50"
                />
                {(returnTypeFilter || paramTypeFilter) && (
                  <button
                    onClick={() => { setReturnTypeFilter(''); setParamTypeFilter(''); }}
                    className="text-xs text-muted hover:text-foreground px-2 py-1 rounded hover:bg-surface/50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div> */}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted">Loading natives...</div>
            ) : filteredNatives.map((n) => (
              <div
                key={n.hash}
                onClick={() => handleNativeSelect(n)}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer group hover:shadow-sm",
                  selectedNative?.hash === n.hash
                    ? "bg-primary/10 border-primary/40 shadow-sm"
                    : "bg-surface/30 border-border hover:border-primary/30 hover:bg-surface/50"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono text-primary font-medium group-hover:underline truncate">
                        {n.name}
                      </h3>
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-mono uppercase flex-shrink-0">
                        {n.results || n.return_type || 'void'}
                      </span>
                      {searchMode === 'global' && n.namespace && (
                        <span className="text-[10px] bg-muted/20 text-muted px-2 py-0.5 rounded font-medium flex-shrink-0">
                          {n.namespace}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-muted font-mono">{n.hash}</p>
                      {n.params && (
                        <p className="text-xs text-muted truncate">
                          {Array.isArray(n.params)
                            ? n.params.map(p => `${p.type} ${p.name}`).join(', ')
                            : n.params
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(n.hash); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {selectedNative && (
          <div className="w-96 glass border-l border-border overflow-hidden hidden lg:flex flex-col">
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gradient mb-1 truncate">{selectedNative.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted font-mono">
                    <span className="truncate">{selectedNative.hash}</span>
                    <button onClick={() => handleCopy(selectedNative.hash)} className="hover:text-primary transition-colors flex-shrink-0">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <section>
                <h4 className="text-xs font-bold uppercase text-muted mb-3 tracking-widest">Function Signature</h4>
                <div className="bg-background/50 rounded-lg p-4 font-mono text-sm border border-border">
                  <div className="text-blue-400 mb-1">{selectedNative.results || selectedNative.return_type || 'void'}</div>
                  <div className="text-primary font-medium">{selectedNative.name}</div>
                  <div className="text-muted mt-2">
                    <span>(</span>
                    <div className="ml-4 mt-1 space-y-1">
                      {Array.isArray(selectedNative.params) && selectedNative.params.length > 0 ? (
                        selectedNative.params.map((param, i) => (
                          <div key={i} className="text-sm">
                            <span className="text-orange-400">{param.type}</span> <span className="text-foreground">{param.name}</span>
                            {i < selectedNative.params.length - 1 && ','}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground">void</span>
                      )}
                    </div>
                    <span>)</span>
                  </div>
                </div>
              </section>

              {selectedNative.comment && (
                <section>
                  <h4 className="text-xs font-bold uppercase text-muted mb-3 tracking-widest">Description</h4>
                  <div className="bg-surface/30 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                      {selectedNative.comment}
                    </p>
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-xs font-bold uppercase text-muted mb-3 tracking-widest">Code Snippet</h4>
                <div className="bg-background/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      {['cpp', 'csharp', 'lua', 'javascript'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => setSnippetLang(lang)}
                          className={cn(
                            "text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors",
                            snippetLang === lang
                              ? "bg-primary/20 text-primary"
                              : "text-muted hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          {lang === 'javascript' ? 'JS' : lang === 'csharp' ? 'C#' : lang}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCopy(getSnippet(snippetLang, selectedNative))}
                      className="text-xs hover:text-primary transition-colors"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap text-muted">
                    {getSnippet(snippetLang, selectedNative)}
                  </pre>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold uppercase text-muted mb-3 tracking-widest">Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted">Hash</span>
                    <span className="text-sm font-mono text-primary">{selectedNative.hash}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted">Return Type</span>
                    <span className="text-sm font-mono text-blue-400">{selectedNative.results || selectedNative.return_type || 'void'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted">Parameters</span>
                    <span className="text-sm text-muted">
                      {Array.isArray(selectedNative.params) ? selectedNative.params.length : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted">Namespace</span>
                    <span className="text-sm font-medium text-primary">{activeNamespace}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

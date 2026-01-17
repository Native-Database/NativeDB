'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GAMES, cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { Download, Check } from 'lucide-react';

export default function GeneratePage() {
  const { gameId } = useParams();
  const game = GAMES.find(g => g.id === gameId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nativesMap, setNativesMap] = useState({});
  const [selectedNamespaces, setSelectedNamespaces] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [vectorize, setVectorize] = useState(false);
  const [namingConvention, setNamingConvention] = useState('default');
  const [customInvoke, setCustomInvoke] = useState('Invoke');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadNatives() {
      if (!game) return;
      setLoading(true);
      try {
        const response = await fetch(game.url);
        if (!response.ok) throw new Error('Failed to fetch data');

        let data;
        if (game.type === 'header') {
          const text = await response.text();
          data = buildMapFromH(text);
        } else if (game.type === 'cpp_class') {
          const text = await response.text();
          data = parseCppClass(text);
        } else {
          data = await response.json();
          data = buildMap(data);
        }

        setNativesMap(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadNatives();
  }, [game]);

  const buildMap = (json) => {
    const map = {};
    for (const ns in json) {
      if (Object.prototype.hasOwnProperty.call(json, ns)) {
        map[ns] = Object.values(json[ns]).map(native => norm({ ...native, hash: Object.keys(json[ns]).find(key => json[ns][key] === native) }));
      }
    }
    return map;
  };

  const buildMapFromH = (text) => {
    const map = {};
    let currentNamespace = "UNK";
    const lines = text.split('\n');
    const nativeRegex = /^\s*static\s+(?<returns>[\w*&<>:\s]+)\s+(?<name>\w+)\s*\((?<params>.*?)\)/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^namespace\s+(\w+)/.test(line)) {
        currentNamespace = line.match(/^namespace\s+(\w+)/)[1];
        if (!map[currentNamespace]) map[currentNamespace] = [];
        continue;
      }
      if (line === '}') { currentNamespace = "UNK"; continue; }

      const match = line.match(nativeRegex);
      if (match) {
        const { name, returns, params } = match.groups;
        let hash = "0x0000000000000000";
        if (i + 2 < lines.length) {
          const invokeLine = lines[i + 1].includes("Invoke<") ? lines[i + 1] : (lines[i + 2].includes("Invoke<") ? lines[i + 2] : "");
          const invokeHashMatch = invokeLine.match(/Invoke\s*<\s*(0x[A-F0-9]{1,16})/i);
          if (invokeHashMatch) hash = invokeHashMatch[1];
        }
        const paramsArray = params.trim() ? params.split(',').map(p => ({ type: p.trim().split(' ').slice(0, -1).join(' '), name: p.trim().split(' ').pop() })) : [];
        if (!map[currentNamespace]) map[currentNamespace] = [];
        map[currentNamespace].push(norm({ name: name.startsWith("_0x") ? hash : name, hash, params: paramsArray, returns: returns.trim() }));
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

  const norm = (n) => {
    return {
      name: n.name || n.NativeName || n.hashName || n[0] || '',
      hash: n.hash || n.Hash || n.native || n[1] || '',
      comment: n.comment || n.desc || n.description || '',
      params: n.params || n.Params || n.arguments || n.args || [],
      returns: n.returns || n.return || n.return_type || 'Any'
    };
  };

  const namespaces = Object.keys(nativesMap).sort().filter(ns =>
    ns.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNamespaces(new Set(namespaces));
    } else {
      setSelectedNamespaces(new Set());
    }
  };

  const handleNamespaceToggle = (ns) => {
    const newSelected = new Set(selectedNamespaces);
    if (newSelected.has(ns)) {
      newSelected.delete(ns);
    } else {
      newSelected.add(ns);
    }
    setSelectedNamespaces(newSelected);
  };

  const formatName = (name) => {
    // Convert PascalCase to snake_case first for processing
    const snakeCase = name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

    switch (namingConvention) {
      case 'camelCase':
        return snakeCase.replace(/_([a-z0-9])/g, g => g[1].toUpperCase()).replace(/^(.)/, g => g.toLowerCase()).replace(/_/, '');
      case 'PascalCase':
        return snakeCase.replace(/_([a-z0-9])/g, g => g[1].toUpperCase()).replace(/^(.)/, g => g.toUpperCase()).replace(/_/, '');
      case 'snake_case':
        return snakeCase;
      case 'lowercase':
        return snakeCase.replace(/_/g, '');
      default: // UPPER_CASE
        return snakeCase.toUpperCase();
    }
  };

  const generateHpp = () => {
    if (selectedNamespaces.size === 0) {
      alert("Please select at least one namespace.");
      return;
    }

    setGenerating(true);

    let hppContent = `#pragma once\n#include <cstdint>\n\n// Generated by Vey's Native DB\n\n`;

    if (vectorize) {
      hppContent += `struct Vector3 {\n    float x, y, z;\n};\n\n`;
    }

    selectedNamespaces.forEach(ns => {
      hppContent += `namespace ${ns} {\n`;
      nativesMap[ns].forEach(n => {
        let processedParams = Array.isArray(n.params)
          ? n.params.map((p, i) => ({ type: p.type || 'Any', name: p.name || `p${i}` }))
          : [];

        let finalParams = [];
        let finalParamNames = [];

        if (vectorize) {
          for (let i = 0; i < processedParams.length; i++) {
            if (i + 2 < processedParams.length &&
              processedParams[i].type.toLowerCase() === 'float' &&
              processedParams[i + 1].type.toLowerCase() === 'float' &&
              processedParams[i + 2].type.toLowerCase() === 'float' &&
              /x|posx|coorsx/i.test(processedParams[i].name) &&
              /y|posy|coorsy/i.test(processedParams[i + 1].name) &&
              /z|posz|coorsz/i.test(processedParams[i + 2].name)) {

              let vecName = processedParams[i].name.replace(/x|posx|coorsx/i, '');
              if (vecName === '') vecName = 'position';
              if (!isNaN(vecName) && vecName.trim() !== '') vecName = `vec${vecName}`;

              finalParams.push(`Vector3 ${vecName}`);
              finalParamNames.push(`${vecName}.x, ${vecName}.y, ${vecName}.z`);
              i += 2;
            } else {
              finalParams.push(`${processedParams[i].type} ${processedParams[i].name}`);
              finalParamNames.push(processedParams[i].name);
            }
          }
        } else {
          finalParams = processedParams.map(p => `${p.type} ${p.name}`);
          finalParamNames = processedParams.map(p => p.name);
        }

        const params = finalParams.join(', ');
        const paramNames = finalParamNames.join(', ');
        const returnType = n.returns || 'Any';
        const funcName = formatName(n.name);

        hppContent += `    // ${n.name} | ${n.hash}\n`;
        hppContent += `    static ${returnType} ${funcName}(${params}) {\n`;
        if (returnType.toLowerCase() === 'void') {
          hppContent += `        ${customInvoke}<${n.hash}>(${paramNames});\n`;
        } else {
          hppContent += `        return ${customInvoke}<${n.hash}, ${returnType}>(${paramNames});\n`;
        }
        hppContent += `    }\n\n`;
      });
      hppContent += `}\n\n`;
    });

    const blob = new Blob([hppContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `natives_${gameId}.hpp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setGenerating(false);
  };

  if (!game) return <div>Game not found</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col bg-background/30">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
                    G
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Generate Header</h1>
                    <p className="text-sm text-muted">{game.name} Natives</p>
                  </div>
                </div>
                <p className="text-sm text-muted max-w-2xl">
                  Select namespaces and configure options to generate a C++ header file with native function declarations.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{selectedNamespaces.size}</div>
                <div className="text-sm text-muted">namespaces selected</div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-muted">Loading natives...</div>
              ) : error ? (
                <div className="flex items-center justify-center h-64 text-orange-400">Error: {error}</div>
              ) : (
                <>
                  {/* Configuration Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="glass rounded-xl p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Code Style
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-muted mb-2">Naming Convention</label>
                          <select
                            value={namingConvention}
                            onChange={(e) => setNamingConvention(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                          >
                            <option value="default">Default (UPPER_CASE)</option>
                            <option value="camelCase">camelCase</option>
                            <option value="PascalCase">PascalCase</option>
                            <option value="snake_case">snake_case</option>
                            <option value="lowercase">lowercase</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-muted mb-2">Invoke Function</label>
                          <input
                            type="text"
                            value={customInvoke}
                            onChange={(e) => setCustomInvoke(e.target.value)}
                            placeholder="Invoke"
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Optimizations
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="custom-checkbox">
                            <input
                              type="checkbox"
                              checked={vectorize}
                              onChange={(e) => setVectorize(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Vector3 Conversion</div>
                            <div className="text-xs text-muted">Convert float x,y,z to Vector3</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer w-full bg-surface hover:bg-surface/80 border border-border rounded-lg px-4 py-2 text-sm font-medium transition-all">
                          <div className="custom-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedNamespaces.size === namespaces.length && namespaces.length > 0}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                          </div>
                          <span>{selectedNamespaces.size === namespaces.length ? 'Deselect All' : 'Select All'}</span>
                        </label>
                        <button
                          onClick={generateHpp}
                          disabled={generating || selectedNamespaces.size === 0}
                          className="w-full bg-primary hover:bg-primary/80 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2"
                        >
                          {generating ? (
                            <>Generating...</>
                          ) : (
                            <>
                              <Download size={16} />
                              Generate Header
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Namespaces Section */}
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Namespaces</h3>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Filter namespaces..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {namespaces.map(ns => (
                        <label key={ns} className="group cursor-pointer">
                          <div className={cn(
                            "p-3 rounded-lg border transition-all hover:shadow-sm",
                            selectedNamespaces.has(ns)
                              ? "bg-primary/10 border-primary/40 shadow-sm"
                              : "bg-background/50 border-border hover:border-primary/30"
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="custom-checkbox">
                                <input
                                  type="checkbox"
                                  checked={selectedNamespaces.has(ns)}
                                  onChange={() => handleNamespaceToggle(ns)}
                                />
                                <span className="checkmark"></span>
                              </div>
                              <span className="font-medium text-sm truncate">{ns}</span>
                            </div>
                            <div className="text-xs text-muted">{nativesMap[ns] ? Object.keys(nativesMap[ns]).length : 0} natives</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
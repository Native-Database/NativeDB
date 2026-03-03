import { NextResponse } from 'next/server';
import { GAMES } from '@/lib/utils';

const GAME_URLS = {
  gta5: { url: 'https://raw.githubusercontent.com/alloc8or/gta5-nativedb-data/master/natives.json', type: 'json' },
  rdr2: { url: 'https://raw.githubusercontent.com/alloc8or/rdr3-nativedb-data/master/natives.json', type: 'json' },
  rdr: { url: 'https://raw.githubusercontent.com/Native-Database/Red-Dead-Redemption/master/natives.h', type: 'header' },
  mp3: { url: 'https://raw.githubusercontent.com/Native-Database/Max-Payne-3/master/natives.h', type: 'header' },
  gta4: { url: 'https://raw.githubusercontent.com/Native-Database/Grand-Theft-Auto-IV/master/natives.h', type: 'header' }
};

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function generateHash(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = hash & hash;
  }
  return '0x' + ((hash >>> 0)).toString(16).toUpperCase();
}

function parseHeaderFile(content) {
  const natives = {};
  const lines = content.split(/\r?\n/);

  let currentNamespace = null;
  let inNamespace = false;
  let braceCount = 0;
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    let line = rawLine.replace(/\/\/.*$/, '').trim();
    
    if (!line) {
      i++;
      continue;
    }

    if (line.includes('namespace') && !line.startsWith('//')) {
      const nsMatch = line.match(/namespace\s+(\w+)/);
      if (nsMatch) {
        currentNamespace = nsMatch[1];
        if (!natives[currentNamespace]) natives[currentNamespace] = {};
        if (line.includes('{')) {
          braceCount++;
        }
      }
      i++;
      continue;
    }

    if (line === '}' || line.startsWith('} //')) {
      if (braceCount > 0) {
        braceCount--;
      }
      if (braceCount === 0) {
        currentNamespace = null;
      }
      i++;
      continue;
    }

    if (line.includes('{')) {
      braceCount++;
    }

    if (line.startsWith('#')) {
      i++;
      continue;
    }

    const funcMatch = line.match(/^static\s+(\w+)\s+(\w+)\s*\(([^)]*)\)/);
    
    if (funcMatch) {
      const returnType = funcMatch[1];
      const fnName = funcMatch[2];
      const paramsStr = funcMatch[3];

      const skip = ['if', 'else', 'while', 'for', 'return', 'typedef', 'struct', 'enum', 'static', 'inline', 'const', 'extern'];
      if (skip.includes(returnType)) {
        i++;
        continue;
      }

      let hash = null;
      const hashMatch = rawLine.match(/Invoke<0x([0-9A-Fa-f]+)>/);
      if (hashMatch) {
        hash = '0x' + hashMatch[1].toUpperCase();
      } else {
        hash = generateHash(fnName);
      }

      const params = [];
      if (paramsStr.trim()) {
        for (const p of paramsStr.split(',')) {
          const pTrim = p.trim();
          const pMatch = pTrim.match(/^(?:const\s+)?(\w+)(?:\*|&)?\s+(\w+)$/);
          if (pMatch) {
            params.push({ type: pMatch[1], name: pMatch[2] });
          } else if (pTrim) {
            params.push({ type: pTrim, name: 'param' });
          }
        }
      }

      if (currentNamespace) {
        if (!natives[currentNamespace]) natives[currentNamespace] = {};
        natives[currentNamespace][hash] = {
          name: fnName,
          hash,
          returnType,
          params,
          type: 'native'
        };
      }
    }

    i++;
  }

  if (natives['GLOBAL'] && Object.keys(natives['GLOBAL']).length === 0) {
    delete natives['GLOBAL'];
  }
  
  return natives;
}

async function fetchNatives(gameId, forceRefresh = false) {
  const cached = cache.get(gameId);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const gameConfig = GAME_URLS[gameId];
  if (!gameConfig) return null;

  try {
    const response = await fetch(gameConfig.url);
    if (!response.ok) return null;

    let data;
    if (gameConfig.type === 'header') {
      const content = await response.text();
      data = parseHeaderFile(content);
    } else {
      data = await response.json();
    }

    cache.set(gameId, { data, timestamp: Date.now() });
    return data;
  } catch {
    return null;
  }
}

function searchNatives(data, query) {
  const searchLower = query.toLowerCase();
  const result = {};
  
  for (const [ns, natives] of Object.entries(data)) {
    for (const [nativeHash, native] of Object.entries(natives)) {
      const name = native.name || native.NativeName || native.hashName || '';
      const description = native.description || '';
      
      if (name.toLowerCase().includes(searchLower) || 
          nativeHash.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)) {
        if (!result[ns]) result[ns] = {};
        result[ns][nativeHash] = native;
      }
    }
  }
  return result;
}

function filterByHash(data, hash) {
  const hashLower = hash.toLowerCase();
  const result = {};
  
  for (const [ns, natives] of Object.entries(data)) {
    for (const [nativeHash, native] of Object.entries(natives)) {
      if (nativeHash.toLowerCase() === hashLower) {
        result[ns] = { [nativeHash]: native };
        break;
      }
    }
  }
  return result;
}

function getRandomNatives(data, count = 1) {
  const allNatives = [];
  
  for (const [ns, natives] of Object.entries(data)) {
    for (const [nativeHash, native] of Object.entries(natives)) {
      allNatives.push({ namespace: ns, hash: nativeHash, ...native });
    }
  }
  
  const shuffled = allNatives.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function paginateNatives(data, limit = 100, offset = 0) {
  const result = {};
  let totalCount = 0;
  let currentOffset = offset;
  
  for (const [ns, natives] of Object.entries(data)) {
    const nativeList = Object.entries(natives);
    const startIndex = Math.max(0, currentOffset);
    const endIndex = startIndex + limit;
    
    const paginatedNatives = nativeList.slice(startIndex, endIndex);
    
    if (paginatedNatives.length > 0) {
      result[ns] = Object.fromEntries(paginatedNatives);
      limit -= paginatedNatives.length;
    }
    
    currentOffset -= Math.min(0, nativeList.length - startIndex);
    totalCount += nativeList.length;
  }
  
  return { data: result, total: totalCount, offset, limit };
}

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const gameId = searchParams.get('game');
  const namespace = searchParams.get('namespace');
  const hash = searchParams.get('hash');
  const search = searchParams.get('search');
  const random = searchParams.get('random');
  const namespaces = searchParams.get('namespaces');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');
  const refresh = searchParams.get('refresh');

  try {
    const gamesWithNatives = GAMES.filter(g => g.url);

    if (!gameId) {
      const results = await Promise.all(
        gamesWithNatives.map(async (game) => {
          const gameConfig = GAME_URLS[game.id];
          if (!gameConfig) return null;
          
          const data = await fetchNatives(game.id, refresh === 'true');
          if (!data) return null;
          
          const nsList = Object.keys(data).sort();
          return {
            game: game.id,
            gameName: game.name,
            count: nsList.reduce((acc, ns) => acc + Object.keys(data[ns] || {}).length, 0),
            namespaces: nsList.map(ns => ({
              name: ns,
              count: Object.keys(data[ns] || {}).length
            }))
          };
        })
      );

      const availableGames = results.filter(g => g !== null);

      return NextResponse.json({
        games: availableGames,
        total: availableGames.length
      });
    }

    const game = gamesWithNatives.find(g => g.id === gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const gameConfig = GAME_URLS[gameId];
    if (!gameConfig) {
      return NextResponse.json({ error: 'Natives data not available for this game' }, { status: 404 });
    }

    const data = await fetchNatives(gameId, refresh === 'true');
    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch natives data' }, { status: 404 });
    }

    let resultData = { ...data };

    if (namespace) {
      if (data[namespace]) {
        resultData = { [namespace]: data[namespace] };
      } else {
        return NextResponse.json({ error: 'Namespace not found' }, { status: 404 });
      }
    }

    if (namespaces === 'true') {
      const nsList = Object.keys(resultData).sort();
      return NextResponse.json({
        game: gameId,
        gameName: game.name,
        namespaces: nsList.map(ns => ({
          name: ns,
          count: Object.keys(resultData[ns] || {}).length
        }))
      });
    }

    if (hash) {
      resultData = filterByHash(resultData, hash);
    }

    if (search) {
      resultData = searchNatives(resultData, search);
    }

    if (random) {
      const count = parseInt(random) || 1;
      const natives = getRandomNatives(resultData, Math.min(count, 50));
      return NextResponse.json({
        game: gameId,
        gameName: game.name,
        count: natives.length,
        natives
      });
    }

    const { data: paginatedData, total } = paginateNatives(resultData, limit, offset);
    const nsKeys = Object.keys(paginatedData).sort();

    return NextResponse.json({
      game: gameId,
      gameName: game.name,
      count: nsKeys.reduce((acc, ns) => acc + Object.keys(paginatedData[ns] || {}).length, 0),
      total,
      offset,
      limit,
      namespaces: nsKeys.map(ns => ({
        name: ns,
        count: Object.keys(paginatedData[ns] || {}).length
      })),
      natives: paginatedData
    });
  } catch (error) {
    console.error('Error fetching natives:', error);
    return NextResponse.json({ error: 'Failed to fetch natives data' }, { status: 500 });
  }
}

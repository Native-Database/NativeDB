import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const namespace = searchParams.get('namespace');
  const hash = searchParams.get('hash');
  const search = searchParams.get('search');

  try {
    const response = await fetch('https://raw.githubusercontent.com/alloc8or/gta5-nativedb-data/master/natives.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch GTA V natives');
    }

    let data = await response.json();

    if (namespace) {
      if (data[namespace]) {
        data = { [namespace]: data[namespace] };
      } else {
        return NextResponse.json({ error: 'Namespace not found' }, { status: 404 });
      }
    }

    // Filter by hash
    if (hash) {
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
      data = result;
    }

    // Search by name
    if (search) {
      const searchLower = search.toLowerCase();
      const result = {};
      for (const [ns, natives] of Object.entries(data)) {
        for (const [nativeHash, native] of Object.entries(natives)) {
          const name = native.name || native.NativeName || native.hashName || '';
          if (name.toLowerCase().includes(searchLower) || nativeHash.toLowerCase().includes(searchLower)) {
            if (!result[ns]) result[ns] = {};
            result[ns][nativeHash] = native;
          }
        }
      }
      data = result;
    }

    const namespaces = Object.keys(data).sort();

    return NextResponse.json({
      game: 'gta5',
      gameName: 'GTA V',
      count: namespaces.reduce((acc, ns) => acc + Object.keys(data[ns]).length, 0),
      namespaces: namespaces.map(ns => ({
        name: ns,
        count: Object.keys(data[ns]).length
      })),
      natives: data
    });
  } catch (error) {
    console.error('Error fetching GTA V natives:', error);
    return NextResponse.json({ error: 'Failed to fetch GTA V natives' }, { status: 500 });
  }
}

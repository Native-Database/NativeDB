import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  
  const player = searchParams.get('id') 
    || searchParams.get('username') 
    || searchParams.get('name') 
    || searchParams.get('rid');

  if (!player) {
    return NextResponse.json({ error: 'Rockstar ID or username is required' }, { status: 400 });
  }

  try {
    let rid = null;
    let username = null;

    if (/^\d+$/.test(player)) {
      rid = player;
      const resp = await fetch(`https://sc-cache.com/r/${rid}`);
      if (resp.ok) {
        const raw = await resp.json();
        const data = Array.isArray(raw) ? raw[0] : raw;
        username = data?.name || data?.username || data?.nickname || null;
      }
    } else {
      username = player;
      const resp = await fetch(`https://sc-cache.com/n/${encodeURIComponent(username)}`);
      if (resp.ok) {
        const raw = await resp.json();
        const data = Array.isArray(raw) ? raw[0] : raw;
        rid = data?.id?.toString() || null;
        const apiUsername = data?.name || data?.username || data?.nickname || null;
        if (apiUsername) {
          username = apiUsername;
        }
      }
    }

    if (!rid) {
      return NextResponse.json({
        success: false,
        error: 'User not found or RID not available',
        rid: null,
        username,
        legacy: { primary: null, secondary: null },
        enhanced: { primary: null, secondary: null }
      }, { status: 200 });
    }

    const urls = {
      legacy: [
        `https://prod.cloud.rockstargames.com/members/sc/6266/${rid}/publish/gta5/mpchars/0.png`,
        `https://prod.cloud.rockstargames.com/members/sc/6266/${rid}/publish/gta5/mpchars/1.png`,
      ],
      enhanced: [
        `https://prod.cloud.rockstargames.com/members/sc/0807/${rid}/publish/gta5/mpchars/0_pcrosalt.png`,
        `https://prod.cloud.rockstargames.com/members/sc/0807/${rid}/publish/gta5/mpchars/1_pcrosalt.png`,
      ],
    };

    const checkImage = async (url) => {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        return res.ok ? url : null;
      } catch {
        return null;
      }
    };

    const [legacy0, legacy1, enhanced0, enhanced1] = await Promise.all([
      checkImage(urls.legacy[0]),
      checkImage(urls.legacy[1]),
      checkImage(urls.enhanced[0]),
      checkImage(urls.enhanced[1]),
    ]);

    const result = {
      success: true,
      rid,
      username,
      legacy: {
        primary: legacy0 || legacy1 || null,
        secondary: legacy1 || null,
      },
      enhanced: {
        primary: enhanced0 || enhanced1 || null,
        secondary: enhanced1 || null,
      },
      profileUrl: `https://socialclub.rockstargames.com/member/${rid}`,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json({ error: 'Failed to fetch avatar data' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const playerId = searchParams.get('id');
  const username = searchParams.get('username');

  if (!playerId && !username) {
    return NextResponse.json({ error: 'Rockstar ID or username is required' }, { status: 400 });
  }

  try {
    let rid = null;
    let profileUsername = null;

    const isNumeric = /^\d+$/.test(playerId || username || '');
    
    if (isNumeric) {
      rid = playerId;
      const userResp = await fetch(`https://sc-cache.com/r/${rid}`);
      if (userResp.ok) {
        const userData = await userResp.json();
        const data = Array.isArray(userData) ? userData[0] : userData;
        profileUsername = data?.name || data?.username || data?.nickname || null;
        console.log('Profile lookup - RID:', rid, 'Username from cache:', profileUsername);
      }
    } else {
      const lookupResp = await fetch(`https://sc-cache.com/n/${encodeURIComponent(username || playerId)}`);
      if (lookupResp.ok) {
        const lookupData = await lookupResp.json();
        const data = Array.isArray(lookupData) ? lookupData[0] : lookupData;
        rid = data?.id?.toString() || null;
        profileUsername = data?.name || data?.username || data?.nickname || null;
        console.log('Profile lookup - Username:', username, 'RID from cache:', rid);
      }
    }

    if (!rid) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const profileData = {
      rid,
      username: profileUsername || username || playerId,
      profileUrl: `https://socialclub.rockstargames.com/member/${rid}`,
      games: {
        gta5: {
          name: "GTA Online",
          available: true,
        },
        rdr2: {
          name: "Red Dead Online", 
          available: true,
        }
      },
      lastSeen: new Date().toISOString(),
      social: {
        rockstar: `https://socialclub.rockstargames.com/member/${rid}`,
      }
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
}

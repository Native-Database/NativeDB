import { NextResponse } from 'next/server';

const fetchDLCData = async () => {
  try {
    const response = await fetch('https://media-rockstargames-com.akamaized.net/mfe6/importmaps/92ea64/prod.json', {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch DLC data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching DLC data:', error);
    return null;
  }
};

const DEFAULT_DLCS = [
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

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const playerId = searchParams.get('id');
  const getDLCs = searchParams.get('dlcs');

  if (getDLCs === 'true') {
    try {
      const response = await fetch('https://media-rockstargames-com.akamaized.net/mfe6/importmaps/92ea64/prod.json');
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ 
          success: true, 
          data: data,
          defaults: DEFAULT_DLCS 
        });
      }
    } catch (error) {
      console.error('Error fetching DLCs:', error);
    }
    return NextResponse.json({ success: true, defaults: DEFAULT_DLCS });
  }

  if (!playerId) {
    return NextResponse.json({ error: 'Rockstar ID is required' }, { status: 400 });
  }

  try {
    const cleanId = playerId.replace(/[^0-9]/g, '');
    
    if (!cleanId || cleanId.length < 5) {
      return NextResponse.json({ error: 'Invalid Rockstar ID format' }, { status: 400 });
    }

    let dlcData = DEFAULT_DLCS;
    try {
      const dlcResponse = await fetch('https://media-rockstargames-com.akamaized.net/mfe6/importmaps/92ea64/prod.json');
      if (dlcResponse.ok) {
        const rockstarData = await dlcResponse.json();
        if (rockstarData && typeof rockstarData === 'object') {
          console.log('Rockstar DLC data fetched successfully');
        }
      }
    } catch (e) {
      console.log('Using default DLC data');
    }

    const dlcCompleted = dlcData.map((dlc, i) => {
      const randomProgress = Math.random();
      return {
        ...dlc,
        completed: randomProgress > 0.3,
        progress: Math.floor(randomProgress * 100),
      };
    });

    const sampleData = {
      username: `Player_${cleanId.slice(-4)}`,
      rockstarId: cleanId,
      games: {
        gta5: {
          name: "GTA Online",
          totalMoney: Math.floor(Math.random() * 5000000000),
          totalTimePlayed: Math.floor(Math.random() * 2000) + 100,
          level: Math.floor(Math.random() * 2000) + 1,
          kdRatio: (Math.random() * 3 + 0.5).toFixed(2),
          wins: Math.floor(Math.random() * 10000),
          losses: Math.floor(Math.random() * 5000),
          achievements: Math.floor(Math.random() * 126),
          totalAchievements: 126,
          dlcCompleted: dlcCompleted,
          missions: {
            completed: Math.floor(Math.random() * 2000),
            inProgress: Math.floor(Math.random() * 10),
          },
          properties: Math.floor(Math.random() * 20) + 1,
          vehicles: Math.floor(Math.random() * 100) + 10,
        },
        rdr2: {
          name: "Red Dead Online",
          totalMoney: Math.floor(Math.random() * 500000),
          totalTimePlayed: Math.floor(Math.random() * 1000),
          level: Math.floor(Math.random() * 200) + 1,
          kdRatio: (Math.random() * 2 + 0.5).toFixed(2),
          achievements: Math.floor(Math.random() * 89),
          totalAchievements: 89,
        }
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(sampleData);
  } catch (error) {
    console.error('Error fetching career data:', error);
    return NextResponse.json({ error: 'Failed to fetch career data' }, { status: 500 });
  }
}

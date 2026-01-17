export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = '1428793215938592809';

  if (!token) {
    return Response.json({ error: 'Bot token not set' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/applications/${clientId}/commands`, {
      headers: {
        'Authorization': `Bot ${token}`
      }
    });

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch commands from Discord' }, { status: response.status });
    }

    const commands = await response.json();

    // Group commands by category
    const categories = {
      general: { id: 'general', category: 'General', items: [] },
      natives: { id: 'natives', category: 'Natives', items: [] },
      favorites: { id: 'favorites', category: 'Favorites', items: [] },
      utility: { id: 'utility', category: 'Utility', items: [] }
    };

    commands.forEach(cmd => {
      let cat = 'utility'; // default
      if (cmd.name === 'info') cat = 'general';
      else if (cmd.name.startsWith('native')) cat = 'natives';
      else if (cmd.name.startsWith('favorite')) cat = 'favorites';

      // Construct usage string
      let usage = `/${cmd.name}`;
      if (cmd.options && cmd.options.length > 0) {
        const params = cmd.options.map(o => {
          const required = o.required ? '' : '?';
          return `<${o.name}${required}>`;
        }).join(' ');
        usage += ` ${params}`;
      }

      categories[cat].items.push({
        name: `/${cmd.name}`,
        description: cmd.description || 'No description',
        usage
      });
    });

    // Return only categories with items
    const data = Object.values(categories).filter(c => c.items.length > 0);

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching bot commands:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
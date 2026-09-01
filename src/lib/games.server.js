function parseAttributes(attrText = '') {
  const attrs = {};
  const attrRegex = /([A-Za-z0-9_-]+)\s*=\s*"([^"]*)"/g;
  let match;

  while ((match = attrRegex.exec(attrText)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

function parseGamesXml(xmlText) {
  const gameRegex = /<game\b([^>]*)>([\s\S]*?)<\/game>/gi;
  const games = [];
  let match;

  while ((match = gameRegex.exec(xmlText)) !== null) {
    const attrs = parseAttributes(match[1]);
    const content = match[2];

    const getText = (tagName) => {
      const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
      const valueMatch = content.match(regex);
      return valueMatch ? valueMatch[1].trim() : '';
    };

    const linkRegex = /<link\b([^>]*)\s*\/?>/gi;
    const links = [];
    let linkMatch;

    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const linkAttrs = parseAttributes(linkMatch[1]);
      links.push({
        type: linkAttrs.type || 'internal',
        href: linkAttrs.href || '#',
        label: linkAttrs.label || '',
        icon: linkAttrs.icon || ''
      });
    }

    const game = {
      id: attrs.id || '',
      name: getText('name'),
      description: getText('description'),
      detailedDescription: getText('detailedDescription'),
      icon: getText('icon'),
      color: getText('color') || undefined,
      url: getText('url') || undefined,
      type: attrs.type || undefined,
      links,
    };

    if (game.id) {
      games.push(game);
    }
  }

  return games;
}

export async function loadGamesServer() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'games.xml');
    const xmlText = await fs.readFile(filePath, 'utf8');
    return parseGamesXml(xmlText);
  } catch (error) {
    console.error('Failed to load games.xml on server:', error);
    return [];
  }
}

export function getGameById(games, gameId) {
  return games.find((game) => game.id === gameId) || null;
}

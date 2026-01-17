import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function escapeHtml(s) {
  return String(s || '').replace(/[&<>()"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '(': '&#40;',
    ')': '&#41;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

export const GAMES = [
  {
    id: 'gta5',
    name: 'GTA V',
    description: 'Grand Theft Auto V Natives',
    detailedDescription: 'Explore and generate native function calls for Grand Theft Auto V. This database provides detailed information on game internals.',
    icon: 'Database',
    links: [
      { type: 'internal', href: '/native/gta5', label: 'Browse', icon: 'Database' },
      { type: 'internal', href: '/generate/gta5', label: 'Generate', icon: 'Code' },
    ],
    url: 'https://raw.githubusercontent.com/alloc8or/gta5-nativedb-data/master/natives.json'
  },
  {
    id: 'rdr2',
    name: 'RDR 2',
    description: 'Red Dead Redemption 2 Natives',
    detailedDescription: 'Dive into the native functions of Red Dead Redemption 2. Essential for modding and understanding game mechanics.',
    icon: 'Database',
    links: [
      { type: 'internal', href: '/native/rdr2', label: 'Browse', icon: 'Database' },
      { type: 'internal', href: '/generate/rdr2', label: 'Generate', icon: 'Code' },
    ],
    url: 'https://raw.githubusercontent.com/alloc8or/rdr3-nativedb-data/master/natives.json'
  },
  {
    id: 'rdr',
    name: 'RDR',
    description: 'Red Dead Redemption Natives',
    detailedDescription: 'Access native functions for the original Red Dead Redemption. Useful for preservation and exploration.',
    icon: 'Database',
    links: [
      { type: 'internal', href: '/native/rdr', label: 'Browse', icon: 'Database' },
      { type: 'internal', href: '/generate/rdr', label: 'Generate', icon: 'Code' },
    ],
    url: 'https://raw.githubusercontent.com/K3rhos/RDR-PC-Natives-DB/main/Natives.h',
    type: 'header'
  },
  {
    id: 'mp3',
    name: 'Max Payne 3',
    description: 'Max Payne 3 Natives',
    detailedDescription: 'Explore the native database for Max Payne 3. Provides insights into the game engine and scripting.',
    icon: 'Database',
    links: [
      { type: 'internal', href: '/native/mp3', label: 'Browse', icon: 'Database' },
      { type: 'internal', href: '/generate/mp3', label: 'Generate', icon: 'Code' },
    ],
    url: 'https://raw.githubusercontent.com/alloc8or/mp3-nativedb-data/master/natives.json'
  },
  {
    id: 'gta4',
    name: 'GTA IV',
    description: 'Grand Theft Auto IV Natives',
    detailedDescription: 'Investigate native functions for Grand Theft Auto IV. A valuable resource for mod developers and enthusiasts.',
    icon: 'Database',
    links: [
      { type: 'internal', href: '/native/gta4', label: 'Browse', icon: 'Database' },
      { type: 'internal', href: '/generate/gta4', label: 'Generate', icon: 'Code' },
    ],
    url: 'https://raw.githubusercontent.com/ThirteenAG/GTAIV.EFLC.FusionFix/master/source/natives.ixx',
    type: 'cpp_class'
  },
  {
    id: 'converter',
    name: 'Converter',
    description: 'Dev tools: Hex, Base64, Hashing and more.',
    detailedDescription: 'A collection of essential developer tools for converting data formats, encoding/decoding, and generating hashes.',
    icon: 'Zap',
    color: 'text-blue-400',
    links: [
      { type: 'internal', href: '/converter', label: 'Open Converter', icon: 'Zap' },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Join our community and add our bot.',
    detailedDescription: 'Connect with other users, get support, and stay updated on the latest news by joining our Discord server. You can also add our bot to your own server.',
    icon: 'Discord',
    links: [
      { type: 'external', href: 'https://discord.com/oauth2/authorize?client_id=1428793215938592809&permissions=8&integration_type=0&scope=bot+applications.commands', label: 'Add Bot', icon: 'Cpu' },
      { type: 'external', href: 'https://discord.gg/cyNP2bn9xE', label: 'Join Server', icon: 'Users' },
    ],
  },
  // {
  //   id: 'catalog',
  //   name: 'Net Catalog',
  //   description: 'Browse GTA Online network catalog items.',
  //   detailedDescription: 'Explore and inspect network catalog items from GTA Online.',
  //   icon: 'Cpu',
  //   color: 'text-purple-400',
  //   links: [
  //     { type: 'internal', href: '/catalog', label: 'Browse Catalog', icon: 'Cpu' },
  //   ],
];

export const BOT_ADD_URL = 'https://discord.com/oauth2/authorize?client_id=1428793215938592809&permissions=8&integration_type=0&scope=bot+applications.commands';

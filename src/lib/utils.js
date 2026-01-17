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
    url: 'https://raw.githubusercontent.com/alloc8or/gta5-nativedb-data/master/natives.json'
  },
  {
    id: 'rdr2',
    name: 'RDR 2',
    description: 'Red Dead Redemption 2 Natives',
    url: 'https://raw.githubusercontent.com/alloc8or/rdr3-nativedb-data/master/natives.json'
  },
  {
    id: 'rdr',
    name: 'RDR',
    description: 'Red Dead Redemption Natives',
    url: 'https://raw.githubusercontent.com/K3rhos/RDR-PC-Natives-DB/main/Natives.h',
    type: 'header'
  },
  {
    id: 'mp3',
    name: 'Max Payne 3',
    description: 'Max Payne 3 Natives',
    url: 'https://raw.githubusercontent.com/alloc8or/mp3-nativedb-data/master/natives.json'
  },
  {
    id: 'gta4',
    name: 'GTA IV',
    description: 'Grand Theft Auto IV Natives',
    url: 'https://raw.githubusercontent.com/ThirteenAG/GTAIV.EFLC.FusionFix/master/source/natives.ixx',
    type: 'cpp_class'
  }
];

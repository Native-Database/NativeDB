import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

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
                                                 '\'': '&#39;'
                                               }[c]));
}

export const BOT_ADD_URL = process.env.DISCORD_BOT_URL;
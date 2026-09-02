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

export function parseConverterXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) {
    throw new Error('converter.xml is invalid');
  }

  return Array.from(xml.querySelectorAll('tool')).reduce((tools, tool) => {
    const id = tool.getAttribute('id');
    if (id) {
      tools.push({
        id,
        name: tool.querySelector('name')?.textContent.trim() || id,
        description: tool.querySelector('description')?.textContent.trim() || '',
        tabs: Array.from(tool.querySelectorAll(':scope > tabs > tab')).map(tab => ({
          id: tab.getAttribute('id') || tab.querySelector('name')?.textContent.trim() || 'tab',
          name: tab.getAttribute('name') || tab.querySelector('name')?.textContent.trim() || 'Tool',
          fields: Array.from(tab.querySelectorAll(':scope > field')).map(field => ({
            id: field.getAttribute('id') || '',
            type: field.getAttribute('type') || 'input',
            label: field.getAttribute('label') || field.getAttribute('id') || 'Value',
            placeholder: field.getAttribute('placeholder') || '',
            value: field.getAttribute('value') || '',
            readonly: field.getAttribute('readonly') === 'true',
            options: Array.from(field.querySelectorAll(':scope > option')).map(option => ({
              value: option.getAttribute('value') || option.textContent.trim(),
              label: option.textContent.trim()
            }))
          }))
        }))
      });
    }
    return tools;
  }, []);
}

export async function loadConverterTools() {
  const response = await fetch('/api/converter', {cache: 'no-store'});
  if (!response.ok) {
    throw new Error('converter.xml could not be loaded');
  }

  const tools = parseConverterXml(await response.text());
  if (tools.length === 0) {
    throw new Error('converter.xml has no tools');
  }

  return tools;
}
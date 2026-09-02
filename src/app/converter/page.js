'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Copy, Check } from 'lucide-react';
import { loadConverterTools } from '@/lib/utils';

const toolComponents = {
  'number-converter': NumberConverter,
  'text-base64': TextBase64,
  'url-encoder': UrlEncoder,
  'hash-generator': HashGenerator,
  'joaat-converter': JoaatConverter,
  'color-converter': ColorConverter,
  'hex-viewer': HexViewer
};

export default function ConverterPage() {
  const [tools, setTools] = useState({});
  const [activeTool, setActiveTool] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadTools = async () => {
      try {
        const converterTools = await loadConverterTools();
        const xmlTools = converterTools.reduce((result, tool) => {
          result[tool.id] = {
            ...tool,
            component: toolComponents[tool.id] || XmlToolPage
          };
          return result;
        }, {});

        setTools(xmlTools);
        setActiveTool(Object.keys(xmlTools)[0]);
      } catch (error) {
        console.error('Failed to load converter.xml:', error);
        setLoadError('Unable to load converter.xml.');
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ActiveComponent = tools[activeTool]?.component;

  if (loading || loadError || !ActiveComponent) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-background/30 p-6">
          <p className="text-muted">{loadError || 'Loading converter tools...'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 glass border-r border-border p-6 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                C
              </div>
              <div>
                <h1 className="font-bold text-lg">Converter</h1>
                <p className="text-sm text-muted">Useful Tools</p>
              </div>
            </div>
            <p className="text-xs text-muted">
              Select a tool from the list below.
            </p>
          </div>

          <div className="flex-1 space-y-1">
            {Object.entries(tools).map(([key, tool]) => (
              <button
                key={key}
                onClick={() => setActiveTool(key)}
                className={`w-full text-left p-3 rounded-lg transition-all ${activeTool === key
                    ? 'bg-primary/10 border border-primary/30 text-primary'
                    : 'hover:bg-surface/50 text-muted hover:text-foreground'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tool.name}</span>
                  <span className="text-xs opacity-50">→</span>
                </div>
              </button>
            ))}
          </div>

          <a
            href="/"
            className="mt-4 w-full bg-surface border border-border hover:border-primary/30 rounded-lg p-3 text-center transition-all hover:bg-surface/80"
          >
            Back to Home
          </a>
        </aside>

        <main className="flex-1 flex flex-col bg-background/30">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Converter</p>
                <h2 className="text-2xl font-bold">{tools[activeTool]?.name}</h2>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <ActiveComponent onCopy={handleCopy} copied={copied} tool={tools[activeTool]} />
          </div>
        </main>
      </div>
    </div>
  );
}

function XmlToolPage({ tool, onCopy, copied }) {
  const tabs = tool.tabs.length > 0 ? tool.tabs : [{ id: 'main', name: tool.name, fields: [] }];
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [values, setValues] = useState(() => Object.fromEntries(
    tabs.flatMap(tab => tab.fields.map(field => [field.id, field.value]))
  ));

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className="max-w-4xl space-y-6">
      {tool.description && <p className="text-muted">{tool.description}</p>}

      {tabs.length > 1 && (
        <div className="flex gap-2 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-2 text-sm ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {currentTab.fields.map(field => (
          <XmlField
            key={field.id}
            field={field}
            value={values[field.id] ?? ''}
            copied={copied}
            onCopy={onCopy}
            onChange={value => setValues(previous => ({ ...previous, [field.id]: value }))}
          />
        ))}
      </div>
    </div>
  );
}

function XmlField({ field, value, copied, onCopy, onChange }) {
  const fieldClassName = 'w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary/50';

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={value === 'true'}
          disabled={field.readonly}
          onChange={event => onChange(event.target.checked ? 'true' : 'false')}
        />
        {field.label}
      </label>
    );
  }

  const control = field.type === 'textarea' ? (
    <textarea
      value={value}
      readOnly={field.readonly}
      placeholder={field.placeholder}
      rows={6}
      onChange={event => onChange(event.target.value)}
      className={`${fieldClassName} resize-none`}
    />
  ) : field.type === 'select' ? (
    <select value={value} onChange={event => onChange(event.target.value)} className={fieldClassName}>
      {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  ) : (
    <input
      type={field.type}
      value={value}
      readOnly={field.readonly}
      placeholder={field.placeholder}
      onChange={event => onChange(event.target.value)}
      className={fieldClassName}
    />
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{field.label}</label>
      <div className="relative">
        {control}
        {field.readonly && (
          <button
            onClick={() => onCopy(value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-primary/10"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function NumberConverter({ onCopy, copied }) {
  const [values, setValues] = useState({
    s32: '',
    u32: '',
    hex: '',
    bin: ''
  });

  const updateAll = (sourceType, sourceValue) => {
    let num = 0;
    let isValid = false;

    if (sourceValue === '') {
      setValues({ s32: '', u32: '', hex: '', bin: '' });
      return;
    }

    try {
      switch (sourceType) {
        case 's32': num = parseInt(sourceValue, 10) | 0; isValid = !isNaN(num); break;
        case 'u32': num = parseInt(sourceValue, 10) >>> 0; isValid = !isNaN(num); break;
        case 'hex': num = parseInt(sourceValue.replace(/^0x/i, ''), 16) | 0; isValid = !isNaN(num); break;
        case 'bin': num = parseInt(sourceValue.replace(/^0b/i, ''), 2) | 0; isValid = !isNaN(num); break;
      }
    } catch (e) { isValid = false; }

    if (!isValid) return;

    const newValues = { ...values };
    if (sourceType !== 's32') newValues.s32 = num.toString();
    if (sourceType !== 'u32') newValues.u32 = (num >>> 0).toString();
    if (sourceType !== 'hex') newValues.hex = '0x' + (num >>> 0).toString(16).toUpperCase().padStart(8, '0');
    if (sourceType !== 'bin') newValues.bin = '0b' + (num >>> 0).toString(2).padStart(32, '0');

    setValues(newValues);
  };

  const handleInputChange = (type, value) => {
    setValues(prev => ({ ...prev, [type]: value }));
    updateAll(type, value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Signed Integer (32-bit)</label>
        <div className="relative">
          <input
            type="text"
            value={values.s32}
            onChange={(e) => handleInputChange('s32', e.target.value)}
            placeholder="e.g., -1"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={() => onCopy(values.s32)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Unsigned Integer (32-bit)</label>
        <div className="relative">
          <input
            type="text"
            value={values.u32}
            onChange={(e) => handleInputChange('u32', e.target.value)}
            placeholder="e.g., 4294967295"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={() => onCopy(values.u32)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Hexadecimal</label>
        <div className="relative">
          <input
            type="text"
            value={values.hex}
            onChange={(e) => handleInputChange('hex', e.target.value)}
            placeholder="e.g., 0xFFFFFFFF"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={() => onCopy(values.hex)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Binary</label>
        <div className="relative">
          <input
            type="text"
            value={values.bin}
            onChange={(e) => handleInputChange('bin', e.target.value)}
            placeholder="e.g., 11111111"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={() => onCopy(values.bin)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function TextBase64({ onCopy, copied }) {
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');

  const handleTextChange = (value) => {
    setText(value);
    try {
      setBase64(value ? btoa(value) : '');
    } catch (e) {
      setBase64('Invalid input for Base64 encoding.');
    }
  };

  const handleBase64Change = (value) => {
    setBase64(value);
    try {
      setText(value ? atob(value) : '');
    } catch (e) {
      setText('Invalid Base64 string.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Text</label>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter text here..."
            rows={6}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50 resize-none"
          />
          <button
            onClick={() => onCopy(text)}
            className="absolute right-2 top-4 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Base64</label>
        <div className="relative">
          <textarea
            value={base64}
            onChange={(e) => handleBase64Change(e.target.value)}
            placeholder="Enter Base64 string..."
            rows={6}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50 resize-none"
          />
          <button
            onClick={() => onCopy(base64)}
            className="absolute right-2 top-4 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function UrlEncoder({ onCopy, copied }) {
  const [decoded, setDecoded] = useState('');
  const [encoded, setEncoded] = useState('');

  const handleDecodedChange = (value) => {
    setDecoded(value);
    try {
      setEncoded(value ? encodeURIComponent(value) : '');
    } catch (e) {
      setEncoded('Invalid input for URL encoding.');
    }
  };

  const handleEncodedChange = (value) => {
    setEncoded(value);
    try {
      setDecoded(value ? decodeURIComponent(value) : '');
    } catch (e) {
      setDecoded('Invalid URL encoded string.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Decoded Text</label>
        <div className="relative">
          <textarea
            value={decoded}
            onChange={(e) => handleDecodedChange(e.target.value)}
            placeholder="Text with special characters like: & ? ="
            rows={6}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50 resize-none"
          />
          <button
            onClick={() => onCopy(decoded)}
            className="absolute right-2 top-4 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Encoded Text (URL Safe)</label>
        <div className="relative">
          <textarea
            value={encoded}
            onChange={(e) => handleEncodedChange(e.target.value)}
            placeholder="Text will be encoded to be URL-safe"
            rows={6}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50 resize-none"
          />
          <button
            onClick={() => onCopy(encoded)}
            className="absolute right-2 top-4 p-1 hover:bg-primary/10 rounded"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function HashGenerator({ onCopy, copied }) {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-512': ''
  });

  const generateHashes = async (text) => {
    if (!text) {
      setHashes({ 'SHA-1': '', 'SHA-256': '', 'SHA-512': '' });
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const newHashes = { ...hashes };

    for (const algorithm of ['SHA-1', 'SHA-256', 'SHA-512']) {
      try {
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        newHashes[algorithm] = hashHex;
      } catch (e) {
        newHashes[algorithm] = `Error: ${e.message}`;
      }
    }

    setHashes(newHashes);
  };

  const handleInputChange = (value) => {
    setInput(value);
    generateHashes(value);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter text to hash..."
          rows={4}
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">MD5 (Not available in secure contexts)</label>
          <div className="relative">
            <input
              type="text"
              value="Not supported by modern browser APIs."
              readOnly
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none"
            />
            <button
              onClick={() => onCopy("Not supported by modern browser APIs.")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo} className="space-y-2">
            <label className="block text-sm font-medium">{algo}</label>
            <div className="relative">
              <input
                type="text"
                value={hash}
                readOnly
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none font-mono text-xs"
              />
              <button
                onClick={() => onCopy(hash)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JoaatConverter({ onCopy, copied }) {
  const [input, setInput] = useState('');
  const [joaatHash, setJoaatHash] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [resolvedName, setResolvedName] = useState('');
  const [loading, setLoading] = useState(false);

  const joaat = (key) => {
    key = key.toLowerCase();
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash += key.charCodeAt(i);
      hash += (hash << 10);
      hash ^= (hash >>> 6);
    }
    hash += (hash << 3);
    hash ^= (hash >>> 11);
    hash += (hash << 15);
    return hash >>> 0; // Convert to unsigned 32-bit
  };

  const handleInputChange = (value) => {
    setInput(value);
    if (value) {
      const hash = joaat(value);
      setJoaatHash('0x' + hash.toString(16).toUpperCase().padStart(8, '0'));
    } else {
      setJoaatHash('');
    }
  };

  const lookupHash = async (hash) => {
    if (!hash) {
      setResolvedName('');
      return;
    }

    setLoading(true);
    try {
      // Remove 0x prefix if present and convert to decimal
      const cleanHash = hash.replace(/^0x/i, '');
      const decimalHash = parseInt(cleanHash, 16);

      if (isNaN(decimalHash)) {
        setResolvedName('Invalid hash format');
        return;
      }

      // Try to lookup from GTA V natives database
      const response = await fetch('/api/natives?game=gta5');
      if (response.ok) {
        const result = await response.json();
        const data = result.natives || {};
        let found = false;

        // Search through all namespaces
        for (const ns in data) {
          if (data[ns] && typeof data[ns] === 'object') {
            for (const [nativeHash, nativeData] of Object.entries(data[ns])) {
              const nativeHashDec = parseInt(nativeHash.replace(/^0x/i, ''), 16);
              if (nativeHashDec === decimalHash) {
                setResolvedName(`${ns}::${nativeData.name || nativeData.NativeName || 'Unknown'}`);
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }

        if (!found) {
          setResolvedName('Hash not found in database');
        }
      } else {
        setResolvedName('Unable to load database');
      }
    } catch (error) {
      setResolvedName('Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHashInputChange = (value) => {
    setHashInput(value);
    // Debounce the lookup
    clearTimeout(window.hashLookupTimeout);
    window.hashLookupTimeout = setTimeout(() => lookupHash(value), 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Text to JOAAT Hash</label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => onCopy(input)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Generated Hash</label>
          <div className="relative">
            <input
              type="text"
              value={joaatHash}
              readOnly
              placeholder="Hash will appear here..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none font-mono"
            />
            <button
              onClick={() => onCopy(joaatHash)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">JOAAT Hash to Name</label>
          <div className="relative">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => handleHashInputChange(e.target.value)}
              placeholder="Enter hash (e.g., 0x12345678)..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50 font-mono"
            />
            <button
              onClick={() => onCopy(hashInput)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Resolved Name</label>
          <div className="relative">
            <input
              type="text"
              value={loading ? 'Looking up...' : resolvedName}
              readOnly
              placeholder="Name will appear here..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none"
            />
            <button
              onClick={() => onCopy(resolvedName)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
              disabled={!resolvedName || loading}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface/30 rounded-lg p-4 border border-border">
        <h4 className="text-sm font-medium mb-2">About JOAAT</h4>
        <p className="text-xs text-muted leading-relaxed">
          JOAAT (Jenkins One At A Time) is a hash function commonly used in Rockstar Games titles,
          particularly Grand Theft Auto V, for converting strings to 32-bit hash values. This is often
          used for native function names, model names, and other string identifiers in the game engine.
          Hash-to-name lookup searches through the GTA V natives database to find matching entries.
        </p>
      </div>
    </div>
  );
}

function ColorConverter({ onCopy, copied }) {
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState('#000000');
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const updateFromRgb = (newRgb) => {
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const updateFromHex = (newHex) => {
    const rgbResult = hexToRgb(newHex);
    if (rgbResult) {
      setHex(newHex);
      setRgb(rgbResult);
      setHsl(rgbToHsl(rgbResult.r, rgbResult.g, rgbResult.b));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium">RGB Values</label>
          <div className="space-y-2">
            {['r', 'g', 'b'].map(color => (
              <div key={color} className="flex items-center gap-2">
                <span className="text-xs w-6 uppercase">{color}</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb[color]}
                  onChange={(e) => updateFromRgb({ ...rgb, [color]: parseInt(e.target.value) || 0 })}
                  className="flex-1 bg-surface border border-border rounded px-3 py-1 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Hex Color</label>
          <div className="relative">
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              placeholder="#000000"
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50 font-mono"
            />
            <button
              onClick={() => onCopy(hex)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div
            className="w-full h-12 rounded-lg border border-border"
            style={{ backgroundColor: hex }}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">HSL Values</label>
          <div className="space-y-2 text-sm">
            <div>H: {hsl.h}°</div>
            <div>S: {hsl.s}%</div>
            <div>L: {hsl.l}%</div>
          </div>
        </div>
      </div>

      <div className="bg-surface/30 rounded-lg p-4 border border-border">
        <h4 className="text-sm font-medium mb-2">Color Preview</h4>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-lg border border-border"
            style={{ backgroundColor: hex }}
          />
          <div className="text-sm">
            <div>RGB: {rgb.r}, {rgb.g}, {rgb.b}</div>
            <div>HEX: {hex}</div>
            <div>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HexViewer({ onCopy, copied }) {
  const [input, setInput] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [asciiOutput, setAsciiOutput] = useState('');

  const stringToHex = (str) => {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i).toString(16).toUpperCase();
      hex += charCode.length === 1 ? '0' + charCode : charCode;
    }
    return hex;
  };

  const hexToString = (hex) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      if (!isNaN(charCode)) {
        str += String.fromCharCode(charCode);
      }
    }
    return str;
  };

  const updateOutputs = (text) => {
    setInput(text);
    if (text) {
      setHexOutput(stringToHex(text));
      setAsciiOutput(text.replace(/[^\x20-\x7E]/g, '.'));
    } else {
      setHexOutput('');
      setAsciiOutput('');
    }
  };

  const updateFromHex = (hex) => {
    const cleanHex = hex.replace(/\s/g, '');
    setHexOutput(cleanHex);
    if (cleanHex) {
      const str = hexToString(cleanHex);
      setInput(str);
      setAsciiOutput(str.replace(/[^\x20-\x7E]/g, '.'));
    } else {
      setInput('');
      setAsciiOutput('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Text Input</label>
          <textarea
            value={input}
            onChange={(e) => updateOutputs(e.target.value)}
            placeholder="Enter text to convert to hex..."
            rows={6}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Hex Output</label>
          <div className="relative">
            <textarea
              value={hexOutput}
              onChange={(e) => updateFromHex(e.target.value)}
              placeholder="Hex values will appear here..."
              rows={6}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary/50 font-mono text-sm resize-none"
            />
            <button
              onClick={() => onCopy(hexOutput)}
              className="absolute right-2 top-4 p-1 hover:bg-primary/10 rounded"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">ASCII Representation</label>
        <div className="bg-surface border border-border rounded-lg p-4 font-mono text-sm">
          {asciiOutput || 'ASCII representation will appear here...'}
        </div>
      </div>

      <div className="bg-surface/30 rounded-lg p-4 border border-border">
        <h4 className="text-sm font-medium mb-2">Hex Dump Format</h4>
        <div className="font-mono text-xs space-y-1">
          <div>00000000: {hexOutput.substr(0, 32)} {asciiOutput.substr(0, 16)}</div>
          <div>00000010: {hexOutput.substr(32, 32)} {asciiOutput.substr(16, 16)}</div>
        </div>
      </div>
    </div>
  );
}
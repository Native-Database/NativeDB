document.addEventListener('DOMContentLoaded', () => {
    const isRDR2 = window.location.pathname.includes('/rdr2_native/');
    const isRDR = window.location.pathname.includes('/rdr_native/');
    const isGTA = window.location.pathname.includes('/gta_native/');

    const RDR_H_URL = 'https://raw.githubusercontent.com/K3rhos/RDR-PC-Natives-DB/main/Natives.h';
    const RAW_URL = isRDR
        ? RDR_H_URL
        : (isRDR2
            ? 'https://raw.githubusercontent.com/alloc8or/rdr3-nativedb-data/master/natives.json'
            : 'https://raw.githubusercontent.com/alloc8or/gta5-nativedb-data/master/natives.json');

    const panelContent = document.getElementById('panelContent');
    const generateBtn = document.getElementById('generateBtn');
    const themeSwitch = document.getElementById('themeSwitch');

    let nativesMap = {};

    function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    function norm(n) {
        return {
            name: n.name || n.NativeName || n.hashName || n[0] || '',
            hash: n.hash || n.Hash || n.native || n[1] || '',
            comment: n.comment || n.desc || n.description || '',
            params: n.params || n.Params || n.arguments || n.args || [],
            returns: n.returns || n.return || n.return_type || 'Any'
        };
    }

    function buildMap(json) {
        const map = {};
        for (const ns in json) {
            if (Object.prototype.hasOwnProperty.call(json, ns)) {
                map[ns] = Object.values(json[ns]).map(native => norm({ ...native, hash: Object.keys(json[ns]).find(key => json[ns][key] === native) }));
            }
        }
        return map;
    }

    function buildMapFromH(text) {
        const map = {};
        let currentNamespace = "UNK";
        const lines = text.split('\n');
        const nativeRegex = /^\s*static\s+(?<returns>[\w*&<>:\s]+)\s+(?<name>\w+)\s*\((?<params>.*?)\)/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^namespace\s+(\w+)/.test(line)) {
                currentNamespace = line.match(/^namespace\s+(\w+)/)[1];
                if (!map[currentNamespace]) map[currentNamespace] = [];
                continue;
            }
            if (line === '}') { currentNamespace = "UNK"; continue; }

            const match = line.match(nativeRegex);
            if (match) {
                const { name, returns, params } = match.groups;
                let hash = "0x0000000000000000";
                if (i + 2 < lines.length) {
                    const invokeLine = lines[i + 1].includes("Invoke<") ? lines[i + 1] : (lines[i + 2].includes("Invoke<") ? lines[i + 2] : "");
                    const invokeHashMatch = invokeLine.match(/Invoke\s*<\s*(0x[A-F0-9]{1,16})/i);
                    if (invokeHashMatch) hash = invokeHashMatch[1];
                }
                const paramsArray = params.trim() ? params.split(',').map(p => ({ type: p.trim().split(' ').slice(0, -1).join(' '), name: p.trim().split(' ').pop() })) : [];
                if (!map[currentNamespace]) map[currentNamespace] = [];
                map[currentNamespace].push(norm({ name: name.startsWith("_0x") ? hash : name, hash, params: paramsArray, returns: returns.trim() }));
            }
        }
        return map;
    }

    async function loadNatives() {
        try {
            const res = await fetch(RAW_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = isRDR ? await res.text() : await res.json();
            nativesMap = isRDR ? buildMapFromH(data) : buildMap(data);
            renderCheckboxes();
        } catch (e) {
            panelContent.innerHTML = `<div style="color:orange">Error: ${escapeHtml(e.message)}</div>`;
        }
    }

    function renderCheckboxes() {
        const namespaces = Object.keys(nativesMap).sort();
        const html = `
            <label class="custom-checkbox" style="padding: 8px 12px; background: var(--glass); border-radius: 8px;">
                <input type="checkbox" id="selectAll">
                <span class="checkmark"></span>
                <strong>Select All</strong>
            </label>
            <hr style="border-color: var(--glass);">
            <ul class="checkbox-list">
                ${namespaces.map(ns => `
                    <li>
                        <label class="custom-checkbox">
                            <input type="checkbox" class="ns-checkbox" value="${escapeHtml(ns)}">
                            <span class="checkmark"></span>${escapeHtml(ns)}</label>
                    </li>
                `).join('')}
            </ul>`;
        panelContent.innerHTML = html;

        document.getElementById('selectAll').addEventListener('change', (e) => {
            document.querySelectorAll('.ns-checkbox').forEach(cb => cb.checked = e.target.checked);
        });

        const namespaceSearch = document.getElementById('namespaceSearch');
        if (namespaceSearch) {
            namespaceSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll('.checkbox-list li').forEach(li => {
                    li.style.display = li.textContent.toLowerCase().includes(query) ? '' : 'none';
                });
            });
        }
    }

    function generateHpp() {
        const selectedNs = [...document.querySelectorAll('.ns-checkbox:checked')].map(cb => cb.value);
        if (selectedNs.length === 0) {
            showNotification("Please select at least one namespace.", 'error');
            return;
        }

        const vectorize = document.getElementById('vectorizeCheckbox')?.checked;
        const namingConvention = document.getElementById('namingConvention')?.value || 'default';
        const invokeFunc = document.getElementById('customInvoke')?.value.trim() || 'Invoke';

        const formatName = (name) => {
            switch (namingConvention) {
                case 'camelCase':
                    return name.replace(/_([a-z0-9])/g, g => g[1].toUpperCase()).toLowerCase().replace(/_/, '');
                case 'PascalCase':
                    return name.replace(/_([a-z0-9])/g, g => g[1].toUpperCase()).replace(/^(.)/, g => g.toUpperCase()).replace(/_/, '');
                case 'snake_case':
                    return name.toLowerCase();
                case 'lowercase':
                    return name.toLowerCase().replace(/_/g, '');
                default:
                    return name;
            }
        };

        let hppContent = `#pragma once\n#include <cstdint>\n\n// Generated by Vey's Native DB\n\n`;

        if (vectorize) {
            hppContent += `struct Vector3 {\n    float x, y, z;\n};\n\n`;
        }

        selectedNs.forEach(ns => {
            hppContent += `namespace ${ns} {\n`;
            nativesMap[ns].forEach(n => {
                let processedParams = Array.isArray(n.params)
                    ? n.params.map((p, i) => ({ type: p.type || 'Any', name: p.name || `p${i}` }))
                    : [];

                let finalParams = [];
                let finalParamNames = [];

                if (vectorize) {
                    for (let i = 0; i < processedParams.length; i++) {
                        if (i + 2 < processedParams.length &&
                            processedParams[i].type.toLowerCase() === 'float' &&
                            processedParams[i + 1].type.toLowerCase() === 'float' &&
                            processedParams[i + 2].type.toLowerCase() === 'float' &&
                            /x|posx|coorsx/i.test(processedParams[i].name) &&
                            /y|posy|coorsy/i.test(processedParams[i + 1].name) &&
                            /z|posz|coorsz/i.test(processedParams[i + 2].name)) {

                            let vecName = processedParams[i].name.replace(/x|posx|coorsx/i, '');
                            if (vecName === '') vecName = 'position';
                            if (!isNaN(vecName) && vecName.trim() !== '') vecName = `vec${vecName}`;

                            finalParams.push(`Vector3 ${vecName}`);
                            finalParamNames.push(`${vecName}.x, ${vecName}.y, ${vecName}.z`);
                            i += 2;
                        } else {
                            finalParams.push(`${processedParams[i].type} ${processedParams[i].name}`);
                            finalParamNames.push(processedParams[i].name);
                        }
                    }
                } else {
                    finalParams = processedParams.map(p => `${p.type} ${p.name}`);
                    finalParamNames = processedParams.map(p => p.name);
                }

                const params = finalParams.join(', ');
                const paramNames = finalParamNames.join(', ');
                const returnType = n.returns || 'Any';
                const funcName = formatName(n.name);

                hppContent += `    // ${n.name} | ${n.hash}\n`;
                hppContent += `    static ${returnType} ${funcName}(${params}) {\n`;
                if (returnType.toLowerCase() === 'void') {
                    hppContent += `        ${invokeFunc}<${n.hash}>(${paramNames});\n`;
                } else {
                    hppContent += `        return ${invokeFunc}<${n.hash}, ${returnType}>(${paramNames});\n`;
                }
                hppContent += `    }\n\n`;
            });
            hppContent += `}\n\n`;
        });

        const blob = new Blob([hppContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const gameName = isGTA ? 'gta5' : (isRDR2 ? 'rdr2' : 'rdr');
        a.href = url;
        a.download = `natives_${gameName}.hpp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateBtn.addEventListener('click', generateHpp);

    loadNatives();
});
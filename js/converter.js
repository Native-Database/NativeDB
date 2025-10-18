document.addEventListener('DOMContentLoaded', () => {
    const toolListEl = document.getElementById('tool-list');
    const panelContent = document.getElementById('panelContent');
    const breadcrumb = document.getElementById('breadcrumb');
    const toolTitle = document.getElementById('tool-title');
    const themeSwitch = document.getElementById('themeSwitch');

    const tools = {
        'number-converter': {
            name: 'Number Converter',
            render: () => `
                <div class="converter-grid">
                    <label for="signed-int-input">Signed Integer (32-bit)</label>
                    <div class="input-with-copy">
                        <input id="signed-int-input" data-type="s32" class="custom-input num-input" type="text" placeholder="e.g., -1">
                        <button class="copy-btn" data-target="signed-int-input" title="Copy"></button>
                    </div>
                    <label for="unsigned-int-input">Unsigned Integer (32-bit)</label>
                    <div class="input-with-copy">
                        <input id="unsigned-int-input" data-type="u32" class="custom-input num-input" type="text" placeholder="e.g., 4294967295">
                        <button class="copy-btn" data-target="unsigned-int-input" title="Copy"></button>
                    </div>
                    <label for="hex-input">Hexadecimal</label>
                    <div class="input-with-copy">
                        <input id="hex-input" data-type="hex" class="custom-input num-input" type="text" placeholder="e.g., 0xFFFFFFFF">
                        <button class="copy-btn" data-target="hex-input" title="Copy"></button>
                    </div>
                    <label for="bin-input">Binary</label>
                    <div class="input-with-copy">
                        <input id="bin-input" data-type="bin" class="custom-input num-input" type="text" placeholder="e.g., 11111111">
                        <button class="copy-btn" data-target="bin-input" title="Copy"></button>
                    </div>
                </div>
            `,
            init: () => {
                const inputs = {
                    s32: document.getElementById('signed-int-input'),
                    u32: document.getElementById('unsigned-int-input'),
                    hex: document.getElementById('hex-input'),
                    bin: document.getElementById('bin-input'),
                };

                const updateAll = (sourceType, sourceValue) => {
                    let num = 0;
                    let isValid = false;

                    if (sourceValue === '') {
                        Object.values(inputs).forEach(input => input.value = '');
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

                    if (sourceType !== 's32') inputs.s32.value = num;
                    if (sourceType !== 'u32') inputs.u32.value = num >>> 0;
                    if (sourceType !== 'hex') inputs.hex.value = '0x' + (num >>> 0).toString(16).toUpperCase().padStart(8, '0');
                    if (sourceType !== 'bin') inputs.bin.value = '0b' + (num >>> 0).toString(2).padStart(32, '0');
                };

                document.querySelectorAll('.num-input').forEach(input => {
                    input.addEventListener('input', (e) => {
                        updateAll(e.target.dataset.type, e.target.value);
                    });
                });
            }
        },
        'text-base64': {
            name: 'Text ↔ Base64',
            render: () => `
                <div class="converter-grid">
                    <label for="text-input">Text</label>
                    <div class="input-with-copy">
                        <textarea id="text-input" class="custom-input" rows="4" placeholder="Enter text here..."></textarea>
                        <button class="copy-btn" data-target="text-input" title="Copy"></button>
                    </div>
                    <label for="base64-output">Base64</label>
                    <div class="input-with-copy">
                        <textarea id="base64-input" class="custom-input" rows="4" placeholder="Enter Base64 string..."></textarea>
                        <button class="copy-btn" data-target="base64-input" title="Copy"></button>
                    </div>
                </div>
            `,
            init: () => {
                const textInput = document.getElementById('text-input');
                const base64Input = document.getElementById('base64-input');

                textInput.addEventListener('input', () => {
                    try {
                        base64Input.value = textInput.value ? btoa(textInput.value) : '';
                    } catch (e) {
                        base64Input.value = 'Invalid input for Base64 encoding.';
                    }
                });

                base64Input.addEventListener('input', () => {
                    try {
                        textInput.value = base64Input.value ? atob(base64Input.value) : '';
                    } catch (e) {
                        textInput.value = 'Invalid Base64 string.';
                    }
                });
            }
        },
        'url-encoder': {
            name: 'URL Encoder / Decoder',
            render: () => `
                <div class="converter-grid">
                    <label for="url-decoded-input">Decoded Text</label>
                    <div class="input-with-copy">
                        <textarea id="url-decoded-input" class="custom-input" rows="4" placeholder="Text with special characters like: & ? ="></textarea>
                        <button class="copy-btn" data-target="url-decoded-input" title="Copy"></button>
                    </div>
                    <label for="url-encoded-input">Encoded Text (URL Safe)</label>
                    <div class="input-with-copy">
                        <textarea id="url-encoded-input" class="custom-input" rows="4" placeholder="Text will be encoded to be URL-safe"></textarea>
                        <button class="copy-btn" data-target="url-encoded-input" title="Copy"></button>
                    </div>
                </div>
            `,
            init: () => {
                const decodedInput = document.getElementById('url-decoded-input');
                const encodedInput = document.getElementById('url-encoded-input');

                decodedInput.addEventListener('input', () => {
                    try {
                        encodedInput.value = decodedInput.value ? encodeURIComponent(decodedInput.value) : '';
                    } catch (e) {
                        encodedInput.value = 'Invalid input for URL encoding.';
                    }
                });

                encodedInput.addEventListener('input', () => {
                    try {
                        decodedInput.value = encodedInput.value ? decodeURIComponent(encodedInput.value) : '';
                    } catch (e) {
                        decodedInput.value = 'Invalid URL encoded string.';
                    }
                });
            }
        },
        'hash-generator': {
            name: 'Hash Generator',
            render: () => `
                <div class="converter-grid">
                    <label for="hash-input">Input Text</label>
                    <textarea id="hash-input" class="custom-input" rows="4" placeholder="Enter text to hash..."></textarea>
                    
                    <label for="md5-output">MD5 (Not available in secure contexts)</label>
                    <div class="input-with-copy">
                        <input id="md5-output" class="custom-input" readonly placeholder="MD5 is considered insecure">
                        <button class="copy-btn" data-target="md5-output" title="Copy"></button>
                    </div>
                    <label for="sha1-output">SHA-1</label>
                    <div class="input-with-copy">
                        <input id="sha1-output" class="custom-input" readonly>
                        <button class="copy-btn" data-target="sha1-output" title="Copy"></button>
                    </div>
                    <label for="sha256-output">SHA-256</label>
                    <div class="input-with-copy">
                        <input id="sha256-output" class="custom-input" readonly>
                        <button class="copy-btn" data-target="sha256-output" title="Copy"></button>
                    </div>
                    <label for="sha512-output">SHA-512</label>
                    <div class="input-with-copy">
                        <input id="sha512-output" class="custom-input" readonly>
                        <button class="copy-btn" data-target="sha512-output" title="Copy"></button>
                    </div>
                </div>
            `,
            init: () => {
                const input = document.getElementById('hash-input');
                const outputs = {
                    'SHA-1': document.getElementById('sha1-output'),
                    'SHA-256': document.getElementById('sha256-output'),
                    'SHA-512': document.getElementById('sha512-output'),
                };

                // MD5 is not available via Web Crypto API. We inform the user.
                document.getElementById('md5-output').value = 'Not supported by modern browser APIs.';

                const generateHashes = async (text) => {
                    if (!text) {
                        Object.values(outputs).forEach(out => out.value = '');
                        return;
                    }

                    const encoder = new TextEncoder();
                    const data = encoder.encode(text);

                    for (const algorithm in outputs) {
                        try {
                            const hashBuffer = await crypto.subtle.digest(algorithm, data);
                            const hashArray = Array.from(new Uint8Array(hashBuffer));
                            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                            outputs[algorithm].value = hashHex;
                        } catch (e) {
                            outputs[algorithm].value = `Error: ${e.message}`;
                        }
                    }
                };

                input.addEventListener('input', () => {
                    generateHashes(input.value);
                });
            }
        }
    };

    function renderToolList() {
        toolListEl.innerHTML = Object.keys(tools).map(key => `
            <div class="ns-item" role="button" data-tool-key="${key}">
                <div class="ns-name">${tools[key].name}</div>
                <div style="font-size:12px;color:var(--muted)">></div>
            </div>
        `).join('');

        document.querySelectorAll('.ns-item').forEach(el => {
            el.addEventListener('click', () => {
                selectTool(el.dataset.toolKey);
            });
        });
    }

    function selectTool(key) {
        const tool = tools[key];
        if (!tool) return;

        document.querySelectorAll('.ns-item.active').forEach(item => item.classList.remove('active'));
        document.querySelector(`.ns-item[data-tool-key="${key}"]`).classList.add('active');

        breadcrumb.textContent = 'Converter';
        toolTitle.textContent = tool.name;
        panelContent.innerHTML = tool.render();
        tool.init();

        const copyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

        // Add copy button listeners
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.innerHTML = copyIconSvg;
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const targetInput = document.getElementById(targetId);
                if (!targetInput.value) return;
                navigator.clipboard.writeText(targetInput.value)
                    .then(() => showNotification('Copied!', 'success'));
            });
        });
    }

    renderToolList();
});
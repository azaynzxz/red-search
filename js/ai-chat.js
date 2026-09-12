/**
 * SEARCH PORTAL - GEMINI 3.5 FLASH AI TERMINAL
 * Direct Search-Bar Integration, Sci-Fi CLI / IRC Interface & Streaming Generation
 */

import { state } from './state.js';

const DEFAULT_MODEL = 'gemini-3.5-flash';

class GeminiAITerminal {
    constructor() {
        this.isOpen = false;
        this.isGenerating = false;
        this.history = [];
        this.activeModel = localStorage.getItem('gemini_model') || DEFAULT_MODEL;
        this.abortController = null;

        this.initKey();
        this.initDOM();
    }

    async initKey() {
        if (!localStorage.getItem('gemini_api_key')) {
            try {
                const mod = await import('./config.local.js').catch(() => null);
                if (mod && mod.LOCAL_GEMINI_KEY) {
                    localStorage.setItem('gemini_api_key', mod.LOCAL_GEMINI_KEY);
                }
            } catch (e) {}
        }
    }

    getApiKey() {
        return localStorage.getItem('gemini_api_key') || '';
    }

    setApiKey(key) {
        if (key && key.trim()) {
            localStorage.setItem('gemini_api_key', key.trim());
        }
    }

    initDOM() {
        this.terminal = document.getElementById('aiTerminal');
        this.feed = document.getElementById('aiTerminalFeed');
        this.input = document.getElementById('aiTerminalInput');
        this.sendBtn = document.getElementById('aiTerminalSend');
        this.clearBtn = document.getElementById('aiTerminalClear');
        this.closeBtn = document.getElementById('aiTerminalClose');
        this.searchZone = document.getElementById('heroInteractiveZone');
        this.heroSearchInput = document.getElementById('heroSearchInput');
        this.aiModeBadge = document.getElementById('aiModeBadge');
        this.aiModeToggle = document.getElementById('aiModeToggle');

        if (this.sendBtn) {
            this.sendBtn.onclick = () => this.handlePromptSubmit();
        }

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handlePromptSubmit();
                } else if (e.key === 'Escape') {
                    this.close();
                }
            });
        }

        if (this.clearBtn) {
            this.clearBtn.onclick = () => this.clearHistory();
        }

        if (this.closeBtn) {
            this.closeBtn.onclick = () => this.close();
        }

        if (this.aiModeToggle) {
            this.aiModeToggle.onclick = (e) => {
                e.stopPropagation();
                this.open(this.heroSearchInput ? this.heroSearchInput.value.replace(/^\/a\s*/i, '').trim() : '');
            };
        }

        // Global Esc key to close terminal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open(initialQuery = '') {
        if (!this.terminal) return;
        this.isOpen = true;
        this.terminal.classList.add('active');
        document.body.classList.add('ai-terminal-active');

        if (this.searchZone) {
            this.searchZone.classList.add('morphed-to-ai');
        }

        // Focus input after transition
        setTimeout(() => {
            if (this.input) {
                this.input.focus();
            }
        }, 120);

        if (initialQuery && initialQuery.trim()) {
            this.submitQuery(initialQuery.trim());
        } else if (this.feed && this.feed.children.length === 0) {
            this.renderSystemBanner();
        }
    }

    close() {
        if (!this.terminal) return;
        this.isOpen = false;
        this.terminal.classList.remove('active');
        document.body.classList.remove('ai-terminal-active');

        if (this.searchZone) {
            this.searchZone.classList.remove('morphed-to-ai');
        }

        if (this.heroSearchInput) {
            this.heroSearchInput.value = '';
            if (this.aiModeBadge) this.aiModeBadge.style.display = 'none';
        }

        if (this.isGenerating && this.abortController) {
            this.abortController.abort();
            this.isGenerating = false;
        }
    }

    toggle(query = '') {
        if (this.isOpen) {
            this.close();
        } else {
            this.open(query);
        }
    }

    renderSystemBanner() {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        const banner = document.createElement('div');
        banner.className = 'terminal-system-banner';
        banner.innerHTML = `
            <div class="system-line">[${timestamp}] ✦ GEMINI 3.5 FLASH NEURAL-LINK ONLINE</div>
            <div class="system-line sub">Direct LLM Pipeline initialized // Protocol: Server-Sent Events</div>
            <div class="system-line sub">Type your query or commands: <code>/clear</code>, <code>/help</code>, <code>/exit</code></div>
            <div class="terminal-quick-prompts">
                <button class="prompt-chip" data-prompt="Explain quantum computing in 2 sentences">⚡ Quantum Computing</button>
                <button class="prompt-chip" data-prompt="Give 3 tips for clean modern CSS architecture">💡 Clean CSS Tips</button>
                <button class="prompt-chip" data-prompt="Write a Python script to fetch and parse JSON">💻 Python Fetch Script</button>
                <button class="prompt-chip" data-prompt="Summarize the core concepts of Liquid Glass UI design">🪟 Liquid Glass UI</button>
            </div>
        `;

        banner.querySelectorAll('.prompt-chip').forEach(chip => {
            chip.onclick = () => {
                const prompt = chip.dataset.prompt;
                if (prompt) this.submitQuery(prompt);
            };
        });

        this.feed.appendChild(banner);
        this.scrollToBottom();
    }

    handlePromptSubmit() {
        if (!this.input) return;
        const text = this.input.value.trim();
        if (!text || this.isGenerating) return;

        this.input.value = '';
        this.input.style.height = 'auto';
        this.submitQuery(text);
    }

    async submitQuery(promptText) {
        if (!promptText) return;

        // Handle CLI commands
        if (promptText.startsWith('/')) {
            const cmd = promptText.toLowerCase().trim();
            if (cmd === '/clear') {
                this.clearHistory();
                return;
            } else if (cmd === '/exit' || cmd === '/quit' || cmd === '/q') {
                this.close();
                return;
            } else if (cmd === '/help') {
                this.renderHelp();
                return;
            } else if (cmd === '/model') {
                this.renderModelInfo();
                return;
            }
        }

        const timestamp = new Date().toLocaleTimeString([], { hour12: false });

        // 1. Append User Command Row (CLI style)
        const userRow = document.createElement('div');
        userRow.className = 'terminal-row user-row';
        userRow.innerHTML = `
            <div class="row-meta">
                <span class="timestamp">[${timestamp}]</span>
                <span class="user-badge">usr@portal:~$</span>
            </div>
            <div class="row-content user-text">${this.escapeHTML(promptText)}</div>
        `;
        this.feed.appendChild(userRow);

        // 2. Append Model Response Row with Streaming Container
        const modelRow = document.createElement('div');
        modelRow.className = 'terminal-row model-row';
        modelRow.innerHTML = `
            <div class="row-meta">
                <span class="timestamp">[${timestamp}]</span>
                <span class="gemini-badge">✦ gemini-3.5:~$</span>
                <span class="model-pill">3.5 Flash</span>
            </div>
            <div class="row-content model-text">
                <span class="stream-content"></span>
                <span class="cyber-cursor">▋</span>
            </div>
        `;
        this.feed.appendChild(modelRow);
        this.scrollToBottom();

        const streamContentEl = modelRow.querySelector('.stream-content');
        const cursorEl = modelRow.querySelector('.cyber-cursor');

        // 3. Prepare API Call
        const apiKey = this.getApiKey();
        if (!apiKey) {
            streamContentEl.innerHTML = `<span class="terminal-error">ERROR: No Gemini API Key found. Please add your key in Settings.</span>`;
            if (cursorEl) cursorEl.remove();
            return;
        }

        this.isGenerating = true;
        this.abortController = new AbortController();

        // Push to conversation history for multi-turn context
        this.history.push({
            role: 'user',
            parts: [{ text: promptText }]
        });

        // Limit conversation history to last 10 turns to avoid token inflation
        const contents = this.history.slice(-10);

        let fullGeneratedText = '';

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.activeModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents }),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData.error?.message || `HTTP error ${response.status}`;
                throw new Error(errMsg);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep partial line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const jsonStr = trimmed.slice(6).trim();
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const chunk = JSON.parse(jsonStr);
                            const textPart = chunk.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
                            if (textPart) {
                                fullGeneratedText += textPart;
                                streamContentEl.innerHTML = this.renderMarkdown(fullGeneratedText);
                                this.scrollToBottom();
                            }
                        } catch (parseErr) {
                            // Incomplete chunk, continue reading
                        }
                    }
                }
            }

            // Save completed response to history
            this.history.push({
                role: 'model',
                parts: [{ text: fullGeneratedText }]
            });

        } catch (err) {
            if (err.name === 'AbortError') {
                fullGeneratedText += ' [Generation terminated by user]';
            } else {
                streamContentEl.innerHTML = `<span class="terminal-error">SYSTEM EXCEPTION: ${this.escapeHTML(err.message)}</span>`;
            }
        } finally {
            this.isGenerating = false;
            this.abortController = null;
            if (cursorEl) cursorEl.remove();

            // Render final markdown and attach code copy buttons
            streamContentEl.innerHTML = this.renderMarkdown(fullGeneratedText);
            this.attachCodeCopyButtons(modelRow);
            this.scrollToBottom();
        }
    }

    renderHelp() {
        const helpRow = document.createElement('div');
        helpRow.className = 'terminal-row system-row';
        helpRow.innerHTML = `
            <div class="row-content system-help">
                <div class="help-title">✦ GEMINI 3.5 AI TERMINAL COMMANDS:</div>
                <div class="help-item"><code>/a &lt;query&gt;</code> - Trigger AI directly from search bar</div>
                <div class="help-item"><code>/clear</code> - Clear current conversation stream</div>
                <div class="help-item"><code>/exit</code> or <code>[ESC]</code> - Return to search portal</div>
                <div class="help-item"><code>/model</code> - View active Gemini model specifications</div>
                <div class="help-item"><code>Shift + Enter</code> - Insert line break in query prompt</div>
            </div>
        `;
        this.feed.appendChild(helpRow);
        this.scrollToBottom();
    }

    renderModelInfo() {
        const infoRow = document.createElement('div');
        infoRow.className = 'terminal-row system-row';
        infoRow.innerHTML = `
            <div class="row-content system-help">
                <div class="help-title">✦ ACTIVE MODEL DIAGNOSTICS:</div>
                <div class="help-item">Model: <strong>${this.activeModel}</strong></div>
                <div class="help-item">Generation Engine: Google DeepMind Gemini 3.5 Series</div>
                <div class="help-item">Protocol: Server-Sent Events (SSE) Streaming</div>
                <div class="help-item">Endpoint: v1beta/models/gemini-3.5-flash</div>
            </div>
        `;
        this.feed.appendChild(infoRow);
        this.scrollToBottom();
    }

    clearHistory() {
        this.history = [];
        if (this.feed) {
            this.feed.innerHTML = '';
            this.renderSystemBanner();
        }
    }

    scrollToBottom() {
        if (this.feed) {
            this.feed.scrollTop = this.feed.scrollHeight;
        }
    }

    escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    renderMarkdown(text) {
        if (!text) return '';

        let out = this.escapeHTML(text);

        // Fenced code blocks ```lang ... ```
        out = out.replace(/```([a-zA-Z0-9_\-#\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const langLabel = lang ? lang.toUpperCase() : 'CODE';
            return `<div class="ai-code-block">
                <div class="code-header">
                    <span class="code-lang">${langLabel}</span>
                    <button class="btn-copy-code" title="Copy code"><span class="material-icons" style="font-size:14px;">content_copy</span> Copy</button>
                </div>
                <pre class="code-body"><code>${code.trim()}</code></pre>
            </div>`;
        });

        // Inline code `code`
        out = out.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');

        // Bold **text**
        out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Bullet lists
        out = out.replace(/^[\*\-]\s+(.+)$/gm, '<div class="ai-bullet-item"><span class="bullet-dot">›</span> $1</div>');

        // Numbered lists
        out = out.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="ai-number-item"><span class="number-badge">$1.</span> $2</div>');

        // Paragraph breaks
        out = out.replace(/\n\n/g, '<br><br>');
        out = out.replace(/\n/g, '<br>');

        return out;
    }

    attachCodeCopyButtons(container) {
        container.querySelectorAll('.btn-copy-code').forEach(btn => {
            btn.onclick = () => {
                const codeEl = btn.closest('.ai-code-block').querySelector('code');
                if (codeEl) {
                    navigator.clipboard.writeText(codeEl.innerText).then(() => {
                        btn.innerHTML = '<span class="material-icons" style="font-size:14px; color:#4ade80;">check</span> Copied!';
                        setTimeout(() => {
                            btn.innerHTML = '<span class="material-icons" style="font-size:14px;">content_copy</span> Copy';
                        }, 2000);
                    });
                }
            };
        });
    }
}

export let aiTerminal = null;

export const initAIChat = () => {
    if (!aiTerminal) {
        aiTerminal = new GeminiAITerminal();
    }
    return aiTerminal;
};

/**
 * SEARCH PORTAL - GEMINI 3.5 FLASH AI TERMINAL
 * Direct Search-Bar Integration, Sci-Fi CLI / IRC Interface & Streaming Generation
 */

import { state } from './state.js';
import { setEngineAIMode } from './search.js';
import { showConsoleErrorNotification } from './notifications.js';

export const DEFAULT_SYSTEM_PROMPT = `You are my no-fluff strategic advisor. Goal: Be direct, objective, and brutally honest. Expose my blind spots, challenge my assumptions, and clearly call out excuses or wasted effort. No sugar-coating allowed. You are a helpful assistant with a natural, conversational communication style.

Communication guidelines:
- Use contractions (I'll, you're, it's, we've) naturally
- Vary your enthusiasm; not everything needs "amazing" or "incredible"
- Skip meta-commentary about being an AI or your limitations
- Use analogies and examples to explain complex ideas
- Acknowledge when something's tricky or nuanced ("This part's complex..." "Here's where it gets interesting...")
- Start sentences with informal transitions (So, Well, Anyway) occasionally
- Mix paragraphs with occasional lists (not everything numbered)
- Show personality while staying helpful and accurate
- Think out loud: show your reasoning process naturally
- Keep answers direct, compact, concise, and high-density. Avoid essay-length walls of text.
- STRICT NO-EMOJI RULE: Do NOT use any emojis, emoticons, or emoji glyphs anywhere in your responses (never output icons like 🚀, 💡, ⚡, ✦, 😊, etc.). Express all tone, clarity, and nuance purely through vocabulary, sentence structure, and clean markdown instead of emojis.
- STRICT NO-EM-DASH RULE: Strictly NEVER output em dashes or en dashes. Never use dashes to join phrases, separate thoughts, or create pauses. Use standard punctuation instead: commas, periods, colons, semicolons, or parentheses. If hyphenating compound words (like state-of-the-art or high-density), use only the standard ASCII hyphen (-).

Formatting and Structure:
- Code: Always format code blocks with triple backticks and the specific language identifier (e.g. \`\`\`javascript, \`\`\`python, \`\`\`bash). Use inline code \`like this\` for shortcuts, variables, and keywords.
- LaTeX Math: Always format mathematical formulas using LaTeX. Use $$...$$ for display/block equations and $...$ for inline equations (e.g. $$f(x) = x^2$$, $E = mc^2$).
- Tables: Always format comparison tables with standard markdown table syntax (| Header 1 | Header 2 | with separator row |:---|:---|). Keep column content compact and scannable.
- Quotations & Principles: Use markdown blockquotes (> quotation) for core takeaways, principles, or rules.
- Lists: Keep lists concise and naturally formatted. Never output malformed nested asterisks or redundant bullets.

Comparisons & Data Tables (Table Visual Hierarchy):
- When comparing two or more entities, items, options, countries, metrics, technologies, products, or datasets:
  1. ALWAYS use a clean Markdown Table (| Column 1 | Column 2 | ...) instead of bulleted lists or nested bullets.
  2. Tables provide vastly superior visual clarity, side-by-side contrast, and scannability. Structure comparison tables logically:
     | Metric / Dimension | [Entity A] | [Entity B] | Verdict / Takeaway |
     | :--- | :--- | :--- | :--- |
     | Metric 1 | Value A | Value B | Concise takeaway |
     | Metric 2 | Value A | Value B | Concise takeaway |
  3. Keep table headers concise, readable, and clean (2 - 3 words max).
  4. STRICTLY NEVER output repetitive lists of bullet points (such as › Metric:\n› A: ...\n› B: ...\n› Verdict: ...) when comparing metrics or entities. Always present them in a Markdown Table.

Language, Translation & Contextual Understanding (Card Block Visual Hierarchy):
- When the user asks about language, words, vocabulary, phrases, grammar, translation, or idioms:
  1. Provide a direct, concise translation or definition overview first.
  2. STRICTLY NEVER use bulleted lists (* or -) for language usage, sentence examples, or breakdowns. Bulleted lists ruin visual hierarchy.
  3. ALWAYS format each usage example, phrase, or sentence into a dedicated Card Block using markdown blockquotes (>). Each card must follow this exact key-value structure:
     > **[Context / Situation Title]**
     > **Original:** <word or sentence in target language>
     > **Pronunciation:** <clear phonetic transliteration>
     > **Indonesian:** "<natural everyday Indonesian equivalent, santai vs formal>"
     > **Context:** <brief nuance, cultural cue, or situation tip>
  4. Provide separate card blocks for distinct contexts (e.g. one card for Daily Casual / Santai, one for Formal / Sopan, one for Giving Advice).
  5. Indonesian Daily Context: The user is Indonesian. Always ground explanations in Indonesian daily conversation and authentic context (bahasa gaul/santai vs formal kantor) for intuitive comprehension.
  6. Zero Emojis: Never include emoji glyphs anywhere in responses.
  7. Zero Em Dashes: Strictly never use em dashes or en dashes anywhere.

Avoid:
- Using any emojis or emoticons in your output under any circumstance
- Using em dash or en dash punctuation marks anywhere in your output
- Formatting comparison data as bulleted lists instead of tables
- Formulaic openings like "Certainly!" or "I'd be delighted to help!"
- Numbering everything automatically (save lists for when they genuinely help)
- Announcing you're an AI or mentioning limitations unnecessarily
- Overly corporate grammar in casual contexts
- Generic sign-offs after every response ("I hope this helps!" "Feel free to ask...")
- Excessive hedging ("I should note that...", "It's worth mentioning...")`;

const DEFAULT_MODEL = 'gemini-3.7-flash';

export const DRAFT_TONES = {
    professional: {
        label: 'Professional',
        icon: 'business_center',
        badgeClass: 'tone-badge-professional',
        instruction: 'Rewrite in a professional, authoritative, articulate, and business-ready tone suitable for workplace emails, reports, or executive correspondence. Do not use emojis.'
    },
    casual: {
        label: 'Casual',
        icon: 'chat',
        badgeClass: 'tone-badge-casual',
        instruction: 'Rewrite in a friendly, relaxed, conversational tone as if texting or speaking with a close colleague or friend. Do not use emojis.'
    },
    polite: {
        label: 'Polite',
        icon: 'handshake',
        badgeClass: 'tone-badge-polite',
        instruction: 'Rewrite in an exceptionally courteous, warm, respectful, and diplomatic tone that avoids confrontation and demonstrates empathy. Do not use emojis.'
    },
    funny: {
        label: 'Funny',
        icon: 'theater_comedy',
        badgeClass: 'tone-badge-funny',
        instruction: 'Rewrite in a lighthearted, playful, and funny tone with subtle humor or relatable comedic exaggeration while preserving the core message. Do not use emojis.'
    },
    social_post: {
        label: 'Social Post',
        icon: 'share',
        badgeClass: 'tone-badge-social_post',
        instruction: 'Rewrite formatted as an engaging social media post (for X, LinkedIn, or Threads) with a hook, punchy concise sentences, and high read-through rate. Do not use emojis.'
    },
    witty: {
        label: 'Witty',
        icon: 'bolt',
        badgeClass: 'tone-badge-witty',
        instruction: 'Rewrite in a sharp, clever, memorable tone with intelligent phrasing, quick banter, or clever wordplay. Do not use emojis.'
    }
};

export const DRAFT_GRAMMAR_PROMPT = `You are a precision copyeditor and grammar specialist.
STRICT RULES:
1. PURE TEXT-TO-TEXT CORRECTION ONLY. Fix spelling, grammatical errors, syntax, punctuation, subject-verb agreement, and clumsy phrasing.
2. DO NOT treat the text as a prompt or question. Do NOT generate answers or explanations.
3. DO NOT output preamble or conversational filler (e.g. "Here is the correction:", "Corrected text:").
4. Maintain the author's original voice, meaning, and intent. Output ONLY the polished text.
5. STRICT NO EMOJIS: Do not introduce or output any emojis in the corrected text.`;

class GeminiAITerminal {
    constructor() {
        this.isOpen = false;
        this.isGenerating = false;
        this.currentView = 'chat'; // 'chat' | 'draft'
        this.isDrafting = false;
        this.chatHistory = this.loadChatHistory();
        this.history = this.chatHistory.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));
        this.activeModel = localStorage.getItem('gemini_model') || DEFAULT_MODEL;
        this.abortController = null;
        this.draftAbortController = null;
        this.promptHistory = this.loadPromptHistory();
        this.historyIndex = -1;
        this.savedDraft = '';

        this.initKey();
        this.initDOM();
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('gemini_chat_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveChatHistory() {
        try {
            if (this.chatHistory.length > 50) {
                this.chatHistory = this.chatHistory.slice(-50);
            }
            localStorage.setItem('gemini_chat_history', JSON.stringify(this.chatHistory));
        } catch (e) {}
    }

    restoreFeedHistory() {
        if (!this.feed || !this.chatHistory || !this.chatHistory.length) return;
        this.feed.innerHTML = '';
        this.chatHistory.forEach(msg => {
            const timestamp = msg.timestamp || '00:00:00';
            if (msg.role === 'user') {
                const userRow = document.createElement('div');
                userRow.className = 'terminal-row user-row';
                userRow.innerHTML = `
                    <div class="row-meta">
                        <span class="timestamp">[${timestamp}]</span>
                        <span class="user-badge">usr@portal:~$</span>
                    </div>
                    <div class="row-content user-text">${this.escapeHTML(msg.text)}</div>
                `;
                this.feed.appendChild(userRow);
            } else if (msg.role === 'model') {
                const modelRow = document.createElement('div');
                modelRow.className = 'terminal-row model-row';
                const modelBadge = msg.model || this.getModelShortLabel(this.activeModel);
                modelRow.innerHTML = `
                    <div class="row-meta">
                        <span class="timestamp">[${timestamp}]</span>
                        <span class="gemini-badge"><svg class="single-sparkle-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style="vertical-align:-1px; margin-right:3px;"><path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"/></svg>${modelBadge}:~$</span>
                        <button class="terminal-row-copy-btn" title="Copy response">
                            <span class="material-icons" style="font-size:13px;">content_copy</span>
                            <span>Copy</span>
                        </button>
                    </div>
                    <div class="row-content model-text">
                        <span class="stream-content">${this.renderMarkdown(msg.text)}</span>
                    </div>
                `;
                this.feed.appendChild(modelRow);
                this.attachCodeCopyButtons(modelRow);
                this.attachFormulaCopyButtons(modelRow);
                this.attachCardCopyButtons(modelRow);
                this.attachRowCopyButton(modelRow, msg.text);
            }
        });
        this.scrollToBottom();
    }

    loadPromptHistory() {
        try {
            const saved = localStorage.getItem('gemini_prompt_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    savePromptHistory(prompt) {
        if (!prompt || !prompt.trim()) return;
        const clean = prompt.trim();
        if (this.promptHistory[this.promptHistory.length - 1] !== clean) {
            this.promptHistory.push(clean);
            if (this.promptHistory.length > 50) {
                this.promptHistory = this.promptHistory.slice(-50);
            }
            try {
                localStorage.setItem('gemini_prompt_history', JSON.stringify(this.promptHistory));
            } catch (e) {}
        }
        this.historyIndex = -1;
        this.savedDraft = '';
    }

    navigateHistory(direction, e) {
        if (!this.promptHistory || !this.promptHistory.length) return;

        if (direction === -1) {
            // ArrowUp: cycle to older prompt
            if (this.historyIndex === -1) {
                this.savedDraft = this.input ? this.input.value : '';
                this.historyIndex = this.promptHistory.length - 1;
            } else if (this.historyIndex > 0) {
                this.historyIndex--;
            } else {
                return;
            }
        } else if (direction === 1) {
            // ArrowDown: cycle to newer prompt
            if (this.historyIndex === -1) {
                return;
            } else if (this.historyIndex < this.promptHistory.length - 1) {
                this.historyIndex++;
            } else {
                this.historyIndex = -1;
                if (this.input) {
                    this.input.value = this.savedDraft;
                }
                if (e) e.preventDefault();
                return;
            }
        }

        if (this.historyIndex >= 0 && this.historyIndex < this.promptHistory.length && this.input) {
            if (e) e.preventDefault();
            this.input.value = this.promptHistory[this.historyIndex];
            setTimeout(() => {
                if (this.input) {
                    this.input.selectionStart = this.input.selectionEnd = this.input.value.length;
                }
            }, 0);
        }
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

    getSystemPrompt() {
        return localStorage.getItem('gemini_system_prompt') || DEFAULT_SYSTEM_PROMPT;
    }

    setSystemPrompt(prompt) {
        if (prompt && prompt.trim()) {
            localStorage.setItem('gemini_system_prompt', prompt.trim());
        } else {
            localStorage.removeItem('gemini_system_prompt');
        }
    }

    setModel(modelName) {
        if (!modelName) return;
        this.activeModel = modelName;
        localStorage.setItem('gemini_model', modelName);
        if (this.modelSelect) {
            this.modelSelect.value = modelName;
        }
        const prefSelect = document.getElementById('prefModelSelect');
        if (prefSelect) {
            prefSelect.value = modelName;
        }
    }

    getModelShortLabel(modelName) {
        if (!modelName) return '3.7 Flash';
        if (modelName.includes('3.8')) return '3.8 Flash';
        if (modelName.includes('3.7')) return '3.7 Flash';
        if (modelName.includes('3.5')) return '3.5 Flash';
        if (modelName.includes('2.5')) return '2.5 Flash';
        return modelName.replace('gemini-', '');
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
        this.modelSelect = document.getElementById('terminalModelSelect');

        if (this.modelSelect) {
            this.modelSelect.value = this.activeModel;
            this.modelSelect.onchange = (e) => {
                this.setModel(e.target.value);
            };
        }

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
                } else if (e.key === 'ArrowUp') {
                    this.navigateHistory(-1, e);
                } else if (e.key === 'ArrowDown') {
                    this.navigateHistory(1, e);
                }
            });
        }

        if (this.clearBtn) {
            this.clearBtn.onclick = () => this.clearHistory();
        }

        if (this.closeBtn) {
            this.closeBtn.onclick = () => this.close();
        }

        // Tab switching
        this.tabChat = document.getElementById('tabModeChat');
        this.tabDraft = document.getElementById('tabModeDraft');
        this.viewChat = document.getElementById('terminalViewChat');
        this.viewDraft = document.getElementById('terminalViewDraft');

        if (this.tabChat) {
            this.tabChat.onclick = () => this.setTerminalView('chat');
        }
        if (this.tabDraft) {
            this.tabDraft.onclick = () => this.setTerminalView('draft');
        }

        // Drafting elements
        this.draftTextarea = document.getElementById('draftTextarea');
        this.draftCounts = document.getElementById('draftCounts');
        this.btnDraftSample = document.getElementById('btnDraftSample');
        this.btnDraftClear = document.getElementById('btnDraftClear');
        this.btnFixGrammar = document.getElementById('btnFixGrammar');
        this.btnGenerateAllTones = document.getElementById('btnGenerateAllTones');
        this.draftToneChips = document.getElementById('draftToneChips');
        this.draftCardsContainer = document.getElementById('draftCardsContainer');

        if (this.draftTextarea) {
            this.draftTextarea.addEventListener('input', () => this.updateDraftCounts());
        }

        if (this.btnDraftSample) {
            this.btnDraftSample.onclick = () => {
                if (this.draftTextarea) {
                    this.draftTextarea.value = "Hey team, me and John was thinking about the deadline for project launch. It dont seem feasible to finish all tasks by Friday, so we should maybe postponing it to next week if everyone is okey with that? Let me know your thoughts asap!";
                    this.updateDraftCounts();
                    this.draftTextarea.focus();
                }
            };
        }

        if (this.btnDraftClear) {
            this.btnDraftClear.onclick = () => {
                if (this.draftTextarea) {
                    this.draftTextarea.value = '';
                    this.updateDraftCounts();
                    this.draftTextarea.focus();
                }
            };
        }

        if (this.btnFixGrammar) {
            this.btnFixGrammar.onclick = () => this.handleFixGrammar();
        }

        if (this.btnGenerateAllTones) {
            this.btnGenerateAllTones.onclick = () => this.handleGenerateAllTones();
        }

        if (this.draftToneChips) {
            this.draftToneChips.querySelectorAll('.tone-chip').forEach(chip => {
                chip.onclick = () => {
                    const tone = chip.dataset.tone;
                    if (tone) this.handleGenerateSingleTone(tone);
                };
            });
        }

        // Global Esc key to close terminal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        this.restoreFeedHistory();
    }

    open(initialQuery = '') {
        if (!this.terminal) return;
        this.isOpen = true;
        this.terminal.classList.add('active');
        document.body.classList.add('ai-terminal-active');

        if (this.searchZone) {
            this.searchZone.classList.add('morphed-to-ai');
            this.searchZone.classList.add('active-search');
        }

        this.scrollToBottom();

        // Focus appropriate input after transition
        setTimeout(() => {
            this.scrollToBottom();
            if (this.currentView === 'draft' && this.draftTextarea) {
                this.draftTextarea.focus();
            } else if (this.input) {
                this.input.focus();
            }
        }, 120);

        if (initialQuery && initialQuery.trim()) {
            this.setTerminalView('chat');
            this.submitQuery(initialQuery.trim());
        }
    }

    close() {
        if (!this.terminal) return;
        this.isOpen = false;
        this.terminal.classList.remove('active');
        document.body.classList.remove('ai-terminal-active');

        if (this.searchZone) {
            this.searchZone.classList.remove('morphed-to-ai');
            this.searchZone.classList.remove('active-search');
        }

        if (this.heroSearchInput) {
            this.heroSearchInput.value = '';
        }
        setEngineAIMode(false);

        if (this.isGenerating && this.abortController) {
            this.abortController.abort();
            this.isGenerating = false;
        }
        if (this.isDrafting && this.draftAbortController) {
            this.draftAbortController.abort();
            this.isDrafting = false;
        }
    }

    toggle(query = '') {
        if (this.isOpen) {
            this.close();
        } else {
            this.open(query);
        }
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

        this.savePromptHistory(promptText);

        const timestamp = new Date().toLocaleTimeString([], { hour12: false });

        this.chatHistory.push({
            role: 'user',
            text: promptText,
            timestamp: timestamp
        });
        this.saveChatHistory();

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

        // 2. Append Model Response Row with Streaming Container and Copy Action
        const modelRow = document.createElement('div');
        modelRow.className = 'terminal-row model-row';
        modelRow.innerHTML = `
            <div class="row-meta">
                <span class="timestamp">[${timestamp}]</span>
                <span class="gemini-badge"><svg class="single-sparkle-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style="vertical-align:-1px; margin-right:3px;"><path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"/></svg>${this.getModelShortLabel(this.activeModel)}:~$</span>
                <button class="terminal-row-copy-btn" title="Copy response">
                    <span class="material-icons" style="font-size:13px;">content_copy</span>
                    <span>Copy</span>
                </button>
            </div>
            <div class="row-content model-text">
                <span class="stream-content"></span>
                <span class="cyber-cursor">▋</span>
            </div>
        `;
        this.feed.appendChild(modelRow);
        userRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

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
        let isError = false;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.activeModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
            const systemPrompt = this.getSystemPrompt();

            const requestBody = {
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents,
                generationConfig: {
                    maxOutputTokens: 1400,
                    temperature: 0.7
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
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
                                // User requested: do NOT auto scroll to bottom during streaming.
                                // Stay in current position so user can read calmly.
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
            isError = true;
            if (err.name === 'AbortError') {
                isError = false;
                fullGeneratedText += ' [Generation terminated by user]';
            } else {
                console.error('[AI Terminal] submitQuery error:', err);
                const errMsg = err.message || 'Unknown error';
                streamContentEl.innerHTML = `<span class="terminal-error">SYSTEM EXCEPTION: ${this.escapeHTML(errMsg)}</span>`;
            }
        } finally {
            this.isGenerating = false;
            this.abortController = null;
            if (cursorEl) cursorEl.remove();

            // Only re-render markdown if there was no error (error message should stay visible)
            if (!isError) {
                streamContentEl.innerHTML = this.renderMarkdown(fullGeneratedText);
            }

            this.attachCodeCopyButtons(modelRow);
            this.attachFormulaCopyButtons(modelRow);
            this.attachCardCopyButtons(modelRow);
            this.attachRowCopyButton(modelRow, fullGeneratedText);

            if (!isError && fullGeneratedText && fullGeneratedText.trim()) {
                this.chatHistory.push({
                    role: 'model',
                    text: fullGeneratedText,
                    timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                    model: this.getModelShortLabel(this.activeModel)
                });
                this.saveChatHistory();
            } else if (this.chatHistory.length && this.chatHistory[this.chatHistory.length - 1].role === 'user') {
                this.chatHistory.pop();
                this.saveChatHistory();
            }
        }
    }

    renderHelp() {
        const helpRow = document.createElement('div');
        helpRow.className = 'terminal-row system-row';
        helpRow.innerHTML = `
            <div class="row-content system-help">
                <div class="help-title"><span class="material-icons" style="font-size:13px; vertical-align:-1px; margin-right:4px;">terminal</span>GEMINI AI TERMINAL COMMANDS:</div>
                <div class="help-item"><code>/a &lt;query&gt;</code> - Trigger AI directly from search bar</div>
                <div class="help-item"><code>/clear</code> - Clear current conversation stream</div>
                <div class="help-item"><code>/exit</code> or <code>[ESC]</code> - Return to search portal</div>
                <div class="help-item"><code>/model</code> - View active Gemini model specifications</div>
                <div class="help-item"><code>↑ / ↓</code> - Switch between previous and next used prompts</div>
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
                <div class="help-title"><span class="material-icons" style="font-size:13px; vertical-align:-1px; margin-right:4px;">tune</span>ACTIVE MODEL DIAGNOSTICS:</div>
                <div class="help-item">Model: <strong>${this.activeModel}</strong></div>
                <div class="help-item">Generation Engine: Google DeepMind Gemini API</div>
                <div class="help-item">Protocol: Server-Sent Events (SSE) Streaming</div>
                <div class="help-item">Endpoint: v1beta/models/${this.activeModel}</div>
            </div>
        `;
        this.feed.appendChild(infoRow);
        this.scrollToBottom();
    }

    clearHistory() {
        if (this.currentView === 'draft') {
            if (this.draftCardsContainer) {
                this.draftCardsContainer.innerHTML = `
                    <div class="draft-empty-state" id="draftEmptyState">
                        <span class="material-icons" style="font-size: 26px; opacity: 0.35;">edit_note</span>
                        <p>Enter text above and choose <strong>Fix Grammar</strong> or a <strong>Tone Alternative</strong>.</p>
                    </div>
                `;
            }
            return;
        }
        this.history = [];
        this.chatHistory = [];
        try {
            localStorage.removeItem('gemini_chat_history');
        } catch (e) {}
        if (this.feed) {
            this.feed.innerHTML = '';
        }
    }

    setTerminalView(view) {
        this.currentView = view;
        if (view === 'draft') {
            if (this.tabChat) this.tabChat.classList.remove('active');
            if (this.tabDraft) this.tabDraft.classList.add('active');
            if (this.viewChat) this.viewChat.classList.remove('active');
            if (this.viewDraft) this.viewDraft.classList.add('active');
            setTimeout(() => {
                if (this.draftTextarea) this.draftTextarea.focus();
            }, 60);
        } else {
            if (this.tabDraft) this.tabDraft.classList.remove('active');
            if (this.tabChat) this.tabChat.classList.add('active');
            if (this.viewDraft) this.viewDraft.classList.remove('active');
            if (this.viewChat) this.viewChat.classList.add('active');
            setTimeout(() => {
                if (this.input) this.input.focus();
            }, 60);
        }
    }

    updateDraftCounts() {
        if (!this.draftTextarea || !this.draftCounts) return;
        const text = this.draftTextarea.value || '';
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        this.draftCounts.textContent = `${words} words · ${chars} chars`;
    }

    removeDraftEmptyState() {
        const emptyState = document.getElementById('draftEmptyState');
        if (emptyState) emptyState.remove();
    }

    showDraftSkeleton(label = 'Analyzing & Refining Text...', count = 1) {
        this.removeDraftEmptyState();
        this.removeDraftSkeleton();

        if (!this.draftCardsContainer) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'draftSkeletonWrapper';
        wrapper.className = 'draft-skeleton-wrapper';

        for (let i = 0; i < count; i++) {
            const card = document.createElement('div');
            card.className = 'draft-card skeleton-card';
            card.innerHTML = `
                <div class="draft-card-header">
                    <div class="skeleton-header-left">
                        <span class="material-icons skeleton-spinner">sync</span>
                        <span class="skeleton-label">${this.escapeHTML(label)}</span>
                    </div>
                    <div class="skeleton-shimmer skeleton-btn"></div>
                </div>
                <div class="draft-card-body">
                    <div class="skeleton-shimmer skeleton-line" style="width: 88%;"></div>
                    <div class="skeleton-shimmer skeleton-line" style="width: 95%;"></div>
                    <div class="skeleton-shimmer skeleton-line" style="width: 68%;"></div>
                </div>
                <div class="draft-card-footer">
                    <div class="skeleton-shimmer skeleton-btn" style="width: 65px; height: 16px;"></div>
                </div>
            `;
            wrapper.appendChild(card);
        }

        this.draftCardsContainer.prepend(wrapper);
    }

    removeDraftSkeleton() {
        const skeleton = document.getElementById('draftSkeletonWrapper');
        if (skeleton) skeleton.remove();

        if (this.draftCardsContainer && this.draftCardsContainer.querySelectorAll('.draft-card').length === 0) {
            const existingEmpty = document.getElementById('draftEmptyState');
            if (!existingEmpty) {
                this.draftCardsContainer.innerHTML = `
                    <div class="draft-empty-state" id="draftEmptyState">
                        <span class="material-icons" style="font-size: 26px; opacity: 0.35;">edit_note</span>
                        <p>Enter text above and choose <strong>Fix Grammar</strong> or a <strong>Tone Alternative</strong>.</p>
                    </div>
                `;
            }
        }
    }

    setDraftActionsLoading(isLoading, activeType = '') {
        if (this.btnFixGrammar) {
            this.btnFixGrammar.disabled = isLoading;
            if (isLoading && activeType === 'grammar') {
                this.btnFixGrammar.innerHTML = `<span class="material-icons" style="font-size:15px; animation:spin 0.8s linear infinite;">sync</span><span>Checking...</span>`;
            } else {
                this.btnFixGrammar.innerHTML = `<span class="material-icons" style="font-size:15px;">spellcheck</span><span>Fix Grammar</span>`;
            }
        }

        if (this.btnGenerateAllTones) {
            this.btnGenerateAllTones.disabled = isLoading;
            if (isLoading && activeType === 'all_tones') {
                this.btnGenerateAllTones.innerHTML = `<span class="material-icons" style="font-size:15px; animation:spin 0.8s linear infinite;">sync</span><span>Generating...</span>`;
            } else {
                this.btnGenerateAllTones.innerHTML = `<span class="material-icons" style="font-size:15px;">auto_awesome</span><span>Tone Alternatives</span>`;
            }
        }

        if (this.draftToneChips) {
            this.draftToneChips.querySelectorAll('.tone-chip').forEach(chip => {
                chip.disabled = isLoading;
                const tKey = chip.dataset.tone;
                const meta = DRAFT_TONES[tKey];
                if (isLoading && (activeType === 'all_tones' || activeType === tKey)) {
                    chip.classList.add('loading');
                    chip.innerHTML = `<span class="material-icons tone-icon" style="animation:spin 0.8s linear infinite;">sync</span> ${meta?.label || ''}`;
                } else {
                    chip.classList.remove('loading');
                    if (meta) {
                        chip.innerHTML = `<span class="material-icons tone-icon">${meta.icon}</span> ${meta.label}`;
                    }
                }
            });
        }
    }

    async handleFixGrammar() {
        const text = (this.draftTextarea?.value || '').trim();
        if (!text) {
            this.draftTextarea?.focus();
            return;
        }
        if (this.isDrafting) return;

        const apiKey = this.getApiKey();
        if (!apiKey) {
            showConsoleErrorNotification({
                title: 'API Key Missing',
                message: 'Please configure your Gemini API Key in Settings first.',
                badge: 'CONFIG REQUIRED'
            });
            return;
        }

        this.isDrafting = true;
        this.draftAbortController = new AbortController();
        this.setDraftActionsLoading(true, 'grammar');
        this.showDraftSkeleton('Refining grammar & syntax...', 1);

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.activeModel}:generateContent?key=${apiKey}`;
            const prompt = `Fix grammar, spelling, punctuation, capitalization, and phrasing in this text. Maintain the author's original voice and intent. Do NOT use em dash (—) or en dash (–) symbols.\n\nInput Text:\n${text}`;

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: this.draftAbortController.signal,
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: DRAFT_GRAMMAR_PROMPT + '\nStrictly never use em dash (—) or en dash (–) symbols.' }]
                    },
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1200
                    }
                })
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error?.message || `HTTP ${resp.status}`);
            }

            const data = await resp.json();
            let corrected = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            corrected = corrected.replace(/[\u2014\u2013]/g, ' - ');

            if (corrected) {
                this.removeDraftEmptyState();
                this.removeDraftSkeleton();
                this.prependDraftCard({
                    id: 'card-grammar-' + Date.now(),
                    toneKey: 'grammar',
                    title: 'Grammar Corrected',
                    icon: 'spellcheck',
                    badgeClass: 'tone-badge-grammar',
                    content: corrected
                });
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                showConsoleErrorNotification({
                    title: 'Grammar Check Error',
                    message: err.message,
                    badge: 'DRAFT ERROR'
                });
            }
        } finally {
            this.removeDraftSkeleton();
            this.isDrafting = false;
            this.draftAbortController = null;
            this.setDraftActionsLoading(false);
        }
    }

    async handleGenerateAllTones() {
        const text = (this.draftTextarea?.value || '').trim();
        if (!text) {
            this.draftTextarea?.focus();
            return;
        }
        if (this.isDrafting) return;

        const apiKey = this.getApiKey();
        if (!apiKey) {
            showConsoleErrorNotification({
                title: 'API Key Missing',
                message: 'Please configure your Gemini API Key in Settings first.',
                badge: 'CONFIG REQUIRED'
            });
            return;
        }

        this.isDrafting = true;
        this.draftAbortController = new AbortController();
        this.setDraftActionsLoading(true, 'all_tones');
        this.showDraftSkeleton('Generating 6 tone alternatives...', 3);

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.activeModel}:generateContent?key=${apiKey}`;
            const prompt = `Rewrite the following text into 6 tone variations: professional, casual, polite, funny, social_post, and witty. Strictly never use em dash (—) or en dash (–) symbols.
Return strictly a JSON object with this format (no markdown fences if possible):
{
  "professional": "...",
  "casual": "...",
  "polite": "...",
  "funny": "...",
  "social_post": "...",
  "witty": "..."
}

Original Text:
${text}`;

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: this.draftAbortController.signal,
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{
                            text: `You are an expert copywriter and tone stylist. Strictly output JSON with 6 tones (professional, casual, polite, funny, social_post, witty). Do not include pleasantries, meta talk, or conversational filler. Strictly never use em dash (—) or en dash (–) symbols.`
                        }]
                    },
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: 'application/json',
                        temperature: 0.65,
                        maxOutputTokens: 2500
                    }
                })
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error?.message || `HTTP ${resp.status}`);
            }

            const data = await resp.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
            let parsed = {};
            try {
                const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
                parsed = JSON.parse(cleanJson);
            } catch (e) {
                console.warn('Failed to parse tone JSON:', rawText);
            }

            this.removeDraftEmptyState();
            this.removeDraftSkeleton();

            const toneKeys = ['professional', 'casual', 'polite', 'funny', 'social_post', 'witty'];
            for (const key of toneKeys) {
                let content = parsed[key];
                if (content && typeof content === 'string') {
                    content = content.replace(/[\u2014\u2013]/g, ' - ').trim();
                    const meta = DRAFT_TONES[key];
                    this.prependDraftCard({
                        id: 'card-' + key + '-' + Date.now(),
                        toneKey: key,
                        title: meta.label,
                        icon: meta.icon,
                        badgeClass: meta.badgeClass,
                        content
                    });
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                showConsoleErrorNotification({
                    title: 'Tone Generation Error',
                    message: err.message,
                    badge: 'DRAFT ERROR'
                });
            }
        } finally {
            this.removeDraftSkeleton();
            this.isDrafting = false;
            this.draftAbortController = null;
            this.setDraftActionsLoading(false);
        }
    }

    async handleGenerateSingleTone(toneKey) {
        const meta = DRAFT_TONES[toneKey];
        if (!meta) return;

        const text = (this.draftTextarea?.value || '').trim();
        if (!text) {
            this.draftTextarea?.focus();
            return;
        }
        if (this.isDrafting) return;

        const apiKey = this.getApiKey();
        if (!apiKey) {
            showConsoleErrorNotification({
                title: 'API Key Missing',
                message: 'Please configure your Gemini API Key in Settings first.',
                badge: 'CONFIG REQUIRED'
            });
            return;
        }

        this.isDrafting = true;
        this.draftAbortController = new AbortController();
        this.setDraftActionsLoading(true, toneKey);
        this.showDraftSkeleton(`Crafting ${meta.label} tone...`, 1);

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.activeModel}:generateContent?key=${apiKey}`;
            const prompt = `${meta.instruction} Strictly never use em dash (—) or en dash (–) symbols.\n\nOriginal Text:\n${text}`;

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: this.draftAbortController.signal,
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{
                            text: `You are an expert copywriter. Output strictly the rewritten text matching the requested tone. Do NOT add preamble, quotes, or conversational explanations. Strictly never use em dash (—) or en dash (–) symbols.`
                        }]
                    },
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.65,
                        maxOutputTokens: 1200
                    }
                })
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error?.message || `HTTP ${resp.status}`);
            }

            const data = await resp.json();
            let result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            result = result.replace(/[\u2014\u2013]/g, ' - ');

            if (result) {
                this.removeDraftEmptyState();
                this.removeDraftSkeleton();
                this.prependDraftCard({
                    id: 'card-' + toneKey + '-' + Date.now(),
                    toneKey,
                    title: meta.label,
                    icon: meta.icon,
                    badgeClass: meta.badgeClass,
                    content: result
                });
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                showConsoleErrorNotification({
                    title: `Tone Error (${meta.label})`,
                    message: err.message,
                    badge: 'DRAFT ERROR'
                });
            }
        } finally {
            this.removeDraftSkeleton();
            this.isDrafting = false;
            this.draftAbortController = null;
            this.setDraftActionsLoading(false);
        }
    }

    prependDraftCard({ id, toneKey, title, icon, badgeClass, content }) {
        if (!this.draftCardsContainer) return;

        const existing = this.draftCardsContainer.querySelector(`[data-tone-card="${toneKey}"]`);
        if (existing) {
            existing.remove();
        }

        const card = document.createElement('div');
        card.className = 'draft-card';
        card.id = id;
        card.dataset.toneCard = toneKey;
        card.innerHTML = `
            <div class="draft-card-header">
                <div class="tone-badge ${badgeClass}">
                    <span class="material-icons tone-icon">${icon}</span>
                    <span>${title}</span>
                </div>
                <button type="button" class="draft-copy-btn" title="Copy text">
                    <span class="material-icons" style="font-size:13px;">content_copy</span>
                    <span>Copy</span>
                </button>
            </div>
            <div class="draft-card-body">${this.escapeHTML(content)}</div>
            <div class="draft-card-footer">
                <button type="button" class="btn-use-draft" title="Replace input text with this draft">
                    <span class="material-icons" style="font-size:13px;">arrow_upward</span>
                    <span>Use Draft</span>
                </button>
            </div>
        `;

        const copyBtn = card.querySelector('.draft-copy-btn');
        if (copyBtn) {
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(content).then(() => {
                    copyBtn.innerHTML = `<span class="material-icons" style="font-size:13px; color:#4ade80;">check</span><span style="color:#4ade80;">Copied!</span>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = `<span class="material-icons" style="font-size:13px;">content_copy</span><span>Copy</span>`;
                    }, 2000);
                });
            };
        }

        const useBtn = card.querySelector('.btn-use-draft');
        if (useBtn) {
            useBtn.onclick = () => {
                if (this.draftTextarea) {
                    this.draftTextarea.value = content;
                    this.updateDraftCounts();
                    this.draftTextarea.focus();
                }
            };
        }

        this.draftCardsContainer.prepend(card);
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

    beautifyMath(math) {
        let s = (math || '').trim();

        // Greek letters
        const greek = {
            '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
            '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ', '\\iota': 'ι', '\\kappa': 'κ',
            '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π',
            '\\rho': 'ρ', '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
            '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω', '\\Gamma': 'Γ', '\\Delta': 'Δ',
            '\\Theta': 'Θ', '\\Lambda': 'Λ', '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ',
            '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω'
        };
        for (const [k, v] of Object.entries(greek)) {
            s = s.split(k).join(v);
        }

        // Arrows & relations
        s = s.replace(/\\rightarrow|\\to/g, ' → ')
             .replace(/\\leftarrow/g, ' ← ')
             .replace(/\\leftrightarrow/g, ' ↔ ')
             .replace(/\\Rightarrow/g, ' ⇒ ')
             .replace(/\\Leftarrow/g, ' ⇐ ')
             .replace(/\\pm/g, '±')
             .replace(/\\times/g, '×')
             .replace(/\\div/g, '÷')
             .replace(/\\cdot/g, '·')
             .replace(/\\approx/g, '≈')
             .replace(/\\neq|\\ne/g, '≠')
             .replace(/\\le|\\leq/g, '≤')
             .replace(/\\ge|\\geq/g, '≥')
             .replace(/\\infty/g, '∞')
             .replace(/\\partial/g, '∂')
             .replace(/\\nabla/g, '∇')
             .replace(/\\mid/g, ' | ');

        // Fractions \frac{a}{b} -> (a / b)
        s = s.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1 / $2)');
        // Sqrt \sqrt{a} -> √(a)
        s = s.replace(/\\sqrt\s*\{([^}]+)\}/g, '√($1)');

        // Subscripts: _{...} or _0-9 or single letter (e.g. Fe_2O_3 -> Fe₂O₃ / Fe<sub>2</sub>O<sub>3</sub>)
        s = s.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
        s = s.replace(/_([0-9]+|[a-zA-Z])/g, '<sub>$1</sub>');

        // Superscripts: ^{...} or ^0-9 or single letter
        s = s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
        s = s.replace(/\^([0-9]+|[a-zA-Z])/g, '<sup>$1</sup>');

        // Cleanup remaining backslashes for text / left / right
        s = s.replace(/\\left|\\right/g, '')
             .replace(/\\text\{([^}]+)\}/g, '$1')
             .replace(/\\mathrm\{([^}]+)\}/g, '$1')
             .replace(/\\quad|\\qquad/g, '  ')
             .replace(/\\,/g, ' ');

        return s;
    }

    renderMathBlock(math) {
        const raw = (math || '').trim();
        let rendered = '';
        if (typeof window !== 'undefined' && window.katex) {
            try {
                rendered = window.katex.renderToString(raw, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {}
        }
        if (!rendered) {
            rendered = this.beautifyMath(raw);
        }
        return `<div class="ai-latex-block" data-raw="${this.escapeHTML(raw)}">
            <div class="latex-header">
                <span class="latex-tag">FORMULA</span>
                <button class="btn-copy-formula" title="Copy LaTeX">
                    <span class="material-icons" style="font-size:12px;">content_copy</span>
                    <span>LaTeX</span>
                </button>
            </div>
            <div class="latex-content">${rendered}</div>
        </div>`;
    }

    renderMathInline(math) {
        const raw = (math || '').trim();
        let rendered = '';
        if (typeof window !== 'undefined' && window.katex) {
            try {
                rendered = window.katex.renderToString(raw, {
                    displayMode: false,
                    throwOnError: false
                });
            } catch (e) {}
        }
        if (!rendered) {
            rendered = this.beautifyMath(raw);
        }
        return `<span class="ai-latex-inline">${rendered}</span>`;
    }

    cleanMarkdownFormatting(str) {
        if (!str) return '';
        return str
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .trim();
    }

    formatInline(text) {
        if (!text) return '';
        let s = text.replace(/[\u2014\u2013]/g, ' - ');
        s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        s = s.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        s = s.replace(/\b_([^_\n]+)_\b/g, '<em>$1</em>');
        s = s.replace(/`([^`\n]+)`/g, '<code class="ai-inline-code">$1</code>');
        s = s.replace(/\*\*/g, '');
        s = s.replace(/\b__\b/g, '');
        return s;
    }

    renderCardOrQuote(rawBlock) {
        const rawLines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
        if (rawLines.length === 0) return '';

        let cardTitle = '';
        const rows = [];

        rawLines.forEach((rawLine, idx) => {
            const line = rawLine.replace(/^(?:&gt;|>)\s*/, '').trim();
            const cleaned = this.cleanMarkdownFormatting(line);

            if (idx === 0) {
                const headingMatch = line.match(/^(?:###|##|#)\s+(.+)$/);
                if (headingMatch) {
                    cardTitle = this.cleanMarkdownFormatting(headingMatch[1]);
                    return;
                }
                const bracketMatch = line.match(/^\[([^\]]+)\]$/);
                if (bracketMatch) {
                    cardTitle = this.cleanMarkdownFormatting(bracketMatch[1]);
                    return;
                }
                const isFullBold = (line.startsWith('**') && line.endsWith('**')) || (line.startsWith('__') && line.endsWith('__'));
                const fieldMatch = cleaned.match(/^(Original|Target|Hindi|Japanese|Arabic|Spanish|French|German|Korean|Chinese|English|Pronunciation|Transliteration|Romaji|Pinyin|Indonesian|Indo|Meaning|Translation|Arti|Makna):\s*(.+)$/i);
                
                if (isFullBold && !fieldMatch) {
                    cardTitle = cleaned;
                    return;
                }
            }

            const kvMatch = cleaned.match(/^([^:]+?):\s*(.+)$/);
            if (kvMatch && kvMatch[1].trim().length < 35) {
                const rawKey = kvMatch[1].trim();
                const rawVal = kvMatch[2].trim();
                rows.push({
                    key: rawKey.toLowerCase(),
                    label: rawKey,
                    value: rawVal
                });
            } else {
                rows.push({
                    key: 'general',
                    label: '',
                    value: cleaned
                });
            }
        });

        const hasKnownKeys = rows.some(r => 
            ['original', 'target', 'hindi', 'japanese', 'arabic', 'spanish', 'french', 'german', 'korean', 'chinese', 'english',
             'pronunciation', 'transliteration', 'romaji', 'pinyin', 'reading',
             'indonesian', 'indonesian equivalent', 'indo', 'meaning', 'translation', 'arti', 'makna',
             'context', 'situation', 'nuance', 'note', 'example', 'usage', 'giving advice', 'how to use it'].includes(r.key)
        );

        if (!hasKnownKeys && (!cardTitle || rows.length < 2)) {
            const formatted = rawLines.map(l => {
                const clean = l.replace(/^(?:&gt;|>)\s*/, '');
                return this.formatInline(clean);
            }).join('<br>');
            return `<blockquote class="ai-quote">${formatted}</blockquote>`;
        }

        if (!cardTitle) {
            cardTitle = 'LANGUAGE USAGE & CONTEXT';
        }

        let bodyHtml = '';
        rows.forEach(r => {
            const k = r.key;
            const val = this.formatInline(r.value);
            if (!val) return;

            if (['original', 'target', 'hindi', 'japanese', 'arabic', 'spanish', 'french', 'german', 'korean', 'chinese', 'english'].includes(k)) {
                bodyHtml += `<div class="card-row card-row-phrase">
                    <span class="card-tag tag-target">${this.escapeHTML(r.label.toUpperCase())}</span>
                    <span class="card-phrase-val">${val}</span>
                </div>`;
            } else if (['pronunciation', 'transliteration', 'romaji', 'pinyin', 'reading'].includes(k)) {
                bodyHtml += `<div class="card-row card-row-phonetic">
                    <span class="card-tag tag-phonetic">PHONETIC</span>
                    <span class="card-phonetic-val">${val}</span>
                </div>`;
            } else if (['indonesian', 'indonesian equivalent', 'indo', 'meaning', 'translation', 'arti', 'makna'].includes(k)) {
                bodyHtml += `<div class="card-row card-row-indo">
                    <span class="card-tag tag-indo">INDONESIAN</span>
                    <span class="card-indo-val">${val}</span>
                </div>`;
            } else if (['context', 'situation', 'nuance', 'note', 'example', 'usage', 'giving advice', 'how to use it'].includes(k)) {
                bodyHtml += `<div class="card-row card-row-note">
                    <span class="card-tag tag-note">${this.escapeHTML(r.label.toUpperCase())}</span>
                    <span class="card-note-val">${val}</span>
                </div>`;
            } else {
                bodyHtml += `<div class="card-row card-row-generic">
                    ${r.label ? `<span class="card-tag">${this.escapeHTML(r.label.toUpperCase())}</span>` : ''}
                    <span class="card-generic-val">${val}</span>
                </div>`;
            }
        });

        return `<div class="ai-card-block">
            <div class="card-block-header">
                <div class="card-block-title">
                    <span class="material-icons card-icon">translate</span>
                    <span class="card-title-text">${this.escapeHTML(cardTitle.toUpperCase())}</span>
                </div>
                <button class="btn-copy-card" title="Copy card text">
                    <span class="material-icons" style="font-size:13px;">content_copy</span>
                    <span>Copy</span>
                </button>
            </div>
            <div class="card-block-body">
                ${bodyHtml}
            </div>
        </div>`;
    }

    renderTable(match) {
        const lines = match.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return match;
        const headerLine = lines[0];
        const sepLine = lines[1];
        if (!sepLine.includes('-') || !sepLine.includes('|')) return match;
        const cleanSep = sepLine.replace(/^\|/, '').replace(/\|$/, '').trim();
        const sepCells = cleanSep.split('|').map(s => s.trim());
        if (!sepCells.every(s => /^:?-+:?$/.test(s))) return match;

        const parseRow = (line) => {
            let clean = line.trim();
            if (clean.startsWith('|')) clean = clean.slice(1);
            if (clean.endsWith('|')) clean = clean.slice(0, -1);
            return clean.split('|').map(cell => cell.trim());
        };
        const parseAlignments = (line) => {
            return parseRow(line).map(cell => {
                const left = cell.startsWith(':');
                const right = cell.endsWith(':');
                if (left && right) return 'center';
                if (right) return 'right';
                return 'left';
            });
        };
        const headers = parseRow(headerLine);
        const alignments = parseAlignments(sepLine);
        const rows = lines.slice(2).map(parseRow);

        let html = '<div class="ai-table-wrapper"><table class="ai-table"><thead><tr>';
        headers.forEach((h, i) => {
            const align = alignments[i] || 'left';
            html += `<th style="text-align:${align}">${this.formatInline(h)}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            if (row.length === 1 && row[0] === '') return;
            html += '<tr>';
            headers.forEach((_, i) => {
                const cell = row[i] !== undefined ? row[i] : '';
                const align = alignments[i] || 'left';
                html += `<td style="text-align:${align}">${this.formatInline(cell)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        return html;
    }

    renderMarkdown(text) {
        if (!text) return '';

        // Eliminate any em dash (—) or en dash (–)
        text = text.replace(/[\u2014\u2013]/g, ' - ');

        // 1. First escape raw HTML safely
        let out = this.escapeHTML(text);

        // 2. Fenced code blocks ```lang ... ``` and card blocks
        const codeBlocks = [];
        const cardBlocks = [];
        out = out.replace(/```([a-zA-Z0-9_\-#\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const l = (lang || '').toLowerCase();
            if (['card', 'lang', 'language', 'vocab'].includes(l)) {
                const id = `§§§CARD${cardBlocks.length}§§§`;
                cardBlocks.push(this.renderCardOrQuote(code));
                return id;
            }
            const id = `§§§CODE${codeBlocks.length}§§§`;
            const langLabel = lang ? lang.toUpperCase() : 'CODE';
            codeBlocks.push(`<div class="ai-code-block">
                <div class="code-header">
                    <span class="code-lang">${langLabel}</span>
                    <button class="btn-copy-code" title="Copy code"><span class="material-icons" style="font-size:13px;">content_copy</span> Copy</button>
                </div>
                <pre class="code-body"><code>${code.trim()}</code></pre>
            </div>`);
            return id;
        });

        // 2b. Markdown Tables
        const tableBlocks = [];
        const tableRegex = /(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\r?\n[ \t]*\|[^\n]+\|[ \t]*)+)/gm;
        out = out.replace(tableRegex, (match) => {
            const id = `§§§TABLE${tableBlocks.length}§§§`;
            tableBlocks.push(this.renderTable(match));
            return id + '\n';
        });

        // 3. Inline code `code` (save to tokens to prevent accidental markdown interference)
        const inlineCodes = [];
        out = out.replace(/`([^`\n]+)`/g, (match, code) => {
            const id = `§§§INLINE${inlineCodes.length}§§§`;
            inlineCodes.push(`<code class="ai-inline-code">${code}</code>`);
            return id;
        });

        // 4. LaTeX Math:
        // Block: $$...$$ or \[...\]
        const mathBlocks = [];
        out = out.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
            const id = `§§§MATH${mathBlocks.length}§§§`;
            mathBlocks.push(this.renderMathBlock(math));
            return id;
        });
        out = out.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
            const id = `§§§MATH${mathBlocks.length}§§§`;
            mathBlocks.push(this.renderMathBlock(math));
            return id;
        });
        // Inline: $...$ or \(...\)
        const mathInlines = [];
        out = out.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
            const id = `§§§INLINEMATH${mathInlines.length}§§§`;
            mathInlines.push(this.renderMathInline(math));
            return id;
        });
        out = out.replace(/\\\((.+?)\\\)/g, (match, math) => {
            const id = `§§§INLINEMATH${mathInlines.length}§§§`;
            mathInlines.push(this.renderMathInline(math));
            return id;
        });

        // 5. Blockquotes & Language Card Blocks (> quote or &gt; quote)
        out = out.replace(/(?:^(?:&gt;|>)[^\n]*(?:\n|$))+/gm, (match) => {
            const id = `§§§CARD${cardBlocks.length}§§§`;
            cardBlocks.push(this.renderCardOrQuote(match));
            return id + '\n';
        });

        // 6. Horizontal rules
        out = out.replace(/^(?:---|___|\*\*\*)$/gm, '<div class="ai-divider"></div>');

        // 7. Headings
        out = out.replace(/^###\s+(.+)$/gm, '<div class="ai-heading-3">$1</div>');
        out = out.replace(/^##\s+(.+)$/gm, '<div class="ai-heading-2">$1</div>');
        out = out.replace(/^#\s+(.+)$/gm, '<div class="ai-heading-1">$1</div>');

        // 8. Bold & Italic combinations
        out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        out = out.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
        out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // 9. Bullet lists (* or - with optional indentation)
        out = out.replace(/^\s*[\*\-]\s+(.+)$/gm, '<div class="ai-bullet-item"><span class="bullet-dot">›</span> $1</div>');
        // Numbered lists (1. or 1) with optional indentation)
        out = out.replace(/^\s*(\d+)[\.\)]\s+(.+)$/gm, '<div class="ai-number-item"><span class="number-badge">$1.</span> $2</div>');

        // 10. Remaining single asterisks or underscores for italics
        out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        out = out.replace(/\b_([^_\n]+)_\b/g, '<em>$1</em>');

        // Clean up empty or orphan bullets (e.g. › ** or › *)
        out = out.replace(/<div class="ai-bullet-item"><span class="bullet-dot">›<\/span>\s*(\*\*|\*|__|_)?\s*<\/div>/g, '');
        out = out.replace(/\*\*/g, '');
        out = out.replace(/\b__\b/g, '');
        out = out.replace(/^\*\s+/gm, '');

        // 11. Paragraph breaks & spacing
        out = out.replace(/\n\n+/g, '<div class="ai-spacer"></div>');
        out = out.replace(/\n/g, '<br>');

        // 12. Clean redundant <br> tags around block-level elements
        out = out
            .replace(/(<\/div>|<\/blockquote>|<\/hr>)\s*<br\s*\/?>/gi, '$1')
            .replace(/<br\s*\/?>\s*(<div|<blockquote|<hr)/gi, '$1');

        // 13. Multi-pass token restoration
        // Tables & Card blocks must be restored first so any nested tokens (inline code, math) become available in `out`
        let pass = 0;
        while (out.includes('§§§') && pass++ < 5) {
            tableBlocks.forEach((block, i) => {
                out = out.replace(`§§§TABLE${i}§§§`, block);
            });
            cardBlocks.forEach((block, i) => {
                out = out.replace(`§§§CARD${i}§§§`, block);
            });
            codeBlocks.forEach((block, i) => {
                out = out.replace(`§§§CODE${i}§§§`, block);
            });
            inlineCodes.forEach((code, i) => {
                out = out.replace(`§§§INLINE${i}§§§`, code);
            });
            mathBlocks.forEach((block, i) => {
                out = out.replace(`§§§MATH${i}§§§`, block);
            });
            mathInlines.forEach((inline, i) => {
                out = out.replace(`§§§INLINEMATH${i}§§§`, inline);
            });
        }
        // Safety cleanup: strip any accidental remaining token markers
        out = out.replace(/§§§[A-Z0-9]+§§§/g, '');

        return out;
    }

    attachCardCopyButtons(container) {
        container.querySelectorAll('.btn-copy-card').forEach(btn => {
            btn.onclick = () => {
                const cardEl = btn.closest('.ai-card-block');
                if (cardEl) {
                    const title = cardEl.querySelector('.card-title-text')?.innerText || '';
                    const rows = Array.from(cardEl.querySelectorAll('.card-row')).map(r => {
                        const tag = r.querySelector('.card-tag')?.innerText || '';
                        const val = r.querySelector('.card-phrase-val, .card-phonetic-val, .card-indo-val, .card-note-val, .card-generic-val')?.innerText || '';
                        return tag ? `${tag}: ${val}` : val;
                    }).join('\n');
                    const textToCopy = `${title}\n${rows}`.trim();
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        btn.innerHTML = '<span class="material-icons" style="font-size:13px; color:#4ade80;">check</span> <span>Copied!</span>';
                        setTimeout(() => {
                            btn.innerHTML = '<span class="material-icons" style="font-size:13px;">content_copy</span> <span>Copy</span>';
                        }, 2000);
                    });
                }
            };
        });
    }

    attachCodeCopyButtons(container) {
        container.querySelectorAll('.btn-copy-code').forEach(btn => {
            btn.onclick = () => {
                const codeEl = btn.closest('.ai-code-block')?.querySelector('code');
                if (codeEl) {
                    navigator.clipboard.writeText(codeEl.innerText).then(() => {
                        btn.innerHTML = '<span class="material-icons" style="font-size:13px; color:#4ade80;">check</span> Copied!';
                        setTimeout(() => {
                            btn.innerHTML = '<span class="material-icons" style="font-size:13px;">content_copy</span> Copy';
                        }, 2000);
                    });
                }
            };
        });
    }

    attachFormulaCopyButtons(container) {
        container.querySelectorAll('.btn-copy-formula').forEach(btn => {
            btn.onclick = () => {
                const block = btn.closest('.ai-latex-block');
                const raw = block ? block.dataset.raw : '';
                if (raw) {
                    navigator.clipboard.writeText(raw).then(() => {
                        btn.innerHTML = '<span class="material-icons" style="font-size:12px; color:#4ade80;">check</span> Copied!';
                        setTimeout(() => {
                            btn.innerHTML = '<span class="material-icons" style="font-size:12px;">content_copy</span> LaTeX';
                        }, 2000);
                    });
                }
            };
        });
    }

    attachRowCopyButton(modelRow, rawText) {
        const copyBtn = modelRow.querySelector('.terminal-row-copy-btn');
        if (!copyBtn) return;
        copyBtn.onclick = () => {
            const cleanText = rawText || modelRow.querySelector('.model-text')?.innerText || '';
            navigator.clipboard.writeText(cleanText).then(() => {
                copyBtn.innerHTML = '<span class="material-icons" style="font-size:13px; color:#4ade80;">check</span><span style="color:#4ade80;">Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<span class="material-icons" style="font-size:13px;">content_copy</span><span>Copy</span>';
                }, 2000);
            });
        };
    }
}

export let aiTerminal = null;

export const initAIChat = () => {
    if (!aiTerminal) {
        aiTerminal = new GeminiAITerminal();
    }
    return aiTerminal;
};

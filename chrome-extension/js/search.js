import { SEARCH_ENGINES } from './config.js';
import { state } from './state.js';
import { aiTerminal } from './ai-chat.js';

export let setEngineAIMode = () => {};

export const initSearch = () => {
    const engineMenu = document.getElementById('engineMenu');
    const engineTrigger = document.getElementById('engineTrigger');
    const currentEngineIcon = document.getElementById('currentEngineIcon');
    const currentEngineName = document.getElementById('currentEngineName');
    const heroZone = document.getElementById('heroInteractiveZone');
    const heroSearchBtn = document.getElementById('heroSearchBtn');

    const SPARKLE_SVG = `<svg class="single-sparkle-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"/></svg>`;
    let isAIModeActive = false;

    // Populate engine selector
    if (engineMenu) {
        engineMenu.innerHTML = '';
        Object.entries(SEARCH_ENGINES).forEach(([key, engine]) => {
            const opt = document.createElement('div');
            opt.className = `engine-option ${key === state.engine ? 'selected' : ''}`;
            opt.dataset.engine = key;
            opt.innerHTML = `<span class="material-icons" style="font-size:16px;">${engine.icon}</span> ${engine.name}`;
            opt.onclick = () => {
                setEngineAIMode(false);
                state.setEngine(key);
                engineMenu.classList.remove('active');
            };
            engineMenu.appendChild(opt);
        });
    }

    const updateEngineUI = (key) => {
        if (isAIModeActive) return;
        const engine = SEARCH_ENGINES[key] || SEARCH_ENGINES.google;
        if (currentEngineIcon) {
            currentEngineIcon.className = 'material-icons';
            currentEngineIcon.textContent = engine.icon;
        }
        if (currentEngineName) currentEngineName.textContent = engine.name;
        document.querySelectorAll('.engine-option').forEach(o => {
            o.classList.toggle('selected', o.dataset.engine === key);
        });
    };

    setEngineAIMode = (active) => {
        isAIModeActive = active;
        if (!engineTrigger) return;
        if (active) {
            engineTrigger.classList.add('ai-active');
            if (currentEngineIcon) {
                currentEngineIcon.className = 'single-sparkle-wrapper';
                currentEngineIcon.innerHTML = SPARKLE_SVG;
            }
            if (currentEngineName) currentEngineName.textContent = 'AI';
        } else {
            engineTrigger.classList.remove('ai-active');
            updateEngineUI(state.engine);
        }
    };

    updateEngineUI(state.engine);
    state.subscribe('engine', (key) => updateEngineUI(key));

    if (engineTrigger) {
        engineTrigger.onclick = (e) => {
            e.stopPropagation();
            if (engineMenu) engineMenu.classList.toggle('active');
        };
    }

    window.addEventListener('click', () => {
        if (engineMenu) engineMenu.classList.remove('active');
    });

    // Execute Search
    const doSearch = (query) => {
        const q = (query || '').trim();
        if (q) {
            const engine = SEARCH_ENGINES[state.engine] || SEARCH_ENGINES.google;
            window.location.href = engine.url + encodeURIComponent(q);
        }
    };

    const searchInputs = document.querySelectorAll('.search-input');
    const searchBtns = document.querySelectorAll('.search-btn');

    searchBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const wrapper = btn.closest('.search-glass');
            const input = wrapper ? wrapper.querySelector('.search-input') : searchInputs[0];
            if (input) {
                const val = input.value.trim();
                if (isAIModeActive || val.toLowerCase().startsWith('/a ') || val.toLowerCase() === '/a') {
                    const query = val.replace(/^\/a\s*/i, '').trim();
                    input.value = '';
                    setEngineAIMode(false);
                    if (aiTerminal) aiTerminal.open(query);
                    return;
                }
                doSearch(val);
            }
        };
    });

    const shortcuts = {
        '/g': 'google',
        '/b': 'bing',
        '/d': 'duckduckgo',
        '/y': 'youtube',
        '/w': 'wikipedia',
        '/r': 'reddit',
        '/gh': 'github'
    };

    searchInputs.forEach(input => {
        input.addEventListener('input', () => {
            const val = input.value;

            // Detect /a AI query mode and strip "/a" immediately
            if (val.toLowerCase().startsWith('/a ') || val.toLowerCase() === '/a') {
                setEngineAIMode(true);
                input.value = val.replace(/^\/a\s*/i, '');
            }

            input.placeholder = isAIModeActive ? "Ask AI anything..." : "Search and ask anything";

            for (const [key, engine] of Object.entries(shortcuts)) {
                if (val.startsWith(key + ' ') || val === key) {
                    state.setEngine(engine);
                    input.value = val.replace(key, '').trim();
                }
            }
            if (heroZone) {
                if (input.value.trim().length > 0) {
                    heroZone.classList.add('active-search');
                }
            }
        });

        input.addEventListener('focus', () => {
            if (heroZone) heroZone.classList.add('active-search');
        });

        input.addEventListener('blur', () => {
            if (aiTerminal && aiTerminal.isOpen) return;
            if (heroZone && input.value.trim().length === 0) {
                heroZone.classList.remove('active-search');
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = input.value.trim();
                if (isAIModeActive || val.toLowerCase().startsWith('/a ') || val.toLowerCase() === '/a') {
                    e.preventDefault();
                    const query = val.replace(/^\/a\s*/i, '').trim();
                    input.value = '';
                    setEngineAIMode(false);
                    if (aiTerminal) {
                        aiTerminal.open(query);
                    }
                    return;
                }
                doSearch(val);
            } else if (e.key === 'Backspace' && isAIModeActive && input.value === '') {
                setEngineAIMode(false);
                input.placeholder = "Search and ask anything";
            }
        });
    });

    if (heroSearchBtn) {
        heroSearchBtn.onclick = () => {
            const heroInput = document.getElementById('heroSearchInput');
            if (heroInput) {
                const val = heroInput.value.trim();
                if (isAIModeActive || val.toLowerCase().startsWith('/a ') || val.toLowerCase() === '/a') {
                    const query = val.replace(/^\/a\s*/i, '').trim();
                    heroInput.value = '';
                    setEngineAIMode(false);
                    if (aiTerminal) {
                        aiTerminal.open(query);
                    }
                    return;
                }
                doSearch(val);
            }
        };
    }

    // Click on clock layer triggers morph and focuses search
    const clockLayer = document.getElementById('heroClockLayer');
    if (clockLayer && heroZone) {
        clockLayer.onclick = () => {
            heroZone.classList.add('active-search');
            const heroInput = document.getElementById('heroSearchInput');
            if (heroInput) heroInput.focus();
        };
    }

    // Global shortcut: Press '/' or 'Ctrl+K'
    window.addEventListener('keydown', (e) => {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;

        if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
            e.preventDefault();
            if (heroZone) heroZone.classList.add('active-search');
            const heroInput = document.getElementById('heroSearchInput') || document.querySelector('.search-input');
            if (heroInput) {
                heroInput.focus();
                heroInput.select();
            }
        }
    });
};

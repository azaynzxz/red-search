import { SEARCH_ENGINES } from './config.js';
import { state } from './state.js';
import { aiTerminal } from './ai-chat.js';

export const initSearch = () => {
    const engineMenu = document.getElementById('engineMenu');
    const engineTrigger = document.getElementById('engineTrigger');
    const currentEngineIcon = document.getElementById('currentEngineIcon');
    const currentEngineName = document.getElementById('currentEngineName');
    const heroZone = document.getElementById('heroInteractiveZone');
    const aiModeBadge = document.getElementById('aiModeBadge');
    const heroSearchBtn = document.getElementById('heroSearchBtn');

    // Populate engine selector
    if (engineMenu) {
        engineMenu.innerHTML = '';
        Object.entries(SEARCH_ENGINES).forEach(([key, engine]) => {
            const opt = document.createElement('div');
            opt.className = `engine-option ${key === state.engine ? 'selected' : ''}`;
            opt.dataset.engine = key;
            opt.innerHTML = `<span class="material-icons" style="font-size:16px;">${engine.icon}</span> ${engine.name}`;
            opt.onclick = () => {
                state.setEngine(key);
                engineMenu.classList.remove('active');
            };
            engineMenu.appendChild(opt);
        });
    }

    const updateEngineUI = (key) => {
        const engine = SEARCH_ENGINES[key] || SEARCH_ENGINES.google;
        if (currentEngineIcon) currentEngineIcon.textContent = engine.icon;
        if (currentEngineName) currentEngineName.textContent = engine.name;
        document.querySelectorAll('.engine-option').forEach(o => {
            o.classList.toggle('selected', o.dataset.engine === key);
        });
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
            if (input) doSearch(input.value);
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

            // Detect /a AI query mode
            const isAIMode = val.toLowerCase().startsWith('/a ') || val.toLowerCase() === '/a';
            if (aiModeBadge) {
                aiModeBadge.style.display = isAIMode ? 'inline-flex' : 'none';
            }
            if (isAIMode) {
                input.placeholder = "Ask Gemini 3.5 anything (Enter to submit)...";
            } else {
                input.placeholder = "Search the web (or type '/a' for Gemini AI)...";
            }

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
            if (heroZone && input.value.trim().length === 0) {
                heroZone.classList.remove('active-search');
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = input.value.trim();
                if (val.toLowerCase().startsWith('/a ') || val.toLowerCase() === '/a') {
                    e.preventDefault();
                    const query = val.replace(/^\/a\s*/i, '').trim();
                    if (aiTerminal) {
                        aiTerminal.open(query);
                    }
                    return;
                }
                doSearch(val);
            }
        });
    });

    if (heroSearchBtn) {
        heroSearchBtn.onclick = () => {
            const heroInput = document.getElementById('heroSearchInput');
            if (heroInput) {
                const val = heroInput.value.trim();
                if (val.toLowerCase().startsWith('/a ') || val.toLowerCase() === '/a') {
                    const query = val.replace(/^\/a\s*/i, '').trim();
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

/**
 * DRAGGABLE WIDGET WINDOWS & MINI-APPS
 * Weather, Notes, Todo, Calculator, Clock/Pomodoro, Ambient Sounds
 */

import { AMBIENT_SOUNDS } from './config.js';
import { state } from './state.js';
import { syncModularCards } from './layouts.js';
import { aiTerminal } from './ai-chat.js';

export const initWidgets = () => {
    let maxZ = 500;

    // --- WIDGET TOGGLE & LAYERING ---
    const toggleWidget = (id) => {
        if (id === 'ai') {
            if (aiTerminal) aiTerminal.toggle();
            return;
        }

        const el = document.getElementById(`widget-${id}`);
        if (!el) return;

        const isActive = el.classList.contains('active');
        if (!isActive) {
            el.classList.add('active');
            el.style.zIndex = ++maxZ;
            document.querySelector(`.dock-item[data-target="${id}"]`)?.classList.add('active');
        } else {
            // Bring to front
            el.style.zIndex = ++maxZ;
        }
    };

    // Bring to front on mousedown
    document.querySelectorAll('.widget-panel').forEach(panel => {
        panel.addEventListener('mousedown', () => {
            panel.style.zIndex = ++maxZ;
        });
    });

    // Close buttons
    document.querySelectorAll('.close-widget').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const panel = btn.closest('.widget-panel');
            if (panel) {
                panel.classList.remove('active');
                const id = panel.id.replace('widget-', '');
                document.querySelector(`.dock-item[data-target="${id}"]`)?.classList.remove('active');
            }
        };
    });

    // Dock action items click
    document.querySelectorAll('.action-widget').forEach(item => {
        item.onclick = () => toggleWidget(item.dataset.target);
    });

    // --- DRAGGING PHYSICS ---
    let isDragging = false;
    let currentPanel = null;
    let initialX = 0, initialY = 0;

    const dragStart = (e) => {
        if (e.target.classList.contains('close-widget')) return;
        const panel = e.target.closest('.widget-panel');
        if (!panel) return;

        currentPanel = panel;
        const rect = panel.getBoundingClientRect();

        // Enforce top/left positioning
        panel.style.bottom = 'auto';
        panel.style.right = 'auto';
        panel.style.top = rect.top + 'px';
        panel.style.left = rect.left + 'px';
        panel.style.transform = 'none';

        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;

        isDragging = true;
        panel.classList.add('dragging');

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    };

    const drag = (e) => {
        if (isDragging && currentPanel) {
            e.preventDefault();
            const x = Math.max(10, Math.min(window.innerWidth - 80, e.clientX - initialX));
            const y = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - initialY));
            currentPanel.style.left = x + 'px';
            currentPanel.style.top = y + 'px';
        }
    };

    const dragEnd = () => {
        if (!currentPanel) return;
        isDragging = false;
        currentPanel.classList.remove('dragging');
        currentPanel = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
    };

    document.querySelectorAll('.widget-header').forEach(header => {
        header.addEventListener('mousedown', dragStart);
    });

    // --- 1. WEATHER WIDGET ---
    const cityInput = document.getElementById('cityInput');
    const weatherLoc = document.getElementById('weatherLoc');
    const weatherTemp = document.getElementById('weatherTemp');

    const loadWeather = (city) => {
        if (!city) return;
        if (weatherLoc) weatherLoc.textContent = city;
        const temp = Math.floor(Math.random() * (30 - 18) + 18) + "°";
        if (weatherTemp) weatherTemp.textContent = temp;
        localStorage.setItem('weather_temp', temp);
        state.setWeatherCity(city);
        syncModularCards();
    };

    if (cityInput) {
        cityInput.value = state.weatherCity;
        if (state.weatherCity) loadWeather(state.weatherCity);
        cityInput.addEventListener('change', () => loadWeather(cityInput.value.trim()));
    }

    // --- 2. NOTES WIDGET ---
    const notesArea = document.getElementById('notesArea');
    if (notesArea) {
        notesArea.value = state.notes;
        notesArea.addEventListener('input', () => {
            state.setNotes(notesArea.value);
            syncModularCards();
        });
    }

    // --- 3. TO-DO WIDGET ---
    const todoList = document.getElementById('todoList');
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');

    const renderTodos = () => {
        if (!todoList) return;
        todoList.innerHTML = '';

        const active = state.todos.filter(t => !t.done);
        const completed = state.todos.filter(t => t.done);

        if (active.length > 0) {
            const h = document.createElement('div');
            h.style.cssText = 'font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;';
            h.textContent = `Pending (${active.length})`;
            todoList.appendChild(h);
            active.forEach(t => todoList.appendChild(createTodoItem(t)));
        }

        if (completed.length > 0) {
            const h = document.createElement('div');
            h.style.cssText = 'font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin:16px 0 8px 0; text-transform:uppercase; letter-spacing:0.5px; border-top:1px solid var(--glass-border); padding-top:10px;';
            h.textContent = `Completed (${completed.length})`;
            todoList.appendChild(h);
            completed.forEach(t => todoList.appendChild(createTodoItem(t)));
        }

        syncModularCards();
    };

    const createTodoItem = (t) => {
        const item = document.createElement('div');
        item.className = `todo-item ${t.done ? 'completed' : ''}`;

        const check = document.createElement('div');
        check.className = `todo-check ${t.done ? 'checked' : ''}`;
        check.innerHTML = `<span class="material-icons" style="font-size:13px; color:#fff;">check</span>`;

        const text = document.createElement('span');
        text.style.cssText = 'flex:1; cursor:pointer; font-size:0.9rem;';
        text.textContent = t.text;

        const del = document.createElement('span');
        del.className = 'material-icons';
        del.style.cssText = 'cursor:pointer; opacity:0.4; font-size:16px; transition:opacity 0.2s;';
        del.textContent = 'delete';
        del.onmouseenter = () => del.style.opacity = '1';
        del.onmouseleave = () => del.style.opacity = '0.4';

        const toggle = (e) => {
            e.stopPropagation();
            const updated = state.todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x);
            state.setTodos(updated);
            renderTodos();
        };

        check.onclick = toggle;
        text.onclick = toggle;

        del.onclick = (e) => {
            e.stopPropagation();
            const updated = state.todos.filter(x => x.id !== t.id);
            state.setTodos(updated);
            renderTodos();
        };

        item.appendChild(check);
        item.appendChild(text);
        item.appendChild(del);
        return item;
    };

    if (addTodoBtn && todoInput) {
        const handleAdd = () => {
            const val = todoInput.value.trim();
            if (val) {
                const updated = [...state.todos, { text: val, done: false, id: Date.now() }];
                state.setTodos(updated);
                todoInput.value = '';
                renderTodos();
            }
        };

        addTodoBtn.onclick = handleAdd;
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAdd();
        });
    }

    renderTodos();

    // --- 4. CALCULATOR WIDGET ---
    const calcDisplay = document.getElementById('calcDisplay');
    const calcKeys = document.getElementById('calcKeys');
    const keys = ['C', '%', '/', '*', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'];
    let calcExp = '';

    if (calcKeys && calcDisplay) {
        calcKeys.innerHTML = '';
        keys.forEach(k => {
            const btn = document.createElement('button');
            btn.className = 'calc-btn' + (['C', '=', '/', '*', '-', '+'].includes(k) ? ' accent' : '');
            btn.textContent = k;
            btn.onclick = () => {
                if (k === 'C') calcExp = '';
                else if (k === '=') {
                    try {
                        calcExp = Function('"use strict";return (' + calcExp + ')')().toString();
                    } catch {
                        calcExp = 'Error';
                    }
                } else {
                    calcExp += k;
                }
                calcDisplay.textContent = calcExp || '0';
            };
            calcKeys.appendChild(btn);
        });
    }

    // --- 5. CLOCK TABS (POMODORO, TIMER, STOPWATCH) ---
    document.querySelectorAll('.clock-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.clock-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.clock-view').forEach(v => v.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`view-${tab.dataset.tab}`)?.classList.add('active');
        };
    });

    // Pomodoro
    let pomoInt, pomoTime = 1500, pomoTotal = 1500, pomoRun = false;
    const timerDisplay = document.getElementById('timerDisplay');
    const timerCircle = document.getElementById('timerCircle');
    const timerStartBtn = document.getElementById('timerStartBtn');
    const timerResetBtn = document.getElementById('timerResetBtn');

    const updatePomo = () => {
        const m = Math.floor(pomoTime / 60).toString().padStart(2, '0');
        const s = (pomoTime % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${m}:${s}`;
        if (timerCircle) {
            timerCircle.style.setProperty('--progress', `${((pomoTotal - pomoTime) / pomoTotal) * 100}%`);
        }
    };

    if (timerStartBtn) {
        timerStartBtn.onclick = function () {
            if (pomoRun) {
                clearInterval(pomoInt);
                this.textContent = 'Start';
            } else {
                pomoInt = setInterval(() => {
                    if (pomoTime > 0) {
                        pomoTime--;
                        updatePomo();
                    } else {
                        clearInterval(pomoInt);
                        pomoRun = false;
                        this.textContent = 'Start';
                    }
                }, 1000);
                this.textContent = 'Pause';
            }
            pomoRun = !pomoRun;
        };
    }

    if (timerResetBtn) {
        timerResetBtn.onclick = () => {
            clearInterval(pomoInt);
            pomoRun = false;
            if (timerStartBtn) timerStartBtn.textContent = 'Start';
            pomoTime = pomoTotal;
            updatePomo();
        };
    }

    document.querySelectorAll('.mode-btn').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
            pomoTotal = parseInt(b.dataset.time, 10) * 60;
            pomoTime = pomoTotal;
            updatePomo();
            if (pomoRun && timerResetBtn) timerResetBtn.click();
        };
    });

    // Custom Timer
    let ctInt, ctTotal = 0, ctLeft = 0, ctRun = false;
    const ctDisplay = document.getElementById('customTimerDisplay');
    const ctInputs = document.querySelector('.timer-input-group');
    const ctStartBtn = document.getElementById('ctStartBtn');
    const ctResetBtn = document.getElementById('ctResetBtn');

    const updateCt = () => {
        const h = Math.floor(ctLeft / 3600).toString().padStart(2, '0');
        const m = Math.floor((ctLeft % 3600) / 60).toString().padStart(2, '0');
        const s = (ctLeft % 60).toString().padStart(2, '0');
        if (ctDisplay) ctDisplay.textContent = `${h}:${m}:${s}`;
    };

    if (ctStartBtn) {
        ctStartBtn.onclick = function () {
            if (ctRun) {
                clearInterval(ctInt);
                ctRun = false;
                this.textContent = 'Resume';
            } else {
                if (ctLeft === 0 && this.textContent !== 'Resume') {
                    const h = parseInt(document.getElementById('tHours')?.value || 0, 10);
                    const m = parseInt(document.getElementById('tMins')?.value || 0, 10);
                    const s = parseInt(document.getElementById('tSecs')?.value || 0, 10);
                    ctTotal = (h * 3600) + (m * 60) + s;
                    ctLeft = ctTotal;
                    if (ctTotal <= 0) return;

                    if (ctInputs) ctInputs.style.display = 'none';
                    if (ctDisplay) ctDisplay.style.display = 'block';
                    updateCt();
                }

                ctInt = setInterval(() => {
                    if (ctLeft > 0) {
                        ctLeft--;
                        updateCt();
                    } else {
                        clearInterval(ctInt);
                        ctRun = false;
                        this.textContent = 'Start';
                        if (ctDisplay) ctDisplay.style.display = 'none';
                        if (ctInputs) ctInputs.style.display = 'flex';
                    }
                }, 1000);
                ctRun = true;
                this.textContent = 'Pause';
            }
        };
    }

    if (ctResetBtn) {
        ctResetBtn.onclick = () => {
            clearInterval(ctInt);
            ctRun = false;
            ctLeft = 0;
            if (ctStartBtn) ctStartBtn.textContent = 'Start';
            if (ctDisplay) ctDisplay.style.display = 'none';
            if (ctInputs) ctInputs.style.display = 'flex';
            document.querySelectorAll('.timer-input').forEach(i => i.value = '');
        };
    }

    // Stopwatch
    let swInt, swTime = 0, swRun = false;
    const swDisplay = document.getElementById('swDisplay');
    const swStartBtn = document.getElementById('swStartBtn');
    const swResetBtn = document.getElementById('swResetBtn');

    const updateSw = () => {
        const m = Math.floor(swTime / 6000).toString().padStart(2, '0');
        const s = Math.floor((swTime % 6000) / 100).toString().padStart(2, '0');
        const ms = (swTime % 100).toString().padStart(2, '0');
        if (swDisplay) swDisplay.textContent = `${m}:${s}.${ms}`;
    };

    if (swStartBtn) {
        swStartBtn.onclick = function () {
            if (swRun) {
                clearInterval(swInt);
                this.textContent = 'Start';
            } else {
                swInt = setInterval(() => {
                    swTime++;
                    updateSw();
                }, 10);
                this.textContent = 'Pause';
            }
            swRun = !swRun;
        };
    }

    if (swResetBtn) {
        swResetBtn.onclick = () => {
            clearInterval(swInt);
            swRun = false;
            swTime = 0;
            if (swStartBtn) swStartBtn.textContent = 'Start';
            updateSw();
        };
    }

    // --- 6. AMBIENT SOUNDS ---
    const soundCards = document.querySelectorAll('.sound-card');
    const audios = {};

    soundCards.forEach(card => {
        const soundType = card.dataset.sound;
        if (!AMBIENT_SOUNDS[soundType]) return;

        const audio = new Audio(AMBIENT_SOUNDS[soundType]);
        audio.loop = true;
        audios[soundType] = audio;

        const slider = card.querySelector('.vol-slider');
        if (slider) {
            slider.oninput = (e) => {
                e.stopPropagation();
                audio.volume = parseFloat(e.target.value);
            };
        }

        card.onclick = (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (card.classList.contains('active')) {
                audio.pause();
                card.classList.remove('active');
            } else {
                audio.play().catch(e => console.warn("Audio playback notice:", e));
                card.classList.add('active');
            }
        };
    });

    return { toggleWidget };
};

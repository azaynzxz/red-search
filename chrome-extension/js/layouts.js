/**
 * LAYOUT VARIATIONS ENGINE (CENTER, SPLIT, BENTO)
 */

import { LAYOUTS } from './config.js';
import { state } from './state.js';

export const applyLayout = (layoutId) => {
    const layout = LAYOUTS.find(l => l.id === layoutId) || LAYOUTS[0];
    document.body.setAttribute('data-layout', layout.id);

    // Update active layout cards in Customization Studio
    document.querySelectorAll('.layout-card').forEach(card => {
        card.classList.toggle('active', card.dataset.layoutId === layout.id);
    });

    syncModularCards();
};

export const syncModularCards = () => {
    // 1. Sync Bento & Split Weather
    const weatherLoc = state.weatherCity || 'Local';
    const weatherTemp = localStorage.getItem('weather_temp') || '--°';
    const splitWeather = document.getElementById('splitWeatherDisplay');
    const bentoWeather = document.getElementById('bentoWeatherDisplay');

    if (splitWeather) splitWeather.textContent = `${weatherTemp} in ${weatherLoc}`;
    if (bentoWeather) bentoWeather.textContent = `${weatherTemp} • ${weatherLoc}`;

    // 2. Sync Bento Notes
    const bentoNotes = document.getElementById('bentoNotesSnippet');
    if (bentoNotes) {
        bentoNotes.textContent = state.notes ? state.notes.slice(0, 120) + (state.notes.length > 120 ? '...' : '') : 'No notes yet. Click to write...';
    }

    // 3. Sync Bento Todo Count
    const bentoTodoCount = document.getElementById('bentoTodoCounter');
    if (bentoTodoCount) {
        const activeCount = state.todos.filter(t => !t.done).length;
        bentoTodoCount.textContent = activeCount.toString();
    }
};

export const initLayouts = (toggleWidget) => {
    // Initial apply
    applyLayout(state.layout);

    // Subscribe to layout changes
    state.subscribe('layout', (newLayout) => {
        applyLayout(newLayout);
    });

    // Populate Layouts Tab in Customization Studio
    const grid = document.getElementById('layoutsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    LAYOUTS.forEach(l => {
        const card = document.createElement('div');
        card.className = `layout-card ${l.id === state.layout ? 'active' : ''}`;
        card.dataset.layoutId = l.id;

        card.innerHTML = `
            <div class="layout-wireframe">
                <span class="material-icons" style="font-size:32px;">${l.icon}</span>
            </div>
            <div class="layout-card-title">${l.name}</div>
            <div class="layout-card-desc">${l.desc}</div>
        `;

        card.onclick = () => {
            state.setLayout(l.id);
        };

        grid.appendChild(card);
    });

    // Wire clicks on Bento cards to open full widget modals
    const bentoWeatherCard = document.getElementById('bentoCardWeather');
    if (bentoWeatherCard) bentoWeatherCard.onclick = () => toggleWidget('weather');

    const bentoNotesCard = document.getElementById('bentoCardNotes');
    if (bentoNotesCard) bentoNotesCard.onclick = () => toggleWidget('notes');

    const bentoTodoCard = document.getElementById('bentoCardTodo');
    if (bentoTodoCard) bentoTodoCard.onclick = () => toggleWidget('todo');

    const bentoSoundsCard = document.getElementById('bentoCardSounds');
    if (bentoSoundsCard) bentoSoundsCard.onclick = () => toggleWidget('sounds');

    // Subscribe to state changes that affect bento cards
    state.subscribe('notes', () => syncModularCards());
    state.subscribe('todos', () => syncModularCards());
    state.subscribe('weatherCity', () => syncModularCards());
};

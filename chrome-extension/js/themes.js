/**
 * THEME ENGINE & ENERGETIC PARTICLE SYSTEM
 */

import { THEMES } from './config.js';
import { state } from './state.js';

export const applyTheme = (themeId) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    document.body.setAttribute('data-theme', theme.id);

    // Dynamic High-Velocity Particle Network
    if (window.particlesJS) {
        try {
            window.particlesJS('particles-js', {
                particles: {
                    number: { value: 95, density: { enable: true, value_area: 800 } },
                    color: { value: theme.particleColor },
                    shape: { type: 'circle' },
                    opacity: { value: 0.65, random: true },
                    size: { value: 3.8, random: true },
                    line_linked: {
                        enable: true,
                        distance: 145,
                        color: theme.particleLine,
                        opacity: 0.45,
                        width: 1.2
                    },
                    move: {
                        enable: true,
                        speed: 4.2, // Fast, lively, responsive flow!
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: 'window',
                    events: {
                        onhover: { enable: true, mode: 'grab' },
                        onclick: { enable: true, mode: 'push' }
                    },
                    modes: {
                        grab: { distance: 220, line_linked: { opacity: 0.95, width: 2 } },
                        push: { particles_nb: 4 }
                    }
                },
                retina_detect: true
            });
        } catch (e) {
            console.warn("Particles.js update notice:", e);
        }
    }

    // Update active theme card indicator
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.themeId === theme.id);
    });
};

export const initThemes = () => {
    applyTheme(state.theme);

    state.subscribe('theme', (newThemeId) => {
        applyTheme(newThemeId);
    });

    const grid = document.getElementById('themesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    THEMES.forEach(theme => {
        const card = document.createElement('div');
        card.className = `theme-card ${theme.id === state.theme ? 'active' : ''}`;
        card.dataset.themeId = theme.id;

        const dotsHtml = theme.dots.map(d => `<div class="swatch-dot" style="background:${d}"></div>`).join('');

        card.innerHTML = `
            <div class="theme-preview-swatch" style="background: ${theme.swatchBg}">
                <div class="swatch-dots">${dotsHtml}</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="theme-title">${theme.name}</div>
                ${theme.id === state.theme ? '<span class="material-icons" style="color:var(--accent-color); font-size:16px;">check</span>' : ''}
            </div>
        `;

        card.onclick = () => {
            state.setTheme(theme.id);
            initThemes();
        };

        grid.appendChild(card);
    });
};

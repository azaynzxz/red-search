/**
 * SEARCH PORTAL - MAIN APPLICATION ENTRY POINT
 * Liquid Glass, Multi-Engine Backgrounds & Modular Physics Dock
 */

import { state } from './state.js';
import { initThemes } from './themes.js';
import { initWidgets } from './widgets.js';
import { initDock } from './dock.js';
import { initSearch } from './search.js';
import { initClock } from './clock.js';
import { initLayouts } from './layouts.js';
import { initScreensaver } from './screensaver.js';
import { backgroundManager } from './backgrounds.js';

document.addEventListener('DOMContentLoaded', () => {
    // Clean up any stale legacy focus banners
    const staleBanner = document.getElementById('focusBanner') || document.querySelector('.focus-banner');
    if (staleBanner) staleBanner.remove();

    // 1. Service Worker Registration & Live Update
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(reg => {
            reg.update();
        }).catch(err => {
            console.warn("SW registration notice:", err);
        });
    }

    // 2. Initialize Background Engines
    backgroundManager.init();

    // 3. Initialize Widgets & Capture Controller
    const { toggleWidget } = initWidgets();

    // 4. Initialize Core Visual & Logic Engines
    initThemes();
    initDock(toggleWidget);
    initSearch();
    initClock();
    initLayouts(toggleWidget);
    initScreensaver();

    // 5. Consolidated Settings Modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsBackdrop = document.getElementById('settingsBackdrop');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const settingsTabs = document.querySelectorAll('.settings-tab');

    const openSettings = () => {
        if (settingsModal && settingsBackdrop) {
            settingsModal.classList.add('active');
            settingsBackdrop.classList.add('active');
        }
    };

    const closeSettings = () => {
        if (settingsModal && settingsBackdrop) {
            settingsModal.classList.remove('active');
            settingsBackdrop.classList.remove('active');
        }
    };

    if (settingsBtn) settingsBtn.onclick = openSettings;
    if (closeSettingsBtn) closeSettingsBtn.onclick = closeSettings;
    if (settingsBackdrop) settingsBackdrop.onclick = closeSettings;

    // Tabs inside Settings
    settingsTabs.forEach(tab => {
        tab.onclick = () => {
            settingsTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-view').forEach(v => v.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(`view-${tab.dataset.tab}`);
            if (target) target.classList.add('active');
        };
    });

    // Background Animation Engine Selection
    document.querySelectorAll('.bg-engine-card').forEach(card => {
        card.onclick = () => {
            backgroundManager.setEngine(card.dataset.engine);
        };
    });

    // 6. Focus Mode Trigger
    const focusBtn = document.getElementById('prefFocusToggle');
    const mainContainer = document.getElementById('mainContainer');
    const dockWrapper = document.getElementById('dockWrapper');
    const meshBg = document.getElementById('meshBg');

    const toggleFocusMode = () => {
        state.setFocusMode(!state.focusMode);
        const topNav = document.querySelector('.top-nav-bar');
        const legacyBanner = document.getElementById('focusBanner') || document.querySelector('.focus-banner');
        if (legacyBanner) legacyBanner.remove();

        if (state.focusMode) {
            document.body.classList.add('focus-mode-active');
            if (mainContainer) mainContainer.classList.add('hidden');
            if (dockWrapper) dockWrapper.classList.add('hidden');
            if (settingsBtn) {
                settingsBtn.style.display = 'none';
                settingsBtn.style.opacity = '0';
                settingsBtn.style.pointerEvents = 'none';
                settingsBtn.style.visibility = 'hidden';
            }
            if (topNav) {
                topNav.style.display = 'none';
                topNav.style.pointerEvents = 'none';
            }
            document.querySelectorAll('.widget-panel').forEach(p => p.classList.remove('active'));
            closeSettings();
            if (meshBg) meshBg.style.filter = 'grayscale(1) brightness(0.35)';
            if (focusBtn) focusBtn.textContent = 'Active';
        } else {
            document.body.classList.remove('focus-mode-active');
            if (mainContainer) mainContainer.classList.remove('hidden');
            if (dockWrapper) dockWrapper.classList.remove('hidden');
            if (settingsBtn) {
                settingsBtn.style.display = '';
                settingsBtn.style.opacity = '';
                settingsBtn.style.pointerEvents = '';
                settingsBtn.style.visibility = '';
            }
            if (topNav) {
                topNav.style.display = '';
                topNav.style.pointerEvents = '';
            }
            if (meshBg) meshBg.style.filter = 'none';
            if (focusBtn) focusBtn.textContent = 'Disabled';
        }
    };

    if (focusBtn) focusBtn.onclick = toggleFocusMode;

    // Screensaver manual trigger from settings
    const prefScreensaverBtn = document.getElementById('prefScreensaverTrigger');
    if (prefScreensaverBtn) {
        prefScreensaverBtn.onclick = () => {
            closeSettings();
            document.body.classList.add('screensaver-active');
        };
    }

    // Hotkey 'F' for focus mode
    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;

        if (e.key.toLowerCase() === 'f') {
            e.preventDefault();
            toggleFocusMode();
        }
    });
});

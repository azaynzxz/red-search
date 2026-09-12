/**
 * IDLE SCREENSAVER MODULE
 */

import { state } from './state.js';

export const initScreensaver = () => {
    const IDLE_LIMIT = 60000; // 60 seconds
    let idleTimeout = null;
    const body = document.body;

    const activateScreensaver = () => {
        if (!state.focusMode) {
            body.classList.add('screensaver-active');
        }
    };

    const deactivateScreensaver = () => {
        if (body.classList.contains('screensaver-active')) {
            body.classList.remove('screensaver-active');
        }
    };

    const resetIdleTimer = () => {
        deactivateScreensaver();
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(activateScreensaver, IDLE_LIMIT);
    };

    // Manual screensaver launcher button in top nav
    const manualBtn = document.getElementById('screensaverBtn');
    if (manualBtn) {
        manualBtn.onclick = (e) => {
            e.stopPropagation();
            activateScreensaver();
        };
    }

    // Activity events
    ['mousemove', 'keypress', 'touchstart', 'click', 'scroll'].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();
};

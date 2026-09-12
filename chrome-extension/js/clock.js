/**
 * CLOCK, DATE, GREETING & TIME FORMAT MODULE
 * Editorial Condensed Typography Support (No AM/PM text)
 */

import { state } from './state.js';

export const initClock = () => {
    const clockDisplays = document.querySelectorAll('.hero-clock-display, .clock-time');
    const heroDate = document.getElementById('heroDate');
    const topDateLabel = document.getElementById('topDateLabel');
    const greetingElements = document.querySelectorAll('.greeting');
    const prefTimeFormatToggle = document.getElementById('prefTimeFormatToggle');

    const updateClock = () => {
        const now = new Date();
        const hours24 = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');

        // Formatted Time (Clean: no trailing AM/PM text)
        let timeStr = '';
        if (state.timeFormat24) {
            timeStr = `${hours24.toString().padStart(2, '0')}:${minutes}`;
        } else {
            const h12 = hours24 % 12 || 12;
            timeStr = `${h12}:${minutes}`;
        }

        clockDisplays.forEach(el => {
            el.textContent = timeStr;
        });

        // Hero Date (e.g. "Sat, Sep 12" matching reference)
        if (heroDate) {
            heroDate.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }

        // Top Navigation Date
        if (topDateLabel) {
            topDateLabel.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }

        // Greetings
        let greeting = 'Good Evening';
        if (hours24 >= 4 && hours24 < 12) greeting = 'Good Morning';
        else if (hours24 >= 12 && hours24 < 17) greeting = 'Good Afternoon';
        else if (hours24 >= 17 && hours24 < 22) greeting = 'Good Evening';
        else greeting = 'Late Night Focus';

        greetingElements.forEach(el => {
            el.textContent = greeting;
        });

        // Settings toggle text
        if (prefTimeFormatToggle) {
            prefTimeFormatToggle.textContent = state.timeFormat24 ? '24 Hours' : '12 Hours';
        }
    };

    if (prefTimeFormatToggle) {
        prefTimeFormatToggle.onclick = () => {
            state.toggleTimeFormat();
            updateClock();
        };
    }

    state.subscribe('timeFormat', () => updateClock());

    setInterval(updateClock, 1000);
    updateClock();
};

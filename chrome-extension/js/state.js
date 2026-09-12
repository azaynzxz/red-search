/**
 * CENTRAL APPLICATION STATE & LOCALSTORAGE PERSISTENCE
 */

import { DEFAULT_PINNED_APPS } from './config.js';

class AppState {
    constructor() {
        this.listeners = new Map();

        // Initialize state from localStorage with safe fallbacks
        this.theme = localStorage.getItem('app_theme') || 'crimson';
        this.layout = localStorage.getItem('app_layout') || 'center';
        this.engine = localStorage.getItem('s_engine') || 'google';
        this.timeFormat24 = localStorage.getItem('time_format_24') !== 'false'; // default 24h
        this.focusMode = false;
        this.weatherCity = localStorage.getItem('weather_city') || '';
        this.notes = localStorage.getItem('notes_content') || '';

        try {
            const rawTodos = localStorage.getItem('todos');
            this.todos = rawTodos ? JSON.parse(rawTodos) : [];
            // Ensure IDs
            this.todos = this.todos.map(t => ({ ...t, id: t.id || Date.now() + Math.random() }));
        } catch {
            this.todos = [];
        }

        try {
            const rawApps = localStorage.getItem('pinned_apps');
            this.pinnedApps = rawApps ? JSON.parse(rawApps) : DEFAULT_PINNED_APPS;
            if (!Array.isArray(this.pinnedApps) || this.pinnedApps.length === 0) {
                this.pinnedApps = [...DEFAULT_PINNED_APPS];
            }
        } catch {
            this.pinnedApps = [...DEFAULT_PINNED_APPS];
        }
    }

    subscribe(property, callback) {
        if (!this.listeners.has(property)) {
            this.listeners.set(property, new Set());
        }
        this.listeners.get(property).add(callback);
    }

    notify(property, value) {
        if (this.listeners.has(property)) {
            for (const cb of this.listeners.get(property)) {
                try {
                    cb(value);
                } catch (err) {
                    console.error(`Error in state subscriber for ${property}:`, err);
                }
            }
        }
    }

    setTheme(themeId) {
        this.theme = themeId;
        localStorage.setItem('app_theme', themeId);
        this.notify('theme', themeId);
    }

    setLayout(layoutId) {
        this.layout = layoutId;
        localStorage.setItem('app_layout', layoutId);
        this.notify('layout', layoutId);
    }

    setEngine(engineKey) {
        this.engine = engineKey;
        localStorage.setItem('s_engine', engineKey);
        this.notify('engine', engineKey);
    }

    toggleTimeFormat() {
        this.timeFormat24 = !this.timeFormat24;
        localStorage.setItem('time_format_24', this.timeFormat24.toString());
        this.notify('timeFormat', this.timeFormat24);
        return this.timeFormat24;
    }

    setFocusMode(active) {
        this.focusMode = active;
        this.notify('focusMode', active);
    }

    setWeatherCity(city) {
        this.weatherCity = city;
        localStorage.setItem('weather_city', city);
        this.notify('weatherCity', city);
    }

    setNotes(content) {
        this.notes = content;
        localStorage.setItem('notes_content', content);
        this.notify('notes', content);
    }

    setTodos(todosList) {
        this.todos = todosList;
        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.notify('todos', this.todos);
    }

    setPinnedApps(apps) {
        this.pinnedApps = apps;
        try {
            localStorage.setItem('pinned_apps', JSON.stringify(this.pinnedApps));
        } catch (e) {
            console.error("Failed to save apps to localStorage", e);
        }
        this.notify('pinnedApps', this.pinnedApps);
    }
}

export const state = new AppState();

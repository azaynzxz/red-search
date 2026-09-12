/**
 * CONFIGURATION & CONSTANTS
 */

export const DEFAULT_PINNED_APPS = [
    { name: 'Gmail', url: 'https://mail.google.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'X / Twitter', url: 'https://x.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'ChatGPT', url: 'https://chatgpt.com' }
];

export const SEARCH_ENGINES = {
    google: { url: "https://www.google.com/search?q=", icon: "search", name: "Google" },
    bing: { url: "https://www.bing.com/search?q=", icon: "search", name: "Bing" },
    duckduckgo: { url: "https://duckduckgo.com/?q=", icon: "security", name: "DuckDuckGo" },
    youtube: { url: "https://www.youtube.com/results?search_query=", icon: "play_circle", name: "YouTube" },
    wikipedia: { url: "https://en.wikipedia.org/wiki/Special:Search?search=", icon: "menu_book", name: "Wikipedia" },
    reddit: { url: "https://www.reddit.com/search/?q=", icon: "forum", name: "Reddit" },
    github: { url: "https://github.com/search?q=", icon: "code", name: "GitHub" }
};

export const AMBIENT_SOUNDS = {
    rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    cafe: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    fire: 'https://cdn.freesound.org/previews/209/209651_3464493-lq.mp3',
    wind: 'https://cdn.freesound.org/previews/654/654566_691380-lq.mp3'
};

export const THEMES = [
    {
        id: 'crimson',
        name: 'Crimson Eclipse',
        desc: 'Deep ruby glow & obsidian black luxury',
        accent: '#e50914',
        particleColor: '#e50914',
        particleLine: '#aa0000',
        swatchBg: 'linear-gradient(135deg, #180202 0%, #4a0000 100%)',
        dots: ['#e50914', '#ffffff', '#220000']
    },
    {
        id: 'obsidian',
        name: 'Cyber Obsidian',
        desc: 'Pure OLED black, titanium & ice glass',
        accent: '#ffffff',
        particleColor: '#ffffff',
        particleLine: '#666666',
        swatchBg: 'linear-gradient(135deg, #000000 0%, #252525 100%)',
        dots: ['#ffffff', '#888888', '#111111']
    },
    {
        id: 'cyberpunk',
        name: 'Neon Cyberpunk',
        desc: 'Neo-Tokyo synthwave violet & electric cyan',
        accent: '#00f0ff',
        particleColor: '#00f0ff',
        particleLine: '#ff007f',
        swatchBg: 'linear-gradient(135deg, #070312 0%, #2f0d4a 100%)',
        dots: ['#00f0ff', '#ff007f', '#8c00ff']
    },
    {
        id: 'aurora',
        name: 'Nordic Aurora',
        desc: 'Emerald borealis & deep arctic night',
        accent: '#00e699',
        particleColor: '#00e699',
        particleLine: '#00b4d8',
        swatchBg: 'linear-gradient(135deg, #020c0e 0%, #083b38 100%)',
        dots: ['#00e699', '#00b4d8', '#021815']
    },
    {
        id: 'sunset',
        name: 'Sunset Mirage',
        desc: 'Twilight plum, golden amber & rose gold',
        accent: '#ff6b4a',
        particleColor: '#ff6b4a',
        particleLine: '#ff2a7a',
        swatchBg: 'linear-gradient(135deg, #10030c 0%, #4d152a 100%)',
        dots: ['#ff6b4a', '#ff2a7a', '#ffbe32']
    },
    {
        id: 'ocean',
        name: 'Deep Ocean',
        desc: 'Abyssal navy & bioluminescent electric cyan',
        accent: '#00b4d8',
        particleColor: '#00b4d8',
        particleLine: '#0077b6',
        swatchBg: 'linear-gradient(135deg, #020713 0%, #0c2b5c 100%)',
        dots: ['#00d2ff', '#0077b6', '#031024']
    },
    {
        id: 'daylight',
        name: 'Frosted Daylight',
        desc: 'Modern frosted paper glass & crisp slate',
        accent: '#4f46e5',
        particleColor: '#4f46e5',
        particleLine: '#94a3b8',
        swatchBg: 'linear-gradient(135deg, #edf2f7 0%, #cbd5e1 100%)',
        dots: ['#4f46e5', '#ec4899', '#0f172a']
    },
    {
        id: 'matrix',
        name: 'Matrix Green',
        desc: 'Retro-futuristic phosphor cyber terminal',
        accent: '#00ff66',
        particleColor: '#00ff66',
        particleLine: '#00aa44',
        swatchBg: 'linear-gradient(135deg, #020904 0%, #092e0f 100%)',
        dots: ['#00ff66', '#00aa44', '#020904']
    }
];

export const LAYOUTS = [
    {
        id: 'center',
        name: 'Minimalist Center',
        desc: 'Hero centered clock, focus search bar, and floating dock.',
        icon: 'filter_center_focus'
    },
    {
        id: 'split',
        name: 'Studio Split',
        desc: 'Artistic typography on the left, elevated search & widgets on the right.',
        icon: 'view_column'
    },
    {
        id: 'bento',
        name: 'Bento Grid',
        desc: 'Productivity modular cards with live clock, search, weather & tasks.',
        icon: 'dashboard'
    }
];

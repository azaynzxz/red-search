# Version History

## Version 1.2.0 (Built-in Gemini 3.5 AI Terminal)
**Release Date**: September 12, 2026

### Highlights
- 🤖 **Direct Search-Bar Gemini AI Integration**: Type `/a <query>` in the search bar to query Google Gemini 3.5 Flash without redirecting to external websites.
- ⚡ **Sleek Search-to-Terminal Morph Animation**: The search bar smoothly expands into a Sci-Fi CLI / IRC Liquid Glass terminal with specular highlights.
- 💬 **Streaming Token SSE**: Instant real-time response generation with cyber cursor typing and markdown formatting (syntax code blocks with copy button).
- ⚙️ **Secure Key Storage**: API key stored locally in browser `localStorage`, with configuration in Settings modal.
- ⌨️ **CLI Commands**: Terminal supports `/clear`, `/help`, `/exit`, and `/model` commands, with `Esc` quick-exit.

---

## Version 1.1.0 (Modular Liquid Glass & macOS Physics)
**Release Date**: September 12, 2026

### Highlights
- 🪟 **Refined Liquid Glass Aesthetics**: Crisp 6px–10px architectural radii, multi-layer glass highlights, and specular edge refraction (replacing rounded bubble/pill aesthetics).
- 🕒 **Full-Width Hero Clock**: Screen-wide Oswald typography (`clamp(6.5rem, 19vw, 17rem)`) with zero clipping and hover-morph search transition.
- 🍏 **Apple macOS Dock Physics**: Gaussian magnification wave with lateral dispersion (neighboring icons part sideways without layout reflow; zero click bounce).
- 🌌 **4 Dynamic Background Engines**: Cyber Constellation (fast interactive particles), Viral Matrix Rain (digital canvas rain), 3D Warp Starfield (hyperspace canvas), and Quantum Waves.
- ⚙️ **Consolidated Settings & Theme Engine**: 8 curated color themes and integrated engine switcher in a unified settings panel.
- 🧘 **Refined Zen Focus Mode**: Clean distraction-free view that completely hides the settings icon and eliminates on-screen banners.
- 🧱 **Fully Modular Architecture**: Separated into 6 modular CSS files and 11 focused ES modules.

---

## Version 1.0.0 (Initial Release)
**Release Date**: January 31, 2026

### Features
- ✨ Beautiful glassmorphism UI with dark maroon theme
- 🔍 Multi-engine search (Google, Bing, DuckDuckGo, YouTube, Wikipedia)
- 📱 Pinned apps with custom icons and offline caching
- ⏰ Clock widget with Pomodoro, Custom Timer, and Stopwatch
- ✅ To-Do list with Current and Completed tasks sections
- 📝 Auto-saving notes widget
- 🧮 Full-featured calculator
- 🌤️ Weather widget
- 🎵 Ambient sounds (Rain, Cafe, Fire, Wind)
- 🎯 Focus mode (press 'F')
- 🌙 Screensaver mode with particle effects
- 🔒 100% privacy-focused (all data stored locally)
- 📴 Full offline support
- 🎨 Draggable widgets
- ⌨️ Keyboard shortcuts

### Technical Details
- Manifest Version 3
- Service Worker for offline functionality
- LocalStorage for data persistence
- Particles.js for animations
- Material Icons
- Google Fonts (Inter & Orbitron)

### Known Issues
- None reported

---

## Planned Features (Future Versions)

### Version 1.1.0 (Planned)
- [ ] Customizable themes and color schemes
- [ ] Export/Import settings and data
- [ ] More ambient sound options
- [ ] Widget size customization
- [ ] Custom backgrounds support
- [ ] Keyboard shortcut customization

### Version 1.2.0 (Planned)
- [ ] Calendar widget
- [ ] Habit tracker
- [ ] Quote of the day
- [ ] Cryptocurrency prices widget
- [ ] Stock market widget
- [ ] News feed widget

### Version 2.0.0 (Planned)
- [ ] Cloud sync (optional)
- [ ] Multiple profiles
- [ ] Widget marketplace
- [ ] Advanced customization options
- [ ] Mobile companion app
- [ ] Browser sync across devices

---

## Changelog Format

For future updates, follow this format:

```
## Version X.Y.Z
**Release Date**: Month Day, Year

### Added
- New feature descriptions

### Changed
- Modified feature descriptions

### Fixed
- Bug fix descriptions

### Removed
- Deprecated feature descriptions

### Security
- Security update descriptions
```

---

## Update Instructions

When releasing a new version:

1. Update `manifest.json` version number
2. Add changelog entry to this file
3. Update README.md if needed
4. Create new ZIP file
5. Upload to Chrome Web Store
6. Submit for review
7. Announce update to users

---

**Note**: This extension follows [Semantic Versioning](https://semver.org/):
- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

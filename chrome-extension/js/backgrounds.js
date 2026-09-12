/**
 * MULTI-ENGINE BACKGROUND ANIMATION SYSTEM
 * 1. Cyber Constellation (particles.js)
 * 2. Viral Matrix Digital Rain (Canvas)
 * 3. Warp Speed 3D Starfield (Canvas)
 * 4. Quantum Cyber Waves (Canvas)
 */

import { state } from './state.js';
import { THEMES } from './config.js';

class BackgroundManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.currentMode = localStorage.getItem('app_bg_engine') || 'constellation';
        this.particlesContainer = null;
        this.mouseX = 0;
        this.mouseY = 0;

        // Matrix state
        this.matrixDrops = [];
        this.matrixChars = '0123456789ABCDEF日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍXYZ+-*<>';

        // Warp state
        this.stars = [];
        this.numStars = 400;

        // Waves state
        this.waveStep = 0;
    }

    init() {
        this.canvas = document.getElementById('bgCanvas');
        this.particlesContainer = document.getElementById('particles-js');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX - window.innerWidth / 2;
            this.mouseY = e.clientY - window.innerHeight / 2;
        });

        this.setEngine(this.currentMode);
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initMatrixDrops();
        this.initStars();
    }

    setEngine(mode) {
        this.currentMode = mode;
        localStorage.setItem('app_bg_engine', mode);

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (mode === 'constellation') {
            if (this.canvas) this.canvas.style.display = 'none';
            if (this.particlesContainer) this.particlesContainer.style.display = 'block';
        } else {
            if (this.particlesContainer) this.particlesContainer.style.display = 'none';
            if (this.canvas) {
                this.canvas.style.display = 'block';
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.startAnimation(mode);
            }
        }

        // Update UI buttons in Settings
        document.querySelectorAll('.bg-engine-card').forEach(card => {
            card.classList.toggle('active', card.dataset.engine === mode);
        });
    }

    getThemeColors() {
        const theme = THEMES.find(t => t.id === state.theme) || THEMES[0];
        return {
            accent: theme.accent,
            particle: theme.particleColor
        };
    }

    startAnimation(mode) {
        const loop = () => {
            if (this.currentMode === 'matrix') {
                this.renderMatrix();
            } else if (this.currentMode === 'warp') {
                this.renderWarp();
            } else if (this.currentMode === 'waves') {
                this.renderWaves();
            }
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }

    // --- 1. VIRAL MATRIX RAIN ---
    initMatrixDrops() {
        if (!this.canvas) return;
        const columns = Math.floor(this.canvas.width / 18);
        this.matrixDrops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    }

    renderMatrix() {
        const { width, height } = this.canvas;
        const { accent } = this.getThemeColors();

        // Dark translucent fade overlay for trailing effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.font = '14px "JetBrains Mono", monospace';

        const fontSize = 18;
        for (let i = 0; i < this.matrixDrops.length; i++) {
            const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
            const x = i * fontSize;
            const y = this.matrixDrops[i] * fontSize;

            // Leading bright head character
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowColor = accent;
            this.ctx.shadowBlur = 8;
            this.ctx.fillText(char, x, y);

            // Trailing body character
            this.ctx.fillStyle = accent;
            this.ctx.shadowBlur = 0;
            this.ctx.fillText(char, x, y - fontSize);

            if (y > height && Math.random() > 0.975) {
                this.matrixDrops[i] = 0;
            }
            this.matrixDrops[i]++;
        }
    }

    // --- 2. WARP SPEED 3D STARFIELD ---
    initStars() {
        if (!this.canvas) return;
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * this.canvas.width * 2,
                y: (Math.random() - 0.5) * this.canvas.height * 2,
                z: Math.random() * this.canvas.width,
                pz: 0
            });
            this.stars[i].pz = this.stars[i].z;
        }
    }

    renderWarp() {
        const { width, height } = this.canvas;
        const { accent } = this.getThemeColors();
        const cx = width / 2;
        const cy = height / 2;
        const speed = 14;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        this.ctx.fillRect(0, 0, width, height);

        for (let star of this.stars) {
            star.z -= speed;
            if (star.z <= 0) {
                star.z = width;
                star.x = (Math.random() - 0.5) * width * 2;
                star.y = (Math.random() - 0.5) * height * 2;
                star.pz = star.z;
            }

            const k = 250 / star.z;
            const px = star.x * k + cx + (this.mouseX * 0.1);
            const py = star.y * k + cy + (this.mouseY * 0.1);

            const pk = 250 / star.pz;
            const ppx = star.x * pk + cx + (this.mouseX * 0.1);
            const ppy = star.y * pk + cy + (this.mouseY * 0.1);

            star.pz = star.z;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
                const size = (1 - star.z / width) * 2.5;
                this.ctx.strokeStyle = accent;
                this.ctx.lineWidth = size;
                this.ctx.beginPath();
                this.ctx.moveTo(ppx, ppy);
                this.ctx.lineTo(px, py);
                this.ctx.stroke();
            }
        }
    }

    // --- 3. QUANTUM CYBER WAVES ---
    renderWaves() {
        const { width, height } = this.canvas;
        const { accent } = this.getThemeColors();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, width, height);

        this.waveStep += 0.025;
        this.ctx.lineWidth = 1.2;
        this.ctx.strokeStyle = accent;

        const lines = 7;
        for (let i = 0; i < lines; i++) {
            this.ctx.beginPath();
            const yOffset = height * 0.45 + (i * 24);
            const alpha = 0.2 + (i / lines) * 0.5;
            this.ctx.strokeStyle = accent;
            this.ctx.globalAlpha = alpha;

            for (let x = 0; x < width; x += 15) {
                const y = Math.sin((x * 0.005) + this.waveStep + (i * 0.35)) * 40 +
                          Math.cos((x * 0.01) - this.waveStep) * 20 + yOffset;
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1.0;
    }
}

export const backgroundManager = new BackgroundManager();

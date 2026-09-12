/**
 * MACOS-STYLE PARABOLIC LIQUID DOCK & BOOKMARK APP MANAGER
 */

import { state } from './state.js';

// Cache image helper
const convertImageToBase64 = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

export const initDock = (toggleWidget) => {
    const dockContainer = document.getElementById('dock-pinned-apps');
    const previewContainer = document.getElementById('bookmarkPreviewGrid');
    const dockEl = document.querySelector('.dock');
    const urlInput = document.getElementById('bmUrlInput');
    const nameInput = document.getElementById('bmNameInput');
    const iconInput = document.getElementById('bmIconInput');
    const addBtn = document.getElementById('addBmBtn');

    let editingIndex = -1;

    // --- RENDER PINNED APPS ---
    const renderApps = () => {
        if (!dockContainer) return;
        dockContainer.innerHTML = '';
        if (previewContainer) previewContainer.innerHTML = '';

        state.pinnedApps.forEach((app, index) => {
            const displayIcon = app.cachedIcon || app.customIcon || `https://logo.clearbit.com/${new URL(app.url).hostname}`;

            // 1. Render in Dock
            const dockItem = document.createElement('div');
            dockItem.className = 'dock-item dock-app';
            dockItem.setAttribute('role', 'button');
            dockItem.setAttribute('tabindex', '0');
            dockItem.onclick = () => window.location.href = app.url;

            const img = document.createElement('img');
            img.src = displayIcon;
            img.alt = app.name;
            img.loading = 'lazy';
            img.onerror = () => {
                const fallback = `https://www.google.com/s2/favicons?domain=${app.url}&sz=64`;
                if (img.src !== fallback) img.src = fallback;
            };

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = app.name;

            dockItem.appendChild(img);
            dockItem.appendChild(tooltip);
            dockContainer.appendChild(dockItem);

            // 2. Render in Bookmark Manager Widget
            if (previewContainer) {
                const previewItem = document.createElement('div');
                previewItem.className = 'bookmark-preview';
                previewItem.style.cursor = 'pointer';
                if (index === editingIndex) previewItem.style.borderColor = 'var(--accent-color)';

                const pImg = document.createElement('img');
                pImg.src = displayIcon;
                pImg.style.cssText = "width:28px; height:28px; border-radius:6px; object-fit:contain;";
                pImg.onerror = () => {
                    const fallback = `https://www.google.com/s2/favicons?domain=${app.url}&sz=64`;
                    if (pImg.src !== fallback) pImg.src = fallback;
                };

                const pSpan = document.createElement('span');
                pSpan.style.cssText = "font-size:0.78rem; font-weight:500; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:60px;";
                pSpan.textContent = app.name;

                const pDel = document.createElement('div');
                pDel.className = 'bm-delete-btn';
                pDel.innerHTML = '<span class="material-icons" style="font-size:14px;">close</span>';
                pDel.onclick = (e) => {
                    e.stopPropagation();
                    const updated = [...state.pinnedApps];
                    updated.splice(index, 1);
                    state.setPinnedApps(updated);
                    if (editingIndex === index) resetEdit();
                    else if (editingIndex > index) editingIndex--;
                    renderApps();
                };

                previewItem.appendChild(pImg);
                previewItem.appendChild(pSpan);
                previewItem.appendChild(pDel);

                previewItem.onclick = (e) => {
                    if (e.target.closest('.bm-delete-btn')) return;
                    editingIndex = index;
                    urlInput.value = app.url;
                    nameInput.value = app.name;
                    iconInput.value = app.customIcon || '';
                    addBtn.innerHTML = '<span class="material-icons">save</span>';
                    renderApps();
                };

                previewContainer.appendChild(previewItem);
            }
        });

        // Re-attach action widget handlers
        document.querySelectorAll('.action-widget').forEach(item => {
            item.onclick = () => {
                if (toggleWidget) toggleWidget(item.dataset.target);
            };
        });
    };

    const resetEdit = () => {
        editingIndex = -1;
        if (urlInput) urlInput.value = '';
        if (nameInput) nameInput.value = '';
        if (iconInput) iconInput.value = '';
        if (addBtn) addBtn.innerHTML = '+';
    };

    if (addBtn) {
        addBtn.onclick = async () => {
            let url = urlInput.value.trim();
            const name = nameInput.value.trim();
            const icon = iconInput.value.trim();

            if (!url || !name) return;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            const appData = { name, url, customIcon: icon };
            const updated = [...state.pinnedApps];

            if (editingIndex >= 0) {
                updated[editingIndex] = appData;
                resetEdit();
            } else {
                updated.push(appData);
                resetEdit();
            }

            state.setPinnedApps(updated);
            renderApps();

            // Background icon caching
            const targetIconUrl = icon || `https://logo.clearbit.com/${new URL(url).hostname}`;
            const base64 = await convertImageToBase64(targetIconUrl);
            if (base64) {
                appData.cachedIcon = base64;
                state.setPinnedApps(updated);
                renderApps();
            }
        };
    }

    renderApps();

    // Subscribe to pinned apps changes
    state.subscribe('pinnedApps', () => {
        renderApps();
    });

    // --- CONTINUOUS PARABOLIC MAGNIFICATION ENGINE ---
    if (!dockEl) return;

    let rafId = null;
    const MAX_DISTANCE = 135;
    const MAX_SCALE = 1.38;

    const handleMouseMove = (e) => {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            const mouseX = e.clientX;
            const items = dockEl.querySelectorAll('.dock-item');

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const dist = Math.abs(mouseX - itemCenterX);

                if (dist < MAX_DISTANCE) {
                    // Cosine curve for parabolic smooth wave
                    const norm = dist / MAX_DISTANCE;
                    const factor = Math.cos(norm * (Math.PI / 2));
                    const scale = 1 + (MAX_SCALE - 1) * factor;
                    const translateY = -((scale - 1) * 36);
                    item.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
                    item.style.zIndex = Math.round(scale * 10);
                } else {
                    item.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    item.style.zIndex = 1;
                }
            });
        });
    };

    const handleMouseLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        const items = dockEl.querySelectorAll('.dock-item');
        items.forEach(item => {
            item.style.transform = 'translate3d(0, 0, 0) scale(1)';
            item.style.zIndex = 1;
        });
    };

    dockEl.addEventListener('mousemove', handleMouseMove);
    dockEl.addEventListener('mouseleave', handleMouseLeave);
};

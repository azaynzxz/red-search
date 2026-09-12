/**
 * SEARCH PORTAL - CONSOLE ERROR & NOTIFICATION HUD
 * Intercepts console.error, unhandled exceptions, and API errors
 * Renders high-density cyber-glassmorphism error notifications
 */

let notificationContainer = null;
const activeNotifications = new Map(); // key -> { element, timer, count, startTime }
let isInitialized = false;

/**
 * Format Gemini API errors into clean, readable summaries
 */
function formatErrorMessage(msg) {
    if (typeof msg !== 'string') {
        try {
            msg = JSON.stringify(msg, null, 2);
        } catch {
            msg = String(msg);
        }
    }

    // Check for Gemini Quota / Rate limit error
    if (msg.includes('exceeded your current quota') || msg.includes('Quota exceeded') || msg.includes('429')) {
        const retryMatch = msg.match(/retry in\s+([0-9.]+)s/i);
        const retryText = retryMatch ? ` Please retry in ~${Math.ceil(parseFloat(retryMatch[1]))}s.` : '';
        return {
            title: 'Gemini API Quota Exceeded',
            badge: 'RATE LIMIT (429)',
            summary: `Free tier request limit reached for the active model.${retryText}`,
            details: msg
        };
    }

    // Check for API key missing
    if (msg.includes('API Key') && msg.includes('Settings')) {
        return {
            title: 'API Key Missing',
            badge: 'CONFIG REQUIRED',
            summary: 'Gemini API Key is not configured. Please open Settings to enter your key.',
            details: msg
        };
    }

    // Default formatting
    return {
        title: 'Console Error',
        badge: 'RUNTIME ERROR',
        summary: msg.length > 220 ? msg.substring(0, 220) + '...' : msg,
        details: msg.length > 220 ? msg : null
    };
}

/**
 * Show a custom error toast notification
 */
export function showConsoleErrorNotification({
    title = 'Console Error',
    message = '',
    details = null,
    badge = 'ERROR',
    duration = 8000,
    source = 'system'
} = {}) {
    if (!notificationContainer) {
        ensureContainer();
    }

    const parsed = formatErrorMessage(message);
    const finalTitle = title !== 'Console Error' ? title : parsed.title;
    const finalBadge = badge !== 'ERROR' ? badge : parsed.badge;
    const finalSummary = parsed.summary || message;
    const finalDetails = details || parsed.details;

    // Deduplication key
    const dedupeKey = `${finalTitle}::${finalSummary}`;
    const now = Date.now();

    if (activeNotifications.has(dedupeKey)) {
        const existing = activeNotifications.get(dedupeKey);
        existing.count += 1;
        const countBadge = existing.element.querySelector('.error-toast-count');
        if (countBadge) {
            countBadge.textContent = `x${existing.count}`;
            countBadge.style.display = 'inline-block';
            countBadge.classList.remove('pulse-badge');
            void countBadge.offsetWidth; // trigger reflow
            countBadge.classList.add('pulse-badge');
        }

        // Reset timer
        clearTimeout(existing.timer);
        resetProgressBar(existing.element, duration);
        existing.timer = setTimeout(() => dismissNotification(dedupeKey), duration);
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'console-error-toast';
    toast.dataset.dedupeKey = dedupeKey;

    const timeStr = new Date().toTimeString().split(' ')[0];

    toast.innerHTML = `
        <div class="error-toast-glow"></div>
        <div class="error-toast-header">
            <div class="error-toast-header-left">
                <span class="material-icons error-toast-icon">error_outline</span>
                <span class="error-toast-title">${escapeHTML(finalTitle)}</span>
                <span class="error-toast-badge">${escapeHTML(finalBadge)}</span>
                <span class="error-toast-count" style="display:none;">x1</span>
            </div>
            <div class="error-toast-actions">
                <span class="error-toast-time">${timeStr}</span>
                <button type="button" class="error-toast-btn btn-copy-error" title="Copy error to clipboard">
                    <span class="material-icons">content_copy</span>
                </button>
                <button type="button" class="error-toast-btn btn-close-error" title="Dismiss">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </div>
        <div class="error-toast-body">
            <p class="error-toast-msg">${escapeHTML(finalSummary)}</p>
            ${finalDetails && finalDetails !== finalSummary ? `
                <div class="error-toast-details" style="display:none;">
                    <pre>${escapeHTML(finalDetails)}</pre>
                </div>
                <button type="button" class="error-toast-toggle-details">
                    <span class="material-icons" style="font-size:12px;">expand_more</span>
                    <span>Show Details</span>
                </button>
            ` : ''}
        </div>
        <div class="error-toast-progress">
            <div class="error-toast-progress-bar"></div>
        </div>
    `;

    // Copy action
    const btnCopy = toast.querySelector('.btn-copy-error');
    if (btnCopy) {
        btnCopy.onclick = (e) => {
            e.stopPropagation();
            const copyText = `${finalTitle} [${finalBadge}]:\n${finalSummary}\n\nDetails:\n${finalDetails || 'None'}`;
            navigator.clipboard.writeText(copyText).then(() => {
                const icon = btnCopy.querySelector('.material-icons');
                if (icon) icon.textContent = 'check';
                setTimeout(() => {
                    if (icon) icon.textContent = 'content_copy';
                }, 1500);
            }).catch(() => {});
        };
    }

    // Close action
    const btnClose = toast.querySelector('.btn-close-error');
    if (btnClose) {
        btnClose.onclick = (e) => {
            e.stopPropagation();
            dismissNotification(dedupeKey);
        };
    }

    // Toggle details
    const btnDetails = toast.querySelector('.error-toast-toggle-details');
    if (btnDetails) {
        const detailsEl = toast.querySelector('.error-toast-details');
        btnDetails.onclick = () => {
            const isHidden = detailsEl.style.display === 'none';
            detailsEl.style.display = isHidden ? 'block' : 'none';
            const icon = btnDetails.querySelector('.material-icons');
            const text = btnDetails.querySelector('span:last-child');
            if (icon) icon.textContent = isHidden ? 'expand_less' : 'expand_more';
            if (text) text.textContent = isHidden ? 'Hide Details' : 'Show Details';
        };
    }

    // Pause on hover
    let remainingTime = duration;
    let timerStartTime = Date.now();
    let isPaused = false;

    const startTimer = (time) => {
        timerStartTime = Date.now();
        return setTimeout(() => dismissNotification(dedupeKey), time);
    };

    let timer = startTimer(duration);
    resetProgressBar(toast, duration);

    toast.onmouseenter = () => {
        isPaused = true;
        clearTimeout(timer);
        remainingTime -= (Date.now() - timerStartTime);
        const bar = toast.querySelector('.error-toast-progress-bar');
        if (bar) bar.style.animationPlayState = 'paused';
    };

    toast.onmouseleave = () => {
        if (isPaused && remainingTime > 0) {
            isPaused = false;
            timer = startTimer(remainingTime);
            const bar = toast.querySelector('.error-toast-progress-bar');
            if (bar) bar.style.animationPlayState = 'running';
        }
    };

    activeNotifications.set(dedupeKey, {
        element: toast,
        timer,
        count: 1,
        startTime: now
    });

    notificationContainer.appendChild(toast);
}

function resetProgressBar(toast, duration) {
    const bar = toast.querySelector('.error-toast-progress-bar');
    if (bar) {
        bar.style.animation = 'none';
        void bar.offsetWidth; // trigger reflow
        bar.style.animation = `toastCountdown ${duration}ms linear forwards`;
    }
}

function dismissNotification(dedupeKey) {
    if (!activeNotifications.has(dedupeKey)) return;
    const item = activeNotifications.get(dedupeKey);
    clearTimeout(item.timer);
    activeNotifications.delete(dedupeKey);

    item.element.classList.add('toast-exit');
    setTimeout(() => {
        item.element.remove();
    }, 280);
}

function ensureContainer() {
    if (!notificationContainer) {
        notificationContainer = document.getElementById('consoleNotificationContainer');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'consoleNotificationContainer';
            notificationContainer.className = 'console-notification-container';
            document.body.appendChild(notificationContainer);
        }
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Initialize global error interception
 */
export function initErrorNotifications() {
    if (isInitialized) return;
    isInitialized = true;

    ensureContainer();

    // 1. Intercept native console.error
    const originalConsoleError = console.error;
    console.error = function (...args) {
        // Forward to native console for DevTools debugging
        originalConsoleError.apply(console, args);

        try {
            const rawMsg = args.map(arg => {
                if (arg instanceof Error) {
                    return arg.stack || arg.message;
                } else if (typeof arg === 'object') {
                    try { return JSON.stringify(arg); } catch { return String(arg); }
                }
                return String(arg);
            }).join(' ');

            // Ignore expected harmless noise (like service worker notices or extension reload ping)
            if (rawMsg.includes('serviceWorker') || rawMsg.includes('ResizeObserver') || rawMsg.includes('favicon')) {
                return;
            }

            showConsoleErrorNotification({
                title: 'Console Error',
                message: rawMsg,
                source: 'console'
            });
        } catch (e) {
            originalConsoleError.call(console, 'Error interceptor failure:', e);
        }
    };

    // 2. Intercept uncaught runtime window errors
    window.addEventListener('error', (event) => {
        if (!event.error && !event.message) return;
        const msg = event.error ? (event.error.stack || event.error.message) : event.message;
        showConsoleErrorNotification({
            title: 'Uncaught Error',
            message: msg || 'An unexpected script error occurred.',
            badge: 'SCRIPT ERROR',
            source: 'window.onerror'
        });
    });

    // 3. Intercept unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        let msg = 'Unhandled Promise rejection';
        if (reason instanceof Error) {
            msg = reason.stack || reason.message;
        } else if (typeof reason === 'string') {
            msg = reason;
        } else if (typeof reason === 'object') {
            try { msg = JSON.stringify(reason); } catch { msg = String(reason); }
        }

        showConsoleErrorNotification({
            title: 'Promise Rejection',
            message: msg,
            badge: 'ASYNC ERROR',
            source: 'unhandledrejection'
        });
    });

    // 4. Gracefully route window.alert to the custom notification HUD
    window.alert = function (msg) {
        showConsoleErrorNotification({
            title: 'Alert Notification',
            message: String(msg),
            badge: 'ALERT',
            duration: 9000,
            source: 'alert'
        });
    };

    // Expose global helper for any component
    window.showConsoleErrorNotification = showConsoleErrorNotification;
    window.showErrorNotification = showConsoleErrorNotification;
}

// Theme toggle functionality
// Respects system preference and saves user choice to localStorage

(function () {
    const STORAGE_KEY = 'theme-preference';
    const TOGGLE_ID = 'theme-toggle';
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    // Get the stored preference, or null if not set
    function getStoredPreference() {
        return localStorage.getItem(STORAGE_KEY);
    }

    // Set the stored preference
    function setStoredPreference(theme) {
        localStorage.setItem(STORAGE_KEY, theme);
    }

    // Apply theme to document
    function applyTheme(theme) {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
            html.classList.remove('light');
        } else if (theme === 'light') {
            html.classList.add('light');
            html.classList.remove('dark');
        } else {
            // 'system' or null - remove both classes to let CSS media query handle it
            html.classList.remove('dark');
            html.classList.remove('light');
        }
    }

    function getSystemTheme() {
        return mql.matches ? 'dark' : 'light';
    }

    // Get current effective theme
    function getCurrentTheme() {
        const stored = getStoredPreference();
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }
        // Fall back to system preference
        return getSystemTheme();
    }

    function updateToggleUi() {
        const btn = document.getElementById(TOGGLE_ID);
        if (!btn) return;

        const current = getCurrentTheme();
        const next = current === 'dark' ? 'light' : 'dark';

        const icon = btn.querySelector('.theme-toggle-icon');
        const label = btn.querySelector('.theme-toggle-label');

        if (icon) icon.textContent = next === 'dark' ? '☾' : '☀︎';
        if (label) label.textContent = next === 'dark' ? 'Dark' : 'Light';

        btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode');
        btn.setAttribute('title', next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode');
    }

    // Toggle between light and dark
    function toggleTheme() {
        const current = getCurrentTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';
        setStoredPreference(newTheme);
        applyTheme(newTheme);
        updateToggleUi();
    }

    // Initialize theme on page load
    function init() {
        const stored = getStoredPreference();
        applyTheme(stored);
        const bindUi = () => {
            updateToggleUi();
            const btn = document.getElementById(TOGGLE_ID);
            if (btn) {
                btn.addEventListener('click', toggleTheme);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindUi, { once: true });
        } else {
            bindUi();
        }

        // Listen for system preference changes (only if no stored preference)
        const onSystemChange = () => {
            if (!getStoredPreference()) {
                applyTheme(null);
                updateToggleUi();
            }
        };

        if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', onSystemChange);
        } else if (typeof mql.addListener === 'function') {
            mql.addListener(onSystemChange);
        }
    }

    // Run init immediately
    init();

    // Expose toggle function globally
    window.toggleTheme = toggleTheme;
})();
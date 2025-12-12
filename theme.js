// Dark Mode Theme Toggle
// This script handles dark mode functionality across the entire site

(function () {
    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        updateThemeIcon();
    }

    // Toggle between light and dark mode
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    }

    // Update the toggle button icon
    function updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            themeToggle.textContent = isDark ? '☀️' : '🌙';
        }
    }

    // Create and inject the theme toggle button if it doesn't exist
    function createThemeToggle() {
        if (!document.getElementById('themeToggle')) {
            const toggle = document.createElement('button');
            toggle.id = 'themeToggle';
            toggle.className = 'theme-toggle';
            toggle.setAttribute('aria-label', 'Toggle dark mode');
            toggle.textContent = '🌙';
            document.body.appendChild(toggle);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initTheme();
            createThemeToggle();
            updateThemeIcon();
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
        });
    } else {
        initTheme();
        createThemeToggle();
        updateThemeIcon();
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            updateThemeIcon();
        }
    });

    // Expose functions globally
    window.toggleTheme = toggleTheme;
    window.initTheme = initTheme;
})();

// Dark Mode Theme - Disabled
// Toggle functionality removed per user request

(function () {
    // Initialize theme on page load - keep light mode default
    function initTheme() {
        // Set to light theme by default, ignore saved/system preferences for now
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();

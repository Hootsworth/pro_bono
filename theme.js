// Theme & Mobile Navigation Handler
// Pro Bono - Enhanced for mobile responsiveness

(function () {
    // Initialize theme on page load - keep light mode default
    function initTheme() {
        // Set to light theme by default
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Mobile Navigation Toggle
    function initMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const mainNav = document.getElementById('mainNav');

        if (!navToggle || !mainNav) return;

        // Toggle menu on button click
        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isActive = navToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);

            // Prevent body scroll when menu is open on mobile
            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                mainNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                mainNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                navToggle.classList.remove('active');
                mainNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Handle resize - close menu if switching to desktop
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (window.innerWidth > 768) {
                    navToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }, 100);
        });
    }

    // Initialize smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1) {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // Add touch feedback for better mobile UX
    function initTouchFeedback() {
        // Add active state class on touch for immediate visual feedback
        const touchElements = document.querySelectorAll('.btn, .card, .filter-pill, .nav-links a');

        touchElements.forEach(function (el) {
            el.addEventListener('touchstart', function () {
                this.classList.add('touch-active');
            }, { passive: true });

            el.addEventListener('touchend', function () {
                this.classList.remove('touch-active');
            }, { passive: true });

            el.addEventListener('touchcancel', function () {
                this.classList.remove('touch-active');
            }, { passive: true });
        });
    }

    // Initialize all functionality when DOM is ready
    function init() {
        initTheme();
        initMobileNav();
        initSmoothScroll();
        initTouchFeedback();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

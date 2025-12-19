// Theme & Navigation Handler v3.0
// Pro Bonana - Enhanced with QoL improvements

(function () {
    'use strict';

    // Initialize theme on page load
    function initTheme() {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Mobile Navigation Toggle
    function initMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const mainNav = document.getElementById('mainNav');

        if (!navToggle || !mainNav) return;

        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isActive = navToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                closeNav();
            });
        });

        document.addEventListener('click', function (e) {
            if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
                closeNav();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                closeNav();
                navToggle.focus();
            }
        });

        function closeNav() {
            navToggle.classList.remove('active');
            mainNav.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (window.innerWidth > 768) {
                    closeNav();
                }
            }, 100);
        });
    }

    // Scroll to Top Button
    function initScrollToTop() {
        // Create scroll-to-top button
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '↑';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.setAttribute('title', 'Back to top');
        document.body.appendChild(scrollBtn);

        // Show/hide based on scroll position
        let isScrolling = false;
        window.addEventListener('scroll', function () {
            if (!isScrolling) {
                window.requestAnimationFrame(function () {
                    if (window.scrollY > 400) {
                        scrollBtn.classList.add('visible');
                    } else {
                        scrollBtn.classList.remove('visible');
                    }
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }, { passive: true });

        scrollBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth scroll for anchor links
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

    // Touch feedback for better mobile UX
    function initTouchFeedback() {
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

    // Animate elements on scroll
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.card, .mission-card, .value-item');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(function (el, index) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.5s ease ' + (index * 0.05) + 's, transform 0.5s ease ' + (index * 0.05) + 's';
                observer.observe(el);
            });
        }
    }

    // Keyboard navigation enhancements
    function initKeyboardNav() {
        // Tab trap for modals (if any are open)
        document.addEventListener('keydown', function (e) {
            const modal = document.querySelector('.modal-overlay.show');
            if (!modal) return;

            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstEl = focusableElements[0];
                const lastEl = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        });
    }

    // Page load animation
    function initPageAnimation() {
        document.body.classList.add('page-enter');
        setTimeout(function () {
            document.body.classList.remove('page-enter');
        }, 500);
    }

    // Initialize all functionality
    function init() {
        initTheme();
        initMobileNav();
        initScrollToTop();
        initSmoothScroll();
        initTouchFeedback();
        initScrollAnimations();
        initKeyboardNav();
        initPageAnimation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


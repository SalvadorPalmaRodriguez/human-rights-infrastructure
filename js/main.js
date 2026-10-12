/* ============================================
   enola-cli-lite — Presentación promocional
   JavaScript — Vanilla JS (sin dependencias)
   ============================================ */

(function() {
    'use strict';

    /* --- 1. Navigation & Active Section --- */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const progressBar = document.getElementById('progressBar');

    // Smooth scroll on nav click
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-section');
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }

    /* --- 2. Active Section Highlight & Progress Bar --- */
    function updateActiveSection() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollY / docHeight) * 100;
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        if (currentSection) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === currentSection) {
                    link.classList.add('active');
                }
            });
        }

        // Update presentation counter if in present mode
        if (document.body.classList.contains('present-mode')) {
            updatePresentCounter();
        }
    }

    window.addEventListener('scroll', throttle(updateActiveSection, 50));

    /* --- 3. Reveal on Scroll (IntersectionObserver) --- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger counter animations
                const counters = entry.target.querySelectorAll('[data-count]');
                counters.forEach(el => {
                    if (!el.dataset.animated) {
                        animateCounter(el);
                        el.dataset.animated = 'true';
                    }
                });

                // Trigger bar chart animation
                if (entry.target.classList.contains('chart-container')) {
                    animateBarChart();
                }
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Also observe chart container and sections with counters
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer && !chartContainer.classList.contains('reveal')) {
        revealObserver.observe(chartContainer);
    }

    // Observe hero counters
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const heroObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('[data-count]');
                    counters.forEach(el => {
                        if (!el.dataset.animated) {
                            animateCounter(el);
                            el.dataset.animated = 'true';
                        }
                    });
                    heroObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        heroObserver.observe(heroContent);
    }

    /* --- 4. Animated Counters --- */
    function animateCounter(element) {
        const target = parseFloat(element.dataset.count);
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        const format = element.dataset.format || '';
        const decimals = parseInt(element.dataset.decimals) || 0;
        const duration = 2000;
        const startTime = performance.now();

        const locale = (document.documentElement.lang === 'en') ? 'en-GB' : 'es-ES';

        function formatNumber(num) {
            if (format === 'euro') {
                return new Intl.NumberFormat(locale).format(Math.floor(num));
            }
            if (decimals > 0) {
                return num.toFixed(decimals).replace('.', ',');
            }
            return new Intl.NumberFormat(locale).format(Math.floor(num));
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            element.textContent = prefix + formatNumber(current) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = prefix + formatNumber(target) + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    /* --- 5. Bar Chart Animation --- */
    function animateBarChart() {
        const bars = document.querySelectorAll('.bar-bar');
        bars.forEach((bar, index) => {
            const item = bar.closest('.bar-item');
            const percent = item.dataset.percent;
            setTimeout(() => {
                bar.style.setProperty('--h', percent + '%');
            }, index * 80);
        });
    }

    /* --- 6. Tabs (Calendario Trimestral) --- */
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    /* --- 7. Monthly Table Reveal --- */
    const btnRevealTable = document.getElementById('btnRevealTable');
    const monthRows = document.querySelectorAll('.month-row:not(.total-row)');
    let tableRevealed = false;

    if (btnRevealTable) {
        btnRevealTable.addEventListener('click', function() {
            if (!tableRevealed) {
                monthRows.forEach((row, index) => {
                    setTimeout(() => {
                        row.classList.add('visible');
                    }, index * 150);
                });
                // Show total after all months
                const totalRow = document.querySelector('.total-row');
                if (totalRow) {
                    setTimeout(() => {
                        totalRow.classList.add('visible');
                    }, monthRows.length * 150 + 200);
                }
                btnRevealTable.textContent = 'Ocultar';
                tableRevealed = true;
            } else {
                monthRows.forEach(row => row.classList.remove('visible'));
                const totalRow = document.querySelector('.total-row');
                if (totalRow) totalRow.classList.remove('visible');
                btnRevealTable.textContent = 'Revelar mes a mes';
                tableRevealed = false;
            }
        });
    }

    /* --- 8. Glossary Flip Cards --- */
    const glossaryCards = document.querySelectorAll('.glossary-card');
    glossaryCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    });

    /* --- 9. Timeline (Navidad) --- */
    const timelinePhases = document.querySelectorAll('.timeline-phase');
    timelinePhases.forEach(phase => {
        phase.addEventListener('click', function() {
            timelinePhases.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set first phase active by default
    if (timelinePhases.length > 0) {
        timelinePhases[0].classList.add('active');
    }

    /* --- 10. Presentation Mode --- */
    const btnPresent = document.getElementById('btnPresent');
    const presentControls = document.getElementById('presentControls');
    const exitPresent = document.getElementById('exitPresent');
    const prevSection = document.getElementById('prevSection');
    const nextSection = document.getElementById('nextSection');
    const presentCounter = document.getElementById('presentCounter');

    const sectionIds = Array.from(sections).map(s => s.id);
    let presentMode = false;
    let currentSectionIndex = 0;

    function enterPresentMode() {
        presentMode = true;
        document.body.classList.add('present-mode');
        presentControls.classList.add('active');
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen no disponible:', err);
            });
        }
        currentSectionIndex = getCurrentSectionIndex();
        updatePresentCounter();
    }

    function exitPresentMode() {
        presentMode = false;
        document.body.classList.remove('present-mode');
        presentControls.classList.remove('active');
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
                console.log('Error al salir de fullscreen:', err);
            });
        }
    }

    function getCurrentSectionIndex() {
        const scrollY = window.scrollY + window.innerHeight / 2;
        for (let i = 0; i < sections.length; i++) {
            const top = sections[i].offsetTop;
            const bottom = top + sections[i].offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                return i;
            }
        }
        return 0;
    }

    function updatePresentCounter() {
        currentSectionIndex = getCurrentSectionIndex();
        if (presentCounter) {
            presentCounter.textContent = (currentSectionIndex + 1) + ' / ' + sectionIds.length;
        }
    }

    function goToSection(index) {
        if (index < 0) index = 0;
        if (index >= sections.length) index = sections.length - 1;
        sections[index].scrollIntoView({ behavior: 'smooth' });
        currentSectionIndex = index;
        if (presentCounter) {
            presentCounter.textContent = (index + 1) + ' / ' + sectionIds.length;
        }
    }

    if (btnPresent) {
        btnPresent.addEventListener('click', enterPresentMode);
    }
    if (exitPresent) {
        exitPresent.addEventListener('click', exitPresentMode);
    }
    if (prevSection) {
        prevSection.addEventListener('click', () => goToSection(currentSectionIndex - 1));
    }
    if (nextSection) {
        nextSection.addEventListener('click', () => goToSection(currentSectionIndex + 1));
    }

    /* --- 11. Keyboard Navigation --- */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'f' || e.key === 'F') {
            if (!presentMode && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                enterPresentMode();
            }
        }
        if (e.key === 'Escape' && presentMode) {
            exitPresentMode();
        }
        if (presentMode) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                goToSection(currentSectionIndex + 1);
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                goToSection(currentSectionIndex - 1);
            }
        }
    });

    /* --- 12. Parallax Effect --- */
    const parallaxElements = document.querySelectorAll('.parallax');
    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.3;
            const offset = scrollY * speed;
            el.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    /* --- 13. Throttle Utility --- */
    function throttle(fn, limit) {
        let inThrottle = false;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                fn.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /* --- 14. Initialize --- */
    // Trigger initial active section
    updateActiveSection();

    // Reveal hero content immediately
    const heroContentEl = document.querySelector('.hero-content');
    if (heroContentEl) {
        heroContentEl.classList.add('visible');
    }

    // Animate bar chart when it comes into view
    const chartObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateBarChart();
                chartObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (chartContainer) {
        chartObserver.observe(chartContainer);
    }

    console.log('enola-cli-lite — Presentación cargada correctamente');

    /* --- 15. Cold open (apagón de Irán) --- */
    const coldOpen = document.getElementById('coldOpen');
    if (coldOpen) {
        function dismissColdOpen() {
            coldOpen.classList.add('dismissed');
        }
        coldOpen.addEventListener('click', dismissColdOpen);
        window.addEventListener('wheel', dismissColdOpen, { passive: true, once: true });
        window.addEventListener('touchstart', dismissColdOpen, { passive: true, once: true });
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                dismissColdOpen();
                document.removeEventListener('keydown', handler);
            }
        });
    }
})();

// CELESTIA Website JavaScript

// Entrypoint
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initMobileMenu();
    initServiceCards();
    initParallaxEffect();
    initHoverEffects();
    initAutoHideSidebar();
});

/* ------------------------- Navigation ------------------------- */
function initNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.nav-menu a'));

    // Click behaviour: smooth scroll, don't force active state — observer will set it
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').replace('#', '');
            const target = document.getElementById(targetId);
            if (!target) return;
            const offsetTop = target.offsetTop - 50; // small top offset
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            closeMobileMenu();
            // update location hash without jumping
            history.replaceState(null, '', `#${targetId}`);
        });
    });

    // Start observer that will set one active link at a time
    setupSectionObserver();

    // If page opened with a hash, apply it after a short delay
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) setTimeout(() => setActiveNavById(initialHash), 80);

    // Keep nav in sync with hash navigation (back/forward)
    window.addEventListener('hashchange', () => {
        const id = window.location.hash.replace('#', '');
        if (id) setActiveNavById(id);
        else clearActiveNav();
    });
}

function clearActiveNav() {
    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.classList.remove('active');
        if (a.parentElement) a.parentElement.classList.remove('active');
    });
    // hide the knob when nothing is active
    const menu = document.querySelector('.nav-menu');
    if (menu) menu.style.setProperty('--knob-opacity', '0');
}

function setActiveNavById(id) {
    clearActiveNav();
    if (!id) return;
    const link = document.querySelector(`.nav-menu a[href="#${id}"]`);
    if (link) {
        link.classList.add('active');
        if (link.parentElement) link.parentElement.classList.add('active');
        // Move the knob to the active item's vertical center
        const li = link.closest('li');
        const menu = document.querySelector('.nav-menu');
        if (li && menu) {
            const menuRect = menu.getBoundingClientRect();
            const liRect = li.getBoundingClientRect();
            const top = (liRect.top + liRect.bottom) / 2 - menuRect.top;
            menu.style.setProperty('--knob-top', `${top}px`);
            menu.style.setProperty('--knob-opacity', '1');
        }
    }
}

function setupSectionObserver() {
    const observedSections = Array.from(document.querySelectorAll('section[id]'))
        .filter(sec => document.querySelector(`.nav-menu a[href="#${sec.id}"]`));

    if (!observedSections.length) return;

    const ratioMap = new Map(observedSections.map(s => [s.id, 0]));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            ratioMap.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        });

        // choose the section with highest recorded ratio
        let bestId = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratioMap.entries()) {
            if (ratio > bestRatio) {
                bestRatio = ratio;
                bestId = id;
            }
        }

        const MIN_RATIO = 0.12; // avoid flicker when barely visible
        if (bestId && bestRatio >= MIN_RATIO) setActiveNavById(bestId);
        else clearActiveNav();
    }, { root: null, rootMargin: '0px 0px -50% 0px', threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1] });

    observedSections.forEach(s => io.observe(s));

    // set initial via center heuristic
    const initial = observedSections.find(sec => {
        const r = sec.getBoundingClientRect();
        return r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.25;
    });
    if (initial) setActiveNavById(initial.id);
}

/* ------------------------- Scroll effects ------------------------- */
function initScrollEffects() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.about-section, .services-section, .projects-section, .contact-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

/* ------------------------- Mobile menu ------------------------- */
function initMobileMenu() {
    if (window.innerWidth <= 768) createMobileMenuToggle();
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) createMobileMenuToggle();
        else {
            removeMobileMenuToggle();
            document.querySelector('.sidebar-nav')?.classList.remove('open');
        }
    });
}

/* ------------------------- Auto-hide Sidebar ------------------------- */
function initAutoHideSidebar() {
    const sidebar = document.querySelector('.sidebar-nav');
    if (!sidebar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let hideTimeout = null;

    function hideSidebar() {
        sidebar.classList.add('hidden');
    }

    function showSidebar() {
        sidebar.classList.remove('hidden');
    }

    // Hide immediately when the user starts scrolling down; show when at top
    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (current > lastScrollY && current > 20) {
                    hideSidebar();
                } else if (current <= 20) {
                    showSidebar();
                }
                lastScrollY = current;
                ticking = false;
            });
            ticking = true;
        }
        // ensure we don't leave it hidden when the user stops near the left edge
        if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
    }, { passive: true });

    // Show sidebar if mouse moves near the left edge (within 48px)
    document.addEventListener('mousemove', (e) => {
        if (e.clientX <= 48) {
            showSidebar();
        }
    });

    // Also show if touchstart near left edge on touch devices
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (touch && touch.clientX <= 48) showSidebar();
    }, { passive: true });
}

function createMobileMenuToggle() {
    if (document.querySelector('.mobile-menu-toggle')) return;
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.textContent = '☰';
    toggle.style.cssText = `position: fixed; top: 20px; left: 20px; z-index:1001;`;
    toggle.addEventListener('click', toggleMobileMenu);
    document.body.appendChild(toggle);
}
function removeMobileMenuToggle() { document.querySelector('.mobile-menu-toggle')?.remove(); }
function toggleMobileMenu() { document.querySelector('.sidebar-nav')?.classList.toggle('open'); document.querySelector('.mobile-menu-toggle').innerText = document.querySelector('.sidebar-nav').classList.contains('open') ? '✕' : '☰'; }
function closeMobileMenu() { const sidebar = document.querySelector('.sidebar-nav'); if (sidebar?.classList.contains('open')) { sidebar.classList.remove('open'); document.querySelector('.mobile-menu-toggle').innerText = '☰'; } }

/* ------------------------- Service cards ------------------------- */
function initServiceCards() {
    document.querySelectorAll('.service-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
        card.addEventListener('click', () => { card.style.transform = 'scale(0.98) translateY(-5px)'; setTimeout(() => card.style.transform = '', 150); });
        card.addEventListener('mouseenter', () => card.style.boxShadow = '0 20px 40px rgba(143,163,176,0.4)');
        card.addEventListener('mouseleave', () => card.style.boxShadow = '');
    });
}

/* ------------------------- Parallax ------------------------- */
function initParallaxEffect() {
    const heroContent = document.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroContent && scrolled < window.innerHeight) heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
    });
}

/* ------------------------- Hover effects ------------------------- */
function initHoverEffects() {
    document.querySelectorAll('.nav-menu a, .service-card, .hero-3d-placeholder').forEach(el => el.addEventListener('mouseenter', function() { this.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'; }));
}

/* ------------------------- Utilities ------------------------- */
function throttle(fn, limit) {
    let inThrottle;
    return function() {
        if (!inThrottle) {
            fn.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function smoothScrollTo(el, duration = 800) {
    const target = el.offsetTop - 50;
    const start = window.pageYOffset;
    const dist = target - start;
    let startTime = null;
    function ease(t,b,c,d){ t /= d/2; if (t<1) return c/2*t*t + b; t--; return -c/2*(t*(t-2)-1)+b }
    function anim(now){ if(!startTime) startTime = now; const time = now - startTime; const val = ease(time, start, dist, duration); window.scrollTo(0, val); if (time < duration) requestAnimationFrame(anim); }
    requestAnimationFrame(anim);
}

/* ------------------------- Hash fallback (older browsers) ------------------------- */
function initNavigationFallback() {
    if (!('scrollBehavior' in document.documentElement.style)) {
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', (e) => { e.preventDefault(); const id = link.getAttribute('href').replace('#',''); const el = document.getElementById(id); if (el) { smoothScrollTo(el); closeMobileMenu(); } });
        });
    }
}

// Initialize fallback if needed
initNavigationFallback();

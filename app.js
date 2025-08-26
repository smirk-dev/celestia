// CELESTIA Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initNavigation();
    initScrollEffects();
    initMobileMenu();
    initServiceCards();
    initParallaxEffect();
    initHoverEffects();
});

// Navigation functionality
function initNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.nav-menu a'));

    // Clicks should scroll but must not force the active state; observer will set it.
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (!targetSection) return;
            const offsetTop = targetSection.offsetTop - 50;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            closeMobileMenu();
        });
    });

    // Initialize the IntersectionObserver which is the single source of truth
    setupSectionObserver();

    // If the page was opened with a hash (direct link to a section), highlight that nav item
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        // small timeout to allow layout/observer initialization
        setTimeout(() => setActiveNavById(initialHash), 60);
    }

    // Update active nav when the hash changes (back/forward or anchor navigation)
    window.addEventListener('hashchange', () => {
        const id = window.location.hash.replace('#', '');
        if (id) setActiveNavById(id);
        else clearActiveNav();
    });
}

// Clear all active states on nav links and their parents
function clearActiveNav() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.parentElement) link.parentElement.classList.remove('active');
    });
}

// Set the active nav item by section id
function setActiveNavById(id) {
    clearActiveNav();
    if (!id) return;
    const link = document.querySelector(`.nav-menu a[href="#${id}"]`);
    if (link) {
        link.classList.add('active');
        if (link.parentElement) link.parentElement.classList.add('active');
    }
}

// Observe sections and update nav based on the most visible section
function setupSectionObserver() {
    const options = {
        root: null,
        rootMargin: '0px 0px -50% 0px',
    threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1]
    };

    const observedSections = Array.from(document.querySelectorAll('section[id]'))
        .filter(sec => document.querySelector(`.nav-menu a[href="#${sec.id}"]`));

    if (!observedSections.length) return;

    const observer = new IntersectionObserver((entries) => {
        // Update stored ratios for entries we received
        entries.forEach(e => {
            ratioMap.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        });

        // Find the section id with the highest recorded ratio
        let bestId = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratioMap.entries()) {
            if (ratio > bestRatio) {
                bestRatio = ratio;
                bestId = id;
            }
        }

        // Require a small minimum ratio to avoid flicker when barely visible
        const MIN_RATIO = 0.12;
        if (bestId && bestRatio >= MIN_RATIO) {
            setActiveNavById(bestId);
        } else {
            clearActiveNav();
        }
    }, options);

    // Keep a map of latest intersection ratios for all observed sections
    const ratioMap = new Map();
    observedSections.forEach(sec => {
        ratioMap.set(sec.id, 0);
        observer.observe(sec);
    });

    // Ensure initial active state matches what's in view (use center heuristic)
    const initial = observedSections.find(sec => {
        const rect = sec.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.25;
    });
    if (initial) setActiveNavById(initial.id);
}

// Initialize scroll effects
function initScrollEffects() {
    // Add scroll reveal effect for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.about-section, .services-section, .projects-section, .contact-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Mobile menu functionality
function initMobileMenu() {
    // Create mobile menu toggle button
    if (window.innerWidth <= 768) {
        createMobileMenuToggle();
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            createMobileMenuToggle();
        } else {
            removeMobileMenuToggle();
            document.querySelector('.sidebar-nav').classList.remove('open');
        }
    });
}

// Create mobile menu toggle button
function createMobileMenuToggle() {
    let existingToggle = document.querySelector('.mobile-menu-toggle');
    if (existingToggle) return;
    
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = '☰';
    toggle.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1001;
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: var(--radius-base);
        padding: 12px 16px;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    toggle.addEventListener('click', toggleMobileMenu);
    document.body.appendChild(toggle);
}

// Remove mobile menu toggle button
function removeMobileMenuToggle() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
        toggle.remove();
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    sidebar.classList.toggle('open');
    toggle.innerHTML = sidebar.classList.contains('open') ? '✕' : '☰';
}

// Close mobile menu
function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (toggle) {
            toggle.innerHTML = '☰';
        }
    }
}

// Initialize service cards interactions
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Add click interaction
        card.addEventListener('click', function() {
            // Add a subtle feedback effect
            this.style.transform = 'scale(0.98) translateY(-5px)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Add hover sound effect simulation (visual feedback)
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 20px 40px rgba(143, 163, 176, 0.4)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}

// Add parallax effect to hero section
function initParallaxEffect() {
    const hero = document.querySelector('.hero-section');
    const heroContent = document.querySelector('.hero-content');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.2;
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${parallax}px)`;
        }
    });
}

// Add smooth hover transitions for interactive elements
function initHoverEffects() {
    const interactiveElements = document.querySelectorAll('.nav-menu a, .service-card, .hero-3d-placeholder');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// Utility function: Throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Fallback smooth scrolling for browsers that don't support it natively
function smoothScrollTo(element, duration = 800) {
    const targetPosition = element.offsetTop - 50;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Enhanced navigation with fallback for older browsers
function initNavigationFallback() {
    // Check if browser supports smooth scrolling
    if (!('scrollBehavior' in document.documentElement.style)) {
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement);
                    closeMobileMenu();
                }
            });
        });
    }
}

// Initialize fallback if needed
document.addEventListener('DOMContentLoaded', function() {
    initNavigationFallback();
});
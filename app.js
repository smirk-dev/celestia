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
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('section[id]');
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target from href attribute
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Calculate offset for fixed sidebar (280px)
                const offsetTop = targetSection.offsetTop - 50; // Small padding from top
                
                // Smooth scroll to section
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active navigation
                updateActiveNav(this);
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
    
    // Handle scroll-based active navigation
    window.addEventListener('scroll', throttle(updateNavOnScroll, 100));
    
    // Set initial active state
    setTimeout(() => {
        updateNavOnScroll();
    }, 100);
}

// Update active navigation state
function updateActiveNav(activeLink) {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    activeLink.classList.add('active');
}

// Update navigation based on scroll position
function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const scrollPos = window.scrollY + 200; // Offset for better detection
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            current = sectionId;
        }
    });
    
    // If we're at the very top, default to hero
    if (window.scrollY < 100) {
        current = 'hero';
    }
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href').substring(1);
        if (linkHref === current) {
            link.classList.add('active');
        }
    });
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
                    updateActiveNav(this);
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
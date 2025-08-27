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
    initProjectVideoHandlers();
    initContactForm();
    initProjectCards(); // Initialize project cards
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
    const observerOptions = { threshold: 0.08, rootMargin: '0px 0px -60px 0px' };
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
        section.style.transition = 'opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)';
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
    const cards = Array.from(document.querySelectorAll('.service-card'));
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
        const video = card.querySelector('.service-video');
        const thumb = card.querySelector('.service-thumb');

        const loadAndPlay = async () => {
            if (!video) return;
            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                try { video.load(); } catch (e) {}
            }
            try { await video.play(); } catch (e) {}
        };

        const stopAndUnload = () => {
            if (!video) return;
            try { video.pause(); } catch (e) {}
            if (video.src) {
                video.removeAttribute('src');
                try { video.load(); } catch (e) {}
            }
        };

        // click opens modal viewer (actual size)
        card.addEventListener('click', async (e) => {
            await openServiceModal(video);
        });

        // keyboard accessibility: Enter/Space to open modal
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openServiceModal(video);
            }
        });

        card.addEventListener('mouseenter', () => card.style.boxShadow = '0 20px 40px rgba(143,163,176,0.4)');
        card.addEventListener('mouseleave', () => card.style.boxShadow = '');
    });
}

/* Backdrop handling for services overlay */
function showServiceBackdrop(card) {
    removeServiceBackdrop();
    const backdrop = document.createElement('div');
    backdrop.className = 'card-backdrop';
    backdrop.addEventListener('click', () => {
        // close any open service cards
        document.querySelectorAll('.service-card.is-open').forEach(c => {
            c.classList.remove('is-open');
            const vid = c.querySelector('.service-video'); if (vid) { try { vid.pause(); } catch(e){}; if (vid.src) { vid.removeAttribute('src'); try { vid.load(); } catch(e){} } }
        });
        removeServiceBackdrop();
    });
    document.body.appendChild(backdrop);

    // Esc key should also close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.service-card.is-open').forEach(c => {
                c.classList.remove('is-open');
                const vid = c.querySelector('.service-video'); if (vid) { try { vid.pause(); } catch(e){}; if (vid.src) { vid.removeAttribute('src'); try { vid.load(); } catch(e){} } }
            });
            removeServiceBackdrop();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function removeServiceBackdrop() {
    document.querySelectorAll('.card-backdrop').forEach(b => b.remove());
}

// Modal for services (actual-size playback)
async function openServiceModal(sourceVideo) {
    if (!sourceVideo) return;
    // ensure video src is loaded
    if (!sourceVideo.src && sourceVideo.dataset.src) {
        sourceVideo.src = sourceVideo.dataset.src;
        try { sourceVideo.load(); } catch (e) {}
    }

    // create backdrop and modal elements
    const backdrop = document.createElement('div');
    backdrop.className = 'service-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'service-modal';

    const content = document.createElement('div');
    content.className = 'service-modal__content';

    const modalVideo = document.createElement('video');
    modalVideo.className = 'service-modal__video';
    modalVideo.controls = false;
    modalVideo.playsInline = true;
    modalVideo.muted = true;
    modalVideo.autoplay = true;
    modalVideo.loop = false;
    // suppress native controls across browsers
    try { modalVideo.disablePictureInPicture = true; } catch(e) {}
    modalVideo.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback nofullscreen');
    // copy poster if any
    if (sourceVideo.getAttribute('poster')) {
        modalVideo.setAttribute('poster', sourceVideo.getAttribute('poster'));
    }
    // use same src (load if needed)
    if (sourceVideo.src) {
        modalVideo.src = sourceVideo.src;
    } else if (sourceVideo.dataset.src) {
        modalVideo.src = sourceVideo.dataset.src;
    }

    content.appendChild(modalVideo);
    modal.appendChild(content);
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    const cleanup = () => {
        try { modalVideo.pause(); } catch (e) {}
        backdrop.remove();
        modal.remove();
    };

    // interactions
    backdrop.addEventListener('click', cleanup);
    // close when clicking anywhere outside the content/video within the modal
    modal.addEventListener('click', (e) => {
        if (!content.contains(e.target)) cleanup();
    });
    document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){ cleanup(); document.removeEventListener('keydown', esc); } });

    try { await modalVideo.play(); } catch (e) { /* user gesture may be required */ }
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

/* ------------------------- Project video lazy-load & autoplay ------------------------- */
function initProjectVideoHandlers() {
    const cards = Array.from(document.querySelectorAll('.project-card'));
    if (!cards.length) return;

    cards.forEach(card => {
        const video = card.querySelector('.project-video');
        if (!video) return;

        // helper to load and play
        const loadAndPlay = async () => {
            if (!video.dataset.src) return;
            if (!video.src) {
                video.src = video.dataset.src;
                try { video.load(); } catch (e) { /* ignore */ }
            }
            try { await video.play(); } catch (e) { /* autoplay blocked; ignore */ }
        };

        const stopAndUnload = () => {
            try { video.pause(); } catch (e) {}
            if (video.src) {
                video.removeAttribute('src');
                try { video.load(); } catch (e) {}
            }
        };

        // Click toggles open state (button-like) on all screen sizes
        card.addEventListener('click', (e) => {
            const isNowOpen = card.classList.contains('is-open');

            // close any other open project cards first
            document.querySelectorAll('.project-card.is-open').forEach(other => {
                if (other !== card) {
                    other.classList.remove('is-open');
                    const vid = other.querySelector('.project-video'); if (vid) { try { vid.pause(); } catch(e){}; if (vid.src) { vid.removeAttribute('src'); try { vid.load(); } catch(e){} } }
                }
            });

            if (!isNowOpen) {
                // open this card
                card.classList.add('is-open');
                loadAndPlay();
                showProjectBackdrop(card);
            } else {
                // close
                card.classList.remove('is-open');
                stopAndUnload();
                removeProjectBackdrop();
            }
        });

        // keyboard accessibility: Enter/Space to toggle
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isNowOpen = card.classList.contains('is-open');
                if (!isNowOpen) {
                    // close others
                    document.querySelectorAll('.project-card.is-open').forEach(other => {
                        if (other !== card) {
                            other.classList.remove('is-open');
                            const vid = other.querySelector('.project-video'); if (vid) { try { vid.pause(); } catch(e){}; if (vid.src) { vid.removeAttribute('src'); try { vid.load(); } catch(e){} } }
                        }
                    });
                    card.classList.add('is-open');
                    loadAndPlay();
                    showProjectBackdrop(card);
                } else {
                    card.classList.remove('is-open');
                    stopAndUnload();
                    removeProjectBackdrop();
                }
            }
        });

        // subtle hover shadow for affordance
        card.addEventListener('mouseenter', () => card.style.boxShadow = '0 20px 40px rgba(143,163,176,0.18)');
        card.addEventListener('mouseleave', () => card.style.boxShadow = '');
    });
}

/* Backdrop handling for project overlays (mirrors service backdrop behavior) */
function showProjectBackdrop(card) {
    removeProjectBackdrop();
    const backdrop = document.createElement('div');
    backdrop.className = 'card-backdrop';
    backdrop.addEventListener('click', () => {
        // close any open project cards
        document.querySelectorAll('.project-card.is-open').forEach(c => {
            c.classList.remove('is-open');
            const vid = c.querySelector('.project-video'); if (vid) { try { vid.pause(); } catch(e){}; if (vid.src) { vid.removeAttribute('src'); try { vid.load(); } catch(e){} } }
        });
        removeProjectBackdrop();
    });
    document.body.appendChild(backdrop);

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.project-card.is-open').forEach(c => {
                c.classList.remove('is-open');
                const vid = c.querySelector('.project-video'); if (vid) { try { vid.pause(); } catch(e){}; if (vid.src) { vid.removeAttribute('src'); try { vid.load(); } catch(e){} } }
            });
            removeProjectBackdrop();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function removeProjectBackdrop() {
    document.querySelectorAll('.card-backdrop').forEach(b => b.remove());
}

/* ===== INNOVATIVE PROJECT CARDS FUNCTIONALITY ===== */
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    const scrollProgressBar = document.querySelector('.scroll-progress-fill');
    const scrollDirectionIndicator = document.querySelector('.scroll-direction');
    const projectsSection = document.querySelector('#projects');
    
    let lastScrollTop = 0;
    let scrollDirection = 'down';
    let isScrolling = false;
    let scrollTimeout;

    // Add ARIA attributes for accessibility
    projectCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', 'false');
    });

    // Advanced 3D Scroll Animation System
    function update3DScrollAnimation() {
        const sectionRect = projectsSection.getBoundingClientRect();
        const sectionTop = sectionRect.top;
        const sectionHeight = sectionRect.height;
        const viewportHeight = window.innerHeight;
        
        // Calculate scroll progress through the section (0 to 1)
        let scrollProgress = 0;
        
        if (sectionTop <= 0) {
            // Section is in view or above
            scrollProgress = Math.abs(sectionTop) / (sectionHeight - viewportHeight);
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));
        }
        
        // Update scroll progress bar
        if (scrollProgressBar) {
            scrollProgressBar.style.height = `${scrollProgress * 100}%`;
        }
        
        // Determine which card should be active based on scroll position
        const cardCount = projectCards.length;
        const activeCardIndex = Math.floor(scrollProgress * cardCount);
        
        // Update card states based on scroll position
        projectCards.forEach((card, index) => {
            const cardScrollProgress = Math.abs(index - scrollProgress * (cardCount - 1));
            
            // Remove all state classes
            card.classList.remove('active', 'entering', 'exiting', 'hidden');
            
            // Determine card state
            if (index === activeCardIndex) {
                card.classList.add('active');
            } else if (index === activeCardIndex - 1 || index === activeCardIndex + 1) {
                card.classList.add('entering');
            } else if (index === activeCardIndex - 2 || index === activeCardIndex + 2) {
                card.classList.add('exiting');
            } else {
                card.classList.add('hidden');
            }
            
            // Update scroll progress for 3D positioning
            card.style.setProperty('--scroll-progress', cardScrollProgress.toString());
        });
        
        // Update scroll direction indicator
        if (scrollDirectionIndicator) {
            scrollDirectionIndicator.textContent = scrollDirection.toUpperCase();
            scrollDirectionIndicator.className = `scroll-direction ${scrollDirection}`;
        }
    }
    
    // Enhanced scroll event handler with throttling
    function handleScroll() {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
                update3DScrollAnimation();
                isScrolling = false;
            });
        }
        
        // Update scroll direction
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up';
        lastScrollTop = currentScrollTop;
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Update scroll direction indicator after scroll stops
        scrollTimeout = setTimeout(() => {
            scrollDirectionIndicator?.classList.remove('up', 'down');
        }, 150);
    }
    
    // Throttled scroll event
    let ticking = false;
    function throttledScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Initial call to set up initial state
    update3DScrollAnimation();
    
    // Click handler for card expansion
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            toggleProjectCard(card);
        });
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleProjectCard(card);
            } else if (e.key === 'Escape') {
                closeAllProjectCards();
            }
        });
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            enhanceHoverEffects(card);
        });
        
        card.addEventListener('mouseleave', () => {
            resetHoverEffects(card);
        });
        
        // Mouse tracking for magnetic effect
        card.addEventListener('mousemove', (e) => {
            trackMousePosition(card, e);
        });
    });
    
    // Close cards when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-card') && !e.target.closest('.project-backdrop')) {
            closeAllProjectCards();
        }
    });
    
    // Close cards on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllProjectCards();
        }
    });
    
    // Intersection Observer for entrance animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                triggerCardAnimations(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    projectCards.forEach(card => observer.observe(card));
    
    // Resize handler for responsive adjustments
    window.addEventListener('resize', () => {
        update3DScrollAnimation();
    });
}

/* ------------------------- Contact form (EmailJS) ------------------------- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const alertEl = document.getElementById('contact-alert');
    const resetBtn = document.getElementById('contact-reset');

    // read placeholders for EmailJS config
    const serviceInput = document.getElementById('emailjs_service_id');
    const templateInput = document.getElementById('emailjs_template_id');
    const publicInput = document.getElementById('emailjs_public_key');

    // load EmailJS SDK if not present (lightweight injection)
    const ensureEmailJS = () => new Promise((resolve, reject) => {
        if (window.emailjs) return resolve(window.emailjs);
        const s = document.createElement('script');
        s.src = 'https://cdn.emailjs.com/dist/email.min.js';
        s.onload = () => { try { emailjs.init(publicInput?.value || ''); } catch(e){}; resolve(window.emailjs); };
        s.onerror = reject;
        document.head.appendChild(s);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertEl.hidden = true;

        // Basic validation
        const name = form.querySelector('[name="from_name"]').value.trim();
        const reply = form.querySelector('[name="reply_to"]').value.trim();
        const message = form.querySelector('[name="message"]').value.trim();
        if (!name || !reply || !message) {
            alertEl.textContent = 'Please complete name, email and message.';
            alertEl.hidden = false;
            return;
        }

        const serviceId = serviceInput?.value || '';
        const templateId = templateInput?.value || '';
        const publicKey = publicInput?.value || '';

        if (!serviceId || !templateId || !publicKey) {
            alertEl.textContent = 'EmailJS not configured. Please set service/template/public key in the form.';
            alertEl.hidden = false;
            return;
        }

        try {
            await ensureEmailJS();
            // initialize with public key (if not already)
            try { emailjs.init(publicKey); } catch (e) {}

            const templateParams = {
                from_name: name,
                reply_to: reply,
                subject: form.querySelector('[name="subject"]').value || '(no subject)',
                message: message
            };

            alertEl.textContent = 'Sending...';
            alertEl.hidden = false;

            const result = await emailjs.send(serviceId, templateId, templateParams);
            alertEl.textContent = 'Message sent — thank you!';
            // optionally clear form
            form.reset();
        } catch (err) {
            console.error('EmailJS send error', err);
            alertEl.textContent = 'Unable to send message. Try again later.';
            alertEl.hidden = false;
        }
    });

    resetBtn?.addEventListener('click', () => {
        form.reset();
        alertEl.hidden = true;
    });
}

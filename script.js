document.addEventListener('DOMContentLoaded', () => {
    initActiveNavigation();
    initHeroTypewriter();
    initContactForm();
    initMobileNavigation();
    initScrollReveals();
});

function initActiveNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = Array.from(document.querySelectorAll('#main-home, section[id]'));

    if (navLinks.length === 0 || sections.length === 0) return;

    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 120;
        let activeId = 'main-home';

        for (const section of sections) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeId = section.id;
                break;
            }
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
    }

    updateActiveNavLink();
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
}

function initHeroTypewriter() {
    const typewriter = document.getElementById('hero-typewriter');
    if (!typewriter) return;

    const phrases = (typewriter.dataset.phrases || '')
        .split('|')
        .map(phrase => phrase.trim())
        .filter(Boolean);

    if (phrases.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        typewriter.textContent = phrases[0];
        return;
    }

    let phraseIndex = 0;
    let characterIndex = phrases[0].length;
    let isDeleting = false;

    function tick() {
        const currentPhrase = phrases[phraseIndex];
        typewriter.textContent = currentPhrase.slice(0, characterIndex);

        if (!isDeleting && characterIndex === currentPhrase.length) {
            isDeleting = true;
            window.setTimeout(tick, 1800);
            return;
        }

        if (isDeleting && characterIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }

        characterIndex += isDeleting ? -1 : 1;
        window.setTimeout(tick, isDeleting ? 42 : 68);
    }

    tick();
}

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (!contactForm || !formStatus) return;

    contactForm.addEventListener('submit', event => {
        event.preventDefault();

        formStatus.textContent = 'Sending...';
        formStatus.style.color = '#3b82f6';

        fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: {
                Accept: 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }

                formStatus.textContent = 'Message sent successfully.';
                formStatus.style.color = '#3b82f6';
                contactForm.reset();

                window.setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            })
            .catch(error => {
                formStatus.textContent = 'Error sending message. Please email me instead.';
                formStatus.style.color = '#ef4444';
                console.error('Form submission error:', error);
            });
    });
}

function initMobileNavigation() {
    const menuButton = document.querySelector('.mobile-nav-toggle');
    const navbar = document.getElementById('navbar');

    if (!menuButton || !navbar) return;

    function closeMenu() {
        navbar.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menu';
    }

    menuButton.addEventListener('click', event => {
        event.stopPropagation();

        const isOpen = navbar.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.textContent = isOpen ? 'Close' : 'Menu';
    });

    navbar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

function initScrollReveals() {
    const revealTargets = Array.from(document.querySelectorAll([
        '#main-home #Home',
        'section',
        '.about-facts div',
        '.project-card',
        '.skill-group',
        '#Contact .contact-form',
        '#Contact .contact-links'
    ].join(', ')));

    if (revealTargets.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        revealTargets.forEach(target => target.classList.add('is-visible'));
        return;
    }

    revealTargets.forEach((target, index) => {
        target.classList.add('reveal-item');
        target.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 45}ms`);
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12
    });

    revealTargets.forEach(target => observer.observe(target));
}

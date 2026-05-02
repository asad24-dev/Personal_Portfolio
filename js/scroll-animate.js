"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initScrollProgress();
    initNavSpy();
    initRevealGroups();
});

function initScrollProgress() {
    const scrollBar = document.getElementById("scroll-bar");
    if (!scrollBar) return;

    function updateScrollBar() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        scrollBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    }

    updateScrollBar();
    window.addEventListener("scroll", updateScrollBar, { passive: true });
    window.addEventListener("resize", updateScrollBar);
}

function initNavSpy() {
    const links = Array.from(document.querySelectorAll(".site-nav-link[href^='#']"));
    const pairs = links
        .map(link => ({
            link,
            section: document.querySelector(link.getAttribute("href"))
        }))
        .filter(pair => pair.section);

    if (links.length === 0 || pairs.length === 0) return;

    function setActive(activeLink) {
        links.forEach(link => {
            link.classList.toggle("active", link === activeLink);
        });
    }

    if (!("IntersectionObserver" in window)) {
        setActive(pairs[0].link);
        return;
    }

    const observer = new IntersectionObserver(entries => {
        const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const activePair = pairs.find(pair => pair.section === visible.target);
        if (activePair) setActive(activePair.link);
    }, {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.08, 0.2, 0.45]
    });

    pairs.forEach(pair => observer.observe(pair.section));
}

function initRevealGroups() {
    const groups = Array.from(document.querySelectorAll(".reveal-group"));
    if (groups.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
        groups.forEach(group => {
            group.querySelectorAll(".reveal-item").forEach(item => {
                item.classList.add("revealed", "is-visible");
            });
        });
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.querySelectorAll(".reveal-item").forEach((item, index) => {
                item.style.transitionDelay = `${index * 0.06}s`;
                item.classList.add("revealed", "is-visible");
            });
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.08
    });

    groups.forEach(group => observer.observe(group));
}

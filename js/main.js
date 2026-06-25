"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initInteractiveTexture();
    initSplitWords();
    initMagneticButtons();
    initBentoCards();
});

function initThemeToggle() {
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    const updateToggle = theme => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        const label = `Switch to ${nextTheme} theme`;
        toggle.setAttribute("aria-label", label);
        toggle.setAttribute("title", label);
    };

    updateToggle(document.documentElement.dataset.theme);

    toggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.dataset.theme;
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.dataset.theme = nextTheme;
        try {
            localStorage.setItem("portfolio-theme", nextTheme);
        } catch {
            // The current page can still switch themes without persistence.
        }
        updateToggle(nextTheme);
    });
}

function initInteractiveTexture() {
    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(hover: none)").matches
    ) {
        return;
    }

    const root = document.documentElement;
    let frameId = null;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const render = () => {
        const x = (pointerX / window.innerWidth - 0.5) * 14;
        const y = (pointerY / window.innerHeight - 0.5) * 14;

        root.style.setProperty("--texture-x", `${x.toFixed(2)}px`);
        root.style.setProperty("--texture-y", `${y.toFixed(2)}px`);
        root.style.setProperty("--wash-x", `${(-x * 0.55).toFixed(2)}px`);
        root.style.setProperty("--wash-y", `${(-y * 0.55).toFixed(2)}px`);
        frameId = null;
    };

    window.addEventListener("pointermove", event => {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (frameId === null) {
            frameId = requestAnimationFrame(render);
        }
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", () => {
        pointerX = window.innerWidth / 2;
        pointerY = window.innerHeight / 2;

        if (frameId === null) {
            frameId = requestAnimationFrame(render);
        }
    });
}

function initSplitWords() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll("[data-split-words]").forEach(element => {
        const words = [];
        let index = 0;

        element.querySelectorAll("span").forEach(line => {
            const lineWords = line.textContent.trim().split(/\s+/);
            line.innerHTML = lineWords
                .map(word => {
                    const delay = (index * 0.07).toFixed(2);
                    index += 1;
                    return `<span class="split-word" style="animation-delay:${delay}s">${word}</span>`;
                })
                .join(" ");
            words.push(line);
        });
    });
}

function initMagneticButtons() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".magnetic-wrap").forEach(wrap => {
        const target = wrap.querySelector("a, button");
        if (!target) return;

        wrap.addEventListener("mousemove", event => {
            const rect = wrap.getBoundingClientRect();
            const dx = (event.clientX - (rect.left + rect.width / 2)) * 0.3;
            const dy = (event.clientY - (rect.top + rect.height / 2)) * 0.3;
            target.style.transition = "transform 0.1s ease";
            target.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        wrap.addEventListener("mouseleave", () => {
            target.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
            target.style.transform = "translate(0, 0)";
        });
    });
}

function initBentoCards() {
    document.querySelectorAll(".bento-card").forEach(card => {
        card.addEventListener("mousemove", event => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
            card.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
        });

        card.addEventListener("click", event => {
            if (event.target.closest("a")) return;

            const expand = card.querySelector(".bento-expand");
            if (!expand) return;

            if (event.target.closest(".bento-expand-close")) {
                setBentoExpanded(expand, false);
                return;
            }

            if (expand.classList.contains("open")) return;

            setBentoExpanded(expand, true);
        });
    });
}

function setBentoExpanded(expand, isOpen) {
    expand.classList.toggle("open", isOpen);
    expand.setAttribute("aria-hidden", String(!isOpen));
}

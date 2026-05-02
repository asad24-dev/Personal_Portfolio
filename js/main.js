"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initSplitWords();
    initMagneticButtons();
    initBentoCards();
});

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

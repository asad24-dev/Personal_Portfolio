"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initCursor();
});

function initCursor() {
    const cursor = document.getElementById("cursor");
    if (!cursor || window.matchMedia("(hover: none)").matches) return;

    document.addEventListener("mousemove", event => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
    });

    document.querySelectorAll("a, button, input, textarea, .terminal-shell-tab").forEach(element => {
        element.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
        element.addEventListener("mouseleave", () => cursor.classList.remove("hovering"));
    });

    document.querySelectorAll(".bento-card, .exp-item, .contact-shell").forEach(element => {
        element.addEventListener("mouseenter", () => cursor.classList.add("on-card"));
        element.addEventListener("mouseleave", () => cursor.classList.remove("on-card"));
    });
}

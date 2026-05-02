"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    if (!contactForm || !formStatus) return;

    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        formStatus.textContent = "Sending...";
        formStatus.style.color = "var(--accent)";

        fetch(contactForm.action, {
            method: "POST",
            body: new FormData(contactForm),
            headers: {
                Accept: "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }

                formStatus.textContent = "Message sent successfully.";
                formStatus.style.color = "var(--accent)";
                contactForm.reset();

                window.setTimeout(() => {
                    formStatus.textContent = "";
                }, 5000);
            })
            .catch(error => {
                formStatus.textContent = "Error sending message. Please email me instead.";
                formStatus.style.color = "var(--error)";
                console.error("Form submission error:", error);
            });
    });
}

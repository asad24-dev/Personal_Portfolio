document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURATION ---
    const animationDuration = 0.5;   // How long each letter takes to draw (in seconds)
    const staggerDelay = 0.3;      // The delay between each letter starting (in seconds)
    const pauseAfterDrawing = 0.4; // How long to pause after the last letter is drawn (in seconds)

    // --- GET HTML ELEMENTS ---
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');
    const svg = document.getElementById('handwriting-svg');
    const paths = svg.querySelectorAll('path');
    const canvas = document.getElementById('binary-rain-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // --- Configuration ---
    const binaryChars = '01';
    const fontSize = 16;
    // A bright, vibrant cyan
    const trailLength = 20; // How many characters long the trail is
    const rainSpeed = 25;   // Milliseconds per frame (~30 FPS)

    const columns = Math.floor(canvas.width / fontSize);

    // NEW DATA STRUCTURE:
    // Instead of just a Y position, each "drop" is an object
    // that tracks its own position and trail of characters.
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = {
            y: Math.random() * canvas.height, // Start at a random height
            chars: [], // An array to hold the trail characters
            update: function() {
                // Add a new character to the front of the trail
                this.chars.unshift(binaryChars.charAt(Math.floor(Math.random() * binaryChars.length)));
                // If the trail is too long, remove the last character
                if (this.chars.length > trailLength) {
                    this.chars.pop();
                }
                // Move the drop down
                this.y += fontSize;
                // "Flicker" reset: If it goes off-screen, randomly decide to reset it
                if (this.y > canvas.height && Math.random() > 0.975) {
                    this.y = 0;
                }
            }
        };
    }

    function drawBinaryRain() {
        // 1. CLEAR THE ENTIRE CANVAS COMPLETELY
        // This makes it fully transparent, revealing the solid CSS background
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + 'px monospace';
        
        // 2. Loop through each drop/column
        for (let i = 0; i < drops.length; i++) {
            // 3. Loop through the characters in THIS drop's trail
            for (let j = 0; j < drops[i].chars.length; j++) {
                const char = drops[i].chars[j];
                const yPos = drops[i].y - (j * fontSize);

                // Calculate opacity based on position in the trail
                // The head of the trail (j=0) is brightest
                const opacity = 1 - (j / drops[i].chars.length);
                
                // Set the color and opacity for this specific character
                ctx.fillStyle = `rgba(38, 105, 249, ${opacity})`;
                // ctx.shadowBlur = 10;
                // ctx.shadowColor = `rgba(0, 229, 255, ${opacity})`;

                // Draw the character
                ctx.fillText(char, i * fontSize, yPos);
            }
            // Update the drop's state for the next frame
            drops[i].update();
        }
    }

    // Check if user has seen the animation before - MOVED DOWN AFTER FUNCTIONS ARE DEFINED
    const hasSeenAnimation = sessionStorage.getItem('hasSeenIntro');
    
    // Start the binary rain animation (regardless of whether intro is shown)
    const rainInterval = setInterval(drawBinaryRain, rainSpeed);
    
    if (hasSeenAnimation) {
        // User has already seen animation, skip intro
        introScreen.classList.add('hidden');
        mainContent.style.display = 'block';
        return; // Exit early to skip animation code
    }
    
    // If we get here, this is the first visit - continue with animation
    svg.style.opacity = '0'; // Hide SVG initially to prevent flicker

    setTimeout(() => {
        svg.style.opacity = '1';

        paths.forEach((path, index) => {
            const length = path.getTotalLength();

            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;

            // NEW: Calculate the delay for this specific path
            const delay = index * staggerDelay;

            // UPDATED: Apply the animation with the calculated duration and delay
            path.style.animation = `draw-in ${animationDuration}s ease-in-out forwards ${delay}s`;
        });

        const lastPath = paths[paths.length - 1];
        if (lastPath) {
            lastPath.addEventListener('animationend', () => {
                // This event now fires when the *last letter* is done drawing.
                svg.classList.add('drawn');
        
                // A short pause for effect
                setTimeout(() => {
                    // Start the fade-out
                    introScreen.classList.add('hidden');
                    sessionStorage.setItem('hasSeenIntro', 'true');
                    // --- LISTEN FOR THE FADE-OUT TO COMPLETE ---
                    introScreen.addEventListener('transitionend', () => {
                        // This function will ONLY run after the 'opacity: 1s' transition is done
                        mainContent.style.display = 'block';
                        const navbar = document.getElementById('navbar');
                        if (navbar) {
                            navbar.style.position = 'fixed';
                        }
                    }, { once: true }); // Pro-tip: { once: true } automatically removes the listener after it runs.

                }, 500); // Convert seconds to milliseconds
            });
        }
    }, 200);
});
// ...existing code...

// Replace your current scroll event listener with this improved version
document.addEventListener('DOMContentLoaded', function() {
    // Get elements only once outside the scroll handler for better performance
    const homeElement = document.getElementById('Home');
    const homeSection = document.getElementById('main-home');
    const aboutSection = document.getElementById('About');
    
    // Define animation parameters
    const startTransformDistance = 400; // Start animation when we're 100px before the About section
    const animationDistance = 300; // Complete the animation over 400px of scrolling
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const aboutOffset = aboutSection.offsetTop;
        const triggerStart = aboutOffset - startTransformDistance;
        if (window.innerWidth <= 768) {
        // Reset any styling if we're on mobile
            if (homeElement) {
                homeElement.style.transform = '';
                homeElement.style.position = '';
                homeElement.style.top = '';
                homeElement.style.left = '';
                homeElement.style.width = '';
                
                // Reset typography
                const h1Elements = homeElement.querySelectorAll('h1');
                h1Elements.forEach(el => el.style.fontSize = '');
                
                const nameElement = document.getElementById('name');
                if (nameElement) nameElement.style.fontSize = '';
                
                const descriptionElements = document.querySelectorAll('#description p');
                descriptionElements.forEach(el => el.style.fontSize = '');
                
                const resumeButton = document.querySelector('.download-resume');
                if (resumeButton) {
                    resumeButton.style.padding = '';
                    resumeButton.style.fontSize = '';
                }
            }
            return;
        }
        // Calculate how far into the animation we are (0 to 1)
        let progress = 0;
        
        if (scrollPosition < triggerStart) {
            // Before animation starts
            progress = 0;
        } else if (scrollPosition > triggerStart + animationDistance) {
            // After animation completes
            progress = 1;
        } else {
            // During animation - calculate percentage complete (0 to 1)
            progress = (scrollPosition - triggerStart) / animationDistance;
        }
        
        if (progress > 0) {
            // Apply transformations based on scroll progress
            const scale = 1 - (0.2 * progress); // Scale from 1 down to 0.7
            const leftPosition = 40 + (0 * progress); // Left position stays at 40px
            const topPosition = 50 + (130 * progress); // Top moves from 50px to 130px
            const width = 50 - (8 * progress); // Width shrinks from 50% to 30%
            
            // Apply the transformations directly with CSS
            homeElement.style.transform = `scale(${scale})`;
            homeElement.style.transformOrigin = 'left';
            homeElement.style.position = progress > 0.1 ? 'fixed' : ''; // Start fixing position after 10% progress
            homeElement.style.top = `${topPosition}px`;
            homeElement.style.left = `${leftPosition}px`;
            homeElement.style.width = `${width}%`;
              // Background darkens from 0.8 to 1.0
            // Adjust typography based on progress
            const h1FontSize = 76 - (16 * progress); // From 76px to 48px
            const nameSize = 64 - (16 * progress); // Adjust based on your current font size
            const descriptionSize = 20 - (1.5 * progress); // From 20px to 16px
            
            // Apply typography changes
            const h1Elements = homeElement.querySelectorAll('h1');
            h1Elements.forEach(el => el.style.fontSize = `${h1FontSize}px`);
            
            const nameElement = document.getElementById('name');
            if (nameElement) nameElement.style.fontSize = `${nameSize}px`;
            
            const descriptionElements = document.querySelectorAll('#description p');
            descriptionElements.forEach(el => el.style.fontSize = `${descriptionSize}px`);
            
            // Make social links/resume button smaller
            const resumeButton = document.querySelector('.download-resume');
            if (resumeButton) {
                const paddingV = 12 - (4 * progress); // Vertical padding
                const paddingH = 18 - (4 * progress); // Horizontal padding
                const fontSize = 18 - (4 * progress); // Font size
                resumeButton.style.padding = `${paddingV}px ${paddingH}px`;
                resumeButton.style.fontSize = `${fontSize}px`;
            }
            
        } else {
            // Reset all styles when back at the top
            homeElement.style.transform = '';
            homeElement.style.position = '';
            homeElement.style.top = '';
            homeElement.style.left = '';
            homeElement.style.width = '';
            
            // Reset typography
            const h1Elements = homeElement.querySelectorAll('h1');
            h1Elements.forEach(el => el.style.fontSize = '');
            
            const nameElement = document.getElementById('name');
            if (nameElement) nameElement.style.fontSize = '';
            
            const descriptionElements = document.querySelectorAll('#description p');
            descriptionElements.forEach(el => el.style.fontSize = '');
            
            // Reset button
            const resumeButton = document.querySelector('.download-resume');
            if (resumeButton) {
                resumeButton.style.padding = '';
                resumeButton.style.fontSize = '';
            }
        }
        
        // Make sure sections below have appropriate padding to make room for sidebar
        // Add this to your scroll event listener in script.js, modifying the section around line 255
// Look for the section that adjusts padding on scroll
        if (progress > 0.8) { // When we're mostly done with the animation
            document.querySelectorAll('#About, #Projects, #Skills, #Publications, #Recommendations, #Github, #Contact').forEach(section => {
                section.style.paddingLeft = '45%';
            });
        } else {
            document.querySelectorAll('#About, #Projects, #Skills, #Publications, #Recommendations, #Github, #Contact').forEach(section => {
                section.style.paddingLeft = '';
            });
        }
    });
});
// ...existing code in your scroll event listener...

// Add this to your DOMContentLoaded event listener, after your existing scroll handler
document.addEventListener('DOMContentLoaded', function() {
    // Your existing code...
    
    // Add navigation active state tracking to the scroll event
    window.addEventListener('scroll', function() {
        // Your existing scroll animation code...
        
        // Add this section for active navigation links
        updateActiveNavLink();
    });
    
    // Function to update the active nav link based on scroll position
    // Replace your updateActiveNavLink function with this improved version
    function updateActiveNavLink() {
        // Get all sections that should be tracked in the navigation
        const sections = document.querySelectorAll('section[id]');
        
        // Get current scroll position with a smaller offset for better detection
        const scrollPosition = window.scrollY + 100;
        
        // Track if any section is active
        let foundActive = false;
        
        // Check each section to see if it's current, starting from the bottom sections first
        // This way, the most specific (lower) section gets priority
        const sectionsArray = Array.from(sections);
        for (let i = sectionsArray.length - 1; i >= 0; i--) {
            const section = sectionsArray[i];
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            // If the current scroll position is within this section
            if (scrollPosition >= sectionTop && 
                scrollPosition < sectionTop + sectionHeight) {
                
                // Remove active class from all nav links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to the corresponding nav link
                const activeLink = document.querySelector(`#navbar a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                foundActive = true;
                break; // Stop after finding the first active section
            }
        }
        
        // If no section is active (very top of page), activate Home
        if (!foundActive && window.scrollY < 100) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            const homeLink = document.querySelector('#navbar a[href="#main-home"]');
            if (homeLink) {
                homeLink.classList.add('active');
            }
        }
    }
        
    // Initialize the active nav link on page load
    updateActiveNavLink();
});
// Add this to your existing JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GitHub Calendar with colors matching your theme
    // Initialize GitHub Calendar with colors matching your theme
GitHubCalendar(".calendar", "asad24-dev", {
    responsive: true,
    tooltips: true,
    global_stats: false,
    years: [2025],
    from: "2025-01-01",
    until: "2025-12-31",
    summary_text: '📅 2025 Contribution Activity',
    cache: 86400,
    proxy: function(username) {
        return {
            url: `https://cors-anywhere.herokuapp.com/https://github.com/users/${username}/contributions?from=2025-01-01&to=2025-12-31`,
            headers: {
                "User-Agent": "GitHub Calendar Widget"
            }
        };
    } 
});


}
);

// Add this to your existing script.js file

document.addEventListener('DOMContentLoaded', function() {
    // Form submission handler
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show sending status
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '#00E5FF';
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Send form data using Formspree
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Show success message
                    formStatus.textContent = 'Message sent successfully!';
                    formStatus.style.color = '#00E5FF';
                    contactForm.reset(); // Clear the form
                    
                    // Clear success message after 5 seconds
                    setTimeout(() => {
                        formStatus.textContent = '';
                    }, 5000);
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                // Show error message
                formStatus.textContent = 'Error sending message. Please try again.';
                formStatus.style.color = '#ff3366';
                
                console.error('Form submission error:', error);
            });
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Add cache-busting to GitHub stats images
    function refreshGitHubStats() {
        const timestamp = new Date().getTime();
        const statImages = document.querySelectorAll('.github-stats-image');
        
        statImages.forEach(img => {
            const currentSrc = img.getAttribute('src');
            // Add or update timestamp parameter
            if (currentSrc.includes('?')) {
                img.setAttribute('src', currentSrc + '&t=' + timestamp);
            } else {
                img.setAttribute('src', currentSrc + '?t=' + timestamp);
            }
        });
    }
    
    // Add refresh button
    const githubSection = document.getElementById('Github');
    const refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Stats';
    refreshButton.className = 'refresh-stats-btn';
    refreshButton.addEventListener('click', refreshGitHubStats);
    
    // Insert button after heading
    const heading = githubSection.querySelector('h2');
    heading.parentNode.insertBefore(refreshButton, heading.nextSibling);
});

// Add to your existing script.js

// Replace your existing mobile menu functionality with this updated code
// Replace your mobile menu toggle functionality in script.js with this:
// Mobile Menu Toggle
// Complete replacement for your mobile menu toggle code
document.addEventListener('DOMContentLoaded', function() {
    // Store navbar state
    let navbarVisible = true;
    
    // Mobile menu functionality
    const menuButton = document.querySelector('.mobile-nav-toggle');
    const navbar = document.getElementById('navbar');
    
    if (menuButton && navbar) {
        // Toggle mobile menu
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Toggle button appearance
            const menuIcon = this.querySelector('.menu-icon');
            if (menuIcon) {
                menuIcon.classList.toggle('change');
            }
            
            // Get current display state
            const isCurrentlyHidden = window.getComputedStyle(navbar).display === 'none';
            
            // Toggle display based on current state
            if (isCurrentlyHidden) {
                navbar.style.display = 'flex';
            } else {
                navbar.style.display = 'none';
            }
        });
        
        // Hide menu when clicking a link (mobile only)
        const navLinks = navbar.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    const menuIcon = menuButton.querySelector('.menu-icon');
                    if (menuIcon) {
                        menuIcon.classList.remove('change');
                    }
                    navbar.style.display = 'none';
                }
            });
        });
    }
    
    // Handle window resize - make navbar visible on large screens
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navbar) {
            navbar.style.display = 'flex';
            navbarVisible = true;
        }
    });
    
    // Handle scrolling - maintain navbar visibility on big screens
    window.addEventListener('scroll', function() {
        if (window.innerWidth > 768 && navbar) {
            navbar.style.display = 'flex';
        }
    });
});
// Add this to your script.js
// Replace your current parallax effect code with this:
document.addEventListener('DOMContentLoaded', function() {
    // Apply parallax effect to binary rain canvas globally
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const canvas = document.getElementById('binary-rain-canvas');
        
        if (canvas) {
            // Create a smoother parallax effect by reducing the multiplier
            canvas.style.transform = 'none';
        }
    });
});
// Add this to your script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize recommendation slider
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (recommendationCards.length > 0) {
        let currentIndex = 0;
        
        // Set first card as active
        recommendationCards[0].classList.add('active');
        
        // Function to show a specific card
        function showCard(index) {
            recommendationCards.forEach(card => card.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            recommendationCards[index].classList.add('active');
            dots[index].classList.add('active');
            currentIndex = index;
        }
        
        // Next button click
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= recommendationCards.length) {
                    newIndex = 0;
                }
                showCard(newIndex);
            });
        }
        
        // Previous button click
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) {
                    newIndex = recommendationCards.length - 1;
                }
                showCard(newIndex);
            });
        }
        
        // Dot clicks
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                showCard(index);
            });
        });
        
        // Auto-advance the slider every 5 seconds
        setInterval(() => {
            let newIndex = currentIndex + 1;
            if (newIndex >= recommendationCards.length) {
                newIndex = 0;
            }
            showCard(newIndex);
        }, 5000);
    }
});
// Add to your script.js
// Custom cursor and trail effects
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize cursor effects on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        initCustomCursor();
        initCursorTrail();
    }
});

function initCustomCursor() {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    
    // Variables for smooth animation
    let dotX = 0, dotY = 0;
    let outlineX = 0, outlineY = 0;
    
    // Update cursor position on mouse move
    document.addEventListener('mousemove', function(e) {
        // Target positions
        dotX = e.clientX;
        dotY = e.clientY;
        
        // Apply position immediately to dot for responsive feel
        cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    });
    
    // Animate cursor outline with a smoother follow effect
    function animateCursor() {
        // Calculate distance to target
        const dx = dotX - outlineX;
        const dy = dotY - outlineY;
        
        // Move outline cursor with easing
        outlineX += dx * 0.2;
        outlineY += dy * 0.2;
        
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Change cursor state on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, input, textarea');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'scale(1.5)';
            cursorOutline.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'scale(1)';
            cursorOutline.classList.remove('hover');
        });
    });
    
    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });
    
    // Show cursor when mouse enters window
    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '0.6';
    });
    
    // Add click effect
    document.addEventListener('mousedown', () => {
        cursorDot.style.transform = 'scale(0.8)';
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) scale(0.8)`;
    });
    
    document.addEventListener('mouseup', () => {
        cursorDot.style.transform = 'scale(1)';
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) scale(1)`;
    });
}

function initCursorTrail() {
    const trailContainer = document.getElementById('cursor-trail-container');
    let lastX = 0;
    let lastY = 0;
    let lastTimestamp = 0;
    
    // Code symbols to use for trail
    const codeSymbols = ['0', '1', '{', '}', '[', ']', '(', ')', '<', '>', '/', '*', '+', '-', '=', ';'];
    
    document.addEventListener('mousemove', function(e) {
        const currentTime = Date.now();
        
        // Only create trail particles at certain intervals
        if (currentTime - lastTimestamp > 20) {
            // Check if mouse has moved enough to create new particle
            const distance = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
            
            if (distance > 8) {
                for (let i = 0; i < 3; i++) { // Create 3 particles at once
                    createTrailParticle(e.clientX, e.clientY);
                }
                lastX = e.clientX;
                lastY = e.clientY;
                lastTimestamp = currentTime;
            }
        }
    });
    
    function createTrailParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'trail-particle';
        
        // Random code symbol
        const symbol = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
        particle.textContent = symbol;
        
        // Random position offset
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        const size = Math.random() * 6 + 15; // 10-16px font size
        particle.style.fontSize = size + 'px';
        
        // Random rotation for more visual interest
        const rotation = (Math.random() - 0.5) * 60;
        particle.style.transform = `rotate(${rotation}deg)`;
        // Set position
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        
        // Add to container
        trailContainer.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentNode === trailContainer) {
                trailContainer.removeChild(particle);
            }
        }, 1000);
    }
}
// Enhance interactive elements with cursor effects
function enhanceInteractiveElements() {
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, input, textarea, .skill-item, .project-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });
}

// Call this function after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Other initialization code...
    enhanceInteractiveElements();
});
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
    const rainColor = '#00E5FF'; // A bright, vibrant cyan
    const trailLength = 20; // How many characters long the trail is
    const rainSpeed = 33;   // Milliseconds per frame (~30 FPS)

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
                ctx.fillStyle = `rgba(0, 229, 255, ${opacity})`;
                // ctx.shadowBlur = 10;
                // ctx.shadowColor = `rgba(0, 229, 255, ${opacity})`;

                // Draw the character
                ctx.fillText(char, i * fontSize, yPos);
            }
            // Update the drop's state for the next frame
            drops[i].update();
        }
    }

    // Start the animation loop AND STORE ITS ID
    
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
                // Stop the rain and start the fade-out
                // clearInterval(rainInterval);
                introScreen.classList.add('hidden');

                // --- LISTEN FOR THE FADE-OUT TO COMPLETE ---
                introScreen.addEventListener('transitionend', () => {
                    // This function will ONLY run after the 'opacity: 1s' transition is done
                    const rainInterval = setInterval(drawBinaryRain, rainSpeed);
                    mainContent.style.display = 'block';
                    
                }, { once: true }); // Pro-tip: { once: true } automatically removes the listener after it runs.

            }, 500); // Convert seconds to milliseconds
            });
        }
    }, 200);//
    
});
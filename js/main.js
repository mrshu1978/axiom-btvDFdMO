// Canvas setup
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
const button = document.getElementById('launch-btn');

let rocketsList = [];
let particlesList = [];
let animationId = null;

// Resize handler
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Utility functions
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Rocket class
class Rocket {
    constructor() {
        this.x = random(canvas.width * 0.1, canvas.width * 0.9);
        this.y = canvas.height;
        this.vx = random(-1.5, 1.5);
        this.vy = random(-16, -12);
        this.trail = [];
        this.trailLength = 8;
        this.gravity = 0.3;
        this.exploded = false;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // Check apex (when starts falling)
        if (this.vy >= 0 && !this.exploded) {
            this.explode();
        }
    }

    draw() {
        // Draw trail
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            const gradient = ctx.createLinearGradient(
                this.trail[0].x, this.trail[0].y,
                this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = random(90, 110);
        for (let i = 0; i < particleCount; i++) {
            particlesList.push(new Particle(this.x, this.y));
        }
        // Remove rocket from list
        const index = rocketsList.indexOf(this);
        if (index > -1) {
            rocketsList.splice(index, 1);
        }
    }
}

// Particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hue = random(0, 360);
        this.saturation = '90%';
        this.lightness = '60%';
        const angle = random(0, Math.PI * 2);
        const speed = random(2, 7);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.15;
        this.friction = 0.97;
        this.alpha = 1;
        this.radius = 3;
        this.life = 1;
        this.decay = random(0.012, 0.022);
        this.isSparkle = Math.random() < 0.2;
        this.sparkles = [];
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.alpha = this.life;

        if (this.isSparkle && this.life > 0.5) {
            // Generate sub-sparkles
            for (let i = 0; i < 3; i++) {
                this.sparkles.push({
                    x: this.x,
                    y: this.y,
                    radius: 1,
                    alpha: 0.6,
                    life: 0.5,
                    decay: 0.05
                });
            }
        }

        // Update sparkles
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const sp = this.sparkles[i];
            sp.life -= sp.decay;
            sp.alpha = sp.life;
            if (sp.life <= 0) {
                this.sparkles.splice(i, 1);
            }
        }

        // Remove particle if dead
        if (this.life <= 0) {
            const index = particlesList.indexOf(this);
            if (index > -1) {
                particlesList.splice(index, 1);
            }
        }
    }

    draw() {
        // Draw main particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}, ${this.lightness}, ${this.alpha})`;
        ctx.fill();

        // Draw sparkles
        for (const sp of this.sparkles) {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}, ${this.lightness}, ${sp.alpha})`;
            ctx.fill();
        }
    }
}

// Launch fireworks
function launchFireworks() {
    const rocketCount = random(8, 12);
    for (let i = 0; i < rocketCount; i++) {
        setTimeout(() => {
            rocketsList.push(new Rocket());
        }, i * 120);
    }
}

// Animation loop
function animate() {
    // Clear with fade effect
    ctx.fillStyle = 'rgba(8, 12, 20, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw rockets
    for (const rocket of rocketsList) {
        rocket.update();
        rocket.draw();
    }

    // Update and draw particles
    for (const particle of particlesList) {
        particle.update();
        particle.draw();
    }

    // No need to check animation end - button is always enabled

    animationId = requestAnimationFrame(animate);
}

// Start animation loop
animate();

// Button event listener
button.addEventListener('click', launchFireworks);

// Prevent context menu on canvas
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

console.log('Fireworks engine ready');

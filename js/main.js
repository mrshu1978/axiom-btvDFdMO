const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
const button = document.getElementById('launch-btn');

let rocketsList = [];
let particlesList = [];
let sleighList = [];
let fireworksWaiting = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function random(min, max) {
    return Math.random() * (max - min) + min;
}

class Rocket {
    constructor() {
        this.x = random(canvas.width * 0.1, canvas.width * 0.9);
        this.y = canvas.height;
        this.vx = random(-1.5, 1.5);
        this.vy = random(-16, -12);
        this.trail = [];
        this.trailLength = 8;
        this.gravity = 0.3;
        this.dead = false;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        if (this.vy >= 0) {
            this.explode();
        }
    }

    draw() {
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
        this.dead = true;
        const particleCount = Math.floor(random(90, 110));
        for (let i = 0; i < particleCount; i++) {
            particlesList.push(new Particle(this.x, this.y));
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hue = random(0, 360);
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

        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const sp = this.sparkles[i];
            sp.life -= sp.decay;
            sp.alpha = sp.life;
            if (sp.life <= 0) {
                this.sparkles.splice(i, 1);
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 90%, 60%, ${this.alpha})`;
        ctx.fill();

        for (const sp of this.sparkles) {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 90%, 60%, ${sp.alpha})`;
            ctx.fill();
        }
    }
}

class Sleigh {
    constructor() {
        this.x = canvas.width + 120;
        this.y = random(canvas.height * 0.08, canvas.height * 0.28);
        this.speed = random(3.5, 5.5);
        this.dead = false;
        this.alpha = 0;
        this.bobOffset = 0;
        this.trail = [];
    }

    update() {
        this.x -= this.speed;
        this.bobOffset += 0.05;
        if (this.alpha < 1) this.alpha = Math.min(1, this.alpha + 0.025);

        if (Math.random() < 0.6) {
            this.trail.push({
                x: this.x + 40,
                y: this.y + Math.sin(this.bobOffset) * 8 + 30,
                alpha: 1.0,
                size: random(3, 6)
            });
        }
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].alpha -= 0.03;
            if (this.trail[i].alpha <= 0) this.trail.splice(i, 1);
        }

        if (this.x < -200) this.dead = true;
    }

    draw() {
        const cx = this.x;
        const cy = this.y + Math.sin(this.bobOffset) * 8;
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Beam thruster trail (cyan)
        for (const star of this.trail) {
            ctx.globalAlpha = star.alpha * this.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = '#00FFFF';
            ctx.fill();
        }
        ctx.globalAlpha = this.alpha;

        const f = (color, x, y, w, h) => {
            ctx.fillStyle = color;
            ctx.fillRect(cx + x, cy + y, w, h);
        };

        // === GUNDAM RX-78 (facing left) ===

        // Legs
        f('#FFFFFF', -14, 32, 11, 28);
        f('#FFFFFF',   3, 32, 11, 28);
        // Feet
        f('#3366CC', -16, 56, 14,  8);
        f('#3366CC',   2, 56, 14,  8);
        // Red knee guards
        f('#CC0000', -14, 42,  11,  6);
        f('#CC0000',   3, 42,  11,  6);

        // Waist
        f('#FFFFFF', -13, 28, 26,  6);
        f('#3366CC',  -8, 29, 16,  4);

        // Torso
        f('#FFFFFF', -18, 10, 36, 20);
        // Chest plates (blue)
        f('#3366CC', -16, 12, 13, 10);
        f('#3366CC',   3, 12, 13, 10);
        // Core (yellow)
        f('#FFCC00',  -4, 14,  8,  6);

        // Shoulders (blue, larger)
        f('#3366CC', -30,  6, 15, 18);
        f('#3366CC',  15,  6, 15, 18);
        // Shoulder trim (white)
        f('#FFFFFF', -30,  6, 15,  4);
        f('#FFFFFF',  15,  6, 15,  4);

        // Arms
        f('#FFFFFF', -28, 22, 10, 20);
        f('#FFFFFF',  18, 22, 10, 20);
        // Hands
        f('#3366CC', -28, 40, 10,  5);
        f('#3366CC',  18, 40, 10,  5);

        // Neck
        f('#CCCCCC',  -4,  0,  8,  12);

        // Head
        f('#FFFFFF', -10, -18, 20, 20);
        // Face mask (blue)
        f('#3366CC', -10,  -6, 20, 10);
        // Eyes (yellow visor)
        f('#FFFF00',  -8,  -14, 16,  5);
        // Chin vent
        f('#CC0000',  -4,   2,  8,  3);

        // Center antenna
        f('#FFFF00',  -2, -30,  4, 14);
        // V-fin left & right
        f('#FFFF00', -10, -26,  9,  4);
        f('#FFFF00',   1, -26,  9,  4);

        ctx.restore();
    }
}

function launchFireworks() {
    const rocketCount = Math.floor(random(8, 12));
    fireworksWaiting = false;
    for (let i = 0; i < rocketCount; i++) {
        setTimeout(() => {
            rocketsList.push(new Rocket());
        }, i * 120);
    }
    setTimeout(() => {
        fireworksWaiting = true;
    }, (rocketCount - 1) * 120 + 200);
}

function animate() {
    ctx.fillStyle = 'rgba(8, 12, 20, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rocketsList = rocketsList.filter(rocket => {
        rocket.update();
        if (!rocket.dead) rocket.draw();
        return !rocket.dead;
    });

    particlesList = particlesList.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });

    if (fireworksWaiting && rocketsList.length === 0 && particlesList.length === 0) {
        fireworksWaiting = false;
        sleighList.push(new Sleigh());
    }

    sleighList = sleighList.filter(sleigh => {
        sleigh.update();
        sleigh.draw();
        return !sleigh.dead;
    });

    requestAnimationFrame(animate);
}

animate();

button.addEventListener('click', launchFireworks);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

console.log('Fireworks engine ready');

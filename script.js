/* ==========================================================================
   GRAVITON 2026 - Main Interactive Script
   Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
   ========================================================================== */

// Detailed Data Store for All 12 Symposium Events (Preserved from Source of Truth)
const EVENTS_DATA = {
    "ppt": {
        title: "PPT Presentation",
        category: "Technical",
        teamSize: "1 - 3 Members",
        duration: "10 Mins Presentation + 10 Mins Q&A",
        desc: "Showcase your cutting-edge technical research, innovative engineering concepts, or project slides before an esteemed panel of judges.",
        rules: [
            "Topics must pertain to Computer Science, Cyber Security, AI/ML, Cloud, or Emerging Technologies.",
            "Maximum 12 slides per presentation.",
            "Abstract must be submitted in PDF format prior to the event start.",
            "Decision of the judging panel will be final and binding."
        ]
    },
    "tech-quiz": {
        title: "Tech Quiz",
        category: "Technical",
        teamSize: "1 - 2 Members",
        duration: "3 Rounds (Preliminary + Semi + Final Grid)",
        desc: "A rapid-fire technical trivia showdown testing your command over computer science concepts, cyber security lore, tech giants, and tech history.",
        rules: [
            "Round 1: MCQ paper-based preliminary round (20 Mins).",
            "Round 2: Rapid fire buzzer round for top 8 qualifying teams.",
            "No electronic gadgets or internet access permitted during quiz rounds.",
            "Negative marking applies for wrong answers in the buzzer round."
        ]
    },
    "ai-prompt": {
        title: "AI Prompt Battle",
        category: "Technical",
        teamSize: "Duo (2 Members)",
        duration: "30 Mins Arena",
        desc: "Battle in prompt engineering! Given a target output image or complex code blueprint, craft the precise prompt to generate matching results.",
        rules: [
            "Team participation: 2 members (Duo).",
            "Participants will be provided access to standard Generative AI sandboxes.",
            "Evaluation based on structural similarity, visual fidelity, and prompt efficiency.",
            "Direct editing or manual photo manipulation is strictly prohibited."
        ]
    },
    "reverse-coding": {
        title: "Reverse Coding",
        category: "Technical",
        teamSize: "2 Members (Duo)",
        duration: "3 Rounds Challenge",
        desc: "A three-round Python challenge to rearrange scrambled code, debug programs, and uncover hidden logic from inputs and outputs. Accuracy, speed, and smart hint usage decide the winners!",
        rules: [
            "Rounds: Scrambled Code → Debug Race → Black Box Challenge.",
            "Python only; individual timers for each participant/team.",
            "Maximum 5 aid slots per round, costing 2 points each. Scores can go negative.",
            "Black Box: 4 free test requests; each additional distinct request uses one aid slot.",
            "Solutions must pass the organizers’ test cases.",
            "Top 5 by cumulative scores after Round 2 qualify for the final.",
            "Personal Laptops are to be brought.",
            "Internet searches, AI tools, copied code, and unauthorized assistance are strictly prohibited."
        ]
    },
    "ctf": {
        title: "CTF (Capture The Flag)",
        category: "Technical",
        teamSize: "1 - 2 Members",
        duration: "90 Mins Jeopardy Format",
        desc: "A hands-on cybersecurity competition involving Web Exploitation, Reverse Engineering, Cryptography, Steganography, and Forensics flags.",
        rules: [
            "Jeopardy style scoreboard system with dynamic flag point values.",
            "Brute forcing or attacking the CTF infrastructure is strictly forbidden.",
            "First team to submit valid hash flags wins bonus speed points."
        ]
    },
    "web-creation": {
        title: "Website Creation Without Using AI",
        category: "Technical",
        teamSize: "2 Members (Duo)",
        duration: "4 Hours",
        desc: "Unleash your raw web development craft! Build a responsive, aesthetic webpage on a given theme using pure HTML5, CSS3, and JavaScript.",
        rules: [
            "Strictly NO AI assistants (ChatGPT, Copilot, Gemini) allowed.",
            "Only standard local code editors (VS Code / Notepad++) will be provided.",
            "Judged on UI aesthetics, responsiveness, semantic HTML, and CSS creativity."
        ]
    },
    "data-grid": {
        title: "Data Grid",
        category: "Technical",
        teamSize: "1 - 2 Members (Solo / Duo)",
        duration: "3 Rounds Challenge",
        desc: "An exciting data-analysis and logical-thinking event where participants work with real-world datasets to find, analyze, calculate, and organize information. Analyze • Calculate • Create • Conquer.",
        rules: [
            "Three challenging rounds: Round 1 (Data Hunt) → Round 2 (Data Quiz) → Round 3 (Data Dashboard Challenge).",
            "Participants work with real-world datasets to find, analyze, calculate, and organize information.",
            "Tests observation, analytical thinking, accuracy, speed, and spreadsheet skills.",
            "Solutions are evaluated based on calculation precision, data wrangling speed, and dashboard insights.",
            "Personal laptops with spreadsheet software (Excel, Google Sheets, or equivalent data tools) should be brought.",
            "Theme: Analyze • Calculate • Create • Conquer."
        ]
    },
    "esports": {
        title: "E Sports Battle",
        category: "Non-Technical",
        teamSize: "Squad (4 Members)",
        duration: "Tournament Matches",
        desc: "Battle it out in Free Fire, BGMI, and other thrilling multiplayer games! Squad showdown featuring custom rooms, tactical squad combat, and intense knockout matches.",
        rules: [
            "Featured Games: Free Fire, BGMI (Battlegrounds Mobile India), and other exciting multiplayer games.",
            "Matches will be hosted in custom rooms with standard tournament rules and scoring systems.",
            "Mobile devices only. Emulators, iPads/tablets, and third-party tools are strictly prohibited.",
            "Participants must bring their own mobile devices with games pre-installed and updated.",
            "Unsportsmanlike conduct, hacking, or teaming results in immediate squad disqualification."
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initMoonKnightIntro();
    initHeroBackgroundVideo();
    initParticleCanvas();
    initMouseMovieEffects();
    initStickyNavbar();
    initCountdownTimer();
    initNumberCounters();
    initEventFilters();
    initModalHandlers();
});

/* --------------------------------------------------------------------------
   0. Moon Knight Cinematic Welcome Intro Controller
   -------------------------------------------------------------------------- */
function initMoonKnightIntro() {
    const overlay = document.getElementById('mk-intro-overlay');
    const introCard = document.getElementById('mk-intro-card');
    const enterBtn = document.getElementById('mk-enter-btn');
    const eventsFastBtn = document.getElementById('mk-events-fast-btn');
    const skipBtn = document.getElementById('mk-intro-skip');
    const replayBtn = document.getElementById('replay-intro-btn');
    const soundToggle = document.getElementById('mk-intro-sound-toggle');
    const soundIcon = document.getElementById('intro-sound-icon');
    const soundStatus = document.getElementById('intro-sound-status');
    const timerCountEl = document.getElementById('intro-timer-count');
    const progressFillEl = document.getElementById('intro-progress-fill');

    if (!overlay) return;

    // Audio state
    let soundEnabled = true;
    let audioCtx = null;

    // Web Audio API Synthesizer for Khonshu Cinematic Sound
    function playLunarChime(mode = 'enter') {
        if (!soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;

            // Sub-Bass Drone / Whoosh
            const subOsc = audioCtx.createOscillator();
            const subGain = audioCtx.createGain();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(mode === 'enter' ? 85 : 110, now);
            subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);
            subGain.gain.setValueAtTime(0.001, now);
            subGain.gain.exponentialRampToValueAtTime(0.12, now + 0.1);
            subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            subOsc.connect(subGain);
            subGain.connect(audioCtx.destination);
            subOsc.start(now);
            subOsc.stop(now + 1.3);

            // Shimmering Lunar Crystal Chord [Khonshu harmonic series]
            const freqs = [528, 660, 792, 1056, 1320];
            freqs.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.045 / (idx + 1), now + 0.08 + idx * 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.25);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + idx * 0.03);
                osc.stop(now + 2.5);
            });
        } catch (e) {
            // Audio context policy fallback
        }
    }

    // Intro Ambient Background Video Player
    const introBgVideo = document.getElementById('mk-intro-bg-video');
    if (introBgVideo) {
        introBgVideo.muted = true;
        const playPromise = introBgVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    }

    // Sound toggle listener
    if (soundToggle) {
        soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            soundEnabled = !soundEnabled;
            if (soundEnabled) {
                soundToggle.classList.add('active');
                if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high';
                if (soundStatus) soundStatus.textContent = 'Sound ON';
                if (introBgVideo) {
                    introBgVideo.muted = false;
                    introBgVideo.volume = 0.85;
                }
                playLunarChime('tick');
            } else {
                soundToggle.classList.remove('active');
                if (soundIcon) soundIcon.className = 'fa-solid fa-volume-xmark';
                if (soundStatus) soundStatus.textContent = 'Sound OFF';
                if (introBgVideo) {
                    introBgVideo.muted = true;
                }
            }
        });
    }

    // Auto-Enter Countdown Timer (5.0 seconds)
    const TOTAL_DURATION_MS = 5000;
    let remainingMs = TOTAL_DURATION_MS;
    let isPaused = false;
    let countdownInterval = null;
    let hasDismissed = false;

    function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        remainingMs = TOTAL_DURATION_MS;
        hasDismissed = false;

        countdownInterval = setInterval(() => {
            if (isPaused) return;

            remainingMs -= 50;
            const progressRatio = Math.max(0, (TOTAL_DURATION_MS - remainingMs) / TOTAL_DURATION_MS);
            
            if (progressFillEl) {
                progressFillEl.style.width = (progressRatio * 100).toFixed(1) + '%';
            }
            if (timerCountEl) {
                timerCountEl.textContent = Math.max(1, Math.ceil(remainingMs / 1000));
            }

            if (remainingMs <= 0) {
                clearInterval(countdownInterval);
                dismissIntro('#home');
            }
        }, 50);
    }

    // Pause on card hover so user can read everything comfortably
    if (introCard) {
        introCard.addEventListener('mouseenter', () => { isPaused = true; });
        introCard.addEventListener('mouseleave', () => { isPaused = false; });
    }

    function dismissIntro(targetId = null) {
        if (hasDismissed) return;
        hasDismissed = true;
        if (countdownInterval) clearInterval(countdownInterval);

        // Pause intro background video when entering website
        if (introBgVideo) {
            try { introBgVideo.pause(); } catch(e) {}
        }

        // Ensure hero background video starts playing
        const heroVideo = document.getElementById('hero-bg-video');
        if (heroVideo) {
            heroVideo.play().catch(() => {});
        }

        playLunarChime('enter');
        overlay.classList.add('dismissed');

        // Cinematic Radial Shockwave Burst
        const shockwave = document.createElement('div');
        shockwave.style.position = 'fixed';
        shockwave.style.top = '50%';
        shockwave.style.left = '50%';
        shockwave.style.transform = 'translate(-50%, -50%) scale(0)';
        shockwave.style.width = '180px';
        shockwave.style.height = '180px';
        shockwave.style.borderRadius = '50%';
        shockwave.style.border = '3px solid #ff1e42';
        shockwave.style.boxShadow = '0 0 60px #ff1e42, 0 0 100px rgba(255, 30, 66, 0.6), inset 0 0 40px #ffffff';
        shockwave.style.pointerEvents = 'none';
        shockwave.style.zIndex = '99998';
        shockwave.style.transition = 'transform 0.85s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.85s ease';
        document.body.appendChild(shockwave);

        requestAnimationFrame(() => {
            shockwave.style.transform = 'translate(-50%, -50%) scale(18)';
            shockwave.style.opacity = '0';
        });
        setTimeout(() => shockwave.remove(), 900);

        if (targetId) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // Button event handlers
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissIntro('#home');
        });
    }

    if (eventsFastBtn) {
        eventsFastBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dismissIntro('#events');
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissIntro();
        });
    }

    // ESC key to dismiss intro
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('dismissed')) {
            dismissIntro();
        }
    });

    // Replay Intro Button in Navbar
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            overlay.classList.remove('dismissed');
            playLunarChime('ambient');
            if (introBgVideo) {
                try {
                    introBgVideo.currentTime = 0;
                    introBgVideo.play().catch(() => {});
                } catch(e) {}
            }
            startCountdown();
        });
    }

    // Initialize auto-entry countdown when website opens
    startCountdown();
}

/* --------------------------------------------------------------------------
   0B. Hero Section Ambient Background Video Controller
   -------------------------------------------------------------------------- */
function initHeroBackgroundVideo() {
    const heroVideo = document.getElementById('hero-bg-video');
    const soundBtn = document.getElementById('hero-video-sound-btn');
    const soundIcon = document.getElementById('hero-video-sound-icon');
    const soundText = document.getElementById('hero-video-sound-text');

    if (!heroVideo) return;

    // Browser policy: must start muted for autoplay to succeed
    heroVideo.muted = true;
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Unlock on first user interaction if browser blocked autoplay
            const unlockVideo = () => {
                heroVideo.play().catch(() => {});
                document.removeEventListener('click', unlockVideo);
                document.removeEventListener('touchstart', unlockVideo);
            };
            document.addEventListener('click', unlockVideo, { once: true });
            document.addEventListener('touchstart', unlockVideo, { once: true });
        });
    }

    // Sound toggle button for Hero background video
    if (soundBtn) {
        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            heroVideo.muted = !heroVideo.muted;
            if (!heroVideo.muted) {
                heroVideo.volume = 0.85;
                soundBtn.classList.add('active');
                if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high';
                if (soundText) soundText.textContent = 'Sound ON';
            } else {
                soundBtn.classList.remove('active');
                if (soundIcon) soundIcon.className = 'fa-solid fa-volume-xmark';
                if (soundText) soundText.textContent = 'Sound OFF';
            }
        });
    }

    // Pause video when scrolled far out of view to conserve GPU/CPU
    if ('IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (heroVideo.paused) heroVideo.play().catch(() => {});
                } else {
                    if (!heroVideo.paused) heroVideo.pause();
                }
            });
        }, { threshold: 0.08 });
        const heroSection = document.getElementById('home');
        if (heroSection) heroObserver.observe(heroSection);
    }
}

/* --------------------------------------------------------------------------
   1. Atmospheric Cosmic Background Particles & Lunar Cosmos Canvas
   -------------------------------------------------------------------------- */
function initParticleCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isMobile = window.innerWidth <= 768;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Track mouse coordinates for interactive particle physics
    const mouse = {
        x: -9999,
        y: -9999,
        radius: isMobile ? 80 : 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        isMobile = width <= 768;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    resizeCanvas();

    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (Math.abs(window.innerWidth - lastWidth) > 30 || Math.abs(window.innerHeight - height) > 150) {
            lastWidth = window.innerWidth;
            resizeCanvas();
        }
    }, { passive: true });

    // Adaptive particle count for ultra smooth 60fps performance
    const maxParticles = isMobile ? 32 : Math.min(Math.floor((width * height) / 18000), 85);
    const particles = [];

    // Official GRAVITON Blood Moon Stardust & Embers (Blood Red, Scarlet, Silver, White)
    const stardustColors = [
        '#ffffff', // Metallic silver/white
        '#cbd5e1', // Chrome silver
        '#ff1e42', // Blood red neon
        '#e50914', // Crimson
        '#b3001b', // Deep scarlet
        '#ff4757', // Radiant ember
        '#94a3b8'  // Steel gray
    ];

    class LunarParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.radius = Math.random() * (isMobile ? 1.6 : 2.4) + 0.6;
            this.vx = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.35);
            this.vy = -(Math.random() * (isMobile ? 0.35 : 0.5) + 0.1); // Gently float upward like stardust
            this.alpha = Math.random() * 0.65 + 0.25;
            this.baseAlpha = this.alpha;
            this.color = stardustColors[Math.floor(Math.random() * stardustColors.length)];
            this.density = Math.random() * 20 + 2;
        }
        update() {
            // Natural drifting movement
            this.x += this.vx;
            this.y += this.vy;

            // Interactive mouse repulsion (Mouse Movie Effect)
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < mouse.radius && distance > 0) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * this.density * 0.6;
                const directionY = forceDirectionY * force * this.density * 0.6;

                this.x -= directionX;
                this.y -= directionY;
                this.alpha = Math.min(1, this.baseAlpha + 0.4);
            } else {
                if (this.alpha > this.baseAlpha) {
                    this.alpha -= 0.02;
                }
            }

            // Wrap edges
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
            if (this.y < -10) {
                this.y = height + 10;
                this.x = Math.random() * width;
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            if (!isMobile && (this.color === '#ff1e42' || this.color === '#e50914' || this.color === '#ff4757')) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
            }
            ctx.restore();
        }
    }

    // Shooting Star (Khonshu Crescent Streak)
    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width * 0.8;
            this.y = Math.random() * (height * 0.4);
            this.len = Math.random() * 80 + 40;
            this.speed = Math.random() * 6 + 7;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
            this.alpha = 1;
            this.active = false;
            this.nextSpawn = Date.now() + Math.random() * 6000 + 4000;
        }
        update() {
            if (!this.active) {
                if (Date.now() > this.nextSpawn) {
                    this.active = true;
                    this.alpha = 1;
                    this.x = Math.random() * width * 0.8;
                    this.y = Math.random() * (height * 0.35);
                }
                return;
            }

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.alpha -= 0.015;

            if (this.alpha <= 0 || this.x > width || this.y > height) {
                this.reset();
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            const grad = ctx.createLinearGradient(
                this.x, this.y,
                this.x - Math.cos(this.angle) * this.len,
                this.y - Math.sin(this.angle) * this.len
            );
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#ff1e42');
            grad.addColorStop(1, 'transparent');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x - Math.cos(this.angle) * this.len,
                this.y - Math.sin(this.angle) * this.len
            );
            ctx.stroke();
            ctx.restore();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new LunarParticle());
    }

    const shootingStar = new ShootingStar();

    if (prefersReducedMotion) {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => p.draw());
        return;
    }

    let animationFrameId;
    let isTabVisible = true;

    function animate() {
        if (!isTabVisible) return;
        ctx.clearRect(0, 0, width, height);

        // Draw and update stardust
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Connect nearby particles to mouse with delicate constellation lines
            if (!isMobile && mouse.x > 0) {
                const dx = mouse.x - particles[i].x;
                const dy = mouse.y - particles[i].y;
                const dist = Math.hypot(dx, dy);
                if (dist < 110) {
                    ctx.save();
                    ctx.globalAlpha = (1 - dist / 110) * 0.25;
                    ctx.strokeStyle = 'rgba(255, 30, 66, 0.45)';
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(particles[i].x, particles[i].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        // Draw shooting star
        shootingStar.update();
        shootingStar.draw();

        animationFrameId = requestAnimationFrame(animate);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isTabVisible = false;
            cancelAnimationFrame(animationFrameId);
        } else {
            isTabVisible = true;
            animationFrameId = requestAnimationFrame(animate);
        }
    });

    animate();
}

/* --------------------------------------------------------------------------
   1.5. Mouse Movie Effects (Custom Cursor, Stardust Trails & 3D Tilt)
   -------------------------------------------------------------------------- */
function initMouseMovieEffects() {
    let cursor = document.getElementById('custom-cursor');
    let follower = document.getElementById('custom-cursor-follower');

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
    }
    if (!follower) {
        follower = document.createElement('div');
        follower.id = 'custom-cursor-follower';
        follower.className = 'custom-cursor-follower';
        document.body.appendChild(follower);
    }

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let lastSparkTime = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;

        // Spawn glowing stardust sparks on mouse movement
        const now = Date.now();
        if (now - lastSparkTime > 55) {
            lastSparkTime = now;
            createStardustSpark(mouseX, mouseY);
        }
    }, { passive: true });

    // Smooth lerp follower loop
    function updateFollower() {
        followerX += (mouseX - followerX) * 0.18;
        followerY += (mouseY - followerY) * 0.18;

        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;

        requestAnimationFrame(updateFollower);
    }
    requestAnimationFrame(updateFollower);

    // Stardust Spark Generator (Blood Red & Silver Embers)
    function createStardustSpark(x, y) {
        if (window.innerWidth <= 768) return; // Skip on mobile
        const spark = document.createElement('div');
        spark.className = 'stardust-spark';
        const size = Math.random() * 4 + 2;
        const colors = ['#ff1e42', '#e50914', '#ffffff', '#cbd5e1', '#ff4757'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.backgroundColor = color;
        spark.style.boxShadow = `0 0 10px ${color}`;
        spark.style.left = `${x + (Math.random() - 0.5) * 12}px`;
        spark.style.top = `${y + (Math.random() - 0.5) * 12}px`;

        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 650);
    }

    // Hover interactive state detection
    const interactiveSelectors = 'a, button, input, select, textarea, .tab-btn, .btn, .nav-link, .modal-close, .event-card, [data-tilt], [role="button"]';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.add('cursor-hover');
            follower.classList.add('cursor-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.remove('cursor-hover');
            follower.classList.remove('cursor-hover');
        }
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('cursor-click');
        follower.classList.add('cursor-click');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor-click');
        follower.classList.remove('cursor-click');
    });

    // 3D Card Tilt & Specular Spotlight Engine ("Movie Effect")
    const tiltCards = document.querySelectorAll('[data-tilt], .event-card, .about-card, .timeline-content, .chair-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set specular spotlight coordinates
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // 3D tilt calculation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotX = -((y - centerY) / centerY) * 7.5;
            const rotY = ((x - centerX) / centerX) * 7.5;

            card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });

    // Hero Section Cinematic Parallax Shift
    const heroVisual = document.querySelector('.hero-visual');
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && heroVisual && window.innerWidth > 768) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;

            const crestCenter = heroVisual.querySelector('.hero-crest-centerpiece') || heroVisual.querySelector('.hero-warrior-img');
            const halo = heroVisual.querySelector('.lunar-crescent-halo');
            const orb = heroVisual.querySelector('.glow-orb');
            const badge1 = heroVisual.querySelector('.badge-1');
            const badge2 = heroVisual.querySelector('.badge-2');
            const badge3 = heroVisual.querySelector('.badge-3');

            if (crestCenter) crestCenter.style.transform = `translate(${relX * 18}px, ${relY * 18}px)`;
            if (halo) halo.style.transform = `translate(${relX * -14}px, ${relY * -14}px)`;
            if (orb) orb.style.transform = `translate(${relX * -22}px, ${relY * -22}px)`;
            if (badge1) badge1.style.transform = `translate(${relX * 28}px, ${relY * 28}px)`;
            if (badge2) badge2.style.transform = `translate(${relX * -25}px, ${relY * -25}px)`;
            if (badge3) badge3.style.transform = `translate(${relX * 32}px, ${relY * 32}px)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            const elements = heroVisual.querySelectorAll('.hero-crest-centerpiece, .hero-warrior-img, .lunar-crescent-halo, .glow-orb, .badge-1, .badge-2, .badge-3');
            elements.forEach(el => el.style.transform = '');
        });
    }
}

/* --------------------------------------------------------------------------
   2. Sticky Navbar & Mobile Navigation
   -------------------------------------------------------------------------- */
function initStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';

        function closeNav() {
            navLinks.classList.remove('mobile-active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            }
        }

        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('mobile-active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !isOpen);
                icon.classList.toggle('fa-xmark', isOpen);
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeNav);
        });

        // Close on tap outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('mobile-active') && !navbar.contains(e.target)) {
                closeNav();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('mobile-active')) {
                closeNav();
            }
        });
    }

    // Highlight active link on scroll
    const sections = document.querySelectorAll('section[id]');
    if (sections.length && navLinks) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 140;
                const sectionId = current.getAttribute('id');
                const link = navLinks.querySelector(`a[href*="#${sectionId}"]`);
                if (link) {
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        }, { passive: true });
    }
}

/* --------------------------------------------------------------------------
   3. Animated Countdown Timer
   -------------------------------------------------------------------------- */
function initCountdownTimer() {
    // Set symposium date: 09/10/2026 9:00 AM IST (October 9, 2026)
    let targetDate = (typeof CONFIG !== 'undefined' && CONFIG.SYMPOSIUM_DATE)
        ? new Date(CONFIG.SYMPOSIUM_DATE)
        : new Date('2026-10-09T09:00:00+05:30');

    // Fallback if ISO string parsing fails (Month is 0-indexed: 9 = October)
    if (isNaN(targetDate.getTime())) {
        targetDate = new Date(2026, 9, 9, 9, 0, 0);
    }

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl) return;

    function update() {
        const now = new Date().getTime();
        const diff = targetDate.getTime() - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   4. Animated Statistics Counters
   -------------------------------------------------------------------------- */
function initNumberCounters() {
    const statCounters = document.querySelectorAll('.stat-count');
    if (!statCounters.length) return;

    let started = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                statCounters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
                    const suffix = counter.getAttribute('data-suffix') || '';
                    let count = 0;
                    const speed = 25;
                    const step = Math.max(1, Math.floor(target / 40));

                    const interval = setInterval(() => {
                        count += step;
                        if (count >= target) {
                            counter.textContent = target + suffix;
                            clearInterval(interval);
                        } else {
                            counter.textContent = count + suffix;
                        }
                    }, speed);
                });
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) observer.observe(statsSection);
}

/* --------------------------------------------------------------------------
   5. Event Category Filter & Search
   -------------------------------------------------------------------------- */
function initEventFilters() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('event-search');
    const eventCards = document.querySelectorAll('.event-card');

    if (!eventCards.length && !searchInput) return;

    let currentCategory = 'all';
    let searchQuery = '';

    function applyFilter() {
        eventCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            const matchesCategory = (currentCategory === 'all' || category === currentCategory);
            const matchesSearch = title.includes(searchQuery.toLowerCase());

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-filter');
            applyFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            applyFilter();
        });
    }
}

/* --------------------------------------------------------------------------
   6. Event Rules & Details Modal
   -------------------------------------------------------------------------- */
function initModalHandlers() {
    const modal = document.getElementById('event-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('modal-close');
    const modalCloseBtn = document.getElementById('m-close-btn');
    const modalSelectBtn = document.getElementById('m-register-btn');

    const mTitle = document.getElementById('m-title');
    const mCategory = document.getElementById('m-category');
    const mDesc = document.getElementById('m-desc');
    const mTeamSize = document.getElementById('m-teamsize');
    const mDuration = document.getElementById('m-duration');
    const mRules = document.getElementById('m-rules');

    let selectedEventTitle = '';

    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventId = btn.getAttribute('data-id');
            const data = EVENTS_DATA[eventId];
            if (!data) return;

            selectedEventTitle = data.title;
            mTitle.textContent = data.title;
            mCategory.textContent = data.category;
            mCategory.className = `modal-badge ${data.category === 'Technical' ? 'text-cyan' : 'text-amber'}`;
            mDesc.textContent = data.desc;
            mTeamSize.textContent = data.teamSize;
            mDuration.textContent = data.duration;

            mRules.innerHTML = data.rules.map(rule => `
                <li><i class="fa-solid fa-chevron-right text-crimson"></i> <span>${rule}</span></li>
            `).join('');

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    if (modalSelectBtn) {
        modalSelectBtn.addEventListener('click', () => {
            closeModal();
            // Redirect to registration page with pre-selected event
            window.location.href = `register.html?event=${encodeURIComponent(selectedEventTitle)}`;
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* --------------------------------------------------------------------------
   6. UPI Copy Helper
   -------------------------------------------------------------------------- */
window.copyUpiText = function(text, btnElement) {
    if (!navigator.clipboard) {
        prompt('Copy to clipboard:', text);
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="fa-solid fa-check text-cyan"></i> Copied!';
        btnElement.style.borderColor = '#ff1e42';
        setTimeout(() => {
            btnElement.innerHTML = originalHtml;
            btnElement.style.borderColor = '';
        }, 2000);
    }).catch(() => {
        prompt('Copy to clipboard:', text);
    });
};
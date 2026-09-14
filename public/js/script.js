// ===== Intro Handwriting Animation =====
(function initIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;

  // Skip intro if already seen this session
  if (sessionStorage.getItem('introSeen')) {
    intro.remove();
    return;
  }

  // Hide hamburger during intro, show after
  const ham = document.getElementById('hamburger');
  if (ham) ham.classList.remove('visible');

  const lines = document.querySelectorAll('.intro-line');
  const svg = document.querySelector('.intro-svg');

  // Add SVG gradient definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'introGradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '0%');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#6c63ff');
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '50%');
  stop2.setAttribute('stop-color', '#e94560');
  const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop3.setAttribute('offset', '100%');
  stop3.setAttribute('stop-color', '#f5a623');

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  gradient.appendChild(stop3);
  defs.appendChild(gradient);
  svg.prepend(defs);

  document.body.classList.add('intro-active');

  // Measure actual stroke lengths and set dasharray
  lines.forEach(line => {
    const length = line.getComputedTextLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
  });

  // Stagger each line's animation
  const delays = [0, 400, 800, 1200];

  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('animate');
      const length = line.getComputedTextLength();
      const duration = Math.max(0.5, Math.min(0.9, length / 500));
      line.style.animationDuration = `${duration}s`;
    }, delays[i]);
  });

  // After all lines drawn, fill them and then fade out intro
  setTimeout(() => {
    lines.forEach(line => line.classList.add('fill-in'));
  }, 1800);

  setTimeout(() => {
    intro.classList.add('hidden');
    document.body.classList.remove('intro-active');
    sessionStorage.setItem('introSeen', 'true');
    if (ham) ham.classList.add('visible');
  }, 2600);
})();

// ===== Particle Background =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function getParticleColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
}
let pc = getParticleColor();
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  pc = getParticleColor();
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x -= dx * force * 0.02;
        this.y -= dy * force * 0.02;
      }
    }

    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${pc}, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 150);
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const opacity = (1 - dist / 150) * 0.15;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${pc}, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

canvas.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

// ===== Counter Animation =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const duration = 2000;
    const start = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

const statsSection = document.querySelector('.hero-stats');
let counterStarted = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counterStarted) {
      counterStarted = true;
      animateCounters();
    }
  });
}, { threshold: 0.5 });

if (statsSection) {
  statsObserver.observe(statsSection);
}

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== Staggered Reveal for Cards =====
document.querySelectorAll('.research-card, .skill-category').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

// ===== Timeline Accordion =====
// Auto-expand current year, collapse all others; auto-create section for current year if missing
(function initYearAccordion() {
  const currentYear = String(new Date().getFullYear());
  const timeline = document.querySelector('.timeline');

  if (timeline) {
    // If current year doesn't already have a section, auto-generate an empty one at the top
    const hasCurrentYear = Array.from(timeline.querySelectorAll('.year-toggle'))
      .some(t => t.dataset.year === currentYear);

    if (!hasCurrentYear) {
      const wrap = document.createElement('div');
      wrap.className = 'timeline-year';
      wrap.innerHTML = `
        <button class="year-toggle" data-year="${currentYear}">
          <span>${currentYear}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="year-content">
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-text">
              <span class="timeline-date">${currentYear}</span>
              <p><em>No news yet for ${currentYear}. Stay tuned!</em></p>
            </div>
          </div>
        </div>
      `;
      timeline.prepend(wrap);
    }
  }

  // Set active states: current year open, others collapsed
  document.querySelectorAll('.timeline-year').forEach(yearEl => {
    const toggle = yearEl.querySelector('.year-toggle');
    const content = yearEl.querySelector('.year-content');
    if (!toggle || !content) return;
    const isCurrent = toggle.dataset.year === currentYear;
    toggle.classList.toggle('active', isCurrent);
    content.classList.toggle('active', isCurrent);
  });

  // Click handlers (bind after dynamic insertion so new toggle works)
  document.querySelectorAll('.year-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      toggle.nextElementSibling.classList.toggle('active');
    });
  });
})();

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ============================================
   ANDHIKA RAFI PORTFOLIO — SCRIPT.JS
   Premium Dark Futuristic Portfolio
   ============================================ */

'use strict';

// Variable to store the data
let portfolioData = null;

/* ===== LOAD DATA ===== */
async function loadPortfolioData() {
  try {
    const response = await fetch('/data.json');
    portfolioData = await response.json();
    renderProjects();
    renderCertificates();
  } catch (error) {
    console.error('Error loading portfolio data:', error);
  }
}

/* ===== RENDER PROJECTS ===== */
function renderProjects() {
  const projectsGrid = document.getElementById('projectsGrid');
  if (!projectsGrid || !portfolioData.projects) return;

  projectsGrid.innerHTML = portfolioData.projects.map((project, index) => {
    const isDoc = project.demotype === 'download';

    if (isDoc) {
      // Document/file type card
      return `
      <div class="project-card glass-card reveal" data-delay="${index * 100}">
        <div class="project-doc-thumb">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span class="project-doc-ext">.docx</span>
        </div>
        <div class="project-body">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
          <div class="project-buttons">
            <a href="project/reader.html?pdf=${encodeURIComponent(project.pdfFile)}&file=${encodeURIComponent(project.downloadFile)}&title=${encodeURIComponent(project.title)}" class="proj-btn proj-btn-primary">
              Baca
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </a>
            <a href="${project.downloadFile}" download class="proj-btn proj-btn-ghost">
              Download
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      `;
    }

    // Normal project card
    const imgSrc = project.image && project.image.startsWith('http') ? project.image : project.image;
    const detailLink = project.id === 1 ? 'project/donghua.html'
                     : project.id === 2 ? 'project/raisaver.html'
                     : `project/detail.html?id=${project.id}`;
    return `
    <div class="project-card glass-card reveal" data-delay="${index * 100}">
      <div class="project-image-wrap">
        <img class="project-image" src="${imgSrc}" alt="${project.title}" loading="lazy" decoding="async">
        <div class="project-overlay"></div>
      </div>
      <div class="project-body">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-desc">${project.description}</p>
        <div class="project-tech">
          ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <div class="project-buttons">
          <a href="${project.demo}" class="proj-btn proj-btn-primary">
            Live Demo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <a href="${detailLink}" class="proj-btn proj-btn-ghost">
            Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `}).join('');

  attachProjectCardEvents();
}

/* ===== RENDER CERTIFICATES ===== */
function renderCertificates() {
  const certsGrid = document.getElementById('certsGrid');
  if (!certsGrid || !portfolioData.certificates) return;

  certsGrid.innerHTML = portfolioData.certificates.map((cert, index) => `
    <div class="cert-card glass-card reveal" data-delay="${index * 80}"
      onclick="openCertModal(this)"
      data-image="${cert.image}">
      <div class="cert-image-wrap">
        <img class="cert-image" src="${cert.image}" alt="${cert.title}" loading="lazy" decoding="async">
        <div class="cert-overlay">
          <div class="cert-overlay-info">
            <h3 class="cert-title">${cert.title}</h3>
            <div class="cert-issuer">${cert.issuer}</div>
            <div class="cert-year">${cert.year}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ===== ATTACH PROJECT CARD TILT EVENTS ===== */
function attachProjectCardEvents() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

/* ===== LOADER ===== */
window.addEventListener('load', async () => {
  await loadPortfolioData();
  initReveal();
});

/* ===== CUSTOM CURSOR ===== */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.4;
  ringY += (mouseY - ringY) * 0.4;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .cert-card, .project-card, .nav-logo, .nav-link, .hamburger, .navbar, .nav-container, .nav-links, .nav-links li, .skill-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ===== PARTICLES ===== */
// Defer particles init until after first render to avoid blocking
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.5 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = '255,255,255';
  };
  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };
  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.fill();
  };

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  // Draw lines between nearby particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
}

// Start particles after page is loaded and idle — doesn't block initial render
if ('requestIdleCallback' in window) {
  requestIdleCallback(initParticles, { timeout: 2000 });
} else {
  setTimeout(initParticles, 200);
}



/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ===== PORTOFOLIO TABS ===== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Show the corresponding tab content
    const tabId = btn.dataset.tab;
    document.getElementById(tabId).classList.add('active');
    
    // Re-initialize reveal for the new tab's cards
    setTimeout(() => {
      const newReveals = document.getElementById(tabId).querySelectorAll('.reveal');
      const tempObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            tempObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      newReveals.forEach(el => tempObserver.observe(el));
    }, 100);
  });
});

/* ===== ACTIVE NAV ON SCROLL ===== */
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}, { passive: true });



/* ===== SCROLL REVEAL ===== */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // Stagger delay for grid items
  document.querySelectorAll('.skills-grid .skill-category').forEach((el, i) => {
    el.dataset.delay = i * 80;
  });
  document.querySelectorAll('.projects-grid .project-card').forEach((el, i) => {
    el.dataset.delay = i * 100;
  });
  document.querySelectorAll('.certs-grid .cert-card').forEach((el, i) => {
    el.dataset.delay = i * 80;
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  function update() {
    start += step;
    if (start >= target) { el.textContent = target; return; }
    el.textContent = Math.floor(start);
    requestAnimationFrame(update);
  }
  update();
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target], .tentang-stat-num[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ===== CERTIFICATE MODAL ===== */
let currentCertIndex = 0;
let certCards = [];

function openCertModal(card) {
  certCards = Array.from(document.querySelectorAll('.cert-card'));
  currentCertIndex = certCards.indexOf(card);
  showCurrentCert();
  const modal = document.getElementById('certModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function navigateCert(direction) {
  currentCertIndex = (currentCertIndex + direction + certCards.length) % certCards.length;
  showCurrentCert();
}

function showCurrentCert() {
  const card = certCards[currentCertIndex];
  const image = card.dataset.image;
  document.getElementById('modalCertImage').src = image;
}

function closeCertModal() {
  const modal = document.getElementById('certModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCertModal();
  if (e.key === 'ArrowLeft') navigateCert(-1);
  if (e.key === 'ArrowRight') navigateCert(1);
});

/* ===== CONTACT FORM ===== */
const contactForm = document.getElementById('contactForm');

function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.add('error');
  error.textContent = message;
  return false;
}

function clearError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.remove('error');
  error.textContent = '';
  return true;
}

// Real-time validation
['formName', 'formEmail', 'formSubject', 'formMessage'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    const errorMap = {
      formName: 'nameError', formEmail: 'emailError',
      formSubject: 'subjectError', formMessage: 'messageError'
    };
    clearError(id, errorMap[id]);
  });
});

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const name = document.getElementById('formName').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const subject = document.getElementById('formSubject').value.trim();
  const message = document.getElementById('formMessage').value.trim();

  // Clear all errors first
  ['formName', 'formEmail', 'formSubject', 'formMessage'].forEach((id, i) => {
    clearError(id, ['nameError','emailError','subjectError','messageError'][i]);
  });

  if (!name || name.length < 2) {
    showError('formName', 'nameError', 'Nama harus diisi minimal 2 karakter.');
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('formEmail', 'emailError', 'Masukkan alamat email yang valid.');
    valid = false;
  }
  if (!subject || subject.length < 3) {
    showError('formSubject', 'subjectError', 'Subjek harus diisi minimal 3 karakter.');
    valid = false;
  }
  if (!message || message.length < 10) {
    showError('formMessage', 'messageError', 'Pesan harus diisi minimal 10 karakter.');
    valid = false;
  }

  if (!valid) return;

  const btn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Mengirim...';

  setTimeout(() => {
    successMsg.classList.add('show');
    contactForm.reset();
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Kirim Pesan';
    setTimeout(() => successMsg.classList.remove('show'), 5000);
  }, 1500);
});

/* ===== BACK TO TOP ===== */
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});



/* ===== SCROLL SNAP INDICATOR ===== */
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  // Subtle parallax on hero glows
  const glow1 = document.querySelector('.hero-glow.glow-1');
  const glow2 = document.querySelector('.hero-glow.glow-2');
  if (glow1 && glow2) {
    const y = current * 0.2;
    glow1.style.transform = `translateY(${y}px)`;
    glow2.style.transform = `translateY(${-y * 0.5}px)`;
  }
  lastScroll = current;
}, { passive: true });

/* ===== CONSOLE EASTER EGG ===== */
console.log('%cHalo Developer!', 'color:#ffffff;font-size:1.5rem;font-weight:bold;');
console.log('%cPortfolio Andhika Rafi — Dibuat dengan dan banyak ', 'color:#cccccc;font-size:0.9rem;');
console.log('%cSMK Wikrama Bogor • TJKT • 2026', 'color:#888;font-size:0.8rem;');
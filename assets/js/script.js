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
            <a href="project/dokumentasi-asat-tahun-2026" class="proj-btn proj-btn-primary">
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
    const detailLink = project.id === 1 ? 'project/donghua'
                     : project.id === 2 ? 'project/raisaver'
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
          <a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="proj-btn proj-btn-primary">
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

/* ===== SCRAMBLE TEXT ANIMATION ===== */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.originalText = el.innerText || el.textContent;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?';
    this.frameRequest = null;
    this.frame = 0;
    
    // Bind hover event
    this.el.addEventListener('mouseenter', () => this.scramble());
  }

  scramble() {
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.totalFrames = 20; // Lebih cepat
    this.update();
  }

  update() {
    let output = '';
    const length = this.originalText.length;
    // Reveal characters left to right. Progress goes from 0 to 1
    const progress = this.frame / this.totalFrames;
    const revealCount = Math.floor(progress * length);

    for (let i = 0; i < length; i++) {
      if (this.originalText[i] === ' ') {
        output += ' ';
      } else if (i < revealCount) {
        output += this.originalText[i];
      } else {
        output += this.chars[Math.floor(Math.random() * this.chars.length)];
      }
    }

    this.el.innerText = output;

    if (this.frame < this.totalFrames) {
      this.frameRequest = requestAnimationFrame(() => this.update());
      this.frame++;
    } else {
      this.el.innerText = this.originalText; // Ensure exact match at the end
    }
  }
}

/* ===== LOADER ===== */
window.addEventListener('load', async () => {
  await loadPortfolioData();
  initReveal();

  // Scramble Hero Name
  const heroNameEl = document.querySelector('.hero-name');
  if (heroNameEl) {
    const fx = new TextScramble(heroNameEl);
    setTimeout(() => {
      fx.scramble();
    }, 300);
  }

  // Scroll to section based on URL path (clean URL, no hash)
  const path = location.pathname.replace('/', '').replace(/\/$/, '');
  const sectionMap = {
    'portofolio': 'portofolio',
    'tentang': 'tentang',
    'pendidikan': 'pendidikan',
    'keahlian': 'keahlian',
    'kontak': 'kontak',
  };
  if (sectionMap[path]) {
    const target = document.getElementById(sectionMap[path]);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    history.replaceState(null, '', '/');
  }
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
  ringX += (mouseX - ringX) * 0.8; // Lebih cepat
  ringY += (mouseY - ringY) * 0.8; // Lebih cepat
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
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const cvBtn = document.getElementById('cvBtn');
const cvDropdown = document.querySelector('.cv-dropdown');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  cvDropdown.classList.remove('open');
});

// Dropdown CV toggle
cvBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  cvDropdown.classList.toggle('open');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!cvDropdown.contains(e.target)) {
    cvDropdown.classList.remove('open');
  }
});

// Smooth scroll via data-scroll, no hash in URL
document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.dataset.scroll;
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL cleanly without hash
      history.replaceState(null, '', '/');
    }
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
const sections   = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link[data-scroll]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.scroll === current) link.classList.add('active');
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
// ====== KONFIGURASI EMAILJS ======
// Kamu perlu daftar di https://www.emailjs.com/ untuk mendapatkan:
const EMAILJS_PUBLIC_KEY = "qzdRX-zTWKmqCbjka";       // Ganti dengan Public Key kamu
const EMAILJS_SERVICE_ID = "service_g9nhsh7";       // Ganti dengan Service ID kamu
const EMAILJS_TEMPLATE_ID = "template_886xflx";     // Ganti dengan Template ID kamu

// Inisialisasi EmailJS
(function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
})();

const contactForm = document.getElementById('contactForm');
const formErrorToast = document.getElementById('formErrorToast');
const formErrorText = document.getElementById('formErrorText');
let errorToastTimeout;

function showError(message) {
  // Hide success toast if visible
  document.getElementById('formSuccess').classList.remove('show');
  
  // Show error toast
  formErrorText.textContent = message;
  formErrorToast.classList.add('show');
  
  // Auto hide after 3 seconds
  clearTimeout(errorToastTimeout);
  errorToastTimeout = setTimeout(() => {
    formErrorToast.classList.remove('show');
  }, 3000);
  
  return false;
}

function clearAllErrors() {
  // Remove error class from all fields
  document.querySelectorAll('.form-input.error').forEach(el => {
    el.classList.remove('error');
  });
  formErrorToast.classList.remove('show');
  return true;
}

// Real-time validation
['formName', 'formEmail', 'formSubject', 'formMessage'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    el.classList.remove('error');
    clearAllErrors();
  });
});

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('formName').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const subject = document.getElementById('formSubject').value.trim();
  const message = document.getElementById('formMessage').value.trim();

  // Clear all errors first
  clearAllErrors();

  if (!name || name.length < 2) {
    document.getElementById('formName').classList.add('error');
    showError('Nama harus diisi minimal 2 karakter.');
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('formEmail').classList.add('error');
    showError('Masukkan alamat email yang valid.');
    return;
  }
  if (!subject || subject.length < 3) {
    document.getElementById('formSubject').classList.add('error');
    showError('Subjek harus diisi minimal 3 karakter.');
    return;
  }
  if (!message || message.length < 10) {
    document.getElementById('formMessage').classList.add('error');
    showError('Pesan harus diisi minimal 10 karakter.');
    return;
  }

  const btn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Mengirim...';

  try {
    // Kirim email via EmailJS
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: name,
      from_email: email,
      subject: subject,
      message: message
    });

    // Berhasil
    successMsg.classList.add('show');
    contactForm.reset();
    setTimeout(() => {
      successMsg.classList.remove('show');
    }, 5000);
  } catch (error) {
    // Gagal
    console.error('Error sending email:', error);
    showError('Gagal mengirim pesan! Silakan coba lagi nanti.');
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Kirim Pesan';
  }
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

/* ===== NO COPY / NO RIGHT CLICK ===== */
document.addEventListener('copy',        e => e.preventDefault());
document.addEventListener('cut',         e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => {
  // Izinkan seleksi di form input/textarea
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  e.preventDefault();
});
/* ============================================
   ANDHIKA RAFI — PORTFOLIO SCRIPT
   Three.js Network Graph + Animations
   ============================================ */

'use strict';

let portfolioData = null;

/* ========== THREE.JS — INTERACTIVE NETWORK (mouse-responsive) ========== */
(function initThree() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let W = window.innerWidth;
  let H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();

  // Orthographic camera — 1 unit = 1 px, origin = screen center
  const camera = new THREE.OrthographicCamera(-W/2, W/2, H/2, -H/2, -1, 1);

  /* ---- CONFIG ---- */
  const isMobile     = W < 768;
  const N            = isMobile ? 60 : 120;   // node count
  const LINK_DIST    = isMobile ? 130 : 170;  // max px to draw a line
  const MOUSE_RADIUS = 160;  // px — attraction zone radius
  const ATTRACT      = 0.018; // pull strength toward mouse
  const REPEL_NEAR   = 60;   // px — hard repel zone (avoid cursor overlap)
  const REPEL_STR    = 0.55;
  const BASE_SPEED   = 0.22;  // idle drift speed
  const FRICTION     = 0.985;
  const MAX_SPEED    = 3.5;

  /* ---- NODES ---- */
  const nodes = Array.from({ length: N }, () => {
    const angle = Math.random() * Math.PI * 2;
    const spd   = BASE_SPEED * (0.5 + Math.random());
    return {
      x:  (Math.random() - 0.5) * W,
      y:  (Math.random() - 0.5) * H,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      // home position — nodes gently drift back toward it when far from mouse
      hx: (Math.random() - 0.5) * W,
      hy: (Math.random() - 0.5) * H,
    };
  });

  /* ---- DOT GEOMETRY ---- */
  const dotPos  = new Float32Array(N * 3);
  const dotGeo  = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  const dotMat  = new THREE.PointsMaterial({
    color: 0xffffff, size: 2.8,
    sizeAttenuation: false,
    transparent: true, opacity: 0.85,
  });
  scene.add(new THREE.Points(dotGeo, dotMat));

  /* ---- LINE GEOMETRY (pre-allocated) ---- */
  const MAX_SEGS  = N * N;
  const linePos   = new Float32Array(MAX_SEGS * 2 * 3);
  const lineClr   = new Float32Array(MAX_SEGS * 2 * 3);
  const lineGeo   = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineClr, 3));
  lineGeo.setDrawRange(0, 0);
  const lineSegs  = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 1,
  }));
  scene.add(lineSegs);

  /* ---- MOUSE CURSOR DOT (visible white dot at cursor) ---- */
  const mDotPos = new Float32Array(3);
  const mDotGeo = new THREE.BufferGeometry();
  mDotGeo.setAttribute('position', new THREE.BufferAttribute(mDotPos, 3));
  const mDotMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 5,
    sizeAttenuation: false,
    transparent: true, opacity: 0, // selalu tersembunyi — HTML cursor yang dipakai
  });
  const mDotMesh = new THREE.Points(mDotGeo, mDotMat);
  scene.add(mDotMesh);

  /* ---- MOUSE LINES (lines from cursor to nearby nodes) ---- */
  const ML_MAX    = N;
  const mLinePos  = new Float32Array(ML_MAX * 2 * 3);
  const mLineClr  = new Float32Array(ML_MAX * 2 * 3);
  const mLineGeo  = new THREE.BufferGeometry();
  mLineGeo.setAttribute('position', new THREE.BufferAttribute(mLinePos, 3));
  mLineGeo.setAttribute('color',    new THREE.BufferAttribute(mLineClr, 3));
  mLineGeo.setDrawRange(0, 0);
  const mLineSegs = new THREE.LineSegments(mLineGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 1,
  }));
  scene.add(mLineSegs);

  /* ---- CLICK RIPPLE ---- */
  // On click: send a shockwave — nodes near click get blasted outward
  const RIPPLE_RADIUS = 220;
  const RIPPLE_FORCE  = 5.5;
  document.addEventListener('click', e => {
    if (['INPUT','TEXTAREA','A','BUTTON'].includes(e.target.tagName)) return;
    const cx = e.clientX - W / 2;
    const cy = -(e.clientY - H / 2);
    nodes.forEach(n => {
      const dx = n.x - cx, dy = n.y - cy;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < RIPPLE_RADIUS && d > 0.1) {
        const f = (1 - d / RIPPLE_RADIUS) * RIPPLE_FORCE;
        n.vx += (dx / d) * f;
        n.vy += (dy / d) * f;
      }
    });
  });

  /* ---- MOUSE STATE ---- */
  let mx = 0, my = 0, mActive = false;
  // Track raw client coords, convert to scene coords inside animate()
  document.addEventListener('mousemove', e => {
    mx = e.clientX - W / 2;
    my = -(e.clientY - H / 2);
    mActive = true;
  });
  document.addEventListener('mouseleave', () => { mActive = false; });

  /* ---- ANIMATE ---- */
  function animate() {
    requestAnimationFrame(animate);

    nodes.forEach(n => {
      if (mActive) {
        const dx   = mx - n.x;
        const dy   = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_NEAR && dist > 0.1) {
          // Hard repel — push away from cursor if too close
          const f = (REPEL_NEAR - dist) / REPEL_NEAR * REPEL_STR;
          n.vx -= (dx / dist) * f;
          n.vy -= (dy / dist) * f;
        } else if (dist < MOUSE_RADIUS && dist > REPEL_NEAR) {
          // Soft attract — pull toward cursor in the ring zone
          const t   = (dist - REPEL_NEAR) / (MOUSE_RADIUS - REPEL_NEAR); // 0..1
          const f   = (1 - t) * ATTRACT; // stronger the closer
          n.vx += (dx / dist) * f;
          n.vy += (dy / dist) * f;
        }
      }

      // Gentle home drift (keeps nodes spread across the canvas over time)
      const hdx = n.hx - n.x;
      const hdy = n.hy - n.y;
      n.vx += hdx * 0.00015;
      n.vy += hdy * 0.00015;

      // Friction
      n.vx *= FRICTION;
      n.vy *= FRICTION;

      // Clamp speed
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > MAX_SPEED) {
        n.vx = (n.vx / spd) * MAX_SPEED;
        n.vy = (n.vy / spd) * MAX_SPEED;
      }

      // Keep minimum drift so nodes never freeze
      if (spd < 0.08) {
        n.vx += (Math.random() - 0.5) * 0.06;
        n.vy += (Math.random() - 0.5) * 0.06;
      }

      n.x += n.vx;
      n.y += n.vy;

      // Soft boundary — push back when near edges instead of hard wrap
      const hw = W / 2, hh = H / 2;
      const margin = 40;
      if (n.x >  hw - margin) n.vx -= (n.x - (hw - margin)) * 0.04;
      if (n.x < -hw + margin) n.vx -= (n.x - (-hw + margin)) * 0.04;
      if (n.y >  hh - margin) n.vy -= (n.y - (hh - margin)) * 0.04;
      if (n.y < -hh + margin) n.vy -= (n.y - (-hh + margin)) * 0.04;
    });

    /* -- Update dot buffer -- */
    nodes.forEach((n, i) => {
      dotPos[i * 3]     = n.x;
      dotPos[i * 3 + 1] = n.y;
      dotPos[i * 3 + 2] = 0;
    });
    dotGeo.attributes.position.needsUpdate = true;

    /* -- Update mouse cursor dot -- */
    mDotPos[0] = mx; mDotPos[1] = my; mDotPos[2] = 0;
    mDotGeo.attributes.position.needsUpdate = true;
    mDotMat.opacity = 0; // selalu hidden — pakai HTML cursor dot saja

    /* -- Node-to-node lines -- */
    let vi = 0;
    for (let a = 0; a < N; a++) {
      for (let b = a + 1; b < N; b++) {
        const dx = nodes[a].x - nodes[b].x;
        const dy = nodes[a].y - nodes[b].y;
        const d  = dx * dx + dy * dy; // skip sqrt, compare squared
        if (d < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d) / LINK_DIST) * 0.38;
          linePos[vi*3] = nodes[a].x; linePos[vi*3+1] = nodes[a].y; linePos[vi*3+2] = 0;
          lineClr[vi*3] = lineClr[vi*3+1] = lineClr[vi*3+2] = alpha;
          vi++;
          linePos[vi*3] = nodes[b].x; linePos[vi*3+1] = nodes[b].y; linePos[vi*3+2] = 0;
          lineClr[vi*3] = lineClr[vi*3+1] = lineClr[vi*3+2] = alpha;
          vi++;
        }
      }
    }
    lineGeo.setDrawRange(0, vi);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate    = true;

    /* -- Mouse-to-nearby-node lines (the "spider web" effect) -- */
    let mi = 0;
    if (mActive) {
      const ML_DIST = MOUSE_RADIUS * 1.1;
      for (let a = 0; a < N; a++) {
        const dx = nodes[a].x - mx;
        const dy = nodes[a].y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < ML_DIST) {
          const alpha = (1 - d / ML_DIST) * 0.7; // brighter than node lines
          // cursor point
          mLinePos[mi*3] = mx; mLinePos[mi*3+1] = my; mLinePos[mi*3+2] = 0;
          mLineClr[mi*3] = mLineClr[mi*3+1] = mLineClr[mi*3+2] = alpha;
          mi++;
          // node point
          mLinePos[mi*3] = nodes[a].x; mLinePos[mi*3+1] = nodes[a].y; mLinePos[mi*3+2] = 0;
          mLineClr[mi*3] = mLineClr[mi*3+1] = mLineClr[mi*3+2] = alpha;
          mi++;
        }
      }
    }
    mLineGeo.setDrawRange(0, mi);
    mLineGeo.attributes.position.needsUpdate = true;
    mLineGeo.attributes.color.needsUpdate    = true;

    renderer.render(scene, camera);
  }
  animate();

  /* ---- RESIZE ---- */
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H);
    camera.left   = -W/2; camera.right  =  W/2;
    camera.top    =  H/2; camera.bottom = -H/2;
    camera.updateProjectionMatrix();
  });
})();

/* ========== LOAD PORTFOLIO DATA ========== */
async function loadPortfolioData() {
  try {
    const res = await fetch('/data.json');
    portfolioData = await res.json();
    renderProjects();
    renderCertificates();
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

/* ========== RENDER PROJECTS ========== */
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !portfolioData?.projects) return;

  grid.innerHTML = portfolioData.projects.map((p, i) => {
    const isDoc = p.demotype === 'download';

    if (isDoc) {
      return `
      <div class="project-card reveal" data-delay="${i * 100}">
        <div class="project-doc-thumb">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span class="project-doc-ext">.docx / .pdf</span>
        </div>
        <div class="project-body">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-btns">
            <a href="project/dokumentasi-asat-tahun-2026" class="proj-btn proj-primary">
              Baca
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </a>
            <a href="${p.downloadFile}" download class="proj-btn proj-ghost">
              Download
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
          </div>
        </div>
      </div>`;
    }

    const detail = p.id === 1 ? 'project/donghua'
                 : p.id === 2 ? 'project/raisaver'
                 : `project/detail.html?id=${p.id}`;
    return `
    <div class="project-card reveal" data-delay="${i * 100}">
      <div class="project-img-wrap">
        <img class="project-img" src="${p.image}" alt="${p.title}" loading="lazy">
      </div>
      <div class="project-body">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tech">
          ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        <div class="project-btns">
          <a href="${p.demo}" target="_blank" rel="noopener" class="proj-btn proj-primary">
            Live Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <a href="${detail}" class="proj-btn proj-ghost">
            Detail
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>`;
  }).join('');

  // Card tilt effect
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translateY(-3px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
  });

  initRevealNew(document.getElementById('proyek'));
}

/* ========== RENDER CERTIFICATES ========== */
function renderCertificates() {
  const grid = document.getElementById('certsGrid');
  if (!grid || !portfolioData?.certificates) return;

  grid.innerHTML = portfolioData.certificates.map((c, i) => `
    <div class="cert-card reveal" data-delay="${i * 80}"
      onclick="openCertModal(this)"
      data-image="${c.image}">
      <div class="cert-img-wrap">
        <img class="cert-img" src="${c.image}" alt="${c.title}" loading="lazy">
        <div class="cert-info">
          <div class="cert-name">${c.title}</div>
          <div class="cert-issuer">${c.issuer}</div>
          <div class="cert-year">${c.year}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ========== HERO ROLE ROTATOR ========== */
(function roleRotator() {
  const roles = document.querySelectorAll('.role-item');
  if (!roles.length) return;
  let idx = 0;

  setInterval(() => {
    roles[idx].classList.remove('active');
    roles[idx].classList.add('exit');
    setTimeout(() => roles[idx].classList.remove('exit'), 500);
    idx = (idx + 1) % roles.length;
    roles[idx].classList.add('active');
  }, 2800);
})();

/* ========== PAGE INIT ========== */
window.addEventListener('load', async () => {
  await loadPortfolioData();
  initReveal();
  initHeroScaleDown();
  initSlideIn();
  initCounters();

  // Clean URL scroll
  const path = location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const map = { portofolio: 'portofolio', tentang: 'tentang', pendidikan: 'pendidikan', keahlian: 'keahlian', kontak: 'kontak' };
  if (map[path]) {
    const t = document.getElementById(map[path]);
    if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 150);
    history.replaceState(null, '', '/');
  }
});

/* ========== CUSTOM CURSOR ========== */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * 0.75;
  ry += (my - ry) * 0.75;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .cert-card, .project-card, .ptab, .skill-chip, .nav-link, .nav-cv-btn, .cv-dropdown-item, .hero-social, .btn-hero-primary, .btn-hero-ghost').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ========== NAVBAR ========== */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const cvBtn     = document.getElementById('cvBtn');
const cvDrop    = document.querySelector('.cv-dropdown');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  cvDrop.classList.remove('open');
});
cvBtn.addEventListener('click', e => {
  e.stopPropagation();
  cvDrop.classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!cvDrop.contains(e.target)) cvDrop.classList.remove('open');
});

// Smooth scroll
document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.dataset.scroll;
    
    // Jika klik "Beranda", scroll ke atas halaman
    if (targetId === 'beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
    
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    history.replaceState(null, '', '/');
  });
});

// Active nav highlight
const sections   = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link[data-scroll]');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) cur = s.id;
  });
  navLinkEls.forEach(l => {
    l.classList.toggle('active', l.dataset.scroll === cur);
  });
}, { passive: true });

/* ========== TABS ========== */
document.querySelectorAll('.ptab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const tab = document.getElementById(btn.dataset.tab);
    tab.classList.add('active');
    setTimeout(() => initRevealNew(tab), 50);
  });
});

/* ========== HERO SCALE-DOWN — physical depth as next section slides over ========== */
function initHeroScaleDown() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroH    = hero.offsetHeight;

    if (scrolled > heroH) {
      // Completely hide hero once scrolled past — prevent bleed-through
      hero.style.opacity   = '0';
      hero.style.transform = 'scale(0.93)';
      return;
    }

    if (scrolled === 0) {
      // Reset fully when back at top
      hero.style.opacity   = '1';
      hero.style.transform = 'scale(1)';
      return;
    }

    const progress = scrolled / heroH;
    hero.style.transform = `scale(${(1 - progress * 0.07).toFixed(4)})`;
    hero.style.opacity   = (1 - progress * 0.4).toFixed(4);
  }, { passive: true });
}

/* ========== SLIDE-IN — smooth entrance for solid sections ========== */
function initSlideIn() {
  const targets = document.querySelectorAll('.tentang, .keahlian, .kontak');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('slide-in'), 60);
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.04,
  });

  targets.forEach(el => obs.observe(el));
}

/* ========== SCROLL REVEAL ========== */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay) || 0;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initRevealNew(container) {
  if (!container) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => el.classList.add('visible'), parseInt(el.dataset.delay) || 0);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ========== COUNTERS ========== */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        let n = 0;
        const step = target / 60;
        const tick = () => {
          n += step;
          if (n >= target) { el.textContent = target; return; }
          el.textContent = Math.floor(n);
          requestAnimationFrame(tick);
        };
        tick();
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => obs.observe(el));
}

/* ========== CERT MODAL ========== */
let certCards = [];
let certIdx = 0;

function openCertModal(card) {
  certCards = Array.from(document.querySelectorAll('.cert-card'));
  certIdx = certCards.indexOf(card);
  updateModal();
  document.getElementById('certModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function navigateCert(dir) {
  certIdx = (certIdx + dir + certCards.length) % certCards.length;
  updateModal();
}
function updateModal() {
  document.getElementById('modalCertImage').src = certCards[certIdx].dataset.image;
}
function closeCertModal() {
  document.getElementById('certModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')      closeCertModal();
  if (e.key === 'ArrowLeft')   navigateCert(-1);
  if (e.key === 'ArrowRight')  navigateCert(1);
});

/* ========== CONTACT FORM ========== */
const EMAILJS_PUBLIC_KEY   = 'qzdRX-zTWKmqCbjka';
const EMAILJS_SERVICE_ID   = 'service_g9nhsh7';
const EMAILJS_TEMPLATE_ID  = 'template_886xflx';

if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);

const contactForm  = document.getElementById('contactForm');
const successToast = document.getElementById('formSuccess');
const errorToast   = document.getElementById('formErrorToast');
const errorText    = document.getElementById('formErrorText');
let errTimer;

function showToast(el, duration = 4000) {
  el.classList.add('show');
  clearTimeout(errTimer);
  errTimer = setTimeout(() => el.classList.remove('show'), duration);
}
function showError(msg) {
  errorText.textContent = msg;
  showToast(errorToast);
}

['formName','formEmail','formSubject','formMessage'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => el.classList.remove('error'));
});

contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name    = document.getElementById('formName').value.trim();
  const email   = document.getElementById('formEmail').value.trim();
  const subject = document.getElementById('formSubject').value.trim();
  const message = document.getElementById('formMessage').value.trim();

  document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));

  if (name.length < 2) {
    document.getElementById('formName').classList.add('error');
    return showError('Nama minimal 2 karakter.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('formEmail').classList.add('error');
    return showError('Email tidak valid.');
  }
  if (subject.length < 3) {
    document.getElementById('formSubject').classList.add('error');
    return showError('Subjek minimal 3 karakter.');
  }
  if (message.length < 10) {
    document.getElementById('formMessage').classList.add('error');
    return showError('Pesan minimal 10 karakter.');
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Mengirim...';

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: name, from_email: email, subject, message
    });
    showToast(successToast, 5000);
    contactForm.reset();
  } catch (err) {
    console.error(err);
    showError('Gagal mengirim. Coba lagi nanti.');
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Kirim Pesan';
  }
});

/* ========== BACK TO TOP ========== */
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ========== PARALLAX HERO SUBTLE ========== */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const noise = document.querySelector('.hero-noise');
  if (noise) noise.style.transform = `translateY(${y * 0.15}px)`;
}, { passive: true });

/* ========== NO COPY ========== */
document.addEventListener('copy',        e => e.preventDefault());
document.addEventListener('cut',         e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => {
  if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
  e.preventDefault();
});

/* ========== CONSOLE ========== */
console.log('%c AR. ', 'background:#fff;color:#000;font-size:1.4rem;font-weight:900;padding:4px 8px;');
console.log('%cAndhika Rafi · SMK Wikrama Bogor · TJKT · 2026', 'color:#666;font-size:0.85rem;');

/* ========== LANYARD DRAG PHYSICS ========== */
(function initLanyard() {
  const card   = document.getElementById('lanyardCard');
  const scene  = document.getElementById('lanyardScene');
  const rope   = document.getElementById('lanyardRope');
  const ropeShadow = document.getElementById('lanyardRopeShadow');
  const anchor = document.getElementById('lanyardAnchor');
  if (!card || !scene || !rope) return;

  const CARD_W = 240;
  const CARD_H = 400;

  // Physics
  let posX, posY;       // current card CENTER position (relative to scene)
  let velX = 0, velY = 0;
  let isDragging = false;
  let dragOffX = 0, dragOffY = 0;
  let animFrame;

  // Home position — center horizontally, 70px below anchor
  function getHome() {
    return { x: scene.offsetWidth / 2, y: 70 };
  }

  function init() {
    const home = getHome();
    posX = home.x;
    posY = home.y;
    applyPos();
    updateRope();
  }

  function applyPos() {
    // posX/posY = center of card
    card.style.left = (posX - CARD_W / 2) + 'px';
    card.style.top  = posY + 'px';
  }

  function getAnchorPos() {
    // anchor di top center scene
    return { x: scene.offsetWidth / 2, y: 6 };
  }

  function updateRope() {
    const a  = getAnchorPos();
    const cx = posX;
    const cy = posY + 22; // titik lubang kartu

    const slack = Math.min(100, Math.abs(cy - a.y) * 0.45 + Math.abs(cx - a.x) * 0.3);
    const mx    = (a.x + cx) / 2;
    const my    = (a.y + cy) / 2 + slack;
    const d     = `M ${a.x} ${a.y} Q ${mx} ${my} ${cx} ${cy}`;

    rope.setAttribute('d', d);
    if (ropeShadow) ropeShadow.setAttribute('d', d);
  }

  // Drag — mouse
  card.addEventListener('mousedown', e => {
    e.preventDefault();
    isDragging = true;
    const rect = scene.getBoundingClientRect();
    // offset dari center kartu ke posisi klik
    dragOffX = e.clientX - rect.left - posX;
    dragOffY = e.clientY - rect.top  - posY;
    velX = velY = 0;
    cancelAnimationFrame(animFrame);
    card.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const rect = scene.getBoundingClientRect();
    posX = e.clientX - rect.left - dragOffX;
    posY = e.clientY - rect.top  - dragOffY;
    velX = e.movementX;
    velY = e.movementY;
    applyPos();
    updateRope();
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    card.style.cursor = 'grab';
    springBack();
  });

  // Drag — touch
  card.addEventListener('touchstart', e => {
    isDragging = true;
    const t    = e.touches[0];
    const rect = scene.getBoundingClientRect();
    dragOffX   = t.clientX - rect.left - posX;
    dragOffY   = t.clientY - rect.top  - posY;
    velX = velY = 0;
    cancelAnimationFrame(animFrame);
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const t    = e.touches[0];
    const rect = scene.getBoundingClientRect();
    const nx   = t.clientX - rect.left - dragOffX;
    const ny   = t.clientY - rect.top  - dragOffY;
    velX = nx - posX;
    velY = ny - posY;
    posX = nx; posY = ny;
    applyPos();
    updateRope();
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    springBack();
  });

  // Spring back to home with inertia
  function springBack() {
    const SPRING  = 0.12;  // stiffness
    const DAMPING = 0.75;  // damping
    const GRAVITY = 0.4;

    function tick() {
      if (isDragging) return;

      const home = getHome();
      const dx   = home.x - posX;
      const dy   = home.y - posY;

      velX += dx * SPRING;
      velY += dy * SPRING + GRAVITY;
      velX *= DAMPING;
      velY *= DAMPING;
      posX += velX;
      posY += velY;

      applyPos();
      updateRope();

      if (Math.abs(velX) < 0.1 && Math.abs(velY) < 0.1 &&
          Math.abs(dx) < 0.5  && Math.abs(dy) < 0.5) {
        posX = home.x; posY = home.y;
        applyPos();
        updateRope();
        return;
      }
      animFrame = requestAnimationFrame(tick);
    }
    animFrame = requestAnimationFrame(tick);
  }

  // Init after DOM ready
  window.addEventListener('load', init);
  window.addEventListener('resize', init);
})();

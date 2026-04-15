/**
 * JEAN COSTA // SYSTEMS_ANALYST v2.0
 * script.js — Módulo de Comportamento Principal
 *
 * Segurança: zero uso de innerHTML / innerText com dados externos.
 * Toda manipulação de DOM usa textContent, createElement e setAttribute.
 *
 * Módulos:
 *  1. LOADER    – Boot sequence animada
 *  2. CURSOR    – Cursor neon customizado (desabilitado em touch)
 *  3. CANVAS    – Matrix (binary stream) + Tech icons (partículas)
 *  4. TYPING    – Auto-typing com IntersectionObserver
 *  5. SKILL BARS– Barras de habilidade animadas por scroll
 *  6. HW MONITOR– Simulação de métricas de hardware
 *  7. NAV       – Highlight de seção ativa no scroll
 *  8. RESIZE    – Redimensionamento de canvases com debounce
 *  9. FOOTER    – Uptime, resposta aleatória, IP rotativo, copiar email
 */

'use strict';

/* ============================================================
   UTILITÁRIOS GLOBAIS
   ============================================================ */

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const rnd = (min, max) => Math.random() * (max - min) + min;
const isTouch = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/** Escreve apenas texto puro no DOM — nunca interpreta HTML */
const setText = (el, value) => { if (el) el.textContent = String(value); };


/* ============================================================
   DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {


  /* ============================================================
     MÓDULO 1 // LOADER (BOOT SEQUENCE)
     ============================================================ */
  const loader  = qs('#loader');
  const barEl   = qs('#loader-bar');
  const textEl  = qs('#loader-text');
  const percEl  = qs('#loader-perc');

  const bootMessages = Object.freeze([
    'BOOTING_OS...',
    'MOUNTING_DRIVES_RTX4060...',
    'LOADING_DATABASE_CRUZEIRO...',
    'ESTABLISHING_NEURAL_LINK...',
    'SYSTEM_READY.',
  ]);

  let progress = 0;
  let msgIndex = 0;
  const msgStep = 100 / bootMessages.length;

  const bootInterval = setInterval(() => {
    progress += rnd(8, 18);
    if (progress > 100) progress = 100;

    if (barEl)  barEl.style.width = `${progress}%`;
    setText(percEl, `${Math.floor(progress)}%`);

    if (msgIndex < bootMessages.length && progress > msgStep * msgIndex) {
      setText(textEl, bootMessages[msgIndex]);
      msgIndex++;
    }

    if (progress >= 100) {
      clearInterval(bootInterval);
      setTimeout(() => {
        if (!loader) return;
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          document.body.classList.remove('overflow-hidden');
        }, 700);
      }, 500);
    }
  }, 120);


  /* ============================================================
     MÓDULO 2 // CURSOR NEON CUSTOMIZADO
     ============================================================ */
  const cursor = qs('#custom-cursor');

  if (!isTouch() && cursor) {
    const interactibles = qsa('a, button, .custom-hover, input, textarea, .hw-card');

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top  = `${e.clientY}px`;
    });

    interactibles.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover-state'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover-state'));
    });
  }


  /* ============================================================
     MÓDULO 3 // CANVAS — MATRIX & TECH ICONS
     ============================================================ */
  const matrixCanvas   = qs('#matrix-canvas');
  const particleCanvas = qs('#hero-particles');

  function resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (matrixCanvas)   { matrixCanvas.width   = w; matrixCanvas.height   = h; }
    if (particleCanvas) { particleCanvas.width  = w; particleCanvas.height = h; }
  }
  resizeCanvases();

  // --- 3a. MATRIX ---
  if (matrixCanvas) {
    const ctxM    = matrixCanvas.getContext('2d');
    const fontSize = 14;
    let columns   = Math.floor(window.innerWidth / fontSize);
    let drops     = Array(columns).fill(1);

    function drawMatrix() {
      ctxM.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctxM.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      ctxM.fillStyle = '#a855f7';
      ctxM.font      = `${fontSize}px "JetBrains Mono"`;
      drops.forEach((y, i) => {
        const char = Math.random() > 0.5 ? '1' : '0';
        ctxM.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }

    setInterval(drawMatrix, 50);
    window.addEventListener('resize', () => {
      columns = Math.floor(window.innerWidth / fontSize);
      drops   = Array(columns).fill(1);
    });
  }

  // --- 3b. TECH ICONS ---
  if (particleCanvas) {
    const ctxP  = particleCanvas.getContext('2d');
    const icons = Object.freeze(['</>', '{ }', 'SQL', 'JS', 'JAVA', 'HTML', 'CSS', 'NODE', 'React', 'Data']);
    let particles = [];

    class TechParticle {
      constructor() { this.init(true); }
      init(spread = false) {
        this.x       = rnd(0, window.innerWidth);
        this.y       = spread ? rnd(0, window.innerHeight) : window.innerHeight + rnd(0, 200);
        this.text    = icons[Math.floor(rnd(0, icons.length))];
        this.size    = rnd(10, 24);
        this.speedY  = rnd(0.2, 0.7);
        this.opacity = rnd(0.1, 0.6);
      }
      update() {
        this.y -= this.speedY;
        if (this.y < -50) this.init();
      }
      draw() {
        ctxP.fillStyle = `rgba(168, 85, 247, ${this.opacity})`;
        ctxP.font      = `${this.size}px "JetBrains Mono"`;
        ctxP.fillText(this.text, this.x, this.y);
      }
    }

    function particleCount() {
      const area = window.innerWidth * window.innerHeight;
      return Math.max(20, Math.min(120, Math.floor(area / 15000)));
    }

    function buildParticles() {
      particles = Array.from({ length: particleCount() }, () => new TechParticle());
    }
    buildParticles();

    function animateTechIcons() {
      ctxP.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateTechIcons);
    }
    animateTechIcons();
    window.addEventListener('resize', buildParticles);
  }


  /* ============================================================
     MÓDULO 4 // AUTO-TYPING BIO
     Usa Text Node — nunca interpreta HTML, imune a XSS.
     ============================================================ */
  function typeEffect(element, text, speed = 30) {
    if (!element) return;

    // Remove filhos anteriores sem usar innerHTML
    while (element.firstChild) element.removeChild(element.firstChild);

    // Text Node: caracteres são sempre texto puro
    const textNode = document.createTextNode('');
    element.appendChild(textNode);

    let i = 0;
    const safeText = String(text); // garante string

    (function typing() {
      if (i < safeText.length) {
        textNode.nodeValue += safeText.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    })();
  }

  const aboutSection = qs('#about');
  if (aboutSection) {
    const typingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        typeEffect(
          qs('#type-formacao'),
          'Analista de Sistemas pelo SENAI Jandira e Tecnólogo em Banco de Dados pela Cruzeiro do Sul.'
        );
        setTimeout(() => {
          typeEffect(
            qs('#type-missao'),
            'Arquitetar ecossistemas de dados eficientes e interfaces que convertem complexidade em clareza visual.'
          );
        }, 1500);
        typingObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    typingObserver.observe(aboutSection);
  }


  /* ============================================================
     MÓDULO 5 // SKILL BARS
     data-percent é parseado e clampado antes de usar.
     ============================================================ */
  const skillBars = qsa('.skill-bar');

  if (skillBars.length) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const raw     = parseInt(bar.getAttribute('data-percent'), 10);
        const percent = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
        bar.style.width = `${percent}%`;
        skillObserver.unobserve(bar);
      });
    }, { threshold: 0.2 });

    skillBars.forEach(bar => skillObserver.observe(bar));
  }


  /* ============================================================
     MÓDULO 6 // HARDWARE MONITOR
     Valores são gerados localmente — sem entrada externa.
     ============================================================ */
  function updateHWMetrics() {
    qsa('.core-load').forEach(el => setText(el, `${Math.floor(rnd(88, 98))}%`));
    qsa('.temp-core').forEach(el => setText(el, `${Math.floor(rnd(36, 42))}°C`));
  }
  setInterval(updateHWMetrics, 3000);


  /* ============================================================
     MÓDULO 7 // NAVEGAÇÃO — SEÇÃO ATIVA
     ============================================================ */
  const navLinks = qsa('nav a[href^="#"]');
  const sections = qsa('section[id]');

  if (navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('text-purple-400', active);
          link.classList.toggle('text-gray-400',  !active);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(sec => navObserver.observe(sec));
  }


  /* ============================================================
     MÓDULO 8 // RESIZE — DEBOUNCE DE CANVASES
     ============================================================ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvases, 150);
  });


  /* ============================================================
     MÓDULO 9 // FOOTER INTERATIVO
     Segurança:
       - EMAIL é constante hardcoded, nunca lida do DOM
       - Todos os textos escritos via setText() (textContent)
       - Textarea do fallback: readonly, aria-hidden, fora do viewport,
         removida imediatamente após a cópia
       - Nenhum dado externo / input do usuário entra no DOM
     ============================================================ */

  // 9a. Uptime counter
  const ftUptime = qs('#ft-uptime');
  if (ftUptime) {
    const ftStart = Date.now();
    const pad = (n) => String(Math.floor(n)).padStart(2, '0');

    setInterval(() => {
      const elapsed = Math.floor((Date.now() - ftStart) / 1000);
      setText(ftUptime, `${pad(elapsed / 3600)}:${pad((elapsed % 3600) / 60)}:${pad(elapsed % 60)}`);
    }, 1000);
  }

  // 9b. Tempo de resposta aleatório
  const ftResp = qs('#ft-resp');
  if (ftResp) {
    const resps = Object.freeze(['48ms', '120ms', '37ms', '89ms', '62ms', '54ms']);
    setText(ftResp, resps[0]);
    setInterval(() => setText(ftResp, resps[Math.floor(Math.random() * resps.length)]), 4000);
  }

  // 9c. IP rotativo
  const ftNode = qs('#ft-node');
  if (ftNode) {
    const ips = Object.freeze(['192.168.1.1', '10.0.0.47', '172.16.0.23', '192.168.0.105']);
    setInterval(() => {
      ftNode.style.opacity    = '0';
      ftNode.style.transition = 'opacity 0.4s';
      setTimeout(() => {
        setText(ftNode, ips[Math.floor(Math.random() * ips.length)]);
        ftNode.style.opacity = '1';
      }, 400);
    }, 6000);
  }

  // 9d. Botão copiar email
  const ftCopyBtn   = qs('#ft-copy-btn');
  const ftCopyLabel = qs('#ft-copy-label');
  const ftCopyIcon  = qs('#ft-copy-icon');
  const ftToast     = qs('#ft-toast');

  if (ftCopyBtn) {
    const EMAIL = 'jc090504@gmail.com'; // constante — nunca vem do DOM

    let copyTimer = null;

    const showCopied = () => {
      setText(ftCopyLabel, 'COPIADO!');
      setText(ftCopyIcon,  '✓');
      if (ftToast) ftToast.style.opacity = '1';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        setText(ftCopyLabel, 'EMAIL.copy');
        setText(ftCopyIcon,  '⌘');
        if (ftToast) ftToast.style.opacity = '0';
      }, 2500);
    };

    const fallbackCopy = () => {
      // Textarea invisível fora do viewport — removida imediatamente
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.setAttribute('readonly', '');
      ta.setAttribute('aria-hidden', 'true');
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) { /* fallback indisponível */ }
      document.body.removeChild(ta);
      showCopied();
    };

    ftCopyBtn.addEventListener('click', () => {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(EMAIL).then(showCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  }

}); 
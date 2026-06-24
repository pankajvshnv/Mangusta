/**
 * THE GRAND YACHT — Premium Motion Design
 * Lenis + GSAP ScrollTrigger + Canvas Sequence
 * Word splits · Clip reveals · Magnetic buttons · Custom cursor
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     CONFIG
  ══════════════════════════════════════════════ */
  const CFG = {
    TOTAL_FRAMES:    1033,
    SEQUENCE_PATH:   'sequence/',
    SCROLL_PER_FRAME: 3,
    LENIS_DURATION:  1.1,
    CACHE_RADIUS:    24,
    MAX_CACHE:       80,
    MAX_PENDING:     30,
  };

  const CHAPTERS = [
    { id: 'ch-space', fromF: 380,  toF: 500  },
    { id: 'ch-atmos', fromF: 540,  toF: 660  },
    { id: 'ch-city',  fromF: 700,  toF: 820 },
    { id: 'ch-roof',  fromF: 860,  toF: 980 },
  ];

  /* ══════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════ */
  const images     = new Map();
  const loading    = new Map();
  let currentFrame = 0;
  let lenis        = null;
  let guestCount   = 2;
  let tIdx         = 0;
  let curX = 0, curY = 0, folX = 0, folY = 0;
  let cursorEl, followerEl;

  /* ══════════════════════════════════════════════
     DOM
  ══════════════════════════════════════════════ */
  const $  = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const loader       = $('#loader');
  const loaderFill   = $('#loaderFill');
  const loaderStatus = $('#loaderStatus');
  const nav          = $('#nav');
  const canvas       = $('#canvas');
  const ctx          = canvas.getContext('2d');
  const scrollCue    = $('#scrollCue');
  const progFill     = $('#heroProgressFill');

  /* ══════════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════════ */
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ══════════════════════════════════════════════
     CANVAS
  ══════════════════════════════════════════════ */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width  = w * dpr;  canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    drawFrame(currentFrame);
  }

  function drawFrame(idx) {
    const img = images.get(idx);
    if (!img || !img.complete || !img.naturalWidth) return;
    const w = window.innerWidth, h = window.innerHeight;
    // COVER + extra zoom (1.28×) — pushes any letterbox bars off-screen
    const ZOOM = 1.28;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * ZOOM;
    const dw = img.naturalWidth  * scale;
    const dh = img.naturalHeight * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function trimFrameCache(keepAround) {
    if (images.size <= CFG.MAX_CACHE) return;
    [...images.keys()]
      .sort((a, b) => Math.abs(b - keepAround) - Math.abs(a - keepAround))
      .slice(0, images.size - CFG.MAX_CACHE)
      .forEach(idx => images.delete(idx));
  }

  function requestFrame(idx, drawWhenReady = false) {
    idx = clamp(idx, 0, CFG.TOTAL_FRAMES - 1);
    if (images.has(idx) || loading.has(idx) || loading.size >= CFG.MAX_PENDING) return;
    const img = new Image();
    loading.set(idx, img);
    img.decoding = 'async';
    img.src = `${CFG.SEQUENCE_PATH}${idx + 1}.jpg`;
    img.onload = () => {
      loading.delete(idx);
      images.set(idx, img);
      trimFrameCache(currentFrame);
      if (drawWhenReady && idx === currentFrame) drawFrame(idx);
    };
    img.onerror = () => loading.delete(idx);
  }

  function warmFrames(center, direction = 1) {
    // A fast flick can cross hundreds of frames. Abort requests that are no
    // longer near the playhead before warming the new neighbourhood.
    loading.forEach((img, idx) => {
      if (Math.abs(idx - center) > CFG.CACHE_RADIUS * 2) {
        img.onload = null;
        img.onerror = null;
        img.src = 'data:,';
        loading.delete(idx);
      }
    });
    requestFrame(center, true);
    for (let step = 1; step <= CFG.CACHE_RADIUS; step++) {
      requestFrame(center + step * direction);
      requestFrame(center - step * direction);
    }
  }

  /* ══════════════════════════════════════════════
     PRELOAD
  ══════════════════════════════════════════════ */
  function preloadImages(onProgress, onComplete) {
    let loaded = 0;
    const msgs = [
      'Preparing your voyage',
      'Charting the course',
      'Ready the decks',
      'Opening the horizon',
      'Welcome aboard',
    ];
    // Decode only a small opening buffer. The 5.5 GB UHD sequence is then
    // streamed around the active frame to keep memory use predictable.
    const targetLoadCount = Math.min(8, CFG.TOTAL_FRAMES);
    
    // ONLY load the first `targetLoadCount` images initially!
    for (let i = 0; i < targetLoadCount; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = `${CFG.SEQUENCE_PATH}${i + 1}.jpg`;
      const settle = () => {
        loaded++;
        const pct = loaded / targetLoadCount;
        onProgress(pct);
        const mi = Math.min(Math.floor(pct * msgs.length), msgs.length - 1);
        if (loaderStatus) loaderStatus.textContent = msgs[mi];
        
        if (loaded === targetLoadCount) onComplete();
      };
      img.onload = () => { images.set(i, img); settle(); };
      img.onerror = settle;
    }
  }

  /* ══════════════════════════════════════════════
     WORD SPLIT UTILITY
     Wraps each word in <span class="sw"><span class="sw-i">word</span></span>
     Preserves <em>, <strong> tags
  ══════════════════════════════════════════════ */
  function wrapWords(container) {
    const nodes = [...container.childNodes];
    container.innerHTML = '';

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split text into words
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach(part => {
          if (/^\s+$/.test(part)) {
            container.appendChild(document.createTextNode(part));
          } else if (part) {
            const sw  = document.createElement('span');
            sw.className = 'sw';
            const swi = document.createElement('span');
            swi.className = 'sw-i';
            swi.textContent = part;
            sw.appendChild(swi);
            container.appendChild(sw);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Preserve the tag (em, strong, etc.) but wrap its text children
        const tag = node.tagName.toLowerCase();
        const clone = document.createElement(tag);
        [...node.attributes].forEach(a => clone.setAttribute(a.name, a.value));
        wrapWords(clone); // recurse using original children
        // Transfer processed children back
        [...node.childNodes].forEach(child => {
          const sw  = document.createElement('span');
          sw.className = 'sw';
          const swi = document.createElement('span');
          swi.className = 'sw-i';
          if (child.nodeType === Node.TEXT_NODE) {
            const words = child.textContent.split(/(\s+)/);
            words.forEach(w => {
              if (/^\s+$/.test(w)) {
                clone.appendChild(document.createTextNode(w));
              } else if (w) {
                const s  = document.createElement('span');
                s.className = 'sw';
                const si = document.createElement('span');
                si.className = 'sw-i';
                si.textContent = w;
                s.appendChild(si);
                clone.appendChild(s);
              }
            });
          }
        });
        container.appendChild(clone);
      }
    });
  }

  function splitWords(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = '1';
    wrapWords(el);
  }

  /* ══════════════════════════════════════════════
     CUSTOM CURSOR
  ══════════════════════════════════════════════ */
  function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    cursorEl   = document.createElement('div');
    cursorEl.className = 'a-cursor';
    followerEl = document.createElement('div');
    followerEl.className = 'a-cursor-follow';
    document.body.append(cursorEl, followerEl);

    window.addEventListener('mousemove', e => {
      curX = e.clientX; curY = e.clientY;
      gsap.set(cursorEl, { x: curX, y: curY });
    }, { passive: true });

    (function tick() {
      folX = lerp(folX, curX, 0.1);
      folY = lerp(folY, curY, 0.1);
      gsap.set(followerEl, { x: folX, y: folY });
      requestAnimationFrame(tick);
    })();

    const hover = $$('a, button');
    hover.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorEl.classList.add('is-hover');
        followerEl.classList.add('is-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorEl.classList.remove('is-hover');
        followerEl.classList.remove('is-hover');
      });
    });

    $$('.gallery-item, .exp-block-img, .about-img-wrap, .elev-item-img, .event-card-img').forEach(el => {
      el.addEventListener('mouseenter', () => { cursorEl.classList.add('is-view'); followerEl.classList.add('is-view'); });
      el.addEventListener('mouseleave', () => { cursorEl.classList.remove('is-view'); followerEl.classList.remove('is-view'); });
    });
  }

  /* ══════════════════════════════════════════════
     CHAPTERS
  ══════════════════════════════════════════════ */
  function updateChapters(frame) {
    CHAPTERS.forEach(c => {
      const el = document.getElementById(c.id);
      if (el) el.classList.toggle('active', frame >= c.fromF && frame <= c.toF);
    });
  }

  /* ══════════════════════════════════════════════
     LENIS
  ══════════════════════════════════════════════ */
  function initLenis() {
    lenis = new Lenis({
      duration:         CFG.LENIS_DURATION,
      easing:           t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:      'vertical',
      smoothWheel:      true,
      wheelMultiplier:  1,
      touchMultiplier:  2,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* (hero-reveal section removed) */

  /* ══════════════════════════════════════════════
     CANVAS SCROLL SEQUENCE
  ══════════════════════════════════════════════ */
  function initCanvasSequence() {
    gsap.registerPlugin(ScrollTrigger);
    const totalScroll = CFG.TOTAL_FRAMES * CFG.SCROLL_PER_FRAME;

    let previousFrame = 0;
    ScrollTrigger.create({
      trigger: '#hero',
      start:   'top top',
      end:     `+=${totalScroll}`,
      pin:     true,
      scrub:   true,
      onUpdate(self) {
        const p = self.progress;
        scrollCue && (p > 0.015 ? scrollCue.classList.add('gone') : scrollCue.classList.remove('gone'));
        const hl = $('#heroLogo');
        if (hl) {
          // Fades out extremely fast (under 0.10s of scrolling equivalent)
          hl.style.opacity = Math.max(0, 1 - (p * 30));
        }
        if (progFill) progFill.style.width = (p * 100) + '%';
        const frame = clamp(Math.round(p * (CFG.TOTAL_FRAMES - 1)), 0, CFG.TOTAL_FRAMES - 1);
        if (frame !== currentFrame) {
          const direction = frame >= previousFrame ? 1 : -1;
          currentFrame = frame;
          drawFrame(frame);
          warmFrames(frame, direction);
          previousFrame = frame;
        }
        updateChapters(frame);
      },
    });

    // Nav color switch
    nav.classList.add('nav--dark');
    ScrollTrigger.create({
      trigger: '.marquee',
      start: 'top 60px',
      onEnter:     () => { nav.classList.remove('nav--dark');  nav.classList.add('nav--light');  },
      onLeaveBack: () => { nav.classList.remove('nav--light'); nav.classList.add('nav--dark');   },
    });
  }

  /* ══════════════════════════════════════════════
     PAGE ENTER (after loader)
  ══════════════════════════════════════════════ */
  function initPageEnter() {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.fromTo(nav,    { y: -56, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0 })
      .fromTo(canvas, { scale: 1.08 },         { scale: 1, duration: 3, ease: 'power2.out' }, '<')
      .fromTo(scrollCue, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 2.0 }, '-=1');
  }

  /* ══════════════════════════════════════════════
     HEADLINE WORD REVEAL (reusable)
  ══════════════════════════════════════════════ */
  function animateHeadline(el, trigger, opts = {}) {
    if (!el) return;
    splitWords(el);
    const words = el.querySelectorAll('.sw-i');
    gsap.fromTo(words,
      { y: '115%', rotateX: opts.rotateX || 0, opacity: 0 },
      {
        y: '0%', rotateX: 0, opacity: 1,
        stagger:   opts.stagger  || 0.065,
        duration:  opts.duration || 1.1,
        ease:      opts.ease     || 'power4.out',
        delay:     opts.delay    || 0,
        scrollTrigger: {
          trigger: trigger || el,
          start:   opts.start || 'top 82%',
          once:    true,
        },
      }
    );
  }

  /* ══════════════════════════════════════════════
     EYEBROW CHAR REVEAL
  ══════════════════════════════════════════════ */
  function animateEyebrow(el, trigger) {
    if (!el) return;
    const text = el.textContent;
    el.innerHTML = [...text].map(c =>
      `<span style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
    gsap.fromTo(el.querySelectorAll('span'),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.022, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: trigger || el, start: 'top 90%', once: true }
      }
    );
  }

  /* ══════════════════════════════════════════════
     IMAGE CLIP REVEAL (left-to-right wipe)
  ══════════════════════════════════════════════ */
  function revealImage(wrapper, opts = {}) {
    const img = wrapper.querySelector('img');
    if (!wrapper || !img) return;
    img.style.transition = 'none'; // Disable CSS, GSAP takes over

    const dir = opts.dir || 'left'; // 'left' or 'right'
    const startClip = dir === 'right' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    const endClip   = 'inset(0 0% 0 0%)';

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start:   opts.start || 'top 85%',
        once:    true,
      }
    });
    tl.fromTo(wrapper, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 2.5, ease: 'power2.out' })
      .fromTo(img,     { scale: 1.28 },       { scale: 1.18,      duration: 4.0, ease: 'power2.out' }, '<');
  }

  /* ══════════════════════════════════════════════
     ALL SECTION ANIMATIONS
  ══════════════════════════════════════════════ */
  function initSectionAnimations() {

    /* ── §01 ABOUT ──────────────────────────── */
    revealImage($('.about-img-wrap'), { start: 'top 72%' });

    const aboutCol = $('.about-text-col');
    if (aboutCol) {
      animateEyebrow(aboutCol.querySelector('.eyebrow'), '#about');

      // Headline – word reveal with slide from right
      const h = aboutCol.querySelector('.about-headline');
      if (h) {
        splitWords(h);
        gsap.fromTo(h.querySelectorAll('.sw-i'),
          { x: 30, y: '50%', opacity: 0 },
          { x: 0, y: '0%', opacity: 1, stagger: 0.06, duration: 2.5, ease: 'power2.out',
            scrollTrigger: { trigger: '#about', start: 'top 65%', once: true } }
        );
      }

      // Body paragraphs – fade up from right
      aboutCol.querySelectorAll('.about-body').forEach((b, i) => {
        gsap.fromTo(b,
          { x: 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 2.0, ease: 'power2.out', delay: i * 0.12,
            scrollTrigger: { trigger: b, start: 'top 88%', once: true } }
        );
      });

      // Stats – zoom up
      const stats = aboutCol.querySelector('.about-stats');
      if (stats) {
        gsap.fromTo(stats,
          { y: 32, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out',
            scrollTrigger: { trigger: stats, start: 'top 86%', once: true } }
        );
        // Counter
        stats.querySelectorAll('.js-counter').forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          ScrollTrigger.create({
            trigger: el, start: 'top 88%', once: true,
            onEnter: () => {
              const o = { v: 0 };
              gsap.to(o, { v: target, duration: 2.6, ease: 'power2.out',
                onUpdate() { el.textContent = Math.round(o.v); } });
            }
          });
        });
      }

      const lk = aboutCol.querySelector('.link-arrow');
      if (lk) {
        gsap.fromTo(lk,
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: lk, start: 'top 90%', once: true } }
        );
      }
    }

    /* ── §02 EDITORIAL SHOWCASE ─────────────── */
    const edSection = $('.editorial-section');
    if (edSection) {
      const edEyebrow = $('#ed-eyebrow');
      if (edEyebrow) animateEyebrow(edEyebrow, '.editorial-section');
      
      const edHeadline = $('#ed-headline');
      if (edHeadline) {
        edHeadline.querySelectorAll('.ed-line').forEach((line, i) => {
          splitWords(line);
          gsap.fromTo(line.querySelectorAll('.sw-i'),
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: 2, ease: 'power2.out', delay: i * 0.1,
              scrollTrigger: { trigger: edHeadline, start: 'top 80%', once: true } }
          );
        });
      }

      const edSub = $('#ed-sub');
      if (edSub) {
        gsap.fromTo(edSub, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out', scrollTrigger: { trigger: edSub, start: 'top 85%', once: true } });
      }

      $$('.ed-ev-row').forEach((row, i) => {
        gsap.fromTo(row, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out', delay: i * 0.15, scrollTrigger: { trigger: '#ed-ev-preview', start: 'top 85%', once: true } });
      });

      const edAllBtn = $('#btn-all-events');
      if (edAllBtn) {
        gsap.fromTo(edAllBtn, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: edAllBtn, start: 'top 90%', once: true } });
      }

      $$('.ed-img').forEach((imgWrap, i) => {
        revealImage(imgWrap, { dir: i % 2 === 0 ? 'right' : 'left', start: 'top 75%' });
        const img = imgWrap.querySelector('img');
        if (img) {
          gsap.fromTo(img, { scale: 1.45 }, { scale: 1.30, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: imgWrap, start: 'top 75%', once: true } });
        }
      });

      const edBadge = $('#ed-badge');
      if (edBadge) {
        gsap.fromTo(edBadge, { scale: 0, rotation: -45, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.5, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.editorial-images', start: 'top 60%', once: true } });
      }

      $$('.ed-cat-item').forEach((cat, i) => {
        gsap.fromTo(cat, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out', delay: i * 0.1, scrollTrigger: { trigger: '.ed-cat-grid', start: 'top 85%', once: true } });
      });
      
      const edCatFeatured = $('#cat-center');
      if (edCatFeatured) {
        gsap.fromTo(edCatFeatured, { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: '.ed-cat-grid', start: 'top 85%', once: true } });
      }
    }

    /* ── §05 PRIVATE EVENTS ─────────────────── */
    animateEyebrow($('.private-body .eyebrow'), '.private-section');

    const privTitle = $('.private-title');
    if (privTitle) {
      privTitle.querySelectorAll('.js-reveal-line').forEach((line, i) => {
        splitWords(line);
        gsap.fromTo(line.querySelectorAll('.sw-i'),
          { y: '115%', rotateX: 20, opacity: 0 },
          { y: '0%', rotateX: 0, opacity: 1, stagger: 0.06, duration: 2.55, ease: 'power2.out', delay: i * 0.18,
            scrollTrigger: { trigger: '.private-section', start: 'top 72%', once: true } }
        );
      });
    }

    const privSub = $('.private-sub');
    if (privSub) {
      gsap.fromTo(privSub,
        { y: 30, opacity: 0, filter: 'blur(3px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out',
          scrollTrigger: { trigger: privSub, start: 'top 85%', once: true } }
      );
    }

    $$('.private-cap').forEach((cap, i) => {
      gsap.fromTo(cap,
        { y: 44, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 2.0, ease: 'back.out(1.5)', delay: i * 0.1,
          scrollTrigger: { trigger: '.private-caps', start: 'top 83%', once: true } }
      );
    });

    const privTypes = $$('.private-types span');
    if (privTypes.length) {
      gsap.fromTo(privTypes,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '.private-types', start: 'top 86%', once: true } }
      );
    }

    const privBtn = $('.private-body .btn-primary');
    if (privBtn) {
      gsap.fromTo(privBtn,
        { y: 24, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 2.0, ease: 'power2.out',
          scrollTrigger: { trigger: privBtn, start: 'top 90%', once: true } }
      );
    }

    // Private bg zoom reveal
    const privImg = $('.private-img');
    if (privImg) {
      const pImg = privImg.querySelector('img');
      if (pImg) pImg.style.transition = 'none';
      gsap.fromTo(privImg,
        { clipPath: 'inset(15% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', duration: 1.8, ease: 'expo.out',
          scrollTrigger: { trigger: '.private-section', start: 'top 82%', once: true } }
      );
      if (pImg) {
        gsap.fromTo(pImg, { scale: 1.2 },
          { scale: 1.18, duration: 2.2, ease: 'expo.out',
            scrollTrigger: { trigger: '.private-section', start: 'top 82%', once: true } }
        );
      }
    }

    /* ── §06 GALLERY ────────────────────────── */
    animateEyebrow($('.gallery-section .eyebrow'), '.gallery-section');
    const galTitle = $('.gallery-section .section-title');
    if (galTitle) {
      galTitle.querySelectorAll('span').forEach((line, i) => {
        splitWords(line);
        gsap.fromTo(line.querySelectorAll('.sw-i'),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 2.5, ease: 'power2.out', delay: i * 0.12,
            scrollTrigger: { trigger: '.gallery-section', start: 'top 82%', once: true } }
        );
      });
    }

    $$('.gallery-item').forEach((item, i) => {
      const img = item.querySelector('img');
      if (img) img.style.transition = 'none';
      gsap.fromTo(item,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.5, ease: 'power2.out', delay: (i % 4) * 0.09,
          scrollTrigger: { trigger: item, start: 'top 92%', once: true } }
      );
      if (img) {
        gsap.fromTo(img, { scale: 1.15 },
          { scale: 1.18, duration: 1.4, ease: 'power2.out', delay: (i % 4) * 0.09,
            scrollTrigger: { trigger: item, start: 'top 92%', once: true } }
        );
      }
    });

    /* ── §07 TESTIMONIALS ───────────────────── */
    const tTrack = $('.testimonial-track');
    if (tTrack) {
      gsap.fromTo(tTrack,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: tTrack, start: 'top 75%', once: true } }
      );
    }
    const pressLogos = $$('.press-logos span');
    if (pressLogos.length) {
      gsap.fromTo(pressLogos,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: '.press-logos', start: 'top 90%', once: true } }
      );
    }

    /* ── §08 RESERVATIONS ───────────────────── */
    animateEyebrow($('.reserve-left .eyebrow'), '.reserve-section');

    const resTitle = $('.reserve-title');
    if (resTitle) {
      resTitle.querySelectorAll('.js-reveal-line').forEach((line, i) => {
        splitWords(line);
        gsap.fromTo(line.querySelectorAll('.sw-i'),
          { y: '115%', opacity: 0, x: -20 },
          { y: '0%', x: 0, opacity: 1, stagger: 0.07, duration: 2.5, ease: 'power2.out', delay: i * 0.15,
            scrollTrigger: { trigger: '.reserve-section', start: 'top 80%', once: true } }
        );
      });
    }

    const resDesc = $('.reserve-desc');
    if (resDesc) {
      gsap.fromTo(resDesc, { x: -32, opacity: 0 },
        { x: 0, opacity: 1, duration: 2.0, ease: 'power2.out', delay: 0.3,
          scrollTrigger: { trigger: resDesc, start: 'top 88%', once: true } }
      );
    }

    $$('.reserve-contact-item').forEach((item, i) => {
      gsap.fromTo(item, { x: -28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.85, ease: 'power2.out', delay: 0.1 + i * 0.12,
          scrollTrigger: { trigger: item, start: 'top 88%', once: true } }
      );
    });

    const resRight = $('.reserve-right');
    if (resRight) {
      gsap.fromTo(resRight, { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: resRight, start: 'top 80%', once: true } }
      );
    }

    /* ── §09 NEWSLETTER ─────────────────────── */
    animateEyebrow($('.newsletter-text .eyebrow'), '.newsletter-section');

    const nlTitle = $('.newsletter-title');
    if (nlTitle) {
      nlTitle.querySelectorAll('.js-reveal-line').forEach((line, i) => {
        splitWords(line);
        gsap.fromTo(line.querySelectorAll('.sw-i'),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 2.5, ease: 'power2.out', delay: i * 0.14,
            scrollTrigger: { trigger: '.newsletter-section', start: 'top 82%', once: true } }
        );
      });
    }

    const nlDesc = $('.newsletter-desc');
    const nlForm = $('.newsletter-form');
    if (nlDesc) {
      gsap.fromTo(nlDesc, { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.0, ease: 'power2.out', delay: 0.25,
          scrollTrigger: { trigger: nlDesc, start: 'top 87%', once: true } }
      );
    }
    if (nlForm) {
      gsap.fromTo(nlForm, { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 2.5, ease: 'power2.out',
          scrollTrigger: { trigger: nlForm, start: 'top 83%', once: true } }
      );
    }

    /* ── FOOTER ─────────────────────────────── */
    $$('.footer-brand, .footer-col').forEach((col, i) => {
      gsap.fromTo(col, { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.0, ease: 'power2.out', delay: i * 0.1,
          scrollTrigger: { trigger: '.footer', start: 'top 88%', once: true } }
      );
    });

    /* ── MARQUEE SCROLL PARALLAX ─────────────── */
    gsap.to('.marquee-inner', {
      xPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
    });

    /* ── Catch-all for remaining .js-reveal ─── */
    $$('.js-reveal:not([data-gsap-done])').forEach(el => {
      el.dataset.gsapDone = '1';
      gsap.fromTo(el,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.0, ease: 'power2.out',
          delay: parseFloat(el.style.getPropertyValue('--delay') || 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });
  }

  /* ══════════════════════════════════════════════
     HOVER EFFECTS — MAGNETIC + CARD TILT
  ══════════════════════════════════════════════ */
  function initHoverEffects() {
    // Magnetic pull on CTA buttons
    $$('.btn-primary, .btn-ghost, .btn-outline, .nav-reserve').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
        gsap.to(btn, { x: dx, y: dy, duration: 0.45, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // Card image parallax on hover
    $$('.event-card, .elev-item').forEach(card => {
      const img = card.querySelector('img');
      if (!img) return;
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const px = (e.clientX - r.left)  / r.width  - 0.5;
        const py = (e.clientY - r.top)   / r.height - 0.5;
        gsap.to(img, { x: px * 14, y: py * 10, scale: 1.05, duration: 0.6, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(img, { x: 0, y: 0, scale: 1.18, duration: 0.7, ease: 'power2.out' });
      });
    });

    // Link arrow hover
    $$('.link-arrow').forEach(a => {
      const arrow = a.querySelector('span');
      if (!arrow) return;
      a.addEventListener('mouseenter', () => gsap.to(arrow, { x: 6, duration: 0.35, ease: 'power2.out' }));
      a.addEventListener('mouseleave', () => gsap.to(arrow, { x: 0, duration: 0.35, ease: 'power2.out' }));
    });

    // Nav link underline hover
    $$('.nav-link').forEach(a => {
      a.addEventListener('mouseenter', () => gsap.to(a, { letterSpacing: '0.12em', duration: 0.3, ease: 'power2.out' }));
      a.addEventListener('mouseleave', () => gsap.to(a, { letterSpacing: '0.12em', duration: 0.3, ease: 'power2.out' }));
    });
  }

  /* ══════════════════════════════════════════════
     TESTIMONIALS (GSAP crossfade)
  ══════════════════════════════════════════════ */
  function initTestimonials() {
    const items = $$('.testimonial');
    const dots  = $$('.t-nav-btn');
    if (!items.length) return;

    function goTo(idx) {
      if (idx === tIdx) return;
      const out = items[tIdx];
      const inn = items[idx];

      gsap.to(out, { opacity: 0, x: -28, duration: 0.38, ease: 'power2.in',
        onComplete: () => {
          out.classList.remove('active');
          inn.classList.add('active');
          gsap.fromTo(inn, { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });
        }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      tIdx = idx;
    }

    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    setInterval(() => goTo((tIdx + 1) % items.length), 6500);
  }

  /* ══════════════════════════════════════════════
     GUEST PICKER
  ══════════════════════════════════════════════ */
  function initGuestPicker() {
    const minus = $('#gMinus'), plus = $('#gPlus'), count = $('#gCount');
    if (!minus) return;
    minus.addEventListener('click', () => {
      if (guestCount > 1) { guestCount--; count.textContent = guestCount; gsap.from(count, { scale: 0.82, duration: 0.28, ease: 'back.out(2)' }); }
    });
    plus.addEventListener('click', () => {
      if (guestCount < 20) { guestCount++; count.textContent = guestCount; gsap.from(count, { scale: 1.22, duration: 0.28, ease: 'back.out(2)' }); }
    });
  }

  /* ══════════════════════════════════════════════
     FORMS
  ══════════════════════════════════════════════ */
  function initForms() {
    const d = $('#f-date');
    if (d) d.min = new Date().toISOString().split('T')[0];

    const rf = $('#reserveForm');
    if (rf) {
      rf.addEventListener('submit', e => {
        e.preventDefault();
        const btn = $('#btn-submit-res'); const orig = btn.textContent;
        gsap.to(btn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });
        btn.textContent = 'Confirmed ✓'; btn.style.cssText += 'background:#2d6a3f;border-color:#2d6a3f'; btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.style.background = btn.style.borderColor = ''; btn.disabled = false; rf.reset(); guestCount = 2; const gc = $('#gCount'); if(gc) gc.textContent = '2'; }, 4500);
      });
    }

    const nf = $('#newsletterForm');
    if (nf) {
      nf.addEventListener('submit', e => {
        e.preventDefault();
        const btn = $('#btn-nl-sub');
        gsap.to(btn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });
        btn.textContent = 'Subscribed ✓'; btn.style.background = '#2d6a3f'; btn.disabled = true;
        setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.background = ''; btn.disabled = false; nf.reset(); }, 3500);
      });
    }
  }

  /* ══════════════════════════════════════════════
     SMOOTH ANCHOR SCROLL
  ══════════════════════════════════════════════ */
  function initAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis?.scrollTo(target, { offset: -80, duration: 1.4 });
      });
    });
  }

  /* ══════════════════════════════════════════════
     RESIZE
  ══════════════════════════════════════════════ */
  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => { resizeCanvas(); ScrollTrigger.refresh(); }, 180);
  }, { passive: true });

  /* (initHeroRevealObserver removed — section deleted) */

  /* ══════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════ */
  function boot() {
    resizeCanvas();

    preloadImages(
      pct => { if (loaderFill) loaderFill.style.width = (pct * 100) + '%'; },
      () => {
        drawFrame(0);
        setTimeout(() => {
          loader?.classList.add('gone');

          initLenis();
          initCanvasSequence();
          initSectionAnimations();
          initPageEnter();
          initCustomCursor();
          initTestimonials();

          // Background prefetch all compressed frames into disk cache for instant scrub
          setTimeout(() => {
            let f = 1;
            const worker = () => {
              if (f > CFG.TOTAL_FRAMES) return;
              fetch(`${CFG.SEQUENCE_PATH}${f}.jpg`, { cache: 'force-cache', priority: 'low' })
                .then(() => { f++; setTimeout(worker, 10); })
                .catch(() => { f++; setTimeout(worker, 10); });
            };
            for(let i=0; i<4; i++) { setTimeout(worker, i*100); }
          }, 1500);
          initGuestPicker();
          initForms();
          initAnchors();
          initHoverEffects();
        }, 650);
      }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();

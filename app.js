/* ==========================================================================
   ROYAL GATEWAY — INTERACTION, 3D DOOR ZOOM & SCRATCH CARD ENGINE
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. 3D GATEWAY DOOR SWING + CAMERA ZOOM-THROUGH + GOLDEN MIST
     ------------------------------------------------------------------------ */
  const gatewayOverlay = document.getElementById('gateway-overlay');
  const enterGateBtn = document.getElementById('enter-gate-btn');
  const goldenMist = document.getElementById('golden-mist');
  const audioToggle = document.getElementById('audio-toggle');
  const invitationVideo = document.getElementById('invitation-video');
  const coupleVideo = document.getElementById('couple-video');

  let audioEnabled = false;

  function syncAudioUI(playing) {
    audioEnabled = playing;
    if (!audioToggle) return;
    audioToggle.classList.toggle('is-playing', playing);
    audioToggle.setAttribute('aria-pressed', String(playing));
  }

  function startMusic() {
    if (!invitationVideo) return;
    invitationVideo.muted = false;
    invitationVideo
      .play()
      .then(() => {
        syncAudioUI(true);
        invitationVideo.closest('.reel-arch')?.classList.add('is-playing');
      })
      .catch(() => syncAudioUI(false));
  }

  if (enterGateBtn && gatewayOverlay) {
    enterGateBtn.addEventListener('click', () => {
      gatewayOverlay.classList.add('is-opening');
      document.body.classList.remove('is-locked');
      startMusic();

      setTimeout(() => {
        if (goldenMist) goldenMist.classList.add('is-active');
      }, 650);

      setTimeout(() => {
        gatewayOverlay.classList.add('is-dismissed');
        if (goldenMist) goldenMist.classList.remove('is-active');
      }, 1450);
    });
  } else {
    document.body.classList.remove('is-locked');
  }

  if (audioToggle && invitationVideo) {
    audioToggle.addEventListener('click', () => {
      if (audioEnabled) {
        invitationVideo.muted = true;
        if (coupleVideo) coupleVideo.muted = true;
        syncAudioUI(false);
        showToast('Music muted');
      } else {
        invitationVideo.muted = false;
        invitationVideo.play().catch(() => {});
        syncAudioUI(true);
        invitationVideo.closest('.reel-arch')?.classList.add('is-playing');
        showToast('Playing wedding music');
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. AMBIENT FLOATING ROSE PETALS OVER PARCHMENT
     ------------------------------------------------------------------------ */
  const petalCanvas = document.getElementById('petal-canvas');
  const pCtx = petalCanvas ? petalCanvas.getContext('2d') : null;
  let w = 0;
  let h = 0;
  let petals = [];

  function resizePetals() {
    if (!petalCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    petalCanvas.width = Math.floor(w * dpr);
    petalCanvas.height = Math.floor(h * dpr);
    pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makePetal(top = false) {
    return {
      x: Math.random() * w,
      y: top ? -20 : Math.random() * h,
      vy: 0.45 + Math.random() * 0.85,
      vx: (Math.random() - 0.5) * 0.45,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.025,
      size: 5 + Math.random() * 6,
      alpha: 0.28 + Math.random() * 0.35,
      sway: Math.random() * 100,
    };
  }

  function animatePetals() {
    if (!pCtx || prefersReducedMotion) return;
    pCtx.clearRect(0, 0, w, h);

    for (const p of petals) {
      p.sway += 0.02;
      p.x += p.vx + Math.sin(p.sway) * 0.32;
      p.y += p.vy;
      p.rot += p.vrot;

      if (p.y > h + 24) Object.assign(p, makePetal(true));

      pCtx.save();
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot);
      pCtx.fillStyle = `rgba(176, 36, 48, ${p.alpha})`;
      pCtx.beginPath();
      pCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
    }

    requestAnimationFrame(animatePetals);
  }

  if (petalCanvas && !prefersReducedMotion) {
    resizePetals();
    petals = Array.from({ length: w < 720 ? 18 : 30 }, () => makePetal(false));
    window.addEventListener('resize', resizePetals);
    requestAnimationFrame(animatePetals);
  }

  /* ------------------------------------------------------------------------
     3. SCROLL PROGRESS, PALACE PARALLAX & MANDALA ROTATION
     ------------------------------------------------------------------------ */
  const progressBar = document.getElementById('scroll-progress-bar');
  const palaceParallax = document.getElementById('palace-parallax');
  const navLinks = document.querySelectorAll('.topbar-nav a');

  function onScroll() {
    const sy = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.min(100, (sy / maxScroll) * 100) : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;

    document.documentElement.style.setProperty('--mandala-rot', `${(sy * 0.08).toFixed(1)}deg`);

    if (palaceParallax && !prefersReducedMotion && sy < window.innerHeight * 1.2) {
      palaceParallax.style.transform = `translate3d(0, ${(sy * 0.16).toFixed(1)}px, 0)`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal-3d').forEach((el) => revealObserver.observe(el));

  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('[data-scene]').forEach((s) => sceneObserver.observe(s));

  /* ------------------------------------------------------------------------
     4. LIVE JHAROKHA COUNTDOWN (03 DEC 2026 • 12:05 PM IST)
     ------------------------------------------------------------------------ */
  const targetTime = new Date('2026-12-03T12:05:00+05:30').getTime();
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  function tickCountdown() {
    const diff = Math.max(0, targetTime - Date.now());
    const d = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff / 3600000) % 24);
    const mins = Math.floor((diff / 60000) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (cdDays) cdDays.textContent = String(d).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hrs).padStart(2, '0');
    if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
    if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ------------------------------------------------------------------------
     5. INTERACTIVE HTML5 CANVAS SCRATCH-OFF "SAVE THE DATE" FOIL
     ------------------------------------------------------------------------ */
  const scratchCanvas = document.getElementById('scratch-canvas');
  const scratchRevealBtn = document.getElementById('scratch-reveal-btn');
  const scratchResetBtn = document.getElementById('scratch-reset-btn');
  const sCtx = scratchCanvas ? scratchCanvas.getContext('2d') : null;
  let isScratching = false;

  function drawScratchFoil() {
    if (!scratchCanvas || !sCtx) return;
    scratchCanvas.style.opacity = '1';
    scratchCanvas.style.pointerEvents = 'auto';

    sCtx.globalCompositeOperation = 'source-over';
    const grad = sCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    grad.addColorStop(0, '#c84b1e');
    grad.addColorStop(0.5, '#e2882b');
    grad.addColorStop(1, '#d96b27');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    // Subtle shimmer pattern
    sCtx.fillStyle = 'rgba(255, 245, 214, 0.22)';
    for (let x = 20; x < scratchCanvas.width; x += 28) {
      for (let y = 20; y < scratchCanvas.height; y += 28) {
        sCtx.beginPath();
        sCtx.arc(x, y, 2, 0, Math.PI * 2);
        sCtx.fill();
      }
    }

    sCtx.fillStyle = '#fff9ec';
    sCtx.font = '700 16px "Cinzel", Georgia, serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('SCRATCH HERE', scratchCanvas.width / 2, scratchCanvas.height / 2 - 4);
    sCtx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText('Drag across to reveal the date', scratchCanvas.width / 2, scratchCanvas.height / 2 + 20);
  }

  function scratchAt(clientX, clientY) {
    if (!scratchCanvas || !sCtx) return;
    const rect = scratchCanvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * scratchCanvas.width;
    const y = ((clientY - rect.top) / rect.height) * scratchCanvas.height;

    sCtx.globalCompositeOperation = 'destination-out';
    sCtx.beginPath();
    sCtx.arc(x, y, 24, 0, Math.PI * 2);
    sCtx.fill();
  }

  if (scratchCanvas) {
    drawScratchFoil();

    scratchCanvas.addEventListener('pointerdown', (e) => {
      isScratching = true;
      scratchAt(e.clientX, e.clientY);
    });
    window.addEventListener('pointermove', (e) => {
      if (isScratching) scratchAt(e.clientX, e.clientY);
    });
    window.addEventListener('pointerup', () => {
      isScratching = false;
    });
  }

  if (scratchRevealBtn && scratchCanvas) {
    scratchRevealBtn.addEventListener('click', () => {
      scratchCanvas.style.transition = 'opacity 0.55s ease';
      scratchCanvas.style.opacity = '0';
      scratchCanvas.style.pointerEvents = 'none';
    });
  }

  if (scratchResetBtn && scratchCanvas) {
    scratchResetBtn.addEventListener('click', () => {
      scratchCanvas.style.transition = 'none';
      drawScratchFoil();
    });
  }

  /* ------------------------------------------------------------------------
     6. 3D TILT CARDS, GALLERY LIGHTBOX & VIDEO REELS
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    if (prefersReducedMotion) return;
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * 10;
      const ry = (x - 0.5) * 10;
      card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(10px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = el.dataset.lightbox;
      if (lightboxCaption) lightboxCaption.textContent = el.dataset.caption || '';
      lightbox.hidden = false;
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', () => (lightbox.hidden = true));
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.hidden = true;
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox) lightbox.hidden = true;
  });

  document.querySelectorAll('.reel-play-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const video = document.getElementById(btn.dataset.videoTarget);
      const arch = btn.closest('.reel-arch');
      if (!video || !arch) return;

      if (video.paused) {
        document.querySelectorAll('.reel-arch video').forEach((v) => {
          if (v !== video && !v.paused) {
            v.pause();
            v.closest('.reel-arch')?.classList.remove('is-playing');
          }
        });
        video.muted = false;
        video.play().catch(() => {});
        arch.classList.add('is-playing');
        btn.innerHTML = '&#10074;&#10074;';
      } else {
        video.pause();
        arch.classList.remove('is-playing');
        btn.innerHTML = '&#9654;';
      }
    });
  });

  /* ------------------------------------------------------------------------
     7. CALENDAR (.ICS), COPY ADDRESS, WHATSAPP SHARE & RSVP
     ------------------------------------------------------------------------ */
  const calendarEvents = {
    haldi: {
      uid: 'haldi-sanjana-shubham-2026@jalna',
      start: '20261202T170000',
      end: '20261202T210000',
      summary: 'Haldi Ceremony - Sanjana & Shubham',
      location: 'Sushiladevi Lawns, Opp. Government Medical College, Bypass Road, Jalna',
      description: 'Haldi Ceremony of Sanjana & Shubham on Wednesday, 2 December 2026 at 5:00 PM.',
    },
    vivah: {
      uid: 'wedding-sanjana-shubham-2026@jalna',
      start: '20261203T120500',
      end: '20261203T153000',
      summary: 'Royal Wedding - Sanjana & Shubham',
      location: 'Sushiladevi Lawns, Opp. Government Medical College, Bypass Road, Jalna',
      description: 'Wedding Ceremony of Sanjana & Shubham on Thursday, 3 December 2026 at 12:05 PM.',
    },
  };

  document.querySelectorAll('.btn-ics').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ev = calendarEvents[btn.dataset.event];
      if (!ev) return;

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SanjanaShubham//RoyalWedding//EN',
        'BEGIN:VEVENT',
        `UID:${ev.uid}`,
        'DTSTAMP:20261125T000000Z',
        `DTSTART;TZID=Asia/Kolkata:${ev.start}`,
        `DTEND;TZID=Asia/Kolkata:${ev.end}`,
        `SUMMARY:${ev.summary}`,
        `LOCATION:${ev.location}`,
        `DESCRIPTION:${ev.description}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${btn.dataset.event}-sanjana-shubham.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Calendar invite downloaded!');
    });
  });

  const copyAddressBtn = document.getElementById('copy-address-btn');
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', async () => {
      const addr = 'Sushiladevi Lawns, Opposite Government Medical College, Bypass Road, Jalna, Maharashtra';
      try {
        await navigator.clipboard.writeText(addr);
        showToast('Venue address copied!');
      } catch {
        showToast(addr);
      }
    });
  }

  const whatsappBtn = document.getElementById('whatsapp-share-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const msg =
        'You are cordially invited to the Royal Wedding of Sanjana & Shubham!\n' +
        'Date: Thursday, 3 December 2026 at 12:05 PM\n' +
        'Venue: Sushiladevi Lawns, Opp. Government Medical College, Bypass Road, Jalna\n' +
        window.location.href;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    });
  }

  const STORAGE_KEY = 'royal_gateway_wishes_en_v1';
  const defaultWishes = [
    {
      name: 'Chavan & Maheshwar Families',
      ceremony: 'Hosts',
      wish: 'We look forward to welcoming you with warmth and joy in Jalna for the union of Sanjana & Shubham.',
    },
    {
      name: 'Rajendra & Sneha Patil',
      ceremony: 'Both Haldi & Wedding (2 Guests)',
      wish: 'Wishing Sanjana & Shubham a lifetime filled with love, laughter, and royal happiness!',
    },
  ];

  const wishesWall = document.getElementById('wishes-wall');
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpStatus = document.getElementById('rsvp-status');

  function loadWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultWishes;
    } catch {
      return defaultWishes;
    }
  }

  function renderWishes() {
    if (!wishesWall) return;
    const items = loadWishes();
    wishesWall.innerHTML = '';
    items.slice(0, 6).forEach((item) => {
      const card = document.createElement('article');
      card.className = 'wish-card';

      const author = document.createElement('h4');
      author.className = 'wish-author';
      author.textContent = item.name;

      const meta = document.createElement('p');
      meta.className = 'wish-meta';
      meta.textContent = item.ceremony;

      const body = document.createElement('p');
      body.className = 'wish-body';
      body.textContent = item.wish;

      card.append(author, meta, body);
      wishesWall.appendChild(card);
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('guest-name').value.trim();
      const guests = document.getElementById('guest-count').value;
      const ceremony = document.getElementById('guest-ceremony').value;
      const wish = document.getElementById('guest-wish').value.trim();

      if (!name) {
        if (rsvpStatus) {
          rsvpStatus.style.color = '#8b1e1e';
          rsvpStatus.textContent = 'Please enter your full name to confirm.';
        }
        return;
      }

      const wishes = loadWishes();
      wishes.unshift({
        name,
        ceremony: `${ceremony} (${guests})`,
        wish: wish || 'Sending heartfelt congratulations and blessings to Sanjana & Shubham!',
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes.slice(0, 18)));
      } catch {
        // Ignore storage errors
      }

      renderWishes();
      rsvpForm.reset();
      if (rsvpStatus) {
        rsvpStatus.style.color = '#047857';
        rsvpStatus.textContent = 'Thank you! Your attendance and blessings have been recorded.';
      }
      showToast('Attendance confirmed!');
    });
  }

  renderWishes();

  /* ------------------------------------------------------------------------
     8. TOAST HELPER
     ------------------------------------------------------------------------ */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2500);
  }
})();

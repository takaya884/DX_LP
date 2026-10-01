/* ============================================================
   プロトメイク — interactions
   すべて progressive enhancement（要素が無いページでは何もしない）
   ============================================================ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// 計測フック（GA4 / GTM を後から入れたらそのまま拾える）
const track = (event, params = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.gtag === 'function') window.gtag('event', event, params);
};

// ---------- Hero intro ----------
const markLoaded = () => document.documentElement.classList.add('is-loaded');
if (document.fonts && document.fonts.ready) {
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(markLoaded);
} else {
  markLoaded();
}

// ---------- Header / progress / sticky CTA ----------
const header = $('#header');
const hero = $('#hero');
const floatCta = $('#floatCta');
const contact = $('#contact');
const progressBar = $('#progressBar');
let lastY = window.scrollY;
let contactVisible = false;

const onScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  if (header) {
    header.classList.toggle('is-scrolled', y > 10);
    // 下スクロールで隠し、上スクロールで出す（読む邪魔をしない）
    const navOpen = $('#nav')?.classList.contains('is-open');
    header.classList.toggle('is-hidden', !navOpen && y > 600 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('is-hidden');
  }
  if (floatCta) {
    const pastHero = hero ? y > hero.offsetHeight * 0.7 : y > 600;
    floatCta.classList.toggle('is-visible', pastHero && !contactVisible);
  }
  lastY = y;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (contact && 'IntersectionObserver' in window) {
  new IntersectionObserver(([en]) => { contactVisible = en.isIntersecting; onScroll(); }, { threshold: 0.05 }).observe(contact);
}

// current section highlight in nav
(() => {
  const links = $$('.nav a[href^="#"]:not(.nav__cta)');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-current'));
      map.get(e.target.id)?.classList.add('is-current');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

// ---------- Mobile nav ----------
(() => {
  const navToggle = $('#navToggle');
  const nav = $('#nav');
  if (!navToggle || !nav) return;
  const set = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.classList.toggle('is-on', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => set(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => set(false)));
})();

// ---------- Scroll reveal (staggered) ----------
(() => {
  const groups = [
    '.block__head', '.prob li', '.prob__bridge', '.reason__cell', '.cmp', '.flow__list li',
    '.svc__row', '.work', '.case__card', '.voice blockquote', '.faq details', '.picker__copy', '.chip', '.picker__go',
  ];
  const targets = [];
  groups.forEach((sel) => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      // siblings in a grid fade in one after another
      if (!sel.startsWith('.block__head')) el.style.setProperty('--d', `${Math.min(i % 6, 5) * 0.08}s`);
      targets.push(el);
    });
  });
  if (!('IntersectionObserver' in window) || reduceMotion) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((el) => io.observe(el));
})();

// ---------- Count-up numbers ----------
(() => {
  const nums = $$('[data-count]');
  if (!nums.length || reduceMotion || !('IntersectionObserver' in window)) return;
  const fmt = (n) => n.toLocaleString('ja-JP');
  const run = (el) => {
    const to = parseInt(el.dataset.count, 10);
    const dur = 1400;
    let t0;
    const step = (ts) => {
      t0 ??= ts;
      const k = Math.min(1, (ts - t0) / dur);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 4))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach((el) => io.observe(el));
})();

// ---------- Flow: scroll-driven ¥0 meter ----------
(() => {
  const track = $('#flowTrack');
  const fill = $('#flowFill');
  const meter = $('#meter');
  const dayEl = $('#meterDay');
  if (!track || !fill) return;
  const steps = $$('.flow__list li', track);
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = track.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when top of track hits 75% viewport, 1 when bottom hits 55%
    const start = vh * 0.75;
    const end = vh * 0.55;
    const p = Math.max(0, Math.min(1, (start - r.top) / (r.height + start - end)));
    const val = reduceMotion ? 1 : p;
    fill.style.setProperty('--fp', val.toFixed(3));
    let active = -1;
    steps.forEach((li, i) => {
      const on = val >= i / (steps.length - 1) - 0.02;
      li.classList.toggle('is-active', on);
      if (on) active = i;
    });
    if (dayEl && active >= 0) dayEl.textContent = steps[active].dataset.day;
    if (meter) meter.classList.toggle('is-final', active === steps.length - 1);
  };
  const onS = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onS, { passive: true });
  window.addEventListener('resize', onS);
  update();
})();

// ---------- Magnetic buttons + hero mock tilt (desktop only) ----------
(() => {
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  const drev = $('#drev');
  const heroEl = $('#hero');
  if (drev && heroEl && window.innerWidth > 960) {
    heroEl.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      drev.style.setProperty('--ry', `${-6 + nx * 8}deg`);
      drev.style.setProperty('--rx', `${3 - ny * 6}deg`);
    });
  }
})();

// ---------- Picker chips → form prefill ----------
(() => {
  const picker = $('#picker');
  const form = $('#contactForm');
  if (!picker || !form) return;
  const syncToForm = () => {
    const chosen = $$('.chip.is-on', picker).map((c) => c.dataset.topic);
    $$('input[name="topic"]', form).forEach((cb) => { cb.checked = chosen.includes(cb.value); });
    const msg = form.elements.message;
    if (msg && (!msg.value.trim() || msg.dataset.auto === '1')) {
      msg.value = chosen.length ? `「${chosen.join('」「')}」について相談したいです。\n` : '';
      msg.dataset.auto = chosen.length ? '1' : '';
    }
  };
  $$('.chip', picker).forEach((chip) => {
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => {
      const on = chip.classList.toggle('is-on');
      chip.setAttribute('aria-pressed', String(on));
      syncToForm();
    });
  });
  form.elements.message?.addEventListener('input', (e) => { e.target.dataset.auto = ''; });
  $('.picker__go', picker)?.addEventListener('click', () => {
    track('picker_submit', { topics: $$('.chip.is-on', picker).map((c) => c.dataset.topic).join(',') });
    setTimeout(() => form.elements.name?.focus({ preventScroll: true }), 700);
  });
})();

// ---------- CTA click tracking ----------
$$('[data-cta]').forEach((a) => a.addEventListener('click', () => track('cta_click', { position: a.dataset.cta })));

// ---------- Contact form → /api/contact (Slack 通知) ----------
(function contactForm() {
  const form = $('#contactForm');
  if (!form) return;
  const statusEl = $('#formStatus');
  const doneEl = $('#formDone');
  const ENDPOINT = '/api/contact';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 流入元（UTM / 参照元）を記録して、どの集客施策が問い合わせにつながったか分かるようにする
  (() => {
    const KEY = 'pm_source';
    let src = null;
    try { src = sessionStorage.getItem(KEY); } catch {}
    if (!src) {
      const q = new URLSearchParams(location.search);
      const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => q.get(k)).filter(Boolean).join(' / ');
      let ref = '';
      try { ref = document.referrer && new URL(document.referrer).host !== location.host ? new URL(document.referrer).host : ''; } catch {}
      src = utm || ref || '直接アクセス';
      try { sessionStorage.setItem(KEY, src); } catch {}
    }
    const hidden = $('#formSource');
    if (hidden) hidden.value = src;
  })();

  const setStatus = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.classList.remove('is-ok', 'is-err');
    if (type) statusEl.classList.add(type);
  };

  const validate = (el) => {
    const v = el.value.trim();
    return v !== '' && !(el.type === 'email' && !emailRe.test(v));
  };

  let started = false;
  form.addEventListener('input', (e) => {
    if (!started) { started = true; track('form_start'); }
    const field = e.target.closest('.field');
    if (field) {
      field.classList.remove('is-invalid');
      if (e.target.required) field.classList.toggle('is-valid', validate(e.target));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let firstInvalid = null;
    $$('[required]', form).forEach((el) => {
      const ok = validate(el);
      el.closest('.field')?.classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      setStatus('未入力、または形式に誤りのある項目があります。', 'is-err');
      firstInvalid.focus();
      return;
    }

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.topic = fd.getAll('topic').join('、');
    form.classList.add('is-sending');
    setStatus('送信中…', null);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('status ' + res.status);
      track('generate_lead', { topics: data.topic, source: data.source });
      form.reset();
      if (doneEl) {
        form.hidden = true;
        doneEl.hidden = false;
        doneEl.focus({ preventScroll: true });
        doneEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      } else {
        setStatus('送信しました。お問い合わせありがとうございます。担当より折り返しご連絡します。', 'is-ok');
      }
    } catch (err) {
      setStatus('送信に失敗しました。お手数ですが時間をおいて再度お試しください。', 'is-err');
    } finally {
      form.classList.remove('is-sending');
    }
  });
})();

// ============================================================
//  Hero background — lightweight 2D "blueprint network"
//  （three.js を廃止：約600KB削減で表示速度を改善）
// ============================================================
(function heroScene() {
  const canvas = $('#bgCanvas');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0, h = 0, dpr = 1, nodes = [], raf = null, visible = true;
  const mouse = { x: -9999, y: -9999 };
  const LINK = 130;

  const init = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.8,
    }));
  };

  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      // cursor gently pulls nodes — the draft "responds" to you
      const dx = mouse.x - n.x, dy = mouse.y - n.y, d2 = dx * dx + dy * dy;
      if (d2 < 180 * 180) { n.x += dx * 0.004; n.y += dy * 0.004; }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(17,179,166,${(1 - d / LINK) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(mouse.x - a.x, mouse.y - a.y);
      if (md < 180) {
        ctx.strokeStyle = `rgba(10,143,132,${(1 - md / 180) * 0.45})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(10,143,132,0.75)';
      ctx.fillRect(a.x - a.r, a.y - a.r, a.r * 2, a.r * 2); // square nodes = draft marks
    }
    raf = visible ? requestAnimationFrame(frame) : null;
  };

  init();
  frame();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(init, 150); });
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) frame();
    }).observe(canvas);
  }
})();

// ---------- Hero reveal slider (DRAFT → SHIP) ----------
(() => {
  const drev = $('#drev');
  if (!drev) return;
  const range = $('#drevRange');
  const divider = $('#drevDivider');
  let touched = false;
  const setPos = (p) => {
    p = Math.max(2, Math.min(98, p));
    drev.style.setProperty('--pos', p + '%');
    range.value = p;
  };
  const touch = () => {
    if (touched) return;
    touched = true;
    drev.classList.add('is-touched');
    track('hero_slider_interact');
  };
  range.addEventListener('input', () => { touch(); setPos(parseFloat(range.value)); });

  const fromClient = (x) => {
    const r = drev.getBoundingClientRect();
    setPos(((x - r.left) / r.width) * 100);
  };
  let dragging = false;
  const start = (e) => { dragging = true; touch(); if (e) fromClient(e.clientX); };
  const move = (e) => { if (dragging) fromClient(e.clientX); };
  const end = () => { dragging = false; };
  divider.addEventListener('pointerdown', start);
  drev.addEventListener('pointerdown', (e) => {
    if (e.target === range || divider.contains(e.target)) start(e);
  });
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', end);

  if (reduceMotion) { setPos(60); return; }

  // intro sweep (draft → ship), then gentle idle "breathing" until the user touches it
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const from = 96, to = 42, dur = 1600;
  let t0 = null;
  setPos(from);
  const intro = (ts) => {
    t0 ??= ts;
    const k = Math.min(1, (ts - t0) / dur);
    if (!touched) setPos(from + (to - from) * ease(k));
    if (k < 1) requestAnimationFrame(intro);
    else if (!touched) idle();
  };
  const idle = () => {
    let t1 = null;
    const loop = (ts) => {
      if (touched) return;
      t1 ??= ts;
      const s = (ts - t1) / 1000;
      setPos(42 + Math.sin(s * 0.9) * 20);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };
  setTimeout(() => requestAnimationFrame(intro), 700);
})();

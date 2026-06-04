/* ============================================================
   AIDX Partner — interactions + three.js hero background
   ============================================================ */

// ---------- Header / scroll state ----------
const header = document.getElementById('header');
const hero = document.getElementById('hero');
const floatCta = document.querySelector('.float-cta');

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 10);
  // header sits on the dark hero until we scroll past it
  const heroBottom = hero ? hero.offsetHeight - 90 : 0;
  header.classList.toggle('is-light', y < heroBottom);
  if (floatCta) floatCta.classList.toggle('is-visible', y > 700);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  navToggle.classList.toggle('is-on', open);
});
nav.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-on');
  })
);

// ---------- Scroll reveal ----------
const targets = document.querySelectorAll(
  '.block__head, .prob li, .svc__row, .reason__cell, .flow__list li, .work, .case__card, .voice blockquote, .faq details, .prob__bridge'
);
targets.forEach((el) => el.classList.add('reveal'));
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach((el) => el.classList.add('is-in'));
}

// ---------- Contact form → /api/contact (Slack 通知) ----------
(function contactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const statusEl = document.getElementById('formStatus');
  const ENDPOINT = '/api/contact';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setStatus = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.classList.remove('is-ok', 'is-err');
    if (type) statusEl.classList.add(type);
  };

  // clear invalid highlight as the user fixes a field
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('is-invalid');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach((el) => {
      const filled = el.value.trim() !== '';
      const ok = filled && !(el.type === 'email' && !emailRe.test(el.value.trim()));
      const field = el.closest('.field');
      if (field) field.classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      setStatus('未入力、または形式に誤りのある項目があります。', 'is-err');
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    form.classList.add('is-sending');
    setStatus('送信中…', null);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('status ' + res.status);
      form.reset();
      setStatus('送信しました。お問い合わせありがとうございます。担当より折り返しご連絡します。', 'is-ok');
    } catch (err) {
      setStatus('送信に失敗しました。お手数ですが時間をおいて再度お試しください。', 'is-err');
    } finally {
      form.classList.remove('is-sending');
    }
  });
})();

// ============================================================
//  three.js — floating data network (hero background)
//  progressive enhancement: skips if THREE missing / reduced-motion
// ============================================================
(function heroScene() {
  const canvas = document.getElementById('bgCanvas');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || typeof THREE === 'undefined' || reduce) return;

  const COUNT = window.innerWidth < 700 ? 70 : 130;
  const LINK_DIST = 2.6;     // distance under which two nodes connect
  const SPREAD = 14;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 13;

  const group = new THREE.Group();
  scene.add(group);

  // node positions + velocities
  const positions = new Float32Array(COUNT * 3);
  const velocities = [];
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.6;
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      )
    );
  }

  // points
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x0a9488, size: 0.13, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(pGeo, pMat);
  group.add(points);

  // lines (allocate a generous buffer, fill dynamically)
  const MAX_LINES = COUNT * 8;
  const linePos = new Float32Array(MAX_LINES * 6);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lMat = new THREE.LineBasicMaterial({ color: 0x11b3a6, transparent: true, opacity: 0.22 });
  const lines = new THREE.LineSegments(lGeo, lMat);
  group.add(lines);

  // mouse parallax
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5);
    mouse.ty = (e.clientY / window.innerHeight - 0.5);
  });

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let raf;
  function tick() {
    // drift nodes, bounce within bounds
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      positions[ix] += velocities[i].x;
      positions[ix + 1] += velocities[i].y;
      positions[ix + 2] += velocities[i].z;
      if (Math.abs(positions[ix]) > SPREAD / 2) velocities[i].x *= -1;
      if (Math.abs(positions[ix + 1]) > SPREAD * 0.35) velocities[i].y *= -1;
      if (Math.abs(positions[ix + 2]) > SPREAD * 0.3) velocities[i].z *= -1;
    }
    pGeo.attributes.position.needsUpdate = true;

    // rebuild connections
    let n = 0;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < LINK_DIST && n < MAX_LINES) {
          linePos[n * 6] = positions[i * 3];
          linePos[n * 6 + 1] = positions[i * 3 + 1];
          linePos[n * 6 + 2] = positions[i * 3 + 2];
          linePos[n * 6 + 3] = positions[j * 3];
          linePos[n * 6 + 4] = positions[j * 3 + 1];
          linePos[n * 6 + 5] = positions[j * 3 + 2];
          n++;
        }
      }
    }
    lGeo.setDrawRange(0, n * 2);
    lGeo.attributes.position.needsUpdate = true;

    // gentle auto-rotate + mouse parallax
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    group.rotation.y += 0.0012;
    group.rotation.x = mouse.y * 0.3;
    group.rotation.z = mouse.x * 0.12;
    camera.position.x = mouse.x * 2;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  // pause when hero off-screen (save battery)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { if (!raf) tick(); }
        else { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 }).observe(canvas);
  }
})();

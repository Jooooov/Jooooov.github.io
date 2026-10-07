/* João — hero dois hemisférios + interacções */
(function () {
  'use strict';

  /* ---------- i18n (data-i18n = texto; data-i18n-html = html controlado do dicionário) ---------- */
  function applyLang(lang) {
    var d = I18N[lang] || I18N.pt;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (d[k]) el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (d[k]) el.innerHTML = d[k];
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang); });
    try { localStorage.setItem('joao-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
  });
  var saved = null;
  try { saved = localStorage.getItem('joao-lang'); } catch (e) {}
  var urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang && I18N[urlLang]) applyLang(urlLang);
  else if (saved && I18N[saved]) applyLang(saved);
  else {
    /* primeira visita: segue a língua do browser — PT/ES se for o caso, senão EN */
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || '').slice(0, 2).toLowerCase();
    applyLang(I18N[nav] ? nav : 'en');
  }

  /* ---------- email montado em JS ---------- */
  var ADDR = ['jooooov', 'gmail.com'].join('@');
  var mailbtn = document.getElementById('mailbtn');
  if (mailbtn) mailbtn.addEventListener('click', function (ev) {
    ev.preventDefault();
    location.href = 'mailto:' + ADDR;
  });

  /* ---------- ano ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- reveal ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- hero ---------- */
  var hero = document.getElementById('hero');
  var mx = 0.5, my = 0.5;
  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = (e.clientY - r.top) / r.height;
  });
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* rede neural colorida */
  var net = document.getElementById('net'), nctx = net.getContext('2d');
  var COLS = ['#b388ff', '#4dd8c0', '#ee6c4d', '#e9c46a', '#64dfdf'];
  var P = [];
  function sizeNet() {
    var r = net.parentElement.getBoundingClientRect();
    net.width = Math.max(2, r.width * 2); net.height = Math.max(2, r.height * 2);
  }
  sizeNet(); window.addEventListener('resize', sizeNet);
  for (var i = 0; i < 46; i++) {
    P.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .0012, vy: (Math.random() - .5) * .0012, c: COLS[i % COLS.length], r: 2 + Math.random() * 3.5 });
  }
  function drawNet() {
    var w = net.width, h = net.height;
    nctx.clearRect(0, 0, w, h);
    var ax = (mx - .5) * .0008, ay = (my - .5) * .0008;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      p.x += p.vx + ax; p.y += p.vy + ay;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
      p.x = Math.max(0, Math.min(1, p.x)); p.y = Math.max(0, Math.min(1, p.y));
    }
    nctx.globalAlpha = .35; nctx.lineWidth = 1.6;
    for (i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
      var a = P[i], b = P[j];
      var dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < w * .14) {
        nctx.strokeStyle = a.c;
        nctx.beginPath(); nctx.moveTo(a.x * w, a.y * h); nctx.lineTo(b.x * w, b.y * h); nctx.stroke();
      }
    }
    nctx.globalAlpha = 1;
    for (i = 0; i < P.length; i++) {
      var q = P[i];
      nctx.fillStyle = q.c;
      nctx.beginPath(); nctx.arc(q.x * w, q.y * h, q.r * 2, 0, 7); nctx.fill();
    }
  }

  /* costura líquida */
  var seam = document.getElementById('seam'), sctx = seam.getContext('2d');
  function sizeSeam() {
    var r = hero.getBoundingClientRect();
    seam.width = Math.max(2, r.width * 2); seam.height = Math.max(2, (r.height - 56) * 2);
  }
  sizeSeam(); window.addEventListener('resize', sizeSeam);
  var t0 = performance.now();
  function drawSeam(now) {
    var w = seam.width, h = seam.height, t = (now - t0) / 1000;
    sctx.clearRect(0, 0, w, h);
    var cx = w * (.5 + (mx - .5) * .06);
    sctx.beginPath();
    for (var y = 0; y <= h; y += 6) {
      var x = cx + Math.sin(y * .008 + t * 1.6) * 22 + Math.sin(y * .02 - t * 1.1) * 10;
      if (y === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
    }
    sctx.lineWidth = 5; sctx.strokeStyle = '#e0a458';
    sctx.shadowColor = '#e0a458'; sctx.shadowBlur = 26;
    sctx.stroke(); sctx.shadowBlur = 0;
  }

  function frame(now) {
    drawNet(); drawSeam(now);
    if (!reduced) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ticker loop contínuo */
  var tape = document.getElementById('tape');
  if (tape) tape.innerHTML += tape.innerHTML;
})();

(function () {
  'use strict';
  var html = document.documentElement;
  var KEY_THEME = 'kbw-theme';
  var KEY_SIZE  = 'kbw-prose-size';

  // ── theme: three-way (light / dark / auto), persists in localStorage ──
  var bL = document.getElementById('th-light');
  var bD = document.getElementById('th-dark');
  var bA = document.getElementById('th-auto');
  var themeBtns = [bL, bD, bA];
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function resolveTheme(pref) {
    if (pref === 'auto') return mq.matches ? 'dark' : 'light';
    return pref;
  }
  function applyTheme(pref) {
    html.setAttribute('data-theme', resolveTheme(pref));
    bL.setAttribute('aria-checked', String(pref === 'light'));
    bD.setAttribute('aria-checked', String(pref === 'dark'));
    bA.setAttribute('aria-checked', String(pref === 'auto'));
    try { localStorage.setItem(KEY_THEME, pref); } catch (e) {}
  }

  var savedTheme = 'light';
  try {
    var s = localStorage.getItem(KEY_THEME);
    if (s === 'light' || s === 'dark' || s === 'auto') savedTheme = s;
  } catch (e) {}
  applyTheme(savedTheme);

  bL.addEventListener('click', function () { applyTheme('light'); });
  bD.addEventListener('click', function () { applyTheme('dark');  });
  bA.addEventListener('click', function () { applyTheme('auto');  });

  // arrow-key navigation within the radiogroup
  themeBtns.forEach(function (btn, i) {
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var dir = e.key === 'ArrowRight' ? 1 : -1;
        var next = themeBtns[(i + dir + themeBtns.length) % themeBtns.length];
        next.focus();
        next.click();
      }
    });
  });

  // when system theme flips and user is on Auto, update applied theme
  mq.addEventListener && mq.addEventListener('change', function () {
    var current = (function () {
      try { return localStorage.getItem(KEY_THEME) || 'light'; } catch (e) { return 'light'; }
    })();
    if (current === 'auto') applyTheme('auto');
  });

  // ── prose size: A− / A+, persists ──
  var SIZES = [16, 17, 18, 19, 20, 22];
  var note = document.getElementById('note');
  var bDown = document.getElementById('sz-down');
  var bUp   = document.getElementById('sz-up');

  function applySize(px) {
    note.style.setProperty('--ps', px + 'px');
    note.style.fontSize = px + 'px';
    try { localStorage.setItem(KEY_SIZE, String(px)); } catch (e) {}
  }
  var savedSize = 18;
  try {
    var sz = parseInt(localStorage.getItem(KEY_SIZE), 10);
    if (SIZES.indexOf(sz) !== -1) savedSize = sz;
  } catch (e) {}
  applySize(savedSize);

  function bump(delta) {
    var current = parseInt(note.style.fontSize, 10) || 18;
    var idx = SIZES.indexOf(current);
    if (idx === -1) idx = SIZES.indexOf(18);
    var next = SIZES[Math.max(0, Math.min(SIZES.length - 1, idx + delta))];
    applySize(next);
  }
  bDown.addEventListener('click', function () { bump(-1); });
  bUp  .addEventListener('click', function () { bump(+1); });

  // ── live clock — Riyadh, ticks every 60s ──
  var nowEl = document.getElementById('now');
  function tick() {
    try {
      var fmt = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Riyadh'
      });
      var t = fmt.format(new Date());
      nowEl.textContent = t + ' GMT+3';
      nowEl.setAttribute('datetime', new Date().toISOString());
    } catch (e) {
      nowEl.textContent = '—';
    }
  }
  tick();
  setInterval(tick, 60 * 1000);

  // ── keyboard shortcut: Enter from body navigates to /kbw-notes/ ──
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var t = document.activeElement;
    var tag = t && t.tagName;
    if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' ||
        tag === 'TEXTAREA' || tag === 'SELECT') return;
    e.preventDefault();
    window.location.href = '/kbw-notes/';
  });
})();

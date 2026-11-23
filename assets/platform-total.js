/* Platform local-followers band (2026-11-23): 156 dots light in a
   scattered seeded order while the platform's local follower count
   climbs, starting ONLY when the band is scrolled substantially
   into view (60% of the band visible, Jeff's fix 2026-11-23 17:42:
   a sliver peeking in at the bottom of the first screen must NOT
   start it), in about 2.5 seconds. The count's target is fetched live from the app's
   platform totals (GET /api/public/totals on the app, Jeff's
   per-platform counting method); the number printed in the HTML is
   the fallback if that fetch fails, and the final state no-JS and
   reduced-motion readers see as-is. Fires once per page load. */
(function () {
  var grid = document.getElementById('lfGrid');
  var countEl = document.getElementById('lfCount');
  if (!grid || !countEl) return;
  var N = 156, DUR = 2500;
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  var target = parseInt((countEl.textContent || '').replace(/[^\d]/g, ''), 10) || 0;

  /* Dots + deterministic scattered order (mulberry32 seeded shuffle,
     the hero concept's own order, seed 20261123). */
  var dots = [];
  for (var i = 0; i < N; i++) {
    var d = document.createElement('span');
    d.className = 'lfdot';
    grid.appendChild(d);
    dots.push(d);
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry32(20261123);
  var order = dots.map(function (_, i) { return i; });
  for (var j = order.length - 1; j > 0; j--) {
    var k = Math.floor(rnd() * (j + 1));
    var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
  }

  function setFinal() {
    for (var j = 0; j < N; j++) dots[order[j]].classList.add('lit');
    countEl.textContent = fmt(target);
  }

  /* Live target: the app's platform totals. A failure (or a nonsense
     answer) leaves the printed fallback standing. If the fetch lands
     after the animation already finished, the printed number updates
     to the live one; the dots stay lit. */
  var finished = false;
  try {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;
    fetch('https://app.magpielocal.com/api/public/totals', ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { if (timer) clearTimeout(timer); if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(function (data) {
        var n = data && parseInt(data.localFollowers, 10);
        if (n && isFinite(n) && n > 0) {
          target = n;
          if (finished) countEl.textContent = fmt(target);
        }
      })
      .catch(function () { if (timer) clearTimeout(timer); });
  } catch (e) { /* fallback stands */ }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { finished = true; setFinal(); return; }

  var started = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || started) return;
      started = true;
      io.disconnect();
      var t0 = null;
      countEl.textContent = '0';
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / DUR, 1);
        var ez = 1 - Math.pow(1 - p, 3);
        var lit = Math.round(N * ez);
        for (var j = 0; j < lit; j++) dots[order[j]].classList.add('lit');
        countEl.textContent = fmt(target * ez);
        if (p < 1) requestAnimationFrame(frame);
        else { finished = true; setFinal(); }
      }
      requestAnimationFrame(frame);
    });
  }, { threshold: 0.6 });
  io.observe(grid.parentNode && grid.closest ? (grid.closest('.lfband') || grid) : grid);
})();

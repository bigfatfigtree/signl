/* Dot-reveal (2026-11-23): lights a 100-dot grid to a creator's local %
   while the local follower count climbs, when the block scrolls into view.
   The final numbers live in the HTML, so no-JS readers see them as-is.
   prefers-reduced-motion (or no IntersectionObserver): final state at once. */
(function () {
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function setup(wrap) {
    var pct = parseInt(wrap.getAttribute('data-pct'), 10) || 0;
    var target = parseInt(wrap.getAttribute('data-count'), 10) || 0;
    var grid = wrap.querySelector('.dotgrid');
    var countEl = wrap.querySelector('.dotcount');
    if (!grid) return;
    var dots = [];
    for (var i = 0; i < 100; i++) {
      var d = document.createElement('span');
      d.className = 'dot';
      grid.appendChild(d);
      dots.push(d);
    }
    /* Deterministic scattered order: 37 is coprime with 100, so the
       (i*37)%100 key is a fixed permutation of the grid. */
    var order = dots.map(function (_, i) { return i; }).sort(function (a, b) {
      return ((a * 37) % 100) - ((b * 37) % 100);
    });
    function setFinal() {
      for (var j = 0; j < pct && j < 100; j++) dots[order[j]].classList.add('lit');
      if (countEl) countEl.textContent = fmt(target);
    }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setFinal(); return; }
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || done) return;
        done = true;
        io.disconnect();
        var dur = 1500, t0 = null;
        if (countEl) countEl.textContent = '0';
        function frame(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var ez = 1 - Math.pow(1 - p, 3);
          var lit = Math.round(pct * ez);
          for (var j = 0; j < lit; j++) dots[order[j]].classList.add('lit');
          if (countEl) countEl.textContent = fmt(target * ez);
          if (p < 1) requestAnimationFrame(frame); else setFinal();
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.35 });
    io.observe(wrap);
  }
  function init() {
    var wraps = document.querySelectorAll('.dotreveal');
    for (var i = 0; i < wraps.length; i++) setup(wraps[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

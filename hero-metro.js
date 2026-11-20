(function () {
  "use strict";
  /* Metro animation: on load the main line draws itself stop to
     stop (5s, eased). After the draw, a bright dot (the train)
     travels the main line in a continuous loop, pausing briefly at
     each station, then fades and restarts. Secondary lines are
     static throughout. Exposes window.__metroRoute =
     { getDrawnLength(), getTotalLength(), getDotFraction() } so
     motion is verifiable in the DOM, not just in a screenshot. */
  var path = document.getElementById("metroPath");
  var under = document.getElementById("metroUnder");
  var dot = document.getElementById("metroDot");
  var halo = document.getElementById("metroDotHalo");
  var dotM = document.getElementById("metroDotM");
  var haloM = document.getElementById("metroDotHaloM");
  if (!path) return;
  var L = path.getTotalLength();
  var stops = Array.prototype.slice.call(document.querySelectorAll(".map-stop"));
  stops.forEach(function (s) {
    var c = s.querySelector("circle");
    s._pt = { x: parseFloat(c.getAttribute("cx")), y: parseFloat(c.getAttribute("cy")) };
    s._f = 0;
  });
  /* station fractions measured along the real path, from coords */
  function fractionFor(pt) {
    var best = 0, bd = 1e18, steps = 400;
    for (var i = 0; i <= steps; i++) {
      var p = path.getPointAtLength((L * i) / steps);
      var d = (p.x - pt.x) * (p.x - pt.x) + (p.y - pt.y) * (p.y - pt.y);
      if (d < bd) { bd = d; best = i / steps; }
    }
    return best;
  }
  stops.forEach(function (s) { s._f = fractionFor(s._pt); });

  var drawn = 0;
  var dotFraction = 0;
  function render(drawF, dotF, dotOpacity) {
    drawn = Math.max(0, Math.min(L, L * drawF));
    dotFraction = Math.max(0, Math.min(1, dotF));
    path.style.strokeDasharray = String(L);
    path.style.strokeDashoffset = String(L - drawn);
    if (under) { under.style.strokeDasharray = String(L); under.style.strokeDashoffset = String(L - drawn); }
    var pt = path.getPointAtLength(L * dotFraction);
    if (dot) {
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      dot.style.opacity = String(dotOpacity);
    }
    if (halo) {
      halo.setAttribute("cx", pt.x);
      halo.setAttribute("cy", pt.y);
      halo.style.opacity = String(dotOpacity);
    }
    if (dotM) {
      dotM.setAttribute("cx", pt.x);
      dotM.setAttribute("cy", pt.y);
      dotM.style.opacity = String(dotOpacity);
    }
    if (haloM) {
      haloM.setAttribute("cx", pt.x);
      haloM.setAttribute("cy", pt.y);
      haloM.style.opacity = String(dotOpacity);
    }
    stops.forEach(function (s) { s.classList.toggle("is-on", drawF >= s._f - 0.001); });
    path.setAttribute("data-drawn", drawn.toFixed(1));
  }
  window.__metroRoute = {
    getDrawnLength: function () { return drawn; },
    getTotalLength: function () { return L; },
    getDotFraction: function () { return dotFraction; }
  };

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { render(1, 0, 0); return; }

  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* Travel timeline after the draw: the dot runs station to
     station, pausing 0.55s at each station (and 0.9s at the
     terminus), at a constant speed, then fades out and restarts. */
  var DRAW = 5000;
  var SPEED = L / 9500; /* px per ms once travelling */
  var PAUSE = 550, END_PAUSE = 900, FADE = 700, REST = 600;
  var waypoints = [0];
  stops.forEach(function (s) { if (s._f > 0.01 && s._f < 0.995) waypoints.push(s._f); });
  waypoints.push(1);
  waypoints.sort(function (a, b) { return a - b; });
  /* keyframes: list of {t, f, pauseAfter} in ms from travel start */
  var keys = [];
  var tAcc = 0, prevF = 0;
  waypoints.forEach(function (f, i) {
    tAcc += Math.abs(f - prevF) * L / SPEED;
    keys.push({ t: tAcc, f: f });
    if (i > 0 && i < waypoints.length - 1) tAcc += PAUSE;
    prevF = f;
  });
  var TRAVEL = tAcc + END_PAUSE;
  var TOTAL = DRAW + TRAVEL + FADE + REST;

  function travelFraction(t) {
    if (t <= 0) return 0;
    if (t >= TRAVEL) return 1;
    for (var i = 1; i < keys.length; i++) {
      if (t <= keys[i].t) {
        var k0 = keys[i - 1], k1 = keys[i];
        /* time since the previous keyframe includes any pause that
           followed it; movement only happens in the last
           (k1.t - moveStart) slice of the interval */
        var pauseBefore = (i - 1 > 0) ? PAUSE : 0;
        var moveStart = k0.t + pauseBefore;
        if (t <= moveStart) return k0.f;
        var span = k1.t - moveStart;
        var u = span > 0 ? (t - moveStart) / span : 1;
        return k0.f + (k1.f - k0.f) * u;
      }
    }
    return 1;
  }

  var start = null;
  function frame(ts) {
    if (start === null) start = ts;
    var t = (ts - start) % TOTAL;
    if (t < DRAW) {
      var f = easeInOut(t / DRAW);
      render(f, f, f > 0 ? 1 : 0);
    } else if (t < DRAW + TRAVEL) {
      var tf = travelFraction(t - DRAW);
      render(1, tf, 1);
    } else if (t < DRAW + TRAVEL + FADE) {
      var fo = 1 - easeInOut((t - DRAW - TRAVEL) / FADE);
      render(1, 1, fo);
    } else {
      render(1, 0, 0);
    }
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
})();

/* ============================================================
   METRO HERO (2026-11-20) — door tabs, claim wiring, crowd video.
   Creator form: REAL navigation to the proven claim flow
   (https://app.magpielocal.com/claim?handle=<handle>&market=<city>,
   the pattern the live site's own market/watchlist links use).
   No in-page success state is shown for either door: the creator
   door navigates to the claim flow, and the business door is a
   plain link to the real founding application at
   businesses.html#apply (form "business-application").
   ============================================================ */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Door tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-door-tab]"));
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-door-panel]"));
  function setDoor(name) {
    tabs.forEach(function (t) { var a = t.getAttribute("data-door-tab") === name; t.classList.toggle("is-active", a); t.setAttribute("aria-selected", a ? "true" : "false"); });
    panels.forEach(function (p) { p.hidden = p.getAttribute("data-door-panel") !== name; });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { setDoor(tab.getAttribute("data-door-tab")); });
    tab.addEventListener("keydown", function (ev) {
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      ev.preventDefault();
      var next = tab.getAttribute("data-door-tab") === "creator" ? "business" : "creator";
      setDoor(next);
      var nt = tabs.filter(function (t) { return t.getAttribute("data-door-tab") === next; })[0];
      if (nt) nt.focus();
    });
  });

  /* Creator claim: build the proven claim URL and navigate.
     Handle is sent without a leading "@" and the city goes as
     "market", matching the live site's claim links. With JS off,
     the form still submits natively to the same /claim endpoint
     with the same field names. */
  var form = document.querySelector('.metro-hero form[data-form="creator"]');
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var params = new URLSearchParams();
      var platform = String(data.get("platform") || "").trim();
      var handle = String(data.get("handle") || "").trim().replace(/^@+/, "");
      var market = String(data.get("market") || "").trim();
      if (platform) params.set("platform", platform);
      if (handle) params.set("handle", handle);
      if (market) params.set("market", market);
      params.set("src", "home-hero");
      window.location.href = "https://app.magpielocal.com/claim?" + params.toString();
    });
  }

  /* Crowd video: conservative autoplay (from the concept's
     script.js hero part). Poster/still is a fallback only, on a
     real media error or when reduced motion is requested. */
  var band = document.querySelector(".metro-hero .walk-band");
  var video = document.querySelector(".metro-hero .walk-video");
  if (band && video) {
    function still() { band.classList.add("is-still"); try { video.pause(); } catch (e) {} }
    if (reduced) { video.removeAttribute("autoplay"); still(); }
    else {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.autoplay = true;
      video.setAttribute("autoplay", "");
      video.loop = true;
      function tryPlay() {
        if (band.classList.contains("is-still")) return;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }
      video.addEventListener("error", still, true);
      video.addEventListener("canplay", tryPlay);
      video.addEventListener("loadedmetadata", tryPlay);
      tryPlay();
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (band.classList.contains("is-still")) return;
            if (en.isIntersecting) { tryPlay(); } else { video.pause(); }
          });
        }, { threshold: 0.05 }).observe(video);
      }
    }
  }
})();

(function () {
  "use strict";
  /* Metro animation: on load the main line draws itself stop to
     stop (5s, eased). After the draw, a bright dot (the train)
     travels the main line in a continuous loop, pausing briefly at
     each station, then fades and restarts. Secondary lines are
     static throughout. Exposes window.__metroRoute =
     { getDrawnLength(), getTotalLength(), getDotFraction() } so
     motion is verifiable in the DOM, not just in a screenshot.
     Two routes exist: the desktop route (#metroPath in .hero-map)
     and a mobile-only route (#metroPathM in .hero-map-m, ≤980px)
     whose geometry exits the screen edge before the claim card
     and re-enters below it. The active route is chosen by
     matchMedia and re-initialised if the breakpoint changes. */
  var mq = window.matchMedia("(max-width: 980px)");
  var rafId = null;

  function init(mobile) {
    var path = document.getElementById(mobile ? "metroPathM" : "metroPath");
    if (!path) return;
    var under = document.getElementById(mobile ? "metroUnderM" : "metroUnder");
    var dots = mobile
      ? [document.getElementById("metroDotMg"), document.getElementById("metroDotHaloMg")]
      : [document.getElementById("metroDot"), document.getElementById("metroDotHalo"),
         document.getElementById("metroDotM"), document.getElementById("metroDotHaloM")];
    var scope = mobile ? ".hero-map-m" : ".hero-map";
    var L = path.getTotalLength();
    var stops = Array.prototype.slice.call(document.querySelectorAll(scope + " .map-stop"));
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
      dots.forEach(function (d) {
        if (!d) return;
        d.setAttribute("cx", pt.x);
        d.setAttribute("cy", pt.y);
        d.style.opacity = String(dotOpacity);
      });
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
      rafId = window.requestAnimationFrame(frame);
    }
    rafId = window.requestAnimationFrame(frame);
  }

  init(mq.matches);
  function onBreakpointChange(e) {
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
    init(e.matches);
  }
  if (mq.addEventListener) mq.addEventListener("change", onBreakpointChange);
  else if (mq.addListener) mq.addListener(onBreakpointChange);
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

  /* Creator claim: build the claim URL and navigate. Handle is
     sent without a leading "@"; the chosen market goes as
     "market" (canonical name for a listed market; for "Add your
     city" the typed city goes as BOTH "market" and "city" so the
     claim flow takes its not-listed path and seeds its typed-city
     field). Follower count and local % ride along as "followers"
     and "localpct". Nothing navigates until every piece is
     present; each missing piece gets a plain-words message on
     the card. */
  var form = document.querySelector('.metro-hero form[data-form="creator"]');
  if (form) {
    var platformSel = document.getElementById("mh-platform");
    var handleIn = document.getElementById("mh-handle");
    var marketSel = document.getElementById("mh-market");
    var cityWrap = document.getElementById("mh-city-wrap");
    var cityIn = document.getElementById("mh-city-custom");
    var followersIn = document.getElementById("mh-followers");
    var localpctIn = document.getElementById("mh-localpct");
    var errorEl = document.getElementById("mh-form-error");
    var noteEl = document.getElementById("mh-lookup-note");

    function showError(msg, field) {
      if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
      if (field && field.focus) field.focus();
    }
    function clearError() { if (errorEl) { errorEl.textContent = ""; errorEl.hidden = true; } }

    /* "Add your city" reveals the one free-typing path. */
    function syncCityWrap() {
      var isAdd = marketSel && marketSel.value === "__add__";
      if (cityWrap) cityWrap.hidden = !isAdd;
      if (isAdd && cityIn) cityIn.focus();
    }
    if (marketSel) marketSel.addEventListener("change", function () { syncCityWrap(); clearError(); });
    syncCityWrap();

    /* Count lookup: when platform + handle are both in and the
       count field is EMPTY, ask the app for the public count.
       Fires at most once per platform+handle pair, ~5s timeout,
       never overwrites a typed value, and any failure stays
       silent so the form is always fully usable by hand. */
    var lookupTried = {};
    var PLATFORM_LABELS = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook", x: "X" };
    function maybeLookup() {
      if (!platformSel || !handleIn || !followersIn) return;
      var platform = platformSel.value;
      var handle = handleIn.value.trim().replace(/^@+/, "");
      if (!platform || !handle) return;
      if (followersIn.value.trim() !== "") return;
      var key = platform + "|" + handle.toLowerCase();
      if (lookupTried[key]) return;
      lookupTried[key] = true;
      var label = PLATFORM_LABELS[platform] || platform;
      var ctrl = ("AbortController" in window) ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 5000) : null;
      fetch("https://app.magpielocal.com/api/count-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform, handle: handle }),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) { return res.json(); }).then(function (data) {
        if (timer) clearTimeout(timer);
        if (!data) return;
        /* never overwrite a value the creator typed meanwhile */
        if (data.reason === "found" && typeof data.count === "number") {
          if (followersIn.value.trim() === "") {
            followersIn.value = String(data.count);
            if (noteEl) {
              noteEl.textContent = "We found this on your public profile: " + label + " \u00B7 @" + handle + " \u00B7 " + data.count.toLocaleString("en-US") + " followers. Check it and fix it if it's off.";
              noteEl.hidden = false;
            }
          }
        } else if (data.reason === "manual") {
          if (noteEl) {
            noteEl.textContent = "We can't look up " + label + " counts automatically \u2014 enter yours from your profile.";
            noteEl.hidden = false;
          }
        }
        /* not_found / blocked / error: stay silent, manual entry */
      }).catch(function () { if (timer) clearTimeout(timer); /* silent: manual entry */ });
    }
    if (handleIn) {
      handleIn.addEventListener("blur", maybeLookup);
      handleIn.addEventListener("change", maybeLookup);
    }
    if (platformSel) platformSel.addEventListener("change", maybeLookup);
    if (followersIn) followersIn.addEventListener("input", function () {
      if (followersIn.value.trim() !== "" && noteEl && noteEl.textContent.indexOf("We found this") === 0) {
        /* creator is correcting the found count; keep the note */
      }
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearError();
      var platform = platformSel ? platformSel.value : "";
      var handle = handleIn ? handleIn.value.trim().replace(/^@+/, "") : "";
      var marketVal = marketSel ? marketSel.value : "";
      var typedCity = cityIn ? cityIn.value.trim() : "";
      var isAdd = marketVal === "__add__";
      var followers = followersIn ? followersIn.value.trim() : "";
      var localpct = localpctIn ? localpctIn.value.trim() : "";

      if (!handle) { showError("Please add your handle so we can find your page.", handleIn); return; }
      if (!marketVal) { showError("Please choose your city from the list. If it is not there, choose \u201CAdd your city\u201D and type it.", marketSel); return; }
      if (isAdd && !typedCity) { showError("Please type your city so we know where to list you.", cityIn); return; }
      if (followers === "" || isNaN(Number(followers)) || Number(followers) < 0) {
        showError("Please add your total follower count for this platform. You can find it at the top of your profile.", followersIn); return;
      }
      if (localpct === "" || isNaN(Number(localpct))) {
        showError("Please add your total local percentage: the share of your followers who live in your city, from 0 to 100.", localpctIn); return;
      }
      if (Number(localpct) < 0 || Number(localpct) > 100) {
        showError("Your local percentage needs to be between 0 and 100.", localpctIn); return;
      }

      var params = new URLSearchParams();
      if (platform) params.set("platform", platform);
      params.set("handle", handle);
      if (isAdd) {
        params.set("market", typedCity);
        params.set("city", typedCity);
      } else {
        params.set("market", marketVal);
      }
      params.set("followers", String(Number(followers)));
      params.set("localpct", String(Number(localpct)));
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

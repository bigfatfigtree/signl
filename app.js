/* ---------- Analytics (GA4) ----------
   To activate: create a free GA4 property for joinsignl.com at
   analytics.google.com and paste the measurement ID (looks like
   G-XXXXXXXXXX) between the quotes below, then push. Until then,
   nothing loads and nothing is tracked. */
var GA_ID = 'G-0V1YPFCTSD';
if (GA_ID) {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);
}
function trackEvent(name, params) { if (window.gtag) gtag('event', name, params || {}); }

// Shared JS: mobile nav + application forms. Forms submit to Netlify
// (real lead capture on the deployed site). Success is shown only after
// Netlify confirms the submission; a failure keeps the form in place and
// shows a clear retry message. Nothing is mirrored to localStorage.
(function () {
  // Founding-application language carry (Spanish layers S3,
  // 2026-10-28): negocios.html links to the application form
  // with ?lang=es. The signal is kept in sessionStorage (so it
  // survives the jump to the #apply anchor and any in-session
  // navigation) and written into the form's hidden lang field,
  // so it rides both the Netlify Forms payload and the API
  // fallback payload; the application is then recorded as
  // Spanish and the team answers in Spanish.
  try {
    var langParam = new URLSearchParams(window.location.search).get('lang');
    if (langParam === 'es') sessionStorage.setItem('signl_form_lang', 'es');
    if (sessionStorage.getItem('signl_form_lang') === 'es') {
      document.querySelectorAll('input[name="lang"]').forEach(function (input) { input.value = 'es'; });
    }
  } catch (e) { /* storage or URL parsing unavailable: the form simply submits without a language */ }

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Mint-card menu: tapping the dimmed page (not the card) closes it.
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Sig profile at the top of the menu opens the Ask Sig sheet where
    // the page mounts one; elsewhere it simply closes the menu.
    var mnProfile = mobileNav.querySelector('.mn-profile');
    if (mnProfile) {
      mnProfile.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        var fab = document.querySelector('.sigx-fab');
        if (fab) fab.click();
      });
    }
  }

  // Netlify forms: any <form data-signl-form="key" data-netlify name="...">
  // posts to Netlify. The success block appears only on a confirmed OK
  // response; otherwise the visitor gets an error state and can retry.
  document.querySelectorAll('form[data-signl-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('data-sending') === '1') return;

      var wrap = form.closest('.form-wrap');
      var success = wrap ? wrap.querySelector('.form-success') : null;
      var btn = form.querySelector('button[type="submit"], button:not([type])');
      var btnText = btn ? btn.textContent : '';

      var error = wrap ? wrap.querySelector('.form-error') : null;
      if (!error && wrap) {
        error = document.createElement('p');
        error.className = 'form-error';
        error.setAttribute('role', 'alert');
        error.style.cssText = 'display:none;margin-top:14px;color:#B3261E;font-weight:600';
        wrap.appendChild(error);
      }
      function showError() {
        if (error) {
          error.textContent = 'Something went wrong sending that just now. Your answers are still in the form: please press send again, or email hello@joinsignl.com and we will take it from there.';
          error.style.display = 'block';
        }
        form.removeAttribute('data-sending');
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
      }
      function showSuccess() {
        if (error) error.style.display = 'none';
        form.style.display = 'none';
        if (success) {
          success.classList.add('show');
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      if (!form.hasAttribute('data-netlify') || !form.getAttribute('name')) {
        showError();
        return;
      }

      form.setAttribute('data-sending', '1');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      if (error) error.style.display = 'none';

      var body = new URLSearchParams();
      var payload = {};
      new FormData(form).forEach(function (v, n) { body.append(n, v); payload[n] = v; });
      body.append('form-name', form.getAttribute('name'));

      function postNetlify() {
        return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
          .then(function (r) { if (!r.ok) throw new Error('netlify ' + r.status); });
      }
      // Safety net (2026-10-28): a real founding application was lost
      // when the Netlify POST failed in the visitor's browser and the
      // form had no second path. Business applications now fall back
      // to the app API, which stores the application itself and emails
      // the team; success on either path is a real, recorded success.
      function postFallback() {
        return fetch('https://app.joinsignl.com/api/founding-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) { if (!r.ok) throw new Error('fallback ' + r.status); });
      }
      var isBusinessApplication = form.getAttribute('data-signl-form') === 'business_applications';
      postNetlify()
        .catch(function () { return postNetlify(); })
        .catch(function () {
          if (!isBusinessApplication) throw new Error('primary path failed');
          return postFallback();
        })
        .then(function () {
          trackEvent('form_submit', { form_name: form.getAttribute('name') });
          showSuccess();
        })
        .catch(function () { showError(); });
    });
  });
})();

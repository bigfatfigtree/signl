/* ---------- Analytics (GA4) ----------
   To activate: create a free GA4 property for joinsignl.com at
   analytics.google.com and paste the measurement ID (looks like
   G-XXXXXXXXXX) between the quotes below, then push. Until then,
   nothing loads and nothing is tracked. */
var GA_ID = '';
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

// Shared JS: mobile nav + application forms. Forms save locally and,
// when wired with data-netlify, also submit to Netlify (real lead capture
// once the site is deployed there); the Netlify attempt fails silently elsewhere.
(function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Demo forms: any <form data-signl-form="key"> is saved to localStorage and
  // replaced by its sibling .form-success block.
  document.querySelectorAll('form[data-signl-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var key = 'signl_' + form.getAttribute('data-signl-form');
      var data = {};
      new FormData(form).forEach(function (value, name) {
        if (data[name]) {
          data[name] = Array.isArray(data[name]) ? data[name].concat(value) : [data[name], value];
        } else {
          data[name] = value;
        }
      });
      data.submitted_at = new Date().toISOString();
      var existing = [];
      try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch (err) { existing = []; }
      existing.push(data);
      try { localStorage.setItem(key, JSON.stringify(existing)); } catch (err) { /* storage unavailable */ }

      if (form.hasAttribute('data-netlify') && form.getAttribute('name')) {
        try {
          var body = new URLSearchParams();
          new FormData(form).forEach(function (v, n) { body.append(n, v); });
          body.append('form-name', form.getAttribute('name'));
          fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() }).catch(function () {});
        } catch (err) { /* not deployed on Netlify yet */ }
      }

      trackEvent('form_submit', { form_name: form.getAttribute('name') });

      var wrap = form.closest('.form-wrap');
      var success = wrap ? wrap.querySelector('.form-success') : null;
      form.style.display = 'none';
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
})();

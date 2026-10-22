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
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
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
      new FormData(form).forEach(function (v, n) { body.append(n, v); });
      body.append('form-name', form.getAttribute('name'));
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
        .then(function (r) {
          if (!r.ok) { showError(); return; }
          trackEvent('form_submit', { form_name: form.getAttribute('name') });
          showSuccess();
        })
        .catch(function () { showError(); });
    });
  });
})();

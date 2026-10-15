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

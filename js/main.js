// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Scroll reveal — progressive enhancement only. Elements are visible by
  // default (see .reveal in CSS); we only hide-then-show if we're confident
  // the observer will actually fire.
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('pre');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) {
      el.classList.add('pre');
      io.observe(el);
    });
    // Safety net: if anything is still hidden after 2.5s (e.g. layout
    // shift caused the observer to miss it), just show it.
    setTimeout(function () {
      document.querySelectorAll('.reveal.pre').forEach(function (el) {
        el.classList.remove('pre');
      });
    }, 2500);
  }

  // Services accordion — click to pin a row open (hover already reveals on desktop).
  var serviceRows = document.querySelectorAll('.service-row');
  if (serviceRows.length) {
    serviceRows.forEach(function (row) {
      row.addEventListener('click', function () {
        var wasActive = row.classList.contains('active');
        serviceRows.forEach(function (r) { r.classList.remove('active'); });
        if (!wasActive) row.classList.add('active');
      });
    });
  }

  // Animated stat counters — count up from 0 to the real published number
  // once the stats row scrolls into view. Falls back to the static text
  // if IntersectionObserver isn't available.
  var statEls = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window && statEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        statIO.unobserve(entry.target);
        var el = entry.target;
        var raw = el.textContent.trim();
        var match = raw.match(/^([\d.]+)(.*)$/);
        if (!match) return;
        var end = parseFloat(match[1]);
        var suffix = match[2] || '';
        var decimals = (match[1].split('.')[1] || '').length;
        var duration = 1200;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = (end * eased).toFixed(decimals);
          el.textContent = current + suffix;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = raw;
          }
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    statEls.forEach(function (el) { statIO.observe(el); });
  }

  // Delicate scroll parallax — case-study imagery skews slightly with scroll
  // velocity, then eases back to flat. Skipped for reduced-motion users.
  var skewTargets = document.querySelectorAll('.case-cover, .case-gallery img');
  if (skewTargets.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var lastY = window.scrollY;
    var currentSkew = 0;
    var skewRunning = false;
    function updateSkew() {
      var y = window.scrollY;
      var delta = y - lastY;
      lastY = y;
      var target = Math.max(-4, Math.min(4, delta * 0.5));
      currentSkew += (target - currentSkew) * 0.15;
      if (Math.abs(currentSkew) > 0.03) {
        skewTargets.forEach(function (el) { el.style.transform = 'skewY(' + currentSkew.toFixed(2) + 'deg)'; });
        requestAnimationFrame(updateSkew);
      } else {
        skewTargets.forEach(function (el) { el.style.transform = ''; });
        skewRunning = false;
      }
    }
    window.addEventListener('scroll', function () {
      if (!skewRunning) {
        skewRunning = true;
        requestAnimationFrame(updateSkew);
      }
    }, { passive: true });
  }

  // Contact form (static site — no backend). Prevent silent no-op submit.
  var form = document.querySelector('.js-contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var mail = 'mrjones@jonesdoyoucopy.com';
      var name = form.querySelector('#name') ? form.querySelector('#name').value : '';
      var email = form.querySelector('#email') ? form.querySelector('#email').value : '';
      var message = form.querySelector('#message') ? form.querySelector('#message').value : '';
      var subject = encodeURIComponent('New project inquiry from ' + (name || 'website'));
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:' + mail + '?subject=' + subject + '&body=' + body;
      if (status) status.textContent = "Opening your email client — if nothing happens, email mrjones@jonesdoyoucopy.com directly.";
    });
  }
});

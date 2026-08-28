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

  // Scroll story — a sticky image panel that swaps as each chapter of text
  // scrolls through the center of the viewport (Brief / Approach / Result).
  var stories = document.querySelectorAll('.scroll-story');
  if (stories.length) {
    stories.forEach(function (story) {
      var imgs = story.querySelectorAll('.story-media img');
      var chapters = story.querySelectorAll('.chapter');
      if (!imgs.length || !chapters.length) return;
      if (!('IntersectionObserver' in window)) {
        imgs[0].classList.add('active');
        return;
      }
      var storyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var idx = Array.prototype.indexOf.call(chapters, entry.target);
          imgs.forEach(function (im, i) { im.classList.toggle('active', i === idx); });
        });
      }, { threshold: 0.01, rootMargin: '-45% 0px -45% 0px' });
      chapters.forEach(function (ch) { storyIO.observe(ch); });
    });
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

  // Scroll tilt — each gallery image rotates based on its own position in
  // the viewport: tilted one way entering, flat at center, tilted the other
  // way leaving. Driven by scroll position (not velocity), matching a
  // reference recording of the tilt effect. Skipped for reduced-motion users.
  var tiltTargets = document.querySelectorAll('.case-gallery img');
  if (tiltTargets.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var MAX_TILT = 7; // degrees
    var tiltTicking = false;
    function updateTilt() {
      var vh = window.innerHeight;
      var center = vh / 2;
      tiltTargets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return; // skip far offscreen
        var elCenter = rect.top + rect.height / 2;
        var normalized = (elCenter - center) / center; // -1 (top) .. 1 (bottom)
        normalized = Math.max(-1, Math.min(1, normalized));
        var angle = normalized * MAX_TILT;
        el.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
      });
      tiltTicking = false;
    }
    updateTilt();
    window.addEventListener('scroll', function () {
      if (!tiltTicking) {
        tiltTicking = true;
        requestAnimationFrame(updateTilt);
      }
    }, { passive: true });
    window.addEventListener('resize', updateTilt);
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

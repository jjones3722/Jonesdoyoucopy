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

  // Venetian blind reveal — each case-study gallery image is wrapped in a
  // set of horizontal slats that open once, the first time the image
  // scrolls into view (replaces an earlier continuous scroll-tilt effect).
  var blindImgs = document.querySelectorAll('.case-gallery img');
  if (blindImgs.length) {
    var SLAT_COUNT = 8;
    blindImgs.forEach(function (img) {
      var wrapper = document.createElement('div');
      wrapper.className = 'blind-reveal';
      if (img.classList.contains('tall')) wrapper.classList.add('tall');
      if (img.classList.contains('portrait')) wrapper.classList.add('portrait');
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      for (var i = 0; i < SLAT_COUNT; i++) {
        var slat = document.createElement('span');
        slat.className = 'blind-slat';
        slat.style.top = (i * (100 / SLAT_COUNT)) + '%';
        slat.style.height = (100 / SLAT_COUNT) + '%';
        slat.style.transitionDelay = (i * 0.045) + 's';
        wrapper.appendChild(slat);
      }
    });

    var blindWrappers = document.querySelectorAll('.blind-reveal');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var blindIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('open');
            blindIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });
      blindWrappers.forEach(function (w) { blindIO.observe(w); });
    } else {
      blindWrappers.forEach(function (w) { w.classList.add('open'); });
    }
  }

  // Lightbox — click any content image (case galleries, case covers,
  // before/after cards) to expand it full-size. Images inside a link
  // (portfolio cards) are left alone so navigation still works.
  var lightboxImgs = document.querySelectorAll('.case-gallery img, .case-cover, .ba-card img');
  if (lightboxImgs.length) {
    var lbOverlay = document.createElement('div');
    lbOverlay.className = 'lightbox-overlay';
    lbOverlay.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close">&times;</button><img alt="">';
    document.body.appendChild(lbOverlay);
    var lbImg = lbOverlay.querySelector('img');

    function openLightbox(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lbOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lbOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    lightboxImgs.forEach(function (img) {
      if (img.closest('a')) return;
      img.classList.add('lightbox-enabled');
      img.addEventListener('click', function () {
        openLightbox(img.currentSrc || img.src, img.alt);
      });
    });
    lbOverlay.addEventListener('click', function (e) {
      if (e.target === lbOverlay) closeLightbox();
    });
    lbOverlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
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

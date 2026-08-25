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

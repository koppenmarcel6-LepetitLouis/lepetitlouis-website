(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.dataset.filter;
      var visible = 0;
      document.querySelectorAll('[data-filter]').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      document.querySelectorAll('.article-card[data-category]').forEach(function (card) {
        var matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      var status = document.getElementById('filterStatus');
      if (status) status.textContent = visible + (visible === 1 ? ' Artikel angezeigt' : ' Artikel angezeigt');
    });
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (element) { observer.observe(element); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (element) { element.classList.add('is-visible'); });
  }

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt], .article-cover').forEach(function (element) {
      element.addEventListener('pointermove', function (event) {
        var rect = element.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - .5;
        var y = (event.clientY - rect.top) / rect.height - .5;
        element.style.setProperty('--ry', (x * 4).toFixed(2) + 'deg');
        element.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
      });
      element.addEventListener('pointerleave', function () {
        element.style.setProperty('--ry', '0deg');
        element.style.setProperty('--rx', '0deg');
      });
    });
  }

  document.querySelectorAll('[data-card-deck]').forEach(function (deck) {
    var cards = Array.prototype.slice.call(deck.querySelectorAll('.care-card'));
    var previousButton = document.querySelector('[data-deck-prev]');
    var nextButton = document.querySelector('[data-deck-next]');
    var currentLabel = document.querySelector('[data-deck-current]');
    var status = document.querySelector('[data-deck-status]');
    var activeIndex = 0;
    var pointerStart = null;
    var positionClasses = ['is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next'];

    function showCard(index, announce) {
      activeIndex = (index + cards.length) % cards.length;
      cards.forEach(function (card, cardIndex) {
        positionClasses.forEach(function (className) { card.classList.remove(className); });
        var distance = (cardIndex - activeIndex + cards.length) % cards.length;
        var className = '';
        if (distance === 0) className = 'is-active';
        else if (distance === 1) className = 'is-next';
        else if (distance === cards.length - 1) className = 'is-prev';
        else if (distance === 2) className = 'is-far-next';
        else if (distance === cards.length - 2) className = 'is-far-prev';
        if (className) card.classList.add(className);
        var isActive = distance === 0;
        card.setAttribute('aria-hidden', String(!isActive));
        card.querySelectorAll('a,button').forEach(function (control) { control.tabIndex = isActive ? 0 : -1; });
      });
      var activeCard = cards[activeIndex];
      var title = activeCard.querySelector('h3').textContent.trim();
      if (currentLabel) currentLabel.textContent = String(activeIndex + 1);
      deck.setAttribute('aria-label', 'Pflegefrage ' + (activeIndex + 1) + ' von ' + cards.length + ': ' + title);
      if (announce && status) status.textContent = 'Pflegekarte ' + (activeIndex + 1) + ' von ' + cards.length + ': ' + title;
    }

    function next() { showCard(activeIndex + 1, true); }
    function previous() { showCard(activeIndex - 1, true); }
    if (nextButton) nextButton.addEventListener('click', next);
    if (previousButton) previousButton.addEventListener('click', previous);

    deck.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
    });
    deck.addEventListener('pointerdown', function (event) {
      pointerStart = { x: event.clientX, y: event.clientY };
    });
    deck.addEventListener('pointerup', function (event) {
      if (!pointerStart) return;
      var deltaX = event.clientX - pointerStart.x;
      var deltaY = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) next(); else previous();
      }
    });
    cards.forEach(function (card, cardIndex) {
      card.addEventListener('click', function (event) {
        if (cardIndex !== activeIndex && !event.target.closest('a')) showCard(cardIndex, true);
      });
    });
    showCard(0, false);
  });

  document.querySelectorAll('[data-pomeranian-gallery]').forEach(function (gallery) {
    var stage = gallery.querySelector('[data-pomeranian-stage]');
    var slides = Array.prototype.slice.call(gallery.querySelectorAll('[data-pomeranian-slide]'));
    var dots = Array.prototype.slice.call(gallery.querySelectorAll('[data-pomeranian-dot]'));
    var previousButton = gallery.querySelector('[data-pomeranian-prev]');
    var nextButton = gallery.querySelector('[data-pomeranian-next]');
    var count = gallery.querySelector('[data-pomeranian-count]');
    var status = gallery.querySelector('[data-pomeranian-status]');
    var activeIndex = 0;
    var pointerStart = null;
    var slideClasses = ['is-active', 'is-behind-1', 'is-behind-2', 'is-behind-3'];

    function showSlide(index, announce) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slideClasses.forEach(function (className) { slide.classList.remove(className); });
        var distance = (slideIndex - activeIndex + slides.length) % slides.length;
        slide.classList.add(slideClasses[distance]);
        slide.setAttribute('aria-hidden', String(distance !== 0));
      });
      dots.forEach(function (dot, dotIndex) {
        dot.setAttribute('aria-pressed', String(dotIndex === activeIndex));
      });
      if (count) count.textContent = (activeIndex + 1) + ' / ' + slides.length;
      if (announce && status) status.textContent = 'Pomeranian-Foto ' + (activeIndex + 1) + ' von ' + slides.length;
    }

    function next() { showSlide(activeIndex + 1, true); }
    function previous() { showSlide(activeIndex - 1, true); }
    if (nextButton) nextButton.addEventListener('click', next);
    if (previousButton) previousButton.addEventListener('click', previous);
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () { showSlide(dotIndex, true); });
    });
    if (stage) {
      stage.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
      });
      stage.addEventListener('pointerdown', function (event) {
        pointerStart = { x: event.clientX, y: event.clientY };
      });
      stage.addEventListener('pointerup', function (event) {
        if (!pointerStart) return;
        var deltaX = event.clientX - pointerStart.x;
        var deltaY = event.clientY - pointerStart.y;
        pointerStart = null;
        if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) next(); else previous();
        }
      });
    }
    showSlide(0, false);
  });
})();

/* ==========================================================================
   Каталог: подсветка за курсором, счётчик на карточке, фильтры.
   Это только интерфейс: общая корзина и суммы пока не подключены.
   ========================================================================== */

(function () {
  'use strict';

  var MAX_QTY = 99;

  var grid = document.querySelector('.catalog__grid');
  var filters = document.querySelector('.catalog__filters');
  if (!grid) return;

  /* ----- 1. Подсветка: передаём позицию курсора в CSS-переменные -------- */

  function setGlow(card, clientX, clientY) {
  var rect = card.getBoundingClientRect();
  var x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  var y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
  card.style.setProperty('--mx', x + 'px');
  card.style.setProperty('--my', y + 'px');
  card.classList.add('product-card--lit');
}

grid.addEventListener('pointermove', function (event) {
  var card = event.target.closest('.product-card');
  if (card) setGlow(card, event.clientX, event.clientY);
});

/* Мышь покидает карточку: свет остаётся на границе, где вышли */
grid.addEventListener('pointerout', function (event) {
  var card = event.target.closest('.product-card');
  if (!card || card.contains(event.relatedTarget)) return;
  setGlow(card, event.clientX, event.clientY);
});

  /* ----- 2. Кнопка «В корзину» и счётчик «− 1 +» ------------------------ */

  function showButton(card) {
    card.querySelector('.product-card__buy').hidden = false;
    card.querySelector('.product-card__stepper').hidden = true;
  }

  function showStepper(card, qty) {
    card.querySelector('.product-card__buy').hidden = true;
    card.querySelector('.product-card__stepper').hidden = false;
    card.querySelector('.stepper__value').textContent = qty;
  }

  grid.addEventListener('click', function (event) {
    var control = event.target.closest('[data-action]');
    if (!control) return;

    var card = control.closest('.product-card');
    var output = card.querySelector('.stepper__value');
    var qty = parseInt(output.textContent, 10) || 1;
    var action = control.getAttribute('data-action');

    if (action === 'buy') {
      showStepper(card, 1);
      card.querySelector('[data-action="increase"]').focus();
    }

    if (action === 'increase') {
      showStepper(card, Math.min(qty + 1, MAX_QTY));
    }

    if (action === 'decrease') {
      if (qty <= 1) {
        showButton(card);
        card.querySelector('[data-action="buy"]').focus();
      } else {
        showStepper(card, qty - 1);
      }
    }
  });

  /* ----- 3. Фильтры по категориям --------------------------------------- */

  if (!filters) return;

  filters.addEventListener('click', function (event) {
    var chip = event.target.closest('.chip');
    if (!chip) return;

    var value = chip.getAttribute('data-filter');

    filters.querySelectorAll('.chip').forEach(function (el) {
      el.classList.toggle('chip--active', el === chip);
    });

    grid.querySelectorAll('.catalog__item').forEach(function (item) {
      var match = value === 'all' || item.getAttribute('data-category') === value;
      item.hidden = !match;
    });
  });
})();

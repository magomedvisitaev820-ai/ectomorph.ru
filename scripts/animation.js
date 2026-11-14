/* ==========================================================================
   Орбиты: иконки движутся по наклонным эллипсам вокруг человека.
   Дальняя сторона орбиты: иконка меньше, бледнее и уходит ЗА человека.
   Ближняя сторона: иконка крупнее, ярче и проходит ПЕРЕД человеком.
   ========================================================================== */

(function () {
  'use strict';

  /* ----- Настройки ------------------------------------------------------ */

  /* Все значения cx, cy, rx, ry: доля ширины (x) или высоты (y) блока .visual
     cx, cy: центр орбиты
     rx, ry: горизонтальный и вертикальный радиус
     tilt: наклон в градусах
     period: секунд на полный оборот
     dir: 1 по часовой стрелке, -1 против */
  var RINGS = {
    outer: { cx: 0.5, cy: 0.64, rx: 0.48, ry: 0.13, tilt: -8, period: 26, dir: 1 },
    inner: { cx: 0.5, cy: 0.40, rx: 0.34, ry: 0.07, tilt: 6, period: 20, dir: -1 }
  };

  /* Эффект глубины */
  var SCALE_BACK = 0.72;    /* размер иконки на дальней стороне */
  var SCALE_FRONT = 1.12;   /* размер иконки на ближней стороне */
  var OPACITY_BACK = 0.45;  /* прозрачность на дальней стороне */
  var Z_FRONT = 20;         /* выше человека (у фигуры z-index: 10) */
  var Z_BACK = 1;           /* ниже человека */

  /* ----- Код ------------------------------------------------------------ */

  var scene = document.querySelector('[data-orbit-scene]');
  if (!scene) return;

  var items = Array.prototype.slice.call(scene.querySelectorAll('.orbit-item'));
  var rings = Array.prototype.slice.call(scene.querySelectorAll('.orbit-ring'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var width = 0;
  var height = 0;

  function layoutRings() {
    rings.forEach(function (el) {
      var cfg = RINGS[el.getAttribute('data-ring')];
      if (!cfg) return;
      var rx = cfg.rx * width;
      var ry = cfg.ry * height;
      el.style.width = rx * 2 + 'px';
      el.style.height = ry * 2 + 'px';
      el.style.left = cfg.cx * width - rx + 'px';
      el.style.top = cfg.cy * height - ry + 'px';
      el.style.transform = 'rotate(' + cfg.tilt + 'deg)';
    });
  }

  function render(now) {
    var seconds = now / 1000;

    items.forEach(function (el) {
      var cfg = RINGS[el.getAttribute('data-ring')];
      if (!cfg) return;

      var start = parseFloat(el.getAttribute('data-angle') || '0') * Math.PI / 180;
      var angle = start + cfg.dir * (Math.PI * 2) * (seconds / cfg.period);

      /* точка на эллипсе до наклона */
      var ox = Math.cos(angle) * cfg.rx * width;
      var oy = Math.sin(angle) * cfg.ry * height;

      /* поворот на угол наклона */
      var tilt = cfg.tilt * Math.PI / 180;
      var x = cfg.cx * width + ox * Math.cos(tilt) - oy * Math.sin(tilt);
      var y = cfg.cy * height + ox * Math.sin(tilt) + oy * Math.cos(tilt);

      /* глубина: -1 дальняя точка орбиты, 1 ближняя */
      var depth = Math.sin(angle);
      var k = (depth + 1) / 2;
      var scale = SCALE_BACK + (SCALE_FRONT - SCALE_BACK) * k;
      var opacity = OPACITY_BACK + (1 - OPACITY_BACK) * k;

      el.style.transform =
        'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) ' +
        'translate(-50%, -50%) scale(' + scale.toFixed(3) + ')';
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = depth >= 0 ? Z_FRONT : Z_BACK;
    });
  }

  function measure() {
    width = scene.clientWidth;
    height = scene.clientHeight;
    layoutRings();
    render(performance.now());
  }

  function frame(now) {
    render(now);
    window.requestAnimationFrame(frame);
  }

  measure();

  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(scene);
  } else {
    window.addEventListener('resize', measure);
  }

  /* При включённом «уменьшении движения» иконки стоят на месте */
  if (!reduceMotion) {
    window.requestAnimationFrame(frame);
  }
})();
/* ЛК · служебная статистика — подсказка на графике.

   Графики на этих страницах статичные: <svg> нарисован заранее (см.
   _source/stats_mock.py), логика будет на бэке. Здесь только показ значения
   при наведении: поверх графика лежат прозрачные полосы .lk-chart-hit —
   по одной на деление оси X, — а данные берём из data-атрибутов точек.
   Ловим наведение на всю колонку, а не на саму точку: попасть курсором
   в кружок радиусом 3px тяжело, да и оба ряда сразу показать удобнее. */
(function () {
  'use strict';

  var DOT_R = 3.4;        // как в разметке
  var DOT_R_ON = 5.4;     // подсвеченная точка
  var GAP = 12;           // отступ подсказки от точки

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function initChartTips() {
    document.querySelectorAll('.lk-chart-panel').forEach(setupChart);
  }

  function setupChart(panel) {
    var svg = panel.querySelector('.lk-chart-svg');
    if (!svg) return;

    var hits = svg.querySelectorAll('.lk-chart-hit');
    if (!hits.length) return;

    var dots = svg.querySelectorAll('.lk-chart-dot');
    var cursor = svg.querySelector('.lk-chart-cursor');
    var scroller = panel.querySelector('.lk-chart');

    var tip = document.createElement('div');
    tip.className = 'lk-chart-tip';
    tip.hidden = true;
    panel.appendChild(tip);

    var current = -1;

    function dotsAt(i) {
      return Array.prototype.filter.call(dots, function (d) {
        return d.getAttribute('data-i') === String(i);
      });
    }

    function show(hit) {
      var i = hit.getAttribute('data-i');
      if (current === i) return;
      current = i;

      var mine = dotsAt(i);
      if (!mine.length) return;

      tip.innerHTML =
        '<div class="lk-chart-tip-h">' + escapeHtml(hit.getAttribute('data-label')) + '</div>' +
        mine.map(function (d) {
          return '<div class="lk-chart-tip-row">' +
                   '<span class="lk-chart-tip-k">' +
                     '<i style="background:' + d.style.fill + '"></i>' +
                     escapeHtml(d.getAttribute('data-name')) +
                   '</span>' +
                   '<span class="lk-chart-tip-v">' +
                     escapeHtml(d.getAttribute('data-val')) +
                   '</span>' +
                 '</div>';
        }).join('');

      dots.forEach(function (d) {
        var on = d.getAttribute('data-i') === i;
        d.classList.toggle('is-on', on);
        d.setAttribute('r', on ? DOT_R_ON : DOT_R);
      });

      if (cursor) {
        var x = hit.getAttribute('data-x');
        cursor.setAttribute('x1', x);
        cursor.setAttribute('x2', x);
        // у SVG-элемента нет свойства hidden — только атрибут
        cursor.removeAttribute('hidden');
      }

      tip.hidden = false;
      place(mine);
    }

    /* Координаты считаем через getBoundingClientRect: на узких экранах
       график прокручивается по горизонтали внутри .lk-chart, и пересчёт от
       экрана избавляет от ручной поправки на scrollLeft. */
    function place(mine) {
      var box = panel.getBoundingClientRect();
      var first = mine[0].getBoundingClientRect();
      var top = first.top, bottom = first.bottom;

      mine.forEach(function (d) {
        var r = d.getBoundingClientRect();
        if (r.top < top) top = r.top;
        if (r.bottom > bottom) bottom = r.bottom;
      });

      var w = tip.offsetWidth, h = tip.offsetHeight;
      var left = first.left + first.width / 2 - box.left;
      left = Math.max(w / 2 + 6, Math.min(box.width - w / 2 - 6, left));

      // не хватает места сверху — показываем подсказку под точкой
      var below = (top - box.top) - h - GAP < 0;
      tip.classList.toggle('is-below', below);
      tip.style.left = left + 'px';
      tip.style.top = (below ? bottom - box.top : top - box.top) + 'px';
    }

    function hide() {
      if (tip.hidden) return;
      tip.hidden = true;
      current = -1;
      dots.forEach(function (d) {
        d.classList.remove('is-on');
        d.setAttribute('r', DOT_R);
      });
      if (cursor) cursor.setAttribute('hidden', '');
    }

    hits.forEach(function (hit) {
      // pointer* разом закрывает мышь, тач и стилус
      hit.addEventListener('pointerenter', function () { show(hit); });
      hit.addEventListener('pointerdown', function () { show(hit); });
    });

    svg.addEventListener('pointerleave', hide);
    if (scroller) scroller.addEventListener('scroll', hide);

    // на телефоне «увести курсор» некуда — гасим подсказку по касанию вне графика
    document.addEventListener('pointerdown', function (e) {
      if (!svg.contains(e.target)) hide();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChartTips);
  } else {
    initChartTips();
  }
})();

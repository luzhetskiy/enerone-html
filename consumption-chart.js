/* ============================================================
   Enerone LK — График потребления счётчика
   Автономный, без зависимостей. Строит интерактивный столбчатый
   график из массива вида:
     [{ "year": 2026, "month": 5, "value": "957.11" }, ...]

   Использование:
     EneroneConsumptionChart.render('#container', data);
     EneroneConsumptionChart.render('#container', data, {
       title: 'Потребление электроэнергии',
       unit:  'кВт·ч'
     });

   Данные могут идти в любом порядке — график сам сортирует по дате.
   ============================================================ */
(function (global) {
  'use strict';

  var MONTHS_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  var MONTHS_FULL  = ['январь','февраль','март','апрель','май','июнь','июль',
                      'август','сентябрь','октябрь','ноябрь','декабрь'];

  // ── утилиты ────────────────────────────────────────────
  function ensureFont() {
    if (document.getElementById('ec-golos-font')) return;
    var l = document.createElement('link');
    l.id = 'ec-golos-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }

  // форматирование чисел по-русски: 2 295,11
  function fmt(n, decimals) {
    return n.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals == null ? 0 : decimals,
      maximumFractionDigits: decimals == null ? 0 : decimals
    });
  }

  // «красивый» верхний предел оси Y + шаг
  function niceScale(max, ticks) {
    ticks = ticks || 4;
    if (max <= 0) return { top: 1, step: 1 };
    var rawStep = max / ticks;
    var mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    var norm = rawStep / mag;
    var niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
    var step = niceNorm * mag;
    return { top: Math.ceil(max / step) * step, step: step };
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ── основной рендер ────────────────────────────────────
  function render(target, data, options) {
    ensureFont();
    options = options || {};
    var unit  = options.unit  || 'кВт·ч';
    var title = options.title || 'Потребление электроэнергии';

    var root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root) { console.warn('[EneroneConsumptionChart] контейнер не найден:', target); return; }

    // нормализуем и сортируем по хронологии (старые → новые)
    var items = (data || []).map(function (d) {
      return {
        year: +d.year,
        month: +d.month,        // 1..12
        value: parseFloat(d.value)
      };
    }).filter(function (d) { return isFinite(d.value); })
      .sort(function (a, b) { return a.year - b.year || a.month - b.month; });

    if (!items.length) { root.innerHTML = ''; return; }

    var values = items.map(function (d) { return d.value; });
    var maxVal = Math.max.apply(null, values);
    var maxIdx = values.indexOf(maxVal);
    var sum    = values.reduce(function (a, b) { return a + b; }, 0);
    var avg    = sum / values.length;
    var scale  = niceScale(maxVal, 4);

    // ── каркас ──
    root.innerHTML = '';
    var card = el('div', 'ec-card');

    // шапка
    var head = el('div', 'ec-head');
    var titleWrap = el('div');
    titleWrap.appendChild(el('div', 'ec-title', title));
    var period = items[0], periodEnd = items[items.length - 1];
    titleWrap.appendChild(el('div', 'ec-sub',
      cap(MONTHS_FULL[period.month - 1]) + ' ' + period.year + ' — ' +
      cap(MONTHS_FULL[periodEnd.month - 1]) + ' ' + periodEnd.year + ' · ' + unit));
    head.appendChild(titleWrap);

    var kpis = el('div', 'ec-kpis');
    kpis.appendChild(kpi('Среднее', fmt(avg, 0), unit));
    kpis.appendChild(kpi('Максимум', fmt(maxVal, 0), unit, true));
    head.appendChild(kpis);
    card.appendChild(head);

    // область графика
    var plot = el('div', 'ec-plot');

    // сетка + подписи оси Y
    var grid = el('div', 'ec-grid');
    var lineCount = Math.round(scale.top / scale.step);
    for (var i = 0; i <= lineCount; i++) {
      var v = i * scale.step;
      var line = el('div', 'ec-gridline');
      line.style.bottom = (v / scale.top * 100) + '%';
      var lbl = el('div', 'ec-gridlabel', fmt(v, 0));
      lbl.style.top = '0';
      line.appendChild(lbl);
      grid.appendChild(line);
    }
    plot.appendChild(grid);

    // линия среднего
    var avgLine = el('div', 'ec-avg');
    avgLine.style.bottom = (avg / scale.top * 100) + '%';
    avgLine.appendChild(el('div', 'ec-avg-tag', 'среднее ' + fmt(avg, 0)));
    plot.appendChild(avgLine);

    // столбцы
    var bars = el('div', 'ec-bars');
    var tip = el('div', 'ec-tip');
    items.forEach(function (d, idx) {
      var col = el('div', 'ec-col' + (idx === maxIdx ? ' is-max' : ''));
      var hPct = Math.max(d.value / scale.top * 100, 0.5);

      var bar = el('div', 'ec-bar');
      col.style.setProperty('--h', hPct + '%');
      col.appendChild(bar);

      col.appendChild(el('div', 'ec-vlabel', fmt(d.value, 0)));

      var xl = el('div', 'ec-xlabel',
        MONTHS_SHORT[d.month - 1] + '<b>' + d.year + '</b>');
      col.appendChild(xl);

      // интерактив
      var prev = idx > 0 ? items[idx - 1].value : null;
      bindTip(col, tip, plot, d, prev, unit);

      bars.appendChild(col);
    });
    plot.appendChild(bars);
    plot.appendChild(tip);
    card.appendChild(plot);

    root.appendChild(card);

    // анимация появления: высоту задаём после кадра
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(bars.children, function (col) {
          col.querySelector('.ec-bar').style.height = 'var(--h)';
        });
      });
    });
    // стартовое состояние — нулевая высота
    Array.prototype.forEach.call(bars.children, function (col) {
      col.querySelector('.ec-bar').style.height = '0%';
    });

    return card;
  }

  function kpi(label, val, unit, isMax) {
    var k = el('div', 'ec-kpi' + (isMax ? ' is-max' : ''));
    k.appendChild(el('div', 'ec-kpi-lbl', label));
    k.appendChild(el('div', 'ec-kpi-val', val + ' <small>' + unit + '</small>'));
    return k;
  }

  function bindTip(col, tip, plot, d, prev, unit) {
    function show() {
      col.classList.add('is-active');
      var deltaHtml = '';
      if (prev != null && prev !== 0) {
        var diff = d.value - prev;
        var pct = (diff / prev) * 100;
        var dir = diff > 0.005 ? 'up' : diff < -0.005 ? 'down' : 'flat';
        var arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '—';
        deltaHtml = '<div class="ec-tip-d ' + dir + '">' + arrow + ' ' +
          (diff >= 0 ? '+' : '') + fmt(diff, 0) + ' (' +
          (pct >= 0 ? '+' : '') + fmt(pct, 1) + '%) к пред. мес.</div>';
      }
      tip.innerHTML =
        '<div class="ec-tip-m">' + cap(MONTHS_FULL[d.month - 1]) + ' ' + d.year + '</div>' +
        '<div class="ec-tip-v">' + fmt(d.value, 2) + ' <small>' + unit + '</small></div>' +
        deltaHtml;
      // позиция: центр столбца относительно .ec-plot
      var pr = plot.getBoundingClientRect();
      var cr = col.getBoundingClientRect();
      var bar = col.querySelector('.ec-bar');
      var br = bar.getBoundingClientRect();
      tip.style.left = (cr.left - pr.left + cr.width / 2) + 'px';
      tip.style.top  = (br.top - pr.top) + 'px';
      tip.classList.add('is-on');
    }
    function hide() {
      col.classList.remove('is-active');
      tip.classList.remove('is-on');
    }
    col.addEventListener('mouseenter', show);
    col.addEventListener('mousemove', show);
    col.addEventListener('mouseleave', hide);
    // тач: тап показывает/прячет
    col.addEventListener('click', function (e) {
      e.stopPropagation();
      if (col.classList.contains('is-active')) hide(); else show();
    });
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // авто-инициализация по data-атрибуту:
  //   <div data-enerone-chart='[{...}]'></div>
  function autoInit() {
    var nodes = document.querySelectorAll('[data-enerone-chart]');
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.__ecInited) return;
      node.__ecInited = true;
      try {
        var data = JSON.parse(node.getAttribute('data-enerone-chart'));
        var opts = {};
        if (node.getAttribute('data-title')) opts.title = node.getAttribute('data-title');
        if (node.getAttribute('data-unit'))  opts.unit  = node.getAttribute('data-unit');
        render(node, data, opts);
      } catch (err) {
        console.warn('[EneroneConsumptionChart] не удалось разобрать data-enerone-chart', err);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  global.EneroneConsumptionChart = { render: render, autoInit: autoInit };
})(typeof window !== 'undefined' ? window : this);

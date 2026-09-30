/* ==========================================================================
   ЛК — подсказки первого входа (главная)

   ПК (≥ 992px, виден сайдбар): пошаговый тур. Страница затемняется,
   цели шага подсвечиваются «окнами» в затемнении, у каждой цели — свой
   пузырь с текстом; в пузыре главной цели — счётчик и «Далее».

   Мобилка (< 992px): без затемнения. Подсказка всплывает, когда её цель
   доезжает до экрана при прокрутке, и гаснет по «Понятно» или когда цель
   уходит с экрана. Одновременно на экране — не больше одной.

   В прототипе тур стартует при каждой загрузке. В боевом проекте решение
   «показывать или нет» принимает бэкенд: снимите автостарт (AUTOSTART)
   и вызывайте window.LK.coach.start() сами, а окончание ловите через
   событие lk:coach-done на document (detail.skipped — пропустил ли юзер).

   Цели ищутся по селекторам из STEPS. Шаг без видимых целей пропускается —
   например, если по договору нет долга, кнопки «Оплатить» нет и подсказки
   про оплату не будет.
   ========================================================================== */
(function () {
  'use strict';

  var AUTOSTART = true;
  var DESKTOP = '(min-width: 992px)';

  // side — с какой стороны от цели ставить пузырь (если влезает),
  // desktop / mobile — в каком режиме подсказка нужна.
  var STEPS = [
    { hints: [
      { target: '.lk-layout .lk-sidebar [data-nav="readings"]', side: 'right', desktop: true, main: true,
        text: 'Передайте показания здесь' },
      { target: '[data-lk-coach="readings"]', side: 'top', mobile: true,
        text: 'Передайте показания здесь' }
    ] },
    { hints: [
      { target: '.lk-layout .lk-sidebar [data-nav="invoices"]', side: 'right', desktop: true, main: true,
        text: 'Посмотрите начисления и оплатите здесь' },
      { target: '[data-lk-coach="pay"]', side: 'bottom', mobile: true,
        text: 'Оплатите задолженность по договору здесь' }
    ] },
    { hints: [
      { target: '.lk-layout .lk-sidebar [data-nav="messages"]', side: 'right', desktop: true, main: true,
        text: 'Есть вопрос? Напишите нам' },
      { target: '[data-lk-coach="messages"]', side: 'top', mobile: true,
        text: 'Есть вопрос? Напишите нам' }
    ] }
  ];

  var GAP = 12;        // от цели до пузыря
  var EDGE = 12;       // минимальный отступ пузыря от края экрана
  var RING = 5;        // на сколько подсветка шире цели
  var ARROW_MIN = 16;  // ближе к углу пузыря стрелку не ставим

  var layer = null;    // общий слой в <body>: подсветки, пузыри, затемнение
  var mode = null;     // 'desktop' | 'mobile' | null
  var mq = window.matchMedia(DESKTOP);

  /* ---------- общее ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  // прямоугольник элемента в координатах слоя (слой лежит в начале документа,
  // но считаем относительно него честно — вдруг у body есть отступы)
  function rectOf(el) {
    var r = el.getBoundingClientRect(), base = layer.getBoundingClientRect();
    return { left: r.left - base.left, top: r.top - base.top, width: r.width, height: r.height,
             right: r.right - base.left, bottom: r.bottom - base.top };
  }

  // на мобилке шапка сайта прибита к верху окна — пузырь под неё не ставим
  function topInset() {
    var h = document.querySelector('.bs-header');
    if (!h) return 0;
    var pos = getComputedStyle(h).position;
    return pos === 'fixed' || pos === 'sticky' ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
  }

  // видимая область окна в координатах слоя; scrollTop — если окно
  // вот-вот прокрутится, считаем по будущему положению
  function viewOf(scrollTop) {
    var base = layer.getBoundingClientRect();
    var dy = scrollTop == null ? 0 : window.pageYOffset - scrollTop;
    return { left: -base.left, top: -base.top - dy + topInset(),
             right: -base.left + document.documentElement.clientWidth,
             bottom: -base.top - dy + window.innerHeight };
  }

  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement('div');
    // .lk — ради шрифта и токенов палитры; сам слой в поток не встаёт
    layer.className = 'lk lk-coach';
    document.body.appendChild(layer);
    return layer;
  }

  function radiusOf(el) {
    var r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    return r + RING;
  }

  function ring(el) {
    var r = rectOf(el), node = document.createElement('div');
    node.className = 'lk-coach-ring';
    node.style.cssText = 'left:' + (r.left - RING) + 'px;top:' + (r.top - RING) + 'px;' +
      'width:' + (r.width + RING * 2) + 'px;height:' + (r.height + RING * 2) + 'px;' +
      'border-radius:' + radiusOf(el) + 'px';
    layer.appendChild(node);
    return node;
  }

  // Пузырь ставим с предпочтительной стороны; если там не влезает в окно —
  // пробуем противоположную, потом остальные. Вдоль второй оси пузырь
  // прижимается к окну, а стрелка сдвигается, чтобы смотреть на центр цели.
  function place(bubble, el, side, view) {
    var t = rectOf(el);
    var w = bubble.offsetWidth, h = bubble.offsetHeight;
    var opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    var order = [side, opposite[side]].concat(
      ['top', 'bottom', 'right', 'left'].filter(function (s) { return s !== side && s !== opposite[side]; }));

    function fits(s) {
      if (s === 'top')    return t.top - GAP - h >= view.top + EDGE;
      if (s === 'bottom') return t.bottom + GAP + h <= view.bottom - EDGE;
      if (s === 'left')   return t.left - GAP - w >= view.left + EDGE;
      return t.right + GAP + w <= view.right - EDGE;
    }
    var s = order.filter(fits)[0] || side;

    var x, y, clamp = function (v, lo, hi) { return Math.max(lo, Math.min(v, hi)); };
    if (s === 'top' || s === 'bottom') {
      x = clamp(t.left + t.width / 2 - w / 2, view.left + EDGE, view.right - EDGE - w);
      y = s === 'top' ? t.top - GAP - h : t.bottom + GAP;
      bubble.style.setProperty('--lk-coach-arrow',
        clamp(t.left + t.width / 2 - x, ARROW_MIN, w - ARROW_MIN) + 'px');
    } else {
      y = clamp(t.top + t.height / 2 - h / 2, view.top + EDGE, view.bottom - EDGE - h);
      x = s === 'left' ? t.left - GAP - w : t.right + GAP;
      bubble.style.setProperty('--lk-coach-arrow',
        clamp(t.top + t.height / 2 - y, ARROW_MIN, h - ARROW_MIN) + 'px');
    }
    bubble.setAttribute('data-side', s);
    bubble.style.left = Math.round(x) + 'px';
    bubble.style.top = Math.round(y) + 'px';
  }

  function bubble(html, cls) {
    var node = document.createElement('div');
    node.className = 'lk-coach-tip' + (cls ? ' ' + cls : '');
    node.innerHTML = html;
    layer.appendChild(node);
    return node;
  }

  function clear() {
    if (layer) layer.innerHTML = '';
  }

  /* ---------- ПК: пошаговый тур ---------- */

  var tour = null;     // { steps, i, onKey, onResize }

  // шаги с найденными целями: невидимые подсказки и пустые шаги выкидываем
  function desktopSteps() {
    return STEPS.map(function (step) {
      var hints = step.hints.filter(function (h) { return h.desktop; }).map(function (h) {
        return { el: document.querySelector(h.target), side: h.side, text: h.text, main: h.main };
      }).filter(function (h) { return visible(h.el); });
      // если главная цель пропала, счётчик и кнопки уезжают к оставшейся
      if (hints.length && !hints.some(function (h) { return h.main; })) hints[0].main = true;
      return hints;
    }).filter(function (hints) { return hints.length; });
  }

  // Прокрутка к шагу. У каждой цели — запас под её пузырь (сверху или снизу).
  // Если весь шаг влезает в окно — показываем его целиком; если нет — главная
  // цель обязательно на экране, остальные — насколько получится.
  var ROOM = 120;      // запас под пузырь над / под целью
  var PAD = 16;

  function scrollFor(hints) {
    var inset = topInset();
    var vh = window.innerHeight - inset, y0 = window.pageYOffset + inset;
    var boxes = hints.map(function (h) {
      var r = h.el.getBoundingClientRect();
      return { main: h.main, rawBottom: r.bottom + y0,
               top: r.top + y0 - (h.side === 'top' ? ROOM : PAD),
               bottom: r.bottom + y0 + (h.side === 'bottom' ? ROOM : PAD) };
    });
    var top = Math.min.apply(null, boxes.map(function (b) { return b.top; }));
    var bottom = Math.max.apply(null, boxes.map(function (b) { return b.bottom; }));
    var y;
    if (top >= y0 && bottom <= y0 + vh) return window.pageYOffset;   // уже на экране
    if (bottom - top <= vh) {
      y = (top + bottom) / 2 - vh / 2;
    } else {
      var m = boxes.filter(function (b) { return b.main; })[0];
      // как можно выше, но чтобы главная цель (с рамкой) не уехала за низ окна
      y = Math.min(m.top, Math.max(top, m.rawBottom + RING + 2 - vh));
    }
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(max, Math.round(y - inset)));
  }

  // цель хотя бы частично попадает в окно (по будущему положению прокрутки)
  function inView(el, view) {
    var r = rectOf(el);
    return r.bottom > view.top && r.top < view.bottom;
  }

  // затемнение с «окнами» под цели: один path с правилом evenodd,
  // поэтому окна прозрачны и для кликов — по цели можно сразу нажать
  function shade(hints) {
    var doc = document.documentElement;
    var w = Math.max(doc.scrollWidth, doc.clientWidth), h = Math.max(doc.scrollHeight, doc.clientHeight);
    var base = layer.getBoundingClientRect();
    var ox = -base.left - window.pageXOffset, oy = -base.top - window.pageYOffset;
    var d = 'M' + ox + ' ' + oy + 'h' + w + 'v' + h + 'h' + (-w) + 'Z';
    hints.forEach(function (hint) {
      var r = rectOf(hint.el), rad = radiusOf(hint.el);
      var x = r.left - RING, y = r.top - RING, rw = r.width + RING * 2, rh = r.height + RING * 2;
      d += 'M' + (x + rad) + ' ' + y + 'h' + (rw - rad * 2) +
        'a' + rad + ' ' + rad + ' 0 0 1 ' + rad + ' ' + rad + 'v' + (rh - rad * 2) +
        'a' + rad + ' ' + rad + ' 0 0 1 ' + (-rad) + ' ' + rad + 'h' + (-(rw - rad * 2)) +
        'a' + rad + ' ' + rad + ' 0 0 1 ' + (-rad) + ' ' + (-rad) + 'v' + (-(rh - rad * 2)) +
        'a' + rad + ' ' + rad + ' 0 0 1 ' + rad + ' ' + (-rad) + 'Z';
    });
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'lk-coach-shade');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'left:' + ox + 'px;top:' + oy + 'px';
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', ox + ' ' + oy + ' ' + w + ' ' + h);
    svg.innerHTML = '<path fill-rule="evenodd" d="' + d + '"/>';
    layer.appendChild(svg);
  }

  function renderStep(scrollTop) {
    clear();
    var hints = tour.steps[tour.i], last = tour.i === tour.steps.length - 1;
    var view = viewOf(scrollTop);
    shade(hints);
    var focusBtn = null;
    hints.forEach(function (hint) {
      ring(hint.el);
      var html = '<p class="lk-coach-text">' + esc(hint.text) + '</p>';
      if (hint.main) {
        html += '<div class="lk-coach-foot">' +
          '<span class="lk-coach-count">' + (tour.i + 1) + ' из ' + tour.steps.length + '</span>' +
          (last ? '' : '<button type="button" class="lk-coach-skip" data-coach-skip>Пропустить</button>') +
          '<button type="button" class="lk-coach-next" data-coach-next>' + (last ? 'Понятно' : 'Далее') + '</button>' +
          '</div>';
      }
      // пузырь у цели за краем окна указывал бы в пустоту — остаётся только рамка
      if (!hint.main && !inView(hint.el, view)) return;
      var b = bubble(html, hint.main ? 'is-main' : '');
      if (hint.main) {
        b.setAttribute('role', 'dialog');
        b.setAttribute('aria-label', 'Подсказка ' + (tour.i + 1) + ' из ' + tour.steps.length);
        b.querySelector('[data-coach-next]').addEventListener('click', next);
        var skip = b.querySelector('[data-coach-skip]');
        if (skip) skip.addEventListener('click', function () { stop(true); });
        focusBtn = b.querySelector('[data-coach-next]');
      }
      place(b, hint.el, hint.side, view);
    });
    if (focusBtn) focusBtn.focus({ preventScroll: true });
  }

  function showStep() {
    var y = scrollFor(tour.steps[tour.i]);
    if (y !== window.pageYOffset) window.scrollTo({ top: y, behavior: 'smooth' });
    // пузыри раскладываем сразу по будущему положению окна — без скачка после прокрутки
    renderStep(y);
  }

  function next() {
    if (tour.i < tour.steps.length - 1) { tour.i++; showStep(); }
    else stop(false);
  }

  function startDesktop() {
    var steps = desktopSteps();
    if (!steps.length) return;
    ensureLayer();
    layer.classList.add('is-tour');
    var resizeTimer = null;
    tour = {
      steps: steps, i: 0,
      onKey: function (e) { if (e.key === 'Escape') stop(true); },
      // при ресайзе раскладку пересчитываем, прокрутку не трогаем
      onResize: function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { if (tour) renderStep(null); }, 120);
      }
    };
    document.addEventListener('keydown', tour.onKey);
    window.addEventListener('resize', tour.onResize);
    showStep();
  }

  function stopDesktop() {
    if (!tour) return;
    document.removeEventListener('keydown', tour.onKey);
    window.removeEventListener('resize', tour.onResize);
    tour = null;
  }

  /* ---------- мобилка: подсказки при прокрутке ---------- */

  var scroll = null;   // { io, items, current, onResize }

  function mobileItems() {
    var items = [];
    STEPS.forEach(function (step) {
      step.hints.forEach(function (h) {
        if (!h.mobile) return;
        var el = document.querySelector(h.target);
        if (el) items.push({ el: el, side: h.side, text: h.text, seen: false, inView: false, node: null });
      });
    });
    return items;
  }

  function showMobile(item) {
    scroll.current = item;
    item.ring = ring(item.el);
    item.node = bubble(
      '<p class="lk-coach-text">' + esc(item.text) + '</p>' +
      '<button type="button" class="lk-coach-ok" data-coach-ok>Понятно</button>', 'is-main');
    item.node.setAttribute('role', 'status');
    item.node.querySelector('[data-coach-ok]').addEventListener('click', function () { hideMobile(item); });
    place(item.node, item.el, item.side, viewOf(null));
  }

  function hideMobile(item) {
    item.seen = true;
    if (item.node) item.node.remove();
    if (item.ring) item.ring.remove();
    item.node = item.ring = null;
    if (scroll.current === item) scroll.current = null;
    pickMobile();
  }

  // следующая по порядку на странице подсказка, чья цель сейчас на экране
  function pickMobile() {
    if (!scroll || scroll.current) return;
    var free = scroll.items.filter(function (it) { return !it.seen && it.inView && visible(it.el); });
    if (!free.length) {
      if (scroll.items.every(function (it) { return it.seen; })) stop(false);
      return;
    }
    free.sort(function (a, b) {
      return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    showMobile(free[0]);
  }

  function startMobile() {
    if (!('IntersectionObserver' in window)) return;
    var items = mobileItems();
    if (!items.length) return;
    ensureLayer();
    scroll = { items: items, current: null };
    // цель «на экране» — целиком видна и не прижата к нижнему краю:
    // пузырь сверху от неё должен успеть поместиться
    scroll.io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var item = items.filter(function (it) { return it.el === e.target; })[0];
        if (!item) return;
        item.inView = e.isIntersecting && e.intersectionRatio > 0.99;
        if (!e.isIntersecting && scroll.current === item) hideMobile(item);
      });
      pickMobile();
    }, { rootMargin: '-15% 0px -20% 0px', threshold: [0, 1] });
    items.forEach(function (it) { scroll.io.observe(it.el); });
    scroll.onResize = function () {
      var it = scroll && scroll.current;
      if (!it) return;
      it.ring.remove(); it.ring = ring(it.el);
      place(it.node, it.el, it.side, viewOf(null));
    };
    window.addEventListener('resize', scroll.onResize);
  }

  function stopMobile() {
    if (!scroll) return;
    scroll.io.disconnect();
    window.removeEventListener('resize', scroll.onResize);
    scroll = null;
  }

  /* ---------- управление ---------- */

  function start() {
    stop(null);
    mode = mq.matches ? 'desktop' : 'mobile';
    if (mode === 'desktop') startDesktop(); else startMobile();
  }

  // skipped: true — закрыл досрочно, false — дошёл до конца,
  // null — служебная остановка (перезапуск, смена режима), событие не шлём
  function stop(skipped) {
    stopDesktop();
    stopMobile();
    if (layer) { clear(); layer.classList.remove('is-tour'); }
    var was = mode;
    mode = null;
    if (was && skipped !== null) {
      document.dispatchEvent(new CustomEvent('lk:coach-done', { detail: { skipped: skipped } }));
    }
  }

  function init() {
    // ширина пересекла 992px — тур и подсказки при прокрутке устроены по-разному,
    // поэтому незаконченный показ начинаем заново в нужном режиме
    var onChange = function () { if (mode) start(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);

    document.querySelectorAll('[data-lk-coach-restart]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.scrollTo(0, 0);
        start();
      });
    });

    // даём странице дорисоваться (шрифты, одометры), иначе рамки встанут мимо
    if (AUTOSTART) setTimeout(start, 600);
  }

  window.LK = window.LK || {};
  window.LK.coach = { start: start, stop: function () { stop(true); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

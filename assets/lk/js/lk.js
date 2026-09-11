/* ==========================================================================
   ЛК «Новая энергия» — скрипты личного кабинета (прототип)
   Изолировано в IIFE, чтобы не конфликтовать со скриптами боевого сайта.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Мобильный сайдбар ---------- */
  function initSidebar() {
    var sidebar = document.querySelector('[data-lk-sidebar]');
    var burger  = document.querySelector('[data-lk-burger]');
    if (!sidebar || !burger) return;

    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      sidebar.classList.toggle('is-open');
    });

    document.addEventListener('click', function (e) {
      if (!sidebar.classList.contains('is-open')) return;
      if (sidebar.contains(e.target) || burger.contains(e.target)) return;
      sidebar.classList.remove('is-open');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sidebar.classList.remove('is-open');
    });
  }

  /* ---------- Демо: переключение состояния баланса ----------
     Показывает, как выглядит сводная карточка при задолженности
     и при переплате. В боевой версии значения приходят с бэкенда. */
  var BALANCE_STATES = {
    debt: {
      mod:   'lk-stat lk-stat--red',
      label: 'Задолженность',
      valMod: 'lk-stat-val is-danger',
      val:   '− 187 432 ₽',
      hint:  'По всем договорам'
    },
    overpay: {
      mod:   'lk-stat lk-stat--overpay',
      label: 'Переплата',
      valMod: 'lk-stat-val is-overpay',
      val:   '+ 12 450 ₽',
      hint:  'Зачтётся в следующем периоде'
    }
  };

  function applyBalanceState(name) {
    var state = BALANCE_STATES[name];
    var card  = document.getElementById('lk-balance-card');
    if (!state || !card) return;

    card.className = state.mod;
    card.querySelector('[data-balance-label]').textContent = state.label;
    card.querySelector('[data-balance-hint]').textContent  = state.hint;

    var valEl = card.querySelector('[data-balance-val]');
    valEl.className   = state.valMod;
    valEl.textContent = state.val;
  }

  function initDemoSwitch() {
    document.querySelectorAll('[data-balance-state]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyBalanceState(btn.getAttribute('data-balance-state'));
      });
    });
  }

  /* ---------- Подробная информация об объекте ----------
     Кнопка «i» рядом с объектом раскрывает плашку с параметрами
     (тариф, группа и уровень мощности, ценовая категория, цена). */
  function initObjectInfo() {
    document.querySelectorAll('[data-lk-obj-toggle]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('data-lk-obj-toggle'));
      if (!panel) return;

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
  }

  /* ---------- Тултипы ----------
     Любой элемент с data-lk-tip="текст". На устройствах с мышью — по наведению
     и по фокусу с клавиатуры, на тач-устройствах — по тапу.
     Экспортируется как window.LK.refreshTips() для динамической разметки. */
  var tipEl = null;
  var tipOwner = null;
  var canHover = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function tipNode() {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'lk-tip';
      tipEl.setAttribute('role', 'tooltip');
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }

  function showTip(trigger) {
    var text = trigger.getAttribute('data-lk-tip');
    if (!text) return;

    var t = tipNode();
    t.textContent = text;
    t.style.left = '0px';
    t.style.top = '0px';
    t.style.setProperty('--lk-tip-arrow', '50%');
    t.classList.add('is-on');

    var r = trigger.getBoundingClientRect();
    var w = t.offsetWidth;
    var vw = document.documentElement.clientWidth;
    var pad = 8;

    // координаты страницы, а не окна: тултип едет вместе с контентом
    var center = r.left + r.width / 2;
    var clamped = Math.min(Math.max(center, w / 2 + pad), vw - w / 2 - pad);

    t.style.left = (clamped + window.pageXOffset) + 'px';
    t.style.top = (r.top + window.pageYOffset) + 'px';
    // стрелка остаётся под иконкой, даже если тултип сдвинут от края экрана
    t.style.setProperty('--lk-tip-arrow', (w / 2 + (center - clamped)) + 'px');

    tipOwner = trigger;
  }

  function hideTip() {
    if (tipEl) tipEl.classList.remove('is-on');
    tipOwner = null;
  }

  function bindTip(trigger) {
    if (trigger.__lkTip) return;
    trigger.__lkTip = true;

    if (!trigger.hasAttribute('tabindex')) trigger.setAttribute('tabindex', '0');

    if (canHover) {
      trigger.addEventListener('mouseenter', function () { showTip(trigger); });
      trigger.addEventListener('mouseleave', hideTip);
      trigger.addEventListener('focus', function () { showTip(trigger); });
      trigger.addEventListener('blur', hideTip);
    }

    // тап работает всегда: и на телефоне, и как запасной способ на десктопе
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (tipOwner === trigger) hideTip(); else showTip(trigger);
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideTip();
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showTip(trigger); }
    });
  }

  function refreshTips() {
    document.querySelectorAll('[data-lk-tip]').forEach(bindTip);
  }

  function initTips() {
    refreshTips();
    document.addEventListener('click', hideTip);
    window.addEventListener('resize', hideTip);
  }

  /* ---------- Модальные окна ----------
     Открывает [data-lk-modal-open="id"], закрывает [data-lk-modal-close],
     Esc и клик по подложке. Используется нативный <dialog>. */
  function openModal(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');           // запасной вариант

    var first = dlg.querySelector('input, textarea, select');
    if (first) first.focus();
  }

  function closeModal(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  }

  function initModals() {
    document.querySelectorAll('[data-lk-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(document.getElementById(btn.getAttribute('data-lk-modal-open')));
      });
    });

    document.querySelectorAll('[data-lk-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeModal(btn.closest('.lk-modal'));
      });
    });

    // клик по подложке: цель события — сам <dialog>, а не его содержимое
    document.querySelectorAll('.lk-modal').forEach(function (dlg) {
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) closeModal(dlg);
      });
    });
  }

  /* ---------- Привязка договора ----------
     Прототип: бэкенда нет, поэтому отправка всегда возвращает ответ
     «договор не найден». Реальный запрос подставляется в submitContract(). */
  function initAddContract() {
    var form = document.getElementById('lk-add-contract-form');
    if (!form) return;

    var input = form.querySelector('.lk-input');
    var err   = form.querySelector('[data-form-err]');
    var alert = form.querySelector('[data-form-alert]');
    var submit = form.querySelector('[type="submit"]');

    function clearState() {
      input.classList.remove('is-invalid');
      err.hidden = true;
      alert.hidden = true;
    }

    input.addEventListener('input', clearState);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearState();

      var value = input.value.trim();
      if (!value) {
        input.classList.add('is-invalid');
        err.hidden = false;
        err.textContent = 'Укажите номер договора';
        input.focus();
        return;
      }

      submit.disabled = true;
      submit.textContent = 'Отправка…';

      submitContract(value, function () {
        submit.disabled = false;
        submit.textContent = 'Отправить';
        input.classList.add('is-invalid');
        alert.hidden = false;

        // «Напишите нам» ведёт в «Сообщения» с готовой темой и черновиком
        var link = alert.querySelector('.lk-alert-link');
        if (link) {
          link.href = 'feedback.html?new=1&topic=t-changes&text=' +
            encodeURIComponent('Не удалось привязать договор № ' + value +
                               ' в личном кабинете. Прошу проверить.');
          link.removeAttribute('data-lk-action');
        }
      });
    });
  }

  // заглушка ответа сервера: здесь будет реальный запрос привязки
  function submitContract(number, onError) {
    console.log('[ЛК] привязка договора:', number);
    setTimeout(function () { onError(); }, 400);
  }

  /* ---------- Селект с поиском (комбобокс) ----------
     Работает поверх обычного <select data-lk-combo>: сам селект прячем,
     рядом строим поле ввода и список. Без JS остаётся рабочий нативный селект,
     бэкенду достаточно отдавать <option>.

     Поиск — по вхождению в любом месте строки, регистр и ё/е не важны.
     Значение пишется обратно в <select>, оттуда его и заберёт форма;
     на селекте вызывается событие change. */

  var comboSeq = 0;

  // «ё» и регистр не должны мешать поиску
  function comboNorm(s) {
    return String(s).toLowerCase().replace(/ё/g, 'е');
  }

  function comboMark(text, query) {
    if (!query) return escapeHtml(text);
    var i = comboNorm(text).indexOf(comboNorm(query));
    if (i < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, i)) +
           '<mark>' + escapeHtml(text.slice(i, i + query.length)) + '</mark>' +
           escapeHtml(text.slice(i + query.length));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function initCombos() {
    document.querySelectorAll('[data-lk-combo]').forEach(buildCombo);
  }

  function buildCombo(root) {
    var select = root.querySelector('select');
    if (!select) return;

    // Комбобокс могли построить раньше — например, страница наполнила <select>
    // данными уже после старта lk.js и позвала initCombos повторно.
    // Собираем заново из актуальных <option>, а не дублируем разметку.
    root.querySelectorAll('.lk-combo-input, .lk-combo-btns, .lk-combo-list')
        .forEach(function (n) { n.remove(); });
    root.classList.remove('is-open');

    // пустой disabled-пункт — это плейсхолдер, в списке он не нужен
    var items = Array.prototype.filter.call(select.options, function (o) {
      return o.value !== '';
    }).map(function (o) {
      return { value: o.value, label: o.textContent.trim() };
    });

    var id = 'lk-combo-' + (++comboSeq);
    var placeholder = root.getAttribute('data-placeholder') || 'Начните вводить';

    select.hidden = true;
    select.tabIndex = -1;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'lk-combo-input';
    input.id = id + '-input';
    input.autocomplete = 'off';
    input.placeholder = placeholder;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', id + '-list');
    input.setAttribute('aria-autocomplete', 'list');

    // подпись селекта должна указывать на поле, в которое реально печатают
    var label = select.id && document.querySelector('label[for="' + select.id + '"]');
    if (label) label.setAttribute('for', input.id);

    var btns = document.createElement('div');
    btns.className = 'lk-combo-btns';
    btns.innerHTML =
      '<button type="button" class="lk-combo-clear" aria-label="Очистить" hidden>' +
        '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1l-8 8"/></svg>' +
      '</button>' +
      '<button type="button" class="lk-combo-arrow" tabindex="-1" aria-label="Показать список">' +
        '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5L6 6.5l5-5"/></svg>' +
      '</button>';

    var list = document.createElement('ul');
    list.className = 'lk-combo-list';
    list.id = id + '-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;

    root.appendChild(input);
    root.appendChild(btns);
    root.appendChild(list);

    var clear = btns.querySelector('.lk-combo-clear');
    var arrow = btns.querySelector('.lk-combo-arrow');

    var shown = [];        // что сейчас в списке
    var active = -1;       // подсвеченный пункт
    var picked = null;     // выбранное значение

    function open() {
      if (!list.hidden) return;
      render(input.value === labelOf(picked) ? '' : input.value);
      list.hidden = false;
      root.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
    }

    function close() {
      if (list.hidden) return;
      list.hidden = true;
      root.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
      // ушли, ничего не выбрав — возвращаем прежнее значение, а не обрывок запроса
      input.value = labelOf(picked);
      clear.hidden = !picked;
    }

    // в поле показываем только value (номер договора) — название организации
    // нужно, чтобы найти договор, а не чтобы занимать поле после выбора
    function labelOf(value) {
      return value || '';
    }

    function render(query) {
      query = (query || '').trim();
      var q = comboNorm(query);

      var found = q
        ? items.filter(function (it) { return comboNorm(it.label).indexOf(q) >= 0; })
        : items;

      shown = found;
      active = -1;
      list.innerHTML = '';

      if (!found.length) {
        var empty = document.createElement('li');
        empty.className = 'lk-combo-empty';
        empty.textContent = 'Ничего не найдено';
        list.appendChild(empty);
        return;
      }

      shown.forEach(function (it, i) {
        var li = document.createElement('li');
        li.className = 'lk-combo-opt' + (it.value === picked ? ' is-picked' : '');
        li.id = id + '-opt-' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(it.value === picked));
        li.innerHTML = comboMark(it.label, query);

        // mousedown, а не click: blur поля не должен успеть закрыть список
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          pick(it);
        });
        list.appendChild(li);
      });
    }

    function setActive(i) {
      var opts = list.querySelectorAll('.lk-combo-opt');
      if (!opts.length) return;

      if (active >= 0 && opts[active]) opts[active].classList.remove('is-active');
      active = (i + opts.length) % opts.length;
      opts[active].classList.add('is-active');
      input.setAttribute('aria-activedescendant', opts[active].id);

      var el = opts[active];
      var top = el.offsetTop, bottom = top + el.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top - 4;
      else if (bottom > list.scrollTop + list.clientHeight) {
        list.scrollTop = bottom - list.clientHeight + 4;
      }
    }

    function pick(it) {
      picked = it.value;
      select.value = it.value;
      input.value = labelOf(it.value);
      clear.hidden = false;
      close();
      select.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[ЛК] выбран договор:', it.value);
    }

    function reset() {
      picked = null;
      select.value = '';
      input.value = '';
      clear.hidden = true;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
      open();
    }

    input.addEventListener('input', function () {
      if (list.hidden) { list.hidden = false; root.classList.add('is-open');
                         input.setAttribute('aria-expanded', 'true'); }
      render(input.value);
      list.scrollTop = 0;
    });

    input.addEventListener('focus', open);
    input.addEventListener('mousedown', function () { setTimeout(open, 0); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (list.hidden) { open(); setActive(0); return; }
        setActive(active + (e.key === 'ArrowDown' ? 1 : -1));
        return;
      }
      if (e.key === 'Enter') {
        var opts = list.querySelectorAll('.lk-combo-opt');
        if (!list.hidden && active >= 0 && opts[active]) {
          e.preventDefault();
          pick(shown[active]);
        }
        return;
      }
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') close();
    });

    input.addEventListener('blur', function () { setTimeout(close, 0); });

    arrow.addEventListener('mousedown', function (e) {
      e.preventDefault();
      if (list.hidden) { input.focus(); open(); } else { close(); input.focus(); }
    });

    clear.addEventListener('mousedown', function (e) { e.preventDefault(); reset(); });

    // значение могло быть выбрано в разметке заранее
    if (select.value) {
      picked = select.value;
      input.value = labelOf(picked);
      clear.hidden = false;
    }
  }

  /* ---------- Заглушки действий ----------
     В прототипе действия ЛК не подключены к бэкенду — логируем намерение.
     Каждый элемент помечен data-lk-action="…". */
  function initActions() {
    document.querySelectorAll('[data-lk-action]').forEach(function (el) {
      el.addEventListener('click', function () {
        var action = el.getAttribute('data-lk-action');
        console.log('[ЛК] действие:', action);
      });
    });
  }

  function init() {
    initSidebar();
    initDemoSwitch();
    initObjectInfo();
    initTips();
    initModals();
    initAddContract();
    initActions();
    initCombos();
  }

  // публичный хук для страниц, которые дорисовывают разметку на лету
  window.LK = window.LK || {};
  window.LK.refreshTips = refreshTips;
  window.LK.hideTip = hideTip;
  window.LK.openModal = openModal;
  // страницы, которые наполняют <select> из данных, зовут его после отрисовки
  window.LK.initCombos = initCombos;
  window.LK.closeModal = closeModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

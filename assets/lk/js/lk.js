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
      val:   '187 432 ₽',
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
  }

  // публичный хук для страниц, которые дорисовывают разметку на лету
  window.LK = window.LK || {};
  window.LK.refreshTips = refreshTips;
  window.LK.hideTip = hideTip;
  window.LK.openModal = openModal;
  window.LK.closeModal = closeModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

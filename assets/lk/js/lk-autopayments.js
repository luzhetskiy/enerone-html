/* ==========================================================================
   ЛК «Новая энергия» — страница «Автоплатежи» (прототип)

   1. Подключённые автоплатежи: договор, карта, максимальная сумма, отключение.
      Отключение бывает двух видов — сразу кнопкой (selfDisable: true)
      или заявкой менеджеру (selfDisable: false).
   2. Форма подключения с теми же параметрами.
   3. Привязанные карты с удалением.
   4. Привязка новой карты через платёжную систему.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     ДАННЫЕ. В боевой версии приходят с бэкенда.
     ====================================================================== */

  var CONTRACTS = [
    { num: 'ДЭС740201104', service: 'Энергоснабжение' },
    { num: 'ДЭС740201287', service: 'Энергоснабжение' }
  ];

  var CARDS = [
    { id: 'card-1', mask: '220015xxxxxx2861', system: 'МИР',  expires: '09/28' },
    { id: 'card-2', mask: '427901xxxxxx5514', system: 'Visa', expires: '04/27' }
  ];

  var AUTOPAYS = [
    // отключается самостоятельно
    { id: 'ap-1', contract: 'ДЭС740201104', cardId: 'card-1', limit: 200000, selfDisable: true },
    // отключение только через менеджера
    { id: 'ap-2', contract: 'ДЭС740201287', cardId: 'card-2', limit: 50000,  selfDisable: false }
  ];

  var LIMIT_MAX = 5000000;

  // Условия привязки карты. Выводятся в двух местах — в блоке «Привязать карту»
  // и в форме автоплатежа при выборе «Новая карта», поэтому текст лежит здесь.
  var NEW_CARD = 'new';

  var BIND_NOTES =
    '<p class="lk-bind-note">' +
      'Для регистрации и привязки карты к аккаунту, для совершения автоплатежей в дальнейшем, ' +
      'вы будете перенаправлены на страницу платёжной системы ГазПромБанк.' +
    '</p>' +
    '<p class="lk-bind-note">' +
      'В процессе регистрации карты с вашего счёта будет снята сумма в размере ' +
      '<b>1 руб.</b> для подтверждения. Она вернётся на карту автоматически.' +
    '</p>';

  /* ======================================================================
     Утилиты
     ====================================================================== */

  function money(v) {
    return v.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function cardById(id) {
    return CARDS.filter(function (c) { return c.id === id; })[0];
  }

  function cardLabel(card) {
    return card ? card.system + ' · ' + card.mask : 'карта удалена';
  }

  var ICO_CARD = '<svg viewBox="0 0 16 16" aria-hidden="true">' +
                 '<rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M1.5 6.5h13"/></svg>';
  var ICO_MSG  = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
                 '<path d="M2 2.5h10v7l-4.5 0L4.5 12V9.5H2z" stroke-linejoin="round"/></svg>';
  var ICO_TRASH = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
                  '<path d="M2.5 3.5h9M5.5 3.5V2.2h3v1.3M3.6 3.5l.5 8h5.8l.5-8" stroke-linejoin="round"/></svg>';

  var n = {};

  /* ======================================================================
     Подтверждение действия
     ====================================================================== */

  var confirmAction = null;

  function ask(title, text, okText, onOk) {
    n.confirmTitle.textContent = title;
    n.confirmText.innerHTML = text;
    n.confirmOk.textContent = okText;
    confirmAction = onOk;
    if (window.LK && window.LK.openModal) window.LK.openModal(n.confirm);
  }

  function initConfirm() {
    n.confirm      = document.getElementById('lk-confirm');
    n.confirmTitle = n.confirm.querySelector('[data-confirm-title]');
    n.confirmText  = n.confirm.querySelector('[data-confirm-text]');
    n.confirmOk    = n.confirm.querySelector('[data-confirm-ok]');

    n.confirmOk.addEventListener('click', function () {
      if (confirmAction) confirmAction();
      confirmAction = null;
      if (window.LK && window.LK.closeModal) window.LK.closeModal(n.confirm);
    });
  }

  /* ======================================================================
     1. Подключённые автоплатежи
     ====================================================================== */

  function renderAutopays() {
    n.list.innerHTML = '';

    if (!AUTOPAYS.length) {
      var empty = document.createElement('div');
      empty.className = 'lk-panel';
      empty.innerHTML =
        '<div class="lk-empty">' +
          '<p class="lk-empty-text">Автоплатежей пока нет. С автоплатежом счёт списывается ' +
          'в день выставления и без комиссии банка.</p>' +
          '<button type="button" class="lk-btn-primary" data-ap-open>Подключить автоплатёж</button>' +
        '</div>';
      empty.querySelector('[data-ap-open]').addEventListener('click', function () { openForm(); });
      n.list.appendChild(empty);
      return;
    }

    var wrap = document.createElement('div');
    wrap.className = 'lk-table-wrap';
    wrap.innerHTML =
      '<table class="lk-table lk-table--cards lk-ap">' +
        '<thead><tr>' +
          '<th scope="col">Договор</th>' +
          '<th scope="col">Карта</th>' +
          '<th scope="col">Максимальная сумма</th>' +
          '<th scope="col"><span class="lk-visually-hidden">Отключение</span></th>' +
        '</tr></thead>' +
        '<tbody></tbody>' +
      '</table>';

    var tbody = wrap.querySelector('tbody');

    AUTOPAYS.forEach(function (ap) {
      var card = cardById(ap.cardId);

      var offHtml = ap.selfDisable
        ? '<div class="lk-ap-off"><button type="button" class="lk-btn-off">Отключить</button></div>'
        : '<div class="lk-ap-off"><a class="lk-ap-request" href="#">' + ICO_MSG +
          'Запросить отключение</a></div>';

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td data-label="Договор"><span class="lk-ap-contract">№ ' + esc(ap.contract) + '</span></td>' +
        '<td data-label="Карта">' +
          '<span class="lk-card-line">' +
            '<span class="lk-card-chip" aria-hidden="true">' + ICO_CARD + '</span>' +
            '<span class="lk-card-num">' + esc(card ? card.mask : '—') +
              '<span class="lk-card-meta">' + esc(card ? card.system + ' · до ' + card.expires : 'карта удалена') +
              '</span>' +
            '</span>' +
          '</span>' +
        '</td>' +
        '<td data-label="Максимальная сумма"><span class="lk-ap-limit">' + money(ap.limit) +
          '<span class="lk-ap-limit-note">за один платёж</span></span></td>' +
        '<td data-label="Отключение">' + offHtml + '</td>';

      if (ap.selfDisable) {
        tr.querySelector('.lk-btn-off').addEventListener('click', function () {
          ask('Отключить автоплатёж?',
              'Автоплатёж по договору <b>№ ' + esc(ap.contract) + '</b> будет отключён. ' +
              'Счета придётся оплачивать вручную, с комиссией банка.',
              'Отключить',
              function () { disable(ap); });
        });
      } else {
        var link = tr.querySelector('.lk-ap-request');
        link.href = 'feedback.html?new=1&topic=t-changes' +
          '&contract=' + encodeURIComponent(ap.contract) +
          '&text=' + encodeURIComponent(
            'Прошу отключить автоплатёж по договору № ' + ap.contract +
            ' (карта ' + cardLabel(card) + ', максимальная сумма ' + money(ap.limit) + ').');
      }

      tbody.appendChild(tr);
    });

    n.list.appendChild(wrap);
  }

  function disable(ap) {
    AUTOPAYS = AUTOPAYS.filter(function (x) { return x !== ap; });
    console.log('[ЛК] автоплатёж отключён:', ap.contract);
    renderAll();
    showSaved('Автоплатёж по договору № ' + ap.contract + ' отключён.');
  }

  /* ======================================================================
     2. Форма подключения
     ====================================================================== */

  function freeContracts() {
    var busy = {};
    AUTOPAYS.forEach(function (ap) { busy[ap.contract] = true; });
    return CONTRACTS.filter(function (c) { return !busy[c.num]; });
  }

  function fillFormSelects() {
    var free = freeContracts();

    n.contract.innerHTML = '<option value="" disabled selected>Выберите договор</option>' +
      free.map(function (c) {
        return '<option value="' + esc(c.num) + '">№ ' + esc(c.num) + '</option>';
      }).join('');

    n.card.innerHTML = '<option value="" disabled selected>Выберите карту</option>' +
      CARDS.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(cardLabel(c)) + '</option>';
      }).join('') +
      '<option value="' + NEW_CARD + '">Новая карта</option>';

    syncNewCard();

    // подключать не к чему — объясняем, почему форма недоступна.
    // Отсутствие карт больше не блокирует: можно выбрать «Новая карта».
    var noContracts = !free.length;

    n.form.querySelector('[type="submit"]').disabled = noContracts;
    n.hint.innerHTML = noContracts
      ? 'Автоплатежи подключены по всем договорам.'
      : !CARDS.length
        ? 'Привязанных карт пока нет — выберите «Новая карта», и мы отправим вас в банк для привязки.'
        : 'Списание проходит в день выставления счёта. Если сумма счёта больше максимальной, ' +
          'автоплатёж не сработает — счёт нужно будет оплатить вручную.';
  }

  // подсказка про привязку показывается, только когда выбрана «Новая карта»
  function syncNewCard() {
    if (!n.newCard) return;
    n.newCard.hidden = n.card.value !== NEW_CARD;
  }

  function openForm() {
    fillFormSelects();
    n.panel.hidden = false;
    n.bar.hidden = true;
    n.toggle.setAttribute('aria-expanded', 'true');
    n.saved.hidden = true;
    n.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    n.contract.focus({ preventScroll: true });
  }

  function closeForm() {
    n.panel.hidden = true;
    n.bar.hidden = false;
    n.toggle.setAttribute('aria-expanded', 'false');
  }

  function showSaved(text) {
    n.savedText.textContent = text;
    n.saved.hidden = false;
  }

  function readLimit() {
    var raw = n.form.limit.value.trim().replace(/\s/g, '').replace(',', '.');
    if (raw === '') return { error: 'Укажите максимальную сумму' };
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return { error: 'Введите сумму числом' };
    var v = parseFloat(raw);
    if (v <= 0) return { error: 'Сумма должна быть больше нуля' };
    if (v > LIMIT_MAX) return { error: 'Максимум — ' + money(LIMIT_MAX) };
    return { value: v };
  }

  function initForm() {
    n.form     = document.getElementById('lk-ap-form');
    n.panel    = document.getElementById('lk-ap-panel');
    n.bar      = document.getElementById('lk-ap-bar');
    n.toggle   = document.querySelector('[data-ap-toggle]');
    n.saved    = document.querySelector('[data-ap-saved]');
    n.savedText = document.querySelector('[data-ap-saved-text]');
    n.contract = document.getElementById('lk-ap-contract');
    n.card     = document.getElementById('lk-ap-card');
    n.hint     = document.querySelector('[data-ap-hint]');
    n.newCard  = document.querySelector('[data-ap-newcard]');
    if (n.newCard) n.newCard.innerHTML = BIND_NOTES;

    n.card.addEventListener('change', syncNewCard);

    n.toggle.addEventListener('click', openForm);
    document.querySelectorAll('[data-ap-close]').forEach(function (b) {
      b.addEventListener('click', function () { closeForm(); n.toggle.focus(); });
    });

    ['contract', 'card', 'limit'].forEach(function (name) {
      var f = n.form[name];
      ['input', 'change'].forEach(function (ev) {
        f.addEventListener(ev, function () { setError(name, ''); });
      });
    });

    n.form.addEventListener('submit', function (e) {
      e.preventDefault();
      ['contract', 'card', 'limit'].forEach(function (k) { setError(k, ''); });

      if (!n.form.contract.value) { setError('contract', 'Выберите договор'); n.form.contract.focus(); return; }
      if (!n.form.card.value) { setError('card', 'Выберите карту'); n.form.card.focus(); return; }

      var lim = readLimit();
      if (lim.error) { setError('limit', lim.error); n.form.limit.focus(); return; }

      // карты ещё нет — автоплатёж создавать не из чего, сначала привязка в банке
      if (n.form.card.value === NEW_CARD) {
        var num = n.form.contract.value;
        console.log('[ЛК] привязка новой карты перед подключением автоплатежа:', num, lim.value);
        n.form.reset();
        syncNewCard();
        closeForm();
        showSaved('Переходим в ГазПромБанк для привязки карты. После подтверждения ' +
                  'автоплатёж по договору № ' + num + ' будет подключён.');
        return;
      }

      AUTOPAYS.push({
        id: 'ap-' + Date.now(),
        contract: n.form.contract.value,
        cardId: n.form.card.value,
        limit: lim.value,
        selfDisable: true
      });
      console.log('[ЛК] автоплатёж подключён:', n.form.contract.value);

      n.form.reset();
      syncNewCard();
      closeForm();
      renderAll();
      showSaved('Автоплатёж подключён. Первое списание пройдёт в день следующего счёта.');
    });
  }

  function setError(name, message) {
    var field = n.form[name];
    var err = n.form.querySelector('[data-err-for="' + name + '"]');
    field.classList.toggle('is-invalid', !!message);
    err.hidden = !message;
    if (message) err.textContent = message;
  }

  /* ======================================================================
     3. Привязанные карты
     ====================================================================== */

  function renderCards() {
    n.cards.innerHTML = '';

    if (!CARDS.length) {
      var empty = document.createElement('div');
      empty.className = 'lk-panel';
      empty.innerHTML = '<div class="lk-empty"><p class="lk-empty-text">' +
                        'Привязанных карт нет. Привяжите карту, чтобы подключить автоплатёж.' +
                        '</p></div>';
      n.cards.appendChild(empty);
      return;
    }

    CARDS.forEach(function (card) {
      var usedBy = AUTOPAYS.filter(function (ap) { return ap.cardId === card.id; });

      var row = document.createElement('div');
      row.className = 'lk-card-row';
      row.innerHTML =
        '<span class="lk-card-chip" aria-hidden="true">' + ICO_CARD + '</span>' +
        '<span class="lk-card-num">' + esc(card.mask) +
          '<span class="lk-card-meta">' + esc(card.system) + ' · действует до ' + esc(card.expires) +
        '</span></span>' +
        (usedBy.length
          ? '<span class="lk-card-used">в автоплатеже</span>' : '') +
        '<button type="button" class="lk-card-del">' + ICO_TRASH + 'Удалить</button>';

      var del = row.querySelector('.lk-card-del');

      if (usedBy.length) {
        // карту, к которой привязан автоплатёж, сначала нужно освободить
        del.disabled = true;
        del.setAttribute('data-lk-tip',
          'Сначала отключите автоплатёж по договору ' +
          usedBy.map(function (ap) { return '№ ' + ap.contract; }).join(', '));
        del.setAttribute('tabindex', '0');
      } else {
        del.addEventListener('click', function () {
          ask('Удалить карту?',
              'Карта <b>' + esc(card.mask) + '</b> будет отвязана от аккаунта. ' +
              'Для оплаты её можно будет ввести заново.',
              'Удалить',
              function () {
                CARDS = CARDS.filter(function (c) { return c !== card; });
                console.log('[ЛК] карта удалена:', card.mask);
                renderAll();
                showSaved('Карта ' + card.mask + ' отвязана.');
              });
        });
      }

      n.cards.appendChild(row);
    });
  }

  /* ======================================================================
     Старт
     ====================================================================== */

  function renderAll() {
    renderAutopays();
    renderCards();
    fillFormSelects();
    if (window.LK && window.LK.refreshTips) window.LK.refreshTips();
  }

  function init() {
    n.list = document.getElementById('lk-ap-list');
    if (!n.list) return;

    n.cards = document.getElementById('lk-cards');

    // тот же текст условий, что и в форме автоплатежа при выборе «Новая карта»
    var bindNotes = document.querySelector('[data-bind-notes]');
    if (bindNotes) bindNotes.innerHTML = BIND_NOTES;

    initConfirm();
    initForm();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

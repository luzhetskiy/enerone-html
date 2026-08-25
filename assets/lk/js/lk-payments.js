/* ==========================================================================
   ЛК «Новая энергия» — страница «Платежи»

   Фильтры: договор, диапазон дат и переключатель «все / только успешные».
   Таблица: дата, договор, сумма без комиссии, комиссия, сумма с комиссией,
   тип платежа (банк / онлайн) и статус. У неуспешных — подсказка с кодом ошибки.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     ДАННЫЕ. В боевой версии приходят с бэкенда.
     ====================================================================== */

  var CONTRACTS = ['ДЭС740201104', 'ДЭС740201287'];

  // расшифровки кодов ошибок платёжного шлюза
  var ERRORS = {
    INSUFFICIENT_FUNDS:  'Недостаточно средств на счёте или карте',
    CARD_EXPIRED:        'Истёк срок действия карты',
    DECLINED_BY_ISSUER:  'Платёж отклонён банком-эмитентом',
    THREE_DS_FAILED:     'Не пройдено подтверждение 3-D Secure',
    LIMIT_EXCEEDED:      'Превышен лимит операций по карте',
    TIMEOUT:             'Банк не ответил вовремя, платёж не завершён'
  };

  function pay(date, time, contract, amount, fee, type, error) {
    return {
      iso: date,
      date: date.split('-').reverse().join('.'),
      time: time,
      contract: contract,
      amount: amount,
      fee: fee,
      total: Math.round((amount + fee) * 100) / 100,
      type: type,                       // online | bank
      status: error ? 'error' : 'ok',
      error: error || null
    };
  }

  var C1 = CONTRACTS[0], C2 = CONTRACTS[1];

  var PAYMENTS = [
    pay('2026-08-14', '10:42', C1, 75000.00, 750.00, 'online'),
    pay('2026-08-12', '19:07', C1, 143200.00, 1432.00, 'online', 'INSUFFICIENT_FUNDS'),
    pay('2026-08-05', '09:15', C2, 24310.50, 0, 'bank'),
    pay('2026-07-31', '16:53', C1, 6000.00, 60.00, 'online'),
    pay('2026-07-28', '11:20', C1, 14007.60, 140.08, 'online', 'THREE_DS_FAILED'),
    pay('2026-07-06', '08:44', C2, 22874.00, 0, 'bank'),
    pay('2026-06-30', '13:31', C1, 17379.80, 173.80, 'online'),
    pay('2026-06-18', '21:05', C1, 17379.80, 173.80, 'online', 'CARD_EXPIRED'),
    pay('2026-06-04', '10:02', C2, 25016.30, 0, 'bank'),
    pay('2026-05-29', '15:48', C1, 16601.60, 166.02, 'online'),
    pay('2026-05-12', '12:26', C2, 23448.90, 0, 'bank'),
    pay('2026-04-27', '18:14', C1, 19195.60, 191.96, 'online', 'TIMEOUT'),
    pay('2026-04-24', '18:22', C1, 19195.60, 191.96, 'online'),
    pay('2026-04-03', '09:58', C2, 26702.10, 0, 'bank'),
    pay('2026-03-26', '14:09', C1, 17379.80, 173.80, 'online'),
    pay('2026-03-05', '10:31', C2, 24955.40, 0, 'bank'),
    pay('2026-02-25', '17:40', C1, 15045.20, 150.45, 'online', 'LIMIT_EXCEEDED'),
    pay('2026-02-25', '17:52', C1, 15045.20, 150.45, 'online')
  ];

  // новые платежи сверху
  PAYMENTS.sort(function (a, b) {
    if (a.iso !== b.iso) return a.iso < b.iso ? 1 : -1;
    return a.time < b.time ? 1 : -1;
  });

  var TYPES = {
    online: {
      cls: 'online',
      text: 'онлайн',
      ico: '<svg viewBox="0 0 14 14" aria-hidden="true">' +
           '<rect x="1.5" y="3" width="11" height="8" rx="1.5"/><path d="M1.5 5.5h11"/></svg>'
    },
    bank: {
      cls: 'bank',
      text: 'банк',
      ico: '<svg viewBox="0 0 14 14" aria-hidden="true">' +
           '<path d="M7 1.8l5.2 2.8H1.8z"/><path d="M3 5.5v5M7 5.5v5M11 5.5v5M1.8 11.8h10.4"/></svg>'
    }
  };

  var ICO_WARN = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
                 '<circle cx="7" cy="7" r="5.6" stroke-width="1.2"/>' +
                 '<path d="M7 4.2v3.4" stroke-width="1.3" stroke-linecap="round"/>' +
                 '<circle cx="7" cy="9.8" r=".8" fill="currentColor" stroke="none"/></svg>';

  /* ======================================================================
     Утилиты
     ====================================================================== */

  function money(n) {
    return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var n = {};
  var ONLY_OK_DEFAULT = true;      // по умолчанию показываем только успешные платежи
  var onlyOk = ONLY_OK_DEFAULT;

  /* ======================================================================
     Фильтры
     ====================================================================== */

  function readFilters() {
    return {
      contract: n.contract ? n.contract.value : '',
      from: n.from.value,
      to: n.to.value,
      onlyOk: onlyOk
    };
  }

  function isFiltered(f) {
    return !!(f.contract || f.from || f.to || f.onlyOk !== ONLY_OK_DEFAULT);
  }

  function applyFilters() {
    var f = readFilters();

    if (f.from && f.to && f.from > f.to) {
      n.to.value = f.from;
      f.to = f.from;
    }

    var rows = PAYMENTS.filter(function (p) {
      if (f.contract && p.contract !== f.contract) return false;
      if (f.from && p.iso < f.from) return false;
      if (f.to && p.iso > f.to) return false;
      if (f.onlyOk && p.status !== 'ok') return false;
      return true;
    });

    n.reset.disabled = !isFiltered(f);
    renderRows(rows);
  }

  /* ======================================================================
     Таблица
     ====================================================================== */

  function renderRows(rows) {
    n.tbody.innerHTML = '';

    if (!rows.length) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="7" class="lk-pays-empty">' +
                     'Платежей за выбранный период не найдено</td>';
      n.tbody.appendChild(tr);
      return;
    }

    rows.forEach(function (p) {
      var type = TYPES[p.type];

      var statusHtml = p.status === 'ok'
        ? '<span class="lk-pay-status"><span class="lk-badge lk-badge--ok">оплачен</span></span>'
        : '<span class="lk-pay-status">' +
            '<span class="lk-badge lk-badge--error">с ошибками</span>' +
            '<span class="lk-pay-err" data-lk-tip="' +
              esc(p.error + ' — ' + (ERRORS[p.error] || 'причина уточняется')) + '" ' +
              'aria-label="Причина ошибки">' + ICO_WARN + '</span>' +
          '</span>';

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td data-label="Дата"><span class="lk-pay-date">' + esc(p.date) +
          '<span class="lk-pay-time">' + esc(p.time) + '</span></span></td>' +
        '<td data-label="Договор"><span class="lk-pay-contract">' + esc(p.contract) + '</span></td>' +
        '<td data-label="Сумма без комиссии"><span class="lk-pay-sum">' + money(p.amount) + ' ₽</span></td>' +
        '<td data-label="Комиссия"><span class="lk-pay-sum lk-pay-sum--fee' +
          (p.fee ? '' : ' lk-pay-sum--zero') + '">' +
          (p.fee ? money(p.fee) + ' ₽' : '—') + '</span></td>' +
        '<td data-label="Сумма с комиссией"><span class="lk-pay-sum lk-pay-sum--total">' +
          money(p.total) + ' ₽</span></td>' +
        '<td data-label="Тип платежа"><span class="lk-pay-type lk-pay-type--' + type.cls + '">' +
          type.ico + type.text + '</span></td>' +
        '<td data-label="Статус">' + statusHtml + '</td>';

      n.tbody.appendChild(tr);
    });

    // подсказки с кодом ошибки навешиваем после перерисовки
    if (window.LK && window.LK.refreshTips) window.LK.refreshTips();
  }

  /* ======================================================================
     Старт
     ====================================================================== */

  function init() {
    n.tbody = document.getElementById('lk-pays');
    if (!n.tbody) return;

    n.from  = document.getElementById('lk-filter-from');
    n.to    = document.getElementById('lk-filter-to');
    n.reset = document.getElementById('lk-filter-reset');

    var wrap = document.getElementById('lk-filter-contract-wrap');
    var select = document.getElementById('lk-filter-contract');

    if (CONTRACTS.length > 1) {
      n.contract = select;
      select.innerHTML = '<option value="">Все договоры</option>' +
        CONTRACTS.map(function (c) {
          return '<option value="' + esc(c) + '">№ ' + esc(c) + '</option>';
        }).join('');
      select.addEventListener('change', applyFilters);
    } else {
      wrap.hidden = true;
    }

    // payments.html?contract=…&from=…&to=…&only=ok
    var q = new URLSearchParams(window.location.search);
    var pre = q.get('contract');
    if (pre && n.contract) {
      var exists = Array.prototype.some.call(n.contract.options, function (o) { return o.value === pre; });
      if (exists) n.contract.value = pre;
    }
    if (q.get('from')) n.from.value = q.get('from');
    if (q.get('to')) n.to.value = q.get('to');
    if (q.get('only') === 'ok') onlyOk = true;
    if (q.get('only') === 'all') onlyOk = false;

    n.from.addEventListener('change', applyFilters);
    n.to.addEventListener('change', applyFilters);

    n.seg = document.querySelectorAll('[data-only-ok]');
    n.seg.forEach(function (btn) {
      var on = btn.getAttribute('data-only-ok') === '1';
      if (on === onlyOk) setSeg(btn);

      btn.addEventListener('click', function () {
        onlyOk = on;
        setSeg(btn);
        applyFilters();
      });
    });

    n.reset.addEventListener('click', function () {
      if (n.contract) n.contract.value = '';
      n.from.value = '';
      n.to.value = '';
      onlyOk = ONLY_OK_DEFAULT;
      n.seg.forEach(function (b) {
        if ((b.getAttribute('data-only-ok') === '1') === ONLY_OK_DEFAULT) setSeg(b);
      });
      applyFilters();
    });

    applyFilters();
  }

  function setSeg(active) {
    n.seg.forEach(function (b) {
      var on = b === active;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ==========================================================================
   ЛК «Новая энергия» — страница «Счета» (история документов расчёта)

   Фильтры: договор и диапазон дат. Таблица: договор, номер документа, дата,
   сумма, статус и ссылки на печатные формы (счёт, УПД, акт по объектам).
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     ДАННЫЕ. В боевой версии приходят с бэкенда.
     ====================================================================== */

  var CONTRACTS = [
    { num: 'ДЭС740201104', code: '1558' },
    { num: 'ДЭС740201287', code: '2041' }
  ];

  // номер документа собирается по формату биллинга: НЭ0100000000<код>И<ММ><ГГГГ>
  function docNum(code, month, year) {
    return 'НЭ0100000000' + code + 'И' + String(month).padStart(2, '0') + year;
  }

  // последний день месяца — дата документа расчёта
  function lastDay(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function makeDoc(contract, year, month, sum, status, paid) {
    var day = lastDay(year, month);
    return {
      contract: contract.num,
      num: docNum(contract.code, month, year),
      iso: year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0'),
      date: String(day).padStart(2, '0') + '.' + String(month).padStart(2, '0') + '.' + year,
      sum: sum,
      status: status,          // paid | partial | unpaid
      paid: paid == null ? sum : paid
    };
  }

  var C1 = CONTRACTS[0], C2 = CONTRACTS[1];

  var DOCS = [
    makeDoc(C1, 2026, 7, 143200.00, 'unpaid', 0),
    makeDoc(C1, 2026, 6, 14007.60, 'partial', 6000.00),
    makeDoc(C1, 2026, 5, 17379.80, 'paid'),
    makeDoc(C1, 2026, 4, 16601.60, 'paid'),
    makeDoc(C1, 2026, 3, 19195.60, 'paid'),
    makeDoc(C1, 2026, 2, 17379.80, 'paid'),
    makeDoc(C1, 2026, 1, 15045.20, 'paid'),
    makeDoc(C1, 2025, 12, 18402.40, 'paid'),
    makeDoc(C1, 2025, 11, 16988.00, 'paid'),

    makeDoc(C2, 2026, 7, 24310.50, 'paid'),
    makeDoc(C2, 2026, 6, 22874.00, 'paid'),
    makeDoc(C2, 2026, 5, 25016.30, 'paid'),
    makeDoc(C2, 2026, 4, 23448.90, 'paid'),
    makeDoc(C2, 2026, 3, 26702.10, 'paid'),
    makeDoc(C2, 2026, 2, 24955.40, 'paid'),
    makeDoc(C2, 2026, 1, 27183.70, 'paid')
  ];

  // новые документы сверху, независимо от договора
  DOCS.sort(function (a, b) {
    if (a.iso !== b.iso) return a.iso < b.iso ? 1 : -1;
    return a.contract < b.contract ? -1 : 1;
  });

  var STATUS = {
    paid:    { cls: 'paid',    text: 'оплачен' },
    partial: { cls: 'partial', text: 'частично оплачен' },
    unpaid:  { cls: 'unpaid',  text: 'не оплачен' }
  };

  // печатные формы
  var FORMS = [
    { key: 'invoice', label: 'Счёт' },
    { key: 'upd',     label: 'УПД' },
    { key: 'act',     label: 'Акт по объектам' }
  ];

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

  var ICO_DL = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
               '<path d="M7 2.5v7M7 9.5l-2.5-2.5M7 9.5l2.5-2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
               '<path d="M2.5 11.5h9" stroke-linecap="round"/></svg>';

  var n = {};

  /* ======================================================================
     Фильтры
     ====================================================================== */

  function readFilters() {
    return {
      contract: n.contract ? n.contract.value : '',
      from: n.from.value,
      to: n.to.value
    };
  }

  function isFiltered(f) {
    return !!(f.contract || f.from || f.to);
  }

  function applyFilters() {
    var f = readFilters();

    // некорректный диапазон не должен молча отдавать пустой список
    if (f.from && f.to && f.from > f.to) {
      n.to.value = f.from;
      f.to = f.from;
    }

    var rows = DOCS.filter(function (d) {
      if (f.contract && d.contract !== f.contract) return false;
      if (f.from && d.iso < f.from) return false;
      if (f.to && d.iso > f.to) return false;
      return true;
    });

    n.reset.disabled = !isFiltered(f);
    renderRows(rows);
  }

  /* ======================================================================
     Таблица
     ====================================================================== */

  function fileCell(doc, form) {
    return '<a class="lk-doc-file" href="#" ' +
           'data-lk-action="Скачать ' + form.label + ' по документу ' + esc(doc.num) + '">' +
           ICO_DL + form.label + '</a>';
  }

  function renderRows(rows) {
    n.tbody.innerHTML = '';

    if (!rows.length) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="8" class="lk-docs-empty">' +
                     'Документов за выбранный период не найдено</td>';
      n.tbody.appendChild(tr);
      return;
    }

    rows.forEach(function (d) {
      var st = STATUS[d.status];
      var rest = d.sum - d.paid;

      var statusHtml =
        '<div class="lk-doc-status">' +
          '<span class="lk-badge lk-badge--' + st.cls + '">' + st.text + '</span>' +
          // «Оплатить» показываем только у неоплаченных документов
          (d.status === 'unpaid'
            ? '<a class="lk-doc-pay" href="online-pay.html?contract=' + encodeURIComponent(d.contract) +
              '&amount=' + rest.toFixed(2) + '">Оплатить</a>' : '') +
        '</div>';

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td data-label="Договор"><span class="lk-doc-contract">' + esc(d.contract) + '</span></td>' +
        '<td class="is-num" data-label="Номер документа"><span class="lk-doc-num">' + esc(d.num) + '</span></td>' +
        '<td data-label="Дата документа"><span class="lk-doc-date">' + esc(d.date) + '</span></td>' +
        '<td data-label="Сумма"><span class="lk-doc-sum">' + money(d.sum) + ' ₽</span></td>' +
        '<td data-label="Статус">' + statusHtml + '</td>' +
        FORMS.map(function (form) {
          return '<td class="is-file" data-label="' + form.label + '">' + fileCell(d, form) + '</td>';
        }).join('') +
        // на узких экранах печатные формы выводятся одной строкой
        '<td class="is-files-mob">' +
          FORMS.map(function (form) { return fileCell(d, form); }).join('') +
        '</td>';

      n.tbody.appendChild(tr);
    });
  }

  /* ======================================================================
     Старт
     ====================================================================== */

  function init() {
    n.tbody = document.getElementById('lk-docs');
    if (!n.tbody) return;

    n.from    = document.getElementById('lk-filter-from');
    n.to      = document.getElementById('lk-filter-to');
    n.reset   = document.getElementById('lk-filter-reset');

    var wrap = document.getElementById('lk-filter-contract-wrap');
    var select = document.getElementById('lk-filter-contract');

    // выбор договора нужен, только когда договоров несколько
    if (CONTRACTS.length > 1) {
      n.contract = select;
      select.innerHTML = '<option value="">Все договоры</option>' +
        CONTRACTS.map(function (c) {
          return '<option value="' + esc(c.num) + '">№ ' + esc(c.num) + '</option>';
        }).join('');
      select.addEventListener('change', applyFilters);
    } else {
      wrap.hidden = true;
    }

    // договор можно передать ссылкой: history.html?contract=ДЭС740201104
    var q = new URLSearchParams(window.location.search);
    var pre = q.get('contract');
    if (pre && n.contract) {
      var exists = Array.prototype.some.call(n.contract.options, function (o) { return o.value === pre; });
      if (exists) n.contract.value = pre;
    }
    if (q.get('from')) n.from.value = q.get('from');
    if (q.get('to')) n.to.value = q.get('to');

    n.from.addEventListener('change', applyFilters);
    n.to.addEventListener('change', applyFilters);

    n.reset.addEventListener('click', function () {
      if (n.contract) n.contract.value = '';
      n.from.value = '';
      n.to.value = '';
      applyFilters();
    });

    applyFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

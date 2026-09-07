/* ==========================================================================
   ЛК «Новая энергия» — страница «Счета» (история документов расчёта)

   Фильтры: договор и период (месяц/год начала — месяц/год конца, как в актах
   сверки: документ расчёта привязан к месяцу, а не к конкретному дню).
   Таблица: договор, номер документа, дата, сумма, статус и ссылки на печатные
   формы (счёт, УПД, акт по объектам).
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
      key: year * 100 + month,          // месяц документа — по нему фильтруем период
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

  var MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  var ICO_DL = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
               '<path d="M7 2.5v7M7 9.5l-2.5-2.5M7 9.5l2.5-2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
               '<path d="M2.5 11.5h9" stroke-linecap="round"/></svg>';

  var n = {};

  /* ======================================================================
     Фильтры
     ====================================================================== */

  function fillMonths(select) {
    select.innerHTML = '<option value="">Месяц</option>' +
      MONTHS.map(function (name, i) {
        return '<option value="' + (i + 1) + '">' + name + '</option>';
      }).join('');
  }

  function fillYears(select) {
    var years = {};
    DOCS.forEach(function (d) { years[Math.floor(d.key / 100)] = true; });
    select.innerHTML = '<option value="">Год</option>' +
      Object.keys(years).sort().map(function (y) {
        return '<option value="' + y + '">' + y + '</option>';
      }).join('');
  }

  // месяц без года (и наоборот) границу не задаёт — нужны оба значения
  function bound(monthSel, yearSel) {
    var m = parseInt(monthSel.value, 10);
    var y = parseInt(yearSel.value, 10);
    if (!m || !y) return null;
    return y * 100 + m;
  }

  function readFilters() {
    return {
      contract: n.contract ? n.contract.value : '',
      from: bound(n.fromMonth, n.fromYear),
      to: bound(n.toMonth, n.toYear),
      touched: !!(n.fromMonth.value || n.fromYear.value || n.toMonth.value || n.toYear.value)
    };
  }

  function isFiltered(f) {
    return !!(f.contract || f.touched);
  }

  function applyFilters() {
    var f = readFilters();

    // перевёрнутый период подтягиваем, а не отдаём пустой список
    if (f.from && f.to && f.from > f.to) {
      n.toMonth.value = n.fromMonth.value;
      n.toYear.value = n.fromYear.value;
      f.to = f.from;
    }

    var rows = DOCS.filter(function (d) {
      if (f.contract && d.contract !== f.contract) return false;
      if (f.from && d.key < f.from) return false;
      if (f.to && d.key > f.to) return false;
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

    n.reset     = document.getElementById('lk-filter-reset');
    n.fromMonth = document.getElementById('lk-from-month');
    n.fromYear  = document.getElementById('lk-from-year');
    n.toMonth   = document.getElementById('lk-to-month');
    n.toYear    = document.getElementById('lk-to-year');

    fillMonths(n.fromMonth); fillMonths(n.toMonth);
    fillYears(n.fromYear);   fillYears(n.toYear);

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

    // договор и период можно передать ссылкой:
    // history.html?contract=ДЭС740201104&from=2026-01&to=2026-07
    var q = new URLSearchParams(window.location.search);
    var pre = q.get('contract');
    if (pre && n.contract) {
      var exists = Array.prototype.some.call(n.contract.options, function (o) { return o.value === pre; });
      if (exists) n.contract.value = pre;
    }
    setPeriod(q.get('from'), n.fromYear, n.fromMonth);
    setPeriod(q.get('to'), n.toYear, n.toMonth);

    [n.fromMonth, n.fromYear, n.toMonth, n.toYear].forEach(function (sel) {
      sel.addEventListener('change', applyFilters);
    });

    n.reset.addEventListener('click', function () {
      if (n.contract) n.contract.value = '';
      [n.fromMonth, n.fromYear, n.toMonth, n.toYear].forEach(function (s) { s.value = ''; });
      applyFilters();
    });

    applyFilters();
  }

  // history.html?from=2026-01&to=2026-07 (день в YYYY-MM-DD отбрасывается)
  function setPeriod(value, yearSel, monthSel) {
    if (!value) return;
    var parts = String(value).split('-');
    if (parts.length < 2) return;
    yearSel.value = parts[0];
    monthSel.value = String(parseInt(parts[1], 10));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

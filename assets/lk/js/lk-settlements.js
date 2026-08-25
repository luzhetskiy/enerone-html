/* ==========================================================================
   ЛК «Новая энергия» — страница «Акты сверки» (взаиморасчёты)

   Фильтры: договор и период месяц/год — месяц/год.
   Таблица: год, месяц, сальдо начальное, предъявлено, перерасчёт,
   оплачено, конечное сальдо.

   Сальдо не хранится, а считается по цепочке:
     конечное = начальное + предъявлено + корректировка − оплачено
   начальное следующего месяца = конечное предыдущего.
   ========================================================================== */
(function () {
  'use strict';

  var MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  /* ======================================================================
     ДАННЫЕ. В боевой версии приходят с бэкенда.
     Обороты за месяц: billed — предъявлено, corr — перерасчёт, paid — оплачено.
     ====================================================================== */

  var CONTRACTS = [
    {
      num: 'ДЭС740201104',
      opening: 15420.30,                 // сальдо на начало первого месяца
      months: [
        { y: 2025, m: 11, billed: 16988.00, corr: 0,        paid: 15420.30 },
        { y: 2025, m: 12, billed: 18402.40, corr: 0,        paid: 16988.00 },
        { y: 2026, m: 1,  billed: 15045.20, corr: 0,        paid: 18402.40 },
        { y: 2026, m: 2,  billed: 17379.80, corr: 0,        paid: 15045.20 },
        { y: 2026, m: 3,  billed: 19195.60, corr: -1240.50, paid: 17379.80 },
        { y: 2026, m: 4,  billed: 16601.60, corr: 0,        paid: 17955.10 },
        { y: 2026, m: 5,  billed: 17379.80, corr: 0,        paid: 16601.60 },
        { y: 2026, m: 6,  billed: 14007.60, corr: 0,        paid: 17379.80 },
        { y: 2026, m: 7,  billed: 143200.00, corr: 0,       paid: 6000.00 }
      ]
    },
    {
      num: 'ДЭС740201287',
      opening: 0,
      months: [
        { y: 2025, m: 11, billed: 21430.00, corr: 0,      paid: 21430.00 },
        { y: 2025, m: 12, billed: 23118.60, corr: 0,      paid: 23118.60 },
        { y: 2026, m: 1,  billed: 27183.70, corr: 0,      paid: 27183.70 },
        { y: 2026, m: 2,  billed: 24955.40, corr: 0,      paid: 24955.40 },
        { y: 2026, m: 3,  billed: 26702.10, corr: 940.00, paid: 27642.10 },
        { y: 2026, m: 4,  billed: 23448.90, corr: 0,      paid: 23448.90 },
        { y: 2026, m: 5,  billed: 25016.30, corr: 0,      paid: 25016.30 },
        { y: 2026, m: 6,  billed: 22874.00, corr: 0,      paid: 22874.00 },
        { y: 2026, m: 7,  billed: 24310.50, corr: 0,      paid: 36760.50 }   // переплата
      ]
    }
  ];

  function round2(n) { return Math.round(n * 100) / 100; }

  // разворачиваем обороты в строки с сальдо
  function buildRows(contract) {
    var balance = contract.opening;
    return contract.months.map(function (r) {
      var open = balance;
      var close = round2(open + r.billed + r.corr - r.paid);
      balance = close;
      return {
        contract: contract.num,
        year: r.y,
        month: r.m,
        key: r.y * 100 + r.m,
        open: open,
        billed: r.billed,
        corr: r.corr,
        paid: r.paid,
        close: close
      };
    });
  }

  var ROWS = [];
  CONTRACTS.forEach(function (c) { ROWS = ROWS.concat(buildRows(c)); });

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

  function cell(value, extraClass) {
    if (!value) return '<span class="lk-set-num lk-set-num--zero">—</span>';
    return '<span class="lk-set-num' + (extraClass ? ' ' + extraClass : '') + '">' +
           money(value) + '</span>';
  }

  var n = {};

  /* ======================================================================
     Справочники фильтров
     ====================================================================== */

  function fillMonths(select) {
    select.innerHTML = '<option value="">Месяц</option>' +
      MONTHS.map(function (name, i) {
        return '<option value="' + (i + 1) + '">' + name + '</option>';
      }).join('');
  }

  function fillYears(select) {
    var years = {};
    ROWS.forEach(function (r) { years[r.year] = true; });
    var list = Object.keys(years).sort();
    select.innerHTML = '<option value="">Год</option>' +
      list.map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');
  }

  /* ======================================================================
     Фильтры
     ====================================================================== */

  // месяц без года (и наоборот) период не задаёт — нужны оба значения
  function bound(monthSel, yearSel) {
    var m = parseInt(monthSel.value, 10);
    var y = parseInt(yearSel.value, 10);
    if (!m || !y) return null;
    return y * 100 + m;
  }

  function readFilters() {
    return {
      contract: n.contract.value,
      from: bound(n.fromMonth, n.fromYear),
      to: bound(n.toMonth, n.toYear),
      touched: !!(n.fromMonth.value || n.fromYear.value || n.toMonth.value || n.toYear.value)
    };
  }

  function applyFilters() {
    var f = readFilters();

    // перевёрнутый период подтягиваем, а не отдаём пустую таблицу
    if (f.from && f.to && f.from > f.to) {
      n.toMonth.value = n.fromMonth.value;
      n.toYear.value = n.fromYear.value;
      f.to = f.from;
    }

    var rows = ROWS.filter(function (r) {
      if (f.contract && r.contract !== f.contract) return false;
      if (f.from && r.key < f.from) return false;
      if (f.to && r.key > f.to) return false;
      return true;
    });

    // при выбранном договоре порядок хронологический, иначе группируем по договору
    rows.sort(function (a, b) {
      if (a.contract !== b.contract) return a.contract < b.contract ? -1 : 1;
      return a.key - b.key;
    });

    n.reset.disabled = !(f.contract || f.touched);
    setActEnabled(f.contract);

    if (!f.contract) {
      showPrompt();
      return;
    }
    renderRows(rows);
  }

  // без выбранного договора неясно, по какому договору выгружать акт
  function setActEnabled(contract) {
    var on = !!contract;
    n.actLink.classList.toggle('is-disabled', !on);
    n.actLink.setAttribute('aria-disabled', String(!on));
    n.actLink.title = on ? '' : 'Сначала выберите договор';

    if (on) {
      n.actLink.setAttribute('href', '#');
      n.actLink.setAttribute('data-lk-action', 'Скачать акт сверки по договору ' + contract);
    } else {
      n.actLink.removeAttribute('href');      // ссылка без href не фокусируется и не кликается
      n.actLink.removeAttribute('data-lk-action');
    }
  }

  // договор не выбран — взаиморасчёты показывать не из чего
  function showPrompt() {
    n.tfoot.innerHTML = '';
    n.tbody.innerHTML = '<tr><td colspan="7" class="lk-set-empty">' +
                        'Выберите договор, чтобы увидеть взаиморасчёты</td></tr>';
  }

  /* ======================================================================
     Таблица
     ====================================================================== */

  function renderRows(rows) {
    n.tbody.innerHTML = '';
    n.tfoot.innerHTML = '';

    if (!rows.length) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="7" class="lk-set-empty">' +
                     'Данных за выбранный период нет</td>';
      n.tbody.appendChild(tr);
      return;
    }

    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td data-label="Год"><span class="lk-set-year">' + r.year + '</span></td>' +
        '<td data-label="Месяц"><span class="lk-set-month">' + MONTHS[r.month - 1] + '</span></td>' +
        '<td data-label="Сальдо начальное">' + cell(r.open) + '</td>' +
        '<td data-label="Предъявлено в периоде">' + cell(r.billed) + '</td>' +
        '<td data-label="Перерасчёт / корректировка">' +
          cell(r.corr, r.corr < 0 ? 'lk-set-num--minus' : 'lk-set-num--plus') + '</td>' +
        '<td data-label="Оплачено в периоде">' + cell(r.paid) + '</td>' +
        '<td data-label="Конечное сальдо">' + cell(r.close, 'lk-set-num--close') + '</td>';
      n.tbody.appendChild(tr);
    });

    renderTotal(rows);
  }

  function renderTotal(rows) {
    var sum = function (key) {
      return round2(rows.reduce(function (s, r) { return s + r[key]; }, 0));
    };

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td data-label="Итого" colspan="2"><span class="lk-set-month">Итого за период</span></td>' +
      '<td data-label="Сальдо начальное">' + cell(rows[0].open) + '</td>' +
      '<td data-label="Предъявлено">' + cell(sum('billed')) + '</td>' +
      '<td data-label="Перерасчёт">' + cell(sum('corr')) + '</td>' +
      '<td data-label="Оплачено">' + cell(sum('paid')) + '</td>' +
      '<td data-label="Конечное сальдо">' + cell(rows[rows.length - 1].close, 'lk-set-num--close') + '</td>';
    n.tfoot.appendChild(tr);
  }

  /* ======================================================================
     Старт
     ====================================================================== */

  function init() {
    n.tbody = document.getElementById('lk-set');
    if (!n.tbody) return;

    n.tfoot     = document.getElementById('lk-set-total');
    n.reset     = document.getElementById('lk-filter-reset');
    n.fromMonth = document.getElementById('lk-from-month');
    n.fromYear  = document.getElementById('lk-from-year');
    n.toMonth   = document.getElementById('lk-to-month');
    n.toYear    = document.getElementById('lk-to-year');
    n.actLink   = document.querySelector('[data-act-download]');

    fillMonths(n.fromMonth); fillMonths(n.toMonth);
    fillYears(n.fromYear);   fillYears(n.toYear);

    var wrap = document.getElementById('lk-filter-contract-wrap');
    var select = document.getElementById('lk-filter-contract');

    n.contract = select;
    select.innerHTML =
      '<option value="" disabled selected>Выберите договор</option>' +
      CONTRACTS.map(function (c) {
        return '<option value="' + esc(c.num) + '">№ ' + esc(c.num) + '</option>';
      }).join('');
    select.addEventListener('change', applyFilters);

    // если договор один — выбирать не из чего, подставляем его и прячем поле
    if (CONTRACTS.length === 1) {
      select.value = CONTRACTS[0].num;
      wrap.hidden = true;
    }

    // settlements.html?contract=…&from=2026-01&to=2026-07
    var q = new URLSearchParams(window.location.search);
    var pre = q.get('contract');
    if (pre) {
      var exists = Array.prototype.some.call(n.contract.options, function (o) { return o.value === pre; });
      if (exists) n.contract.value = pre;
    }
    setPeriod(q.get('from'), n.fromYear, n.fromMonth);
    setPeriod(q.get('to'), n.toYear, n.toMonth);

    [n.fromMonth, n.fromYear, n.toMonth, n.toYear].forEach(function (sel) {
      sel.addEventListener('change', applyFilters);
    });

    n.reset.addEventListener('click', function () {
      if (CONTRACTS.length > 1) n.contract.value = '';
      [n.fromMonth, n.fromYear, n.toMonth, n.toYear].forEach(function (s) { s.value = ''; });
      applyFilters();
    });

    applyFilters();
  }

  function setPeriod(value, yearSel, monthSel) {
    if (!value) return;
    var parts = String(value).split('-');
    if (parts.length !== 2) return;
    yearSel.value = parts[0];
    monthSel.value = String(parseInt(parts[1], 10));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

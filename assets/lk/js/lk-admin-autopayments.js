/* ==========================================================================
   ЛК «Новая энергия» — служебная страница «Автоплатежи (ГазпромБанк)»

   Макет: список подключённых автоплатежей по всем пользователям.
   Логики нет — фильтрация, сортировка и постраничность остаются на бэкенде;
   здесь только разметка строк и заполнение фильтров значениями из списка.

   ROWS заменяется ответом бэкенда. Данные демонстрационные: почты вымышленные,
   номера карт маскированные — страница лежит в публичном репозитории.
   ========================================================================== */
(function () {
  'use strict';

  var ROWS = [
    { user: 'i.gvozdev@bk.ru',       card: '220220xxxxxx1000', contract: 'ДЭС740400387', limit: 15000, created: '15.06.2026', updated: '15.06.2026', on: false },
    { user: 'i.gvozdev@bk.ru',       card: '220220xxxxxx1000', contract: 'ДЭС740400341', limit: 5000,  created: '15.06.2026', updated: '10.09.2026', on: false },
    { user: 'e.zubarev@yandex.ru',   card: '220015xxxxxx2861', contract: 'ДЭС740500205', limit: 1000,  created: '13.06.2026', updated: '17.07.2026', on: false },
    { user: 'a.nesterova@mail.ru',   card: '220015xxxxxx1173', contract: 'ДЭС740200375', limit: 70000, created: '02.06.2026', updated: '09.06.2026', on: true },
    { user: 's.ilinykh@rambler.ru',  card: '220196xxxxxx8491', contract: 'ДЭС740200849', limit: 21609, created: '13.05.2026', updated: '15.06.2026', on: true },
    { user: 'e.zubarev@yandex.ru',   card: '220015xxxxxx2861', contract: 'ДЭС740500205', limit: 500,   created: '01.04.2026', updated: '01.04.2026', on: false },
    { user: 'e.zubarev@yandex.ru',   card: '220001xxxxxx3510', contract: 'ДЭС740500205', limit: 800,   created: '25.03.2026', updated: '01.04.2026', on: false },
    { user: 'p.yavorsky@mail.ru',    card: '220220xxxxxx8254', contract: 'ДЭС740201610', limit: 6000,  created: '10.03.2026', updated: '07.04.2026', on: true },
    { user: 'm.karpova@gmail.com',   card: '220220xxxxxx4417', contract: 'ДЭС740201104', limit: 30000, created: '28.02.2026', updated: '28.02.2026', on: true },
    { user: 'd.filatov@yandex.ru',   card: '220196xxxxxx0932', contract: 'ДЭС740215171', limit: 12500, created: '19.02.2026', updated: '03.03.2026', on: false }
  ];

  function num(n) { return n.toLocaleString('ru-RU'); }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  // уникальные значения колонки — ими наполняются фильтры
  function uniq(key) {
    var seen = {};
    return ROWS.map(function (r) { return r[key]; })
               .filter(function (v) {
                 if (seen[v]) return false;
                 seen[v] = true;
                 return true;
               })
               .sort();
  }

  function fillSelect(select, values) {
    if (!select) return;
    select.innerHTML = '';
    ['Все'].concat(values).forEach(function (v, i) {
      var o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      if (i === 0) o.selected = true;
      select.appendChild(o);
    });
  }

  function renderRows() {
    var tbody = document.getElementById('lk-adm-rows');
    if (!tbody) return;

    tbody.innerHTML = ROWS.map(function (r) {
      return '<tr>' +
        '<td data-label="Пользователь"><span class="lk-adm-user">' + esc(r.user) + '</span></td>' +
        '<td data-label="Карта"><span class="lk-adm-card">' + esc(r.card) + '</span></td>' +
        '<td data-label="Договор"><span class="lk-adm-contract">' + esc(r.contract) + '</span></td>' +
        '<td data-label="Макс. сумма" class="lk-adm-sum">' + num(r.limit) + ' ₽</td>' +
        '<td data-label="Создан" class="lk-table-date">' + esc(r.created) + '</td>' +
        '<td data-label="Обновлён" class="lk-table-date">' + esc(r.updated) + '</td>' +
        '<td data-label="Включён">' +
          '<span class="lk-badge ' + (r.on ? 'lk-badge--ok' : 'lk-badge--off') + '">' +
            (r.on ? 'Да' : 'Нет') +
          '</span>' +
        '</td>' +
      '</tr>';
    }).join('');

    var count = document.getElementById('lk-adm-count');
    if (count) {
      count.textContent = ROWS.length + ' ' +
        plural(ROWS.length, 'запись', 'записи', 'записей');
    }
  }

  function init() {
    renderRows();
    fillSelect(document.getElementById('lk-adm-contract'), uniq('contract'));
    fillSelect(document.getElementById('lk-adm-card'), uniq('card'));

    // комбобоксы строятся из <option>, поэтому списки наполняем до initCombos
    if (window.LK && window.LK.initCombos) window.LK.initCombos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

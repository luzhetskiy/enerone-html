/* ==========================================================================
   ЛК «Новая энергия» — страница «Передача показаний» (прототип)

   Логика: договор → объект → приборы учёта.
   Расчёт на лету: разность = текущие − предыдущие,
                   расход  = разность × КТ,
                   начисления = расход × тариф (цена с НДС).
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     ДАННЫЕ. В боевой версии приходят с бэкенда.
     ====================================================================== */

  // ряд потребления за 12 месяцев (июнь 2025 — май 2026)
  function series(values) {
    var months = [
      [2025, 6], [2025, 7], [2025, 8], [2025, 9], [2025, 10], [2025, 11],
      [2025, 12], [2026, 1], [2026, 2], [2026, 3], [2026, 4], [2026, 5]
    ];
    return months.map(function (m, i) {
      return { year: m[0], month: m[1], value: values[i] };
    });
  }

  var DATA = {
    contracts: [
      {
        id: 'c-1104',
        num: 'ДЭС740201104',
        service: 'Энергоснабжение',
        from: '15-03-2021',
        objects: [
          {
            id: 'o-1104-1',
            name: '1217_Челябинск_40-летия Октября_29А',
            addr: '454007, Челябинская обл, Челябинск г, 40-летия Октября ул, дом 29А',
            tariff: 12.97,
            tariffName: 'Фиксированные цены Челябинская область',
            meters: [
              { num: '10198124', kt: 20, prev: '003393.00',
                title: 'ЩУ-0,22кВ нежилого помещения №6',
                chart: series([1600, 1360, 1220, 1760, 1820, 1660, 1760, 1160, 1340, 1480, 1280, 1340]) },
              { num: '10198125', kt: 1, prev: '018472.00',
                title: 'ЩУ-0,4кВ вводного распределительного устройства',
                chart: series([405, 388, 351, 442, 470, 421, 448, 316, 344, 379, 332, 348]) }
            ],
            sentFiles: [
              ['3 августа 2026 г. 10:25',    'single_file__7107791612.jfif'],
              ['1 июля 2026 г. 11:41',       'single_file__7107791612.jfif'],
              ['2 июня 2026 г. 13:02',       'single_file__7107791612.jpg'],
              ['30 апреля 2026 г. 8:05',     'single_file__7107791612.JPG'],
              ['27 февраля 2026 г. 10:28',   'single_file__7107791612.jpg'],
              ['30 января 2026 г. 11:38',    'single_file__7107791612.jpg'],
              ['30 декабря 2025 г. 11:35',   'single_file__7107791612.jpg'],
              ['28 ноября 2025 г. 13:41',    'single_file__7107791612.jpg'],
              ['31 октября 2025 г. 14:24',   'single_file__7107791612.jpeg'],
              ['30 сентября 2025 г. 14:24',  'single_file__7107791612.jpg']
            ]
          },
          {
            id: 'o-1104-2',
            name: 'на КЛ-10кВ (отпайка) от опоры №1/3 КВЛ-10кВ "ПС 110/10 "Гранитная" ф.409,ТП-5773-ТП-5813 нежилого здания (КТПН 10/0,4кВ Потребителя)',
            addr: 'г. Челябинск, ул. Промышленная, 14',
            tariff: 14.32,
            tariffName: 'Фиксированные цены Челябинская область',
            meters: [
              { num: 'СЭ1904-007712', kt: 1, prev: '014055.00',
                title: 'ЩУ-0,4кВ склада готовой продукции',
                chart: series([980, 1040, 890, 1120, 1210, 1180, 1260, 870, 940, 1010, 905, 960]) }
            ],
            sentFiles: [
              ['2 июня 2026 г. 09:14',     'sklad_pu_062026.xlsx'],
              ['30 апреля 2026 г. 16:02',  'sklad_pu_042026.xlsx'],
              ['27 февраля 2026 г. 11:50', 'sklad_pu_022026.xlsx']
            ]
          }
        ]
      },
      {
        id: 'c-1287',
        num: 'ДЭС740201287',
        service: 'Энергоснабжение',
        from: '01-09-2023',
        objects: [
          {
            id: 'o-1287-1',
            name: 'ДЭС740500025_Катав-Ивановск_Дмитрия Тараканова_35',
            addr: '456110, Челябинская обл, Катав-Ивановск г, Дмитрия Тараканова ул, дом 35',
            tariff: 11.84,
            tariffName: 'Фиксированные цены Челябинская область',
            meters: [
              { num: 'МЭ2201-034421', kt: 10, prev: '029817.00',
                title: 'ЩУ-6кВ административного здания, ввод 1',
                chart: series([2180, 2040, 1960, 2260, 2390, 2310, 2480, 1870, 1990, 2120, 1950, 2050]) },
              { num: 'МЭ2201-034422', kt: 1, prev: '009340.00',
                title: 'ЩУ-0,4кВ административного здания, ввод 2',
                chart: series([760, 720, 690, 810, 870, 840, 900, 640, 700, 745, 680, 715]) }
            ],
            sentFiles: [
              ['1 июля 2026 г. 10:03',   'admin_pu_072026.pdf'],
              ['2 июня 2026 г. 12:47',   'admin_pu_062026.pdf']
            ]
          },
          {
            // объект без ПУ — так выглядит кейс «приборов учёта не найдено»
            id: 'o-1287-3',
            name: 'ДЭС740201287_Челябинск_250-летия Челябинска_27',
            addr: '454003, Челябинская обл, Челябинск г, 250-летия Челябинска ул, дом 27, помещение 40',
            tariff: 13.75,
            tariffName: 'Фиксированные цены Челябинская область',
            meters: [],
            sentFiles: []
          },
          {
            id: 'o-1287-2',
            name: 'Парковочный комплекс',
            addr: 'г. Магнитогорск, пр. Ленина, 55А',
            tariff: 15.06,
            tariffName: 'Фиксированные цены Челябинская область',
            meters: [
              { num: 'ПЭ2305-011007', kt: 1, prev: '006903.00',
                title: 'ЩУ-0,4кВ парковочного комплекса',
                chart: series([420, 395, 370, 455, 490, 505, 540, 380, 405, 430, 398, 412]) }
            ],
            sentFiles: []
          }
        ]
      }
    ]
  };

  /* ======================================================================
     Утилиты
     ====================================================================== */

  function num(n, dec) {
    return n.toLocaleString('ru-RU', {
      minimumFractionDigits: dec == null ? 0 : dec,
      maximumFractionDigits: dec == null ? 0 : dec
    });
  }

  // «2 объекта», «3 прибора учёта»
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var ICO_CHECK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2L4.8 8.5 9.5 3.8"/></svg>';
  var ICO_INFO  = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
                  '<circle cx="7" cy="7" r="5.6" stroke-width="1.2"/>' +
                  '<path d="M7 6.4v3.2" stroke-width="1.3" stroke-linecap="round"/>' +
                  '<circle cx="7" cy="4.2" r=".8" fill="currentColor" stroke="none"/></svg>';
  var ICO_CHEVRON = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 8.5L7 5l3.5 3.5"/></svg>';
  var ICO_CLOCK = '<svg viewBox="0 0 16 16" aria-hidden="true">' +
                  '<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.1 1.6" stroke-linecap="round"/></svg>';
  var ICO_METER = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                  '<rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3"/>' +
                  '<rect x="6.6" y="8" width="10.8" height="4.6" rx="1.2"/>' +
                  '<path d="M8 16.2h8"/></svg>';
  var ICO_FILE = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
                 '<path d="M3 1.5h5l3 3v8H3z"/><path d="M8 1.5v3h3"/></svg>';

  /* ======================================================================
     Окно передачи показаний

     Показания принимаются с 0:00 20 числа текущего месяца
     до 15:00 4 числа месяца, следующего за расчётным.
     ====================================================================== */

  var WINDOW_TEXT = 'Показания принимаются в период с 0:00 20 числа текущего месяца ' +
                    'до 15:00 4 числа месяца следующего за расчетным.';

  // одна и та же плашка выводится в начале страницы и внутри карточки ПУ
  function windowNoteHtml() {
    return ICO_CLOCK +
           '<div class="lk-window-closed-text"><b>Окно передачи показаний закрыто</b>' +
           WINDOW_TEXT + '</div>';
  }

  function windowIsOpen(now) {
    now = now || new Date();
    var d = now.getDate();
    if (d >= 20) return true;                 // с 20 числа и до конца месяца
    if (d < 4) return true;                   // и по 4 число следующего
    if (d === 4 && now.getHours() < 15) return true;
    return false;
  }

  /* ======================================================================
     Состояние
     ====================================================================== */

  var state = { contract: null, object: null, windowOpen: windowIsOpen() };

  var nodes = {};

  function syncWindowNote() {
    if (nodes.windowNote) nodes.windowNote.hidden = state.windowOpen;
  }

  /* ======================================================================
     Шаг 1 — договоры
     ====================================================================== */

  function meterCount(contract) {
    return contract.objects.reduce(function (n, o) { return n + o.meters.length; }, 0);
  }

  function renderContracts() {
    nodes.contractPicker.innerHTML = '';

    DATA.contracts.forEach(function (c) {
      var objN = c.objects.length;
      var puN = meterCount(c);

      var b = el('button', 'lk-pick');
      b.type = 'button';
      b.innerHTML =
        '<span class="lk-pick-check">' + ICO_CHECK + '</span>' +
        '<span class="lk-pick-title">№ ' + esc(c.num) + '</span>' +
        '<span class="lk-pick-sub">' + esc(c.service) + ' · от ' + esc(c.from) + '</span>' +
        '<span class="lk-pick-meta">' +
          objN + ' ' + plural(objN, 'объект', 'объекта', 'объектов') + ' · ' +
          puN + ' ' + plural(puN, 'прибор', 'прибора', 'приборов') + ' учёта' +
        '</span>';

      b.addEventListener('click', function () { selectContract(c); });
      nodes.contractPicker.appendChild(b);
      c._node = b;
    });
  }

  function selectContract(c, keepObject) {
    state.contract = c;
    if (!keepObject) state.object = null;

    DATA.contracts.forEach(function (x) {
      x._node.classList.toggle('is-selected', x === c);
    });

    renderObjects(c);
    nodes.stepObject.hidden = false;
    if (!keepObject) nodes.stepMeters.hidden = true;
  }

  /* ======================================================================
     Шаг 2 — объекты договора
     ====================================================================== */

  function renderObjects(contract) {
    nodes.objectPicker.innerHTML = '';

    contract.objects.forEach(function (o) {
      var puN = o.meters.length;

      var b = el('button', 'lk-pick');
      b.type = 'button';
      b.innerHTML =
        '<span class="lk-pick-check">' + ICO_CHECK + '</span>' +
        '<span class="lk-pick-title">' + esc(o.name) + '</span>' +
        '<span class="lk-pick-sub">' + esc(o.addr) + '</span>' +
        '<span class="lk-pick-meta">' +
          puN + ' ' + plural(puN, 'прибор', 'прибора', 'приборов') + ' учёта · ' +
          'тариф ' + num(o.tariff, 2) + ' ₽' +
        '</span>';

      b.addEventListener('click', function () { selectObject(o); });
      nodes.objectPicker.appendChild(b);
      o._node = b;
    });
  }

  function selectObject(o, openMeterNum, scrollTo) {
    state.object = o;

    state.contract.objects.forEach(function (x) {
      x._node.classList.toggle('is-selected', x === o);
    });

    renderSelected();
    renderMeters(o, openMeterNum);
    renderSentFiles(o);

    nodes.stepMeters.hidden = false;

    var target = null;
    if (openMeterNum) {
      target = nodes.meters.querySelector('[data-pu="' + cssEscape(openMeterNum) + '"]');
    }
    if (scrollTo !== false) {
      (target || nodes.stepMeters).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function cssEscape(v) {
    return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/"/g, '\\"');
  }

  // ?pu=НОМЕР — переход с главной на конкретный прибор учёта
  function findByMeter(puNum) {
    var found = null;
    DATA.contracts.forEach(function (c) {
      c.objects.forEach(function (o) {
        o.meters.forEach(function (m) {
          if (m.num === puNum) found = { contract: c, object: o, meter: m };
        });
      });
    });
    return found;
  }

  /* ======================================================================
     Выбранные договор и объект
     ====================================================================== */

  function renderSelected() {
    var c = state.contract, o = state.object;
    nodes.selected.innerHTML =
      '<div class="lk-selected-item">' +
        '<span class="lk-selected-k">Договор</span>' +
        '<span class="lk-selected-v">№ ' + esc(c.num) + '</span>' +
      '</div>' +
      '<div class="lk-selected-item">' +
        '<span class="lk-selected-k">Объект</span>' +
        '<span class="lk-selected-v">' + esc(o.name) +
          '<span class="lk-selected-addr"><br>' + esc(o.addr) + '</span>' +
        '</span>' +
      '</div>' +
      '<div class="lk-selected-item">' +
        '<span class="lk-selected-k">Цена с НДС</span>' +
        '<span class="lk-selected-v">' + num(o.tariff, 2) + ' ₽</span>' +
      '</div>' +
      '<button type="button" class="lk-selected-reset">Изменить выбор</button>';

    nodes.selected.querySelector('.lk-selected-reset')
      .addEventListener('click', function () {
        nodes.stepMeters.hidden = true;
        nodes.contractPicker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  }

  /* ======================================================================
     Шаг 3 — приборы учёта
     ====================================================================== */

  function applyWindowState() {
    // окно передачи закрыто — загрузка файлом недоступна так же, как ручной ввод
    if (nodes.bulkUpload) nodes.bulkUpload.hidden = !state.windowOpen;
    if (nodes.uploadGrid) nodes.uploadGrid.classList.toggle('is-single', !state.windowOpen);
  }

  // за объектом не закреплено ни одного ПУ — передавать нечего
  function renderNoMeters(o) {
    var link = 'feedback.html?new=1' +
               '&contract=' + encodeURIComponent(state.contract.num) +
               '&topic=t-meters' +
               '&text=' + encodeURIComponent(
                 'По объекту «' + o.name + '» в личном кабинете не отображаются приборы учёта. ' +
                 'Прошу проверить и закрепить ПУ за объектом.');

    var box = el('div', 'lk-panel lk-empty');
    box.innerHTML =
      '<div class="lk-empty-ico">' + ICO_METER + '</div>' +
      '<p class="lk-empty-title">Приборов учёта нет</p>' +
      '<p class="lk-empty-text">За объектом <b>' + esc(o.name) + '</b> не закреплён ' +
        'ни один прибор учёта. ' +
        'Если ПУ должен быть здесь — напишите менеджеру, он проверит данные по объекту.</p>' +
      '<a class="lk-btn-ghost" href="' + link + '">Написать менеджеру</a>';

    nodes.meters.appendChild(box);
  }

  function renderMeters(o, openMeterNum) {
    nodes.meters.innerHTML = '';
    nodes.metersCount.textContent = o.meters.length
      ? o.meters.length + ' ' + plural(o.meters.length, 'прибор', 'прибора', 'приборов') + ' учёта'
      : 'приборов учёта нет';

    // без ПУ прятать нужно и загрузку файлом, и шаблоны, и историю файлов:
    // всё это про показания, которых по этому объекту быть не может
    if (nodes.uploadGrid) nodes.uploadGrid.hidden = !o.meters.length;
    if (nodes.sentPanel) nodes.sentPanel.hidden = !o.meters.length;

    if (!o.meters.length) {
      renderNoMeters(o);
      return;
    }

    o.meters.forEach(function (m, i) {
      // один ПУ — раскрыт; несколько — свёрнуты, кроме того, на который перешли
      var open = o.meters.length === 1 || (openMeterNum && m.num === openMeterNum);
      nodes.meters.appendChild(buildMeterCard(m, o, i, open));
    });

    applyWindowState();

    if (window.LK && window.LK.refreshTips) window.LK.refreshTips();
  }

  function buildMeterCard(m, o, idx, open) {
    var uid = 'pu-' + o.id + '-' + idx;
    var card = el('article', 'lk-meter-card' + (open ? '' : ' is-collapsed'));
    card.setAttribute('data-pu', m.num);

    card.innerHTML =
      '<header class="lk-meter-hdr">' +
        '<span class="lk-meter-num">' + esc(m.num) + '</span>' +
        '<span class="lk-hint" data-lk-tip="' + esc(m.title) + '" ' +
              'aria-label="Название прибора учёта">' + ICO_INFO + '</span>' +
        '<span class="lk-meter-kt">КТ = <b>' + num(m.kt, 1) + '</b>' +
          '<span class="lk-hint" data-lk-tip="Коэффициент трансформации" ' +
                'aria-label="Что такое КТ">' + ICO_INFO + '</span></span>' +
        '<button type="button" class="lk-meter-toggle" aria-expanded="' + (open ? 'true' : 'false') + '" ' +
                'aria-controls="' + uid + '" aria-label="Свернуть или раскрыть прибор учёта ' +
                esc(m.num) + '">' + ICO_CHEVRON + '</button>' +
      '</header>' +

      '<div class="lk-meter-body" id="' + uid + '"' + (open ? '' : ' hidden') + '>' +
        '<div class="lk-reading-grid">' +
          '<div class="lk-field">' +
            '<div class="lk-field-lbl">Предыдущие показания</div>' +
            '<div class="lk-field-val">' + esc(m.prev) + '</div>' +
          '</div>' +

          '<div class="lk-field">' +
            (state.windowOpen
              ? '<label class="lk-input-lbl" for="' + uid + '-in">Текущие показания</label>' +
                '<input class="lk-input lk-input--mono" id="' + uid + '-in" type="text" inputmode="decimal" ' +
                       'autocomplete="off" placeholder="0">' +
                '<div class="lk-input-err" data-err hidden></div>'
              : '<div class="lk-window-closed">' + windowNoteHtml() + '</div>') +
          '</div>' +

          '<div class="lk-calc">' +
            '<div class="lk-calc-row is-empty" data-row="diff">' +
              '<span class="lk-calc-k">Разность показаний</span>' +
              '<span class="lk-calc-v" data-diff>—</span>' +
            '</div>' +
            '<div class="lk-calc-row is-empty" data-row="usage">' +
              '<span class="lk-calc-k">Расход по ПУ без учёта потерь</span>' +
              '<span class="lk-calc-v" data-usage>—</span>' +
            '</div>' +
            '<div class="lk-calc-row is-total is-empty" data-row="total">' +
              '<span class="lk-calc-k">Предварительные начисления</span>' +
              '<span class="lk-calc-v" data-total>—</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        (state.windowOpen
          ? '<div class="lk-meter-actions">' +
              '<div class="lk-actions-alt">' +
                '<span class="lk-alt-lbl">Другой способ передачи</span>' +
                '<button type="button" class="lk-btn-upload" ' +
                        'data-lk-action="Загрузить файл с показаниями по ПУ ' + esc(m.num) + '">' +
                  '<svg class="lk-btn-ico" viewBox="0 0 16 16" aria-hidden="true">' +
                    '<path d="M8 11V3M8 3L5 6M8 3l3 3" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '<path d="M2.5 10.5v1.5A1.5 1.5 0 004 13.5h8a1.5 1.5 0 001.5-1.5v-1.5" stroke-width="1.4" stroke-linecap="round"/>' +
                  '</svg>Загрузить файл или фото</button>' +
              '</div>' +
              '<div class="lk-actions-main">' +
                '<span class="lk-submit-note" data-note>Введите текущие показания, чтобы отправить</span>' +
                '<button type="button" class="lk-btn-submit" data-submit hidden>Передать показания</button>' +
              '</div>' +
            '</div>'
          : '') +

        '<div class="lk-meter-chart" data-chart></div>' +
      '</div>';

    bindMeter(card, m, o, uid);
    return card;
  }

  function bindMeter(card, m, o, uid) {
    var body   = card.querySelector('.lk-meter-body');
    var toggle = card.querySelector('.lk-meter-toggle');
    var input  = card.querySelector('.lk-input');
    var err    = card.querySelector('[data-err]');
    var note   = card.querySelector('[data-note]');
    var submit = card.querySelector('[data-submit]');
    var rows   = {
      diff:  card.querySelector('[data-row="diff"]'),
      usage: card.querySelector('[data-row="usage"]'),
      total: card.querySelector('[data-row="total"]')
    };
    var vals = {
      diff:  card.querySelector('[data-diff]'),
      usage: card.querySelector('[data-usage]'),
      total: card.querySelector('[data-total]')
    };

    // сворачивание: кликабелен весь хедер, кнопка-шеврон остаётся для клавиатуры
    var hdr = card.querySelector('.lk-meter-hdr');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
      card.classList.toggle('is-collapsed', !open);
    }

    hdr.addEventListener('click', function (e) {
      // подсказки «i» внутри хедера не должны сворачивать карточку
      if (e.target.closest('[data-lk-tip]')) return;
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    toggle.addEventListener('click', function (e) { e.stopPropagation(); setOpen(body.hidden); });

    card.__setOpen = setOpen;

    function renderChart() {
      if (!window.EneroneConsumptionChart) return;
      window.EneroneConsumptionChart.render(
        card.querySelector('[data-chart]'),
        m.chart,
        { title: 'Потребление счётчика ' + m.num, unit: 'кВт·ч' }
      );
    }

    // при закрытом окне передачи поля ввода нет — считать нечего
    if (!input) {
      renderChart();
      return;
    }

    var prev = parseFloat(m.prev);

    function reset(message) {
      ['diff', 'usage', 'total'].forEach(function (k) {
        rows[k].classList.add('is-empty');
        vals[k].textContent = '—';
      });
      submit.hidden = true;
      note.hidden = false;
      input.classList.toggle('is-invalid', !!message);
      err.hidden = !message;
      err.textContent = message || '';
    }

    function recalc() {
      var raw = input.value.trim().replace(',', '.');

      if (raw === '') { reset(''); return; }

      var cur = parseFloat(raw);
      if (!isFinite(cur) || !/^\d+(\.\d+)?$/.test(raw)) {
        reset('Введите число');
        return;
      }
      if (cur < prev) {
        reset('Текущие показания меньше предыдущих (' + m.prev + ')');
        return;
      }

      var diff  = cur - prev;
      var usage = diff * m.kt;
      var total = usage * o.tariff;

      input.classList.remove('is-invalid');
      err.hidden = true;

      rows.diff.classList.remove('is-empty');
      vals.diff.textContent = num(diff, diff % 1 ? 2 : 0);

      rows.usage.classList.remove('is-empty');
      vals.usage.textContent = num(usage, usage % 1 ? 2 : 0) + ' кВт·ч';

      rows.total.classList.remove('is-empty');
      vals.total.textContent = num(total, 2) + ' ₽ с НДС';

      submit.hidden = false;
      note.hidden = true;
    }

    input.addEventListener('input', recalc);
    input.addEventListener('change', recalc);

    submit.addEventListener('click', function () {
      console.log('[ЛК] отправка показаний', {
        договор: state.contract.num,
        объект: o.name,
        пу: m.num,
        показания: input.value.trim()
      });
      submit.textContent = 'Отправлено ✓';
      submit.disabled = true;
      setTimeout(function () {
        submit.textContent = 'Отправить';
        submit.disabled = false;
      }, 2000);
    });

    renderChart();
  }

  /* ======================================================================
     Отправленные файлы
     ====================================================================== */

  function renderSentFiles(o) {
    var tbody = nodes.sentFiles;
    tbody.innerHTML = '';

    if (!o.sentFiles.length) {
      var tr = el('tr');
      tr.innerHTML = '<td colspan="2" style="color:var(--lk-muted-2);">' +
                     'Для этого объекта файлы ещё не отправлялись</td>';
      tbody.appendChild(tr);
      return;
    }

    o.sentFiles.forEach(function (row) {
      var tr = el('tr');
      tr.innerHTML =
        '<td class="lk-table-date">' + esc(row[0]) + '</td>' +
        '<td><a class="lk-table-file" href="#" ' +
            'data-lk-action="Скачать отправленный файл ' + esc(row[1]) + '">' +
            ICO_FILE + esc(row[1]) + '</a></td>';
      tbody.appendChild(tr);
    });
  }

  /* ======================================================================
     Старт
     ====================================================================== */

  function init() {
    nodes.contractPicker = document.getElementById('lk-contract-picker');
    if (!nodes.contractPicker) return;   // не эта страница

    nodes.objectPicker = document.getElementById('lk-object-picker');
    nodes.stepObject   = document.getElementById('lk-step-object');
    nodes.stepMeters   = document.getElementById('lk-step-meters');
    nodes.selected     = document.getElementById('lk-selected');
    nodes.meters       = document.getElementById('lk-meters');
    nodes.metersCount  = document.getElementById('lk-meters-count');
    nodes.sentFiles    = document.getElementById('lk-sent-files');
    nodes.sentPanel    = document.getElementById('lk-sent-panel');
    nodes.bulkUpload   = document.getElementById('lk-bulk-upload');
    nodes.uploadGrid   = document.getElementById('lk-upload-grid');

    nodes.windowNote = document.getElementById('lk-window-note');
    if (nodes.windowNote) nodes.windowNote.innerHTML = windowNoteHtml();
    syncWindowNote();

    // демо-переключатель состояния окна передачи
    document.querySelectorAll('[data-window-state]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.windowOpen = btn.getAttribute('data-window-state') === 'open';
        syncWindowNote();
        if (state.object) renderMeters(state.object);
      });
    });

    renderContracts();

    // переход с главной: readings.html?pu=10198124
    var puNum = new URLSearchParams(window.location.search).get('pu');
    var hit = puNum && findByMeter(puNum);
    if (hit) {
      selectContract(hit.contract, true);
      selectObject(hit.object, hit.meter.num);
      return;
    }

    // если договор один — сразу открываем его объекты
    if (DATA.contracts.length === 1) selectContract(DATA.contracts[0]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

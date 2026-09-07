/* ==========================================================================
   ЛК «Новая энергия» — страница «Сообщения» (прототип)

   Блок 1 — форма обращения: договор, тема, текст, файлы (опционально).
   Блок 2 — история: дата, сообщение, файлы, статус.
            «принято»   — обращение зарегистрировано, ответа ещё нет;
            «обработано» — есть ответ; непрочитанные выделяются.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     ДАННЫЕ. В боевой версии приходят с бэкенда.
     ====================================================================== */

  // справочник договоров
  var CONTRACTS = [
    { id: 'c-1104', num: 'ДЭС740201104', service: 'Энергоснабжение' },
    { id: 'c-1287', num: 'ДЭС740201287', service: 'Энергоснабжение' }
  ];

  // справочник тем обращения — порядок задан заказчиком, в нём и выводим
  var TOPICS = [
    { id: 't-charges',   name: 'Вопросы по начислениям/проведение перерасчета' },
    { id: 't-lk',        name: 'Вопросы по работе личного кабинета' },
    { id: 't-changes',   name: 'Внесение изменений по договору' },
    { id: 't-meters',    name: 'Вопросы по приборам учёта (неисправность/замена/допуск)' },
    { id: 't-refund',    name: 'Возврат/перенос денежных средств' },
    { id: 't-terminate', name: 'Расторжение договора' },
    { id: 't-other',     name: 'Прочее' }
  ];


  // история обращений, новые сверху
  var MESSAGES = [
    {
      id: 'm-7',
      date: '16 июля 2026 г. 14:36',
      contract: 'ДЭС740201104',
      topic: 'Внесение изменений по договору',
      text: 'Направляю уведомление о смене банковских реквизитов, прошу учесть при выставлении счетов.',
      files: ['uvedomlenie_rekvizity.pdf'],
      status: 'accepted'
    },
    {
      id: 'm-6',
      date: '15 июля 2026 г. 19:52',
      contract: 'ДЭС740201104',
      topic: 'Вопросы по начислениям/проведение перерасчета',
      text: 'Прошу выставить счёт на предоплату за август 2026 года.',
      files: ['zayavka_predoplata_08_2026.pdf'],
      status: 'accepted'
    },
    {
      id: 'm-5',
      date: '17 февраля 2026 г. 16:52',
      contract: 'ДЭС740201104',
      topic: 'Вопросы по приборам учёта (неисправность/замена/допуск)',
      text: 'Уточните, в какие сроки принимаются показания по прибору учёта 10198125 — в прошлом месяце данные не прошли.',
      files: [],
      status: 'processed',
      unread: true,
      answer: {
        date: '19 февраля 2026 г. 10:04',
        text: 'Показания принимаются с 0:00 20 числа текущего месяца до 15:00 4 числа месяца, ' +
              'следующего за расчётным. В январе данные поступили 6 числа, поэтому не были учтены. ' +
              'Расчёт за январь скорректирован, изменения отражены в счёте за февраль.'
      },
      more: [
        {
          side: 'client',
          date: '19 февраля 2026 г. 11:20',
          text: 'Спасибо. А если показания снова не успеют пройти в срок — расчёт будет ' +
                'по среднему или по нормативу?'
        },
        {
          side: 'company',
          date: '19 февраля 2026 г. 15:47',
          text: 'Если показания не поступят в установленный период, месяц считается по среднему ' +
                'потреблению за предыдущие три месяца. После передачи фактических показаний ' +
                'выполняем перерасчёт.'
        }
      ]
    },
    {
      id: 'm-4',
      date: '6 февраля 2026 г. 11:14',
      contract: 'ДЭС740201287',
      topic: 'Вопросы по начислениям/проведение перерасчета',
      text: 'Прошу предоставить акт сверки взаиморасчётов за второе полугодие 2025 года.',
      files: [],
      status: 'processed',
      unread: true,
      answer: {
        date: '9 февраля 2026 г. 09:31',
        text: 'Акт сверки за второе полугодие 2025 года сформирован и доступен в разделе «Акты сверки». ' +
              'Подписанный экземпляр направлен на вашу электронную почту.'
      }
    },
    {
      id: 'm-3',
      date: '5 февраля 2026 г. 16:54',
      contract: 'ДЭС740201104',
      topic: 'Вопросы по начислениям/проведение перерасчета',
      text: 'На электронную почту перестали приходить счета, последний получен в декабре.',
      files: [],
      status: 'processed',
      unread: true,
      answer: {
        date: '6 февраля 2026 г. 14:20',
        text: 'Письма отклонялись почтовым сервером получателя. Адрес рассылки обновлён, ' +
              'счета за декабрь и январь отправлены повторно. Проверьте, пожалуйста, папку «Спам».'
      }
    },
    {
      id: 'm-2',
      date: '12 декабря 2025 г. 10:08',
      contract: 'ДЭС740201287',
      topic: 'Прочее',
      text: 'Планируем подключение нового объекта в Катав-Ивановске, какой порядок действий?',
      files: ['shema_obekta.pdf', 'plan_uchastka.jpg'],
      status: 'processed',
      unread: false,
      answer: {
        date: '15 декабря 2025 г. 12:45',
        text: 'Направили на почту перечень документов и типовую форму заявки. ' +
              'После получения заявки срок подготовки технических условий — до 15 рабочих дней.'
      },
      more: [
        {
          side: 'client',
          date: '16 декабря 2025 г. 09:12',
          text: 'Заявку и схему направили на указанный адрес. Подтвердите, пожалуйста, ' +
                'что документы получены.',
          files: ['zayavka_podklyuchenie.pdf']
        },
        {
          side: 'company',
          date: '16 декабря 2025 г. 16:30',
          text: 'Документы получены и переданы в технический отдел. Ориентировочный срок ' +
                'подготовки технических условий — до 25 декабря.'
        }
      ]
    }
  ];

  /* ======================================================================
     Утилиты
     ====================================================================== */

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

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  function nowStamp() {
    var d = new Date();
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' г. ' +
           d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function fileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' КБ';
    return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' МБ';
  }

  var ICO_FILE = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
                 '<path d="M3 1.5h5l3 3v8H3z"/><path d="M8 1.5v3h3"/></svg>';
  var ICO_CHEVRON = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 8.5L7 5l3.5 3.5"/></svg>';
  var ICO_ANSWER = '<svg viewBox="0 0 14 14" aria-hidden="true">' +
                   '<path d="M2 2.5h10v7l-4.5 0L4.5 12V9.5H2z" stroke-linejoin="round"/></svg>';
  var ICO_CROSS = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6"/></svg>';

  var nodes = {};

  /* ======================================================================
     Справочники в форме
     ====================================================================== */

  function fillSelect(select, items, placeholder) {
    select.innerHTML = '';

    var empty = el('option', null, placeholder);
    empty.value = '';
    empty.disabled = true;
    empty.selected = true;
    select.appendChild(empty);

    items.forEach(function (it) {
      var o = el('option', null, it.label);
      o.value = it.value;
      select.appendChild(o);
    });
  }

  /* ======================================================================
     Прикреплённые файлы
     ====================================================================== */

  var attached = [];

  function renderFiles() {
    nodes.fileList.innerHTML = '';

    attached.forEach(function (f, idx) {
      var li = el('li', 'lk-file-item');
      li.innerHTML =
        ICO_FILE +
        '<span class="lk-file-name">' + esc(f.name) + '</span>' +
        '<span class="lk-file-size">' + fileSize(f.size) + '</span>';

      var del = el('button', 'lk-file-del', ICO_CROSS);
      del.type = 'button';
      del.setAttribute('aria-label', 'Убрать файл ' + f.name);
      del.addEventListener('click', function () {
        attached.splice(idx, 1);
        renderFiles();
      });

      li.appendChild(del);
      nodes.fileList.appendChild(li);
    });
  }

  function initFiles() {
    var input = nodes.form.querySelector('input[type="file"]');
    var drop = nodes.form.querySelector('.lk-file-drop');

    input.addEventListener('change', function () {
      Array.prototype.forEach.call(input.files, function (f) { attached.push(f); });
      input.value = '';                      // чтобы можно было добавить тот же файл снова
      renderFiles();
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.style.borderColor = 'var(--lk-green)';
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.style.borderColor = '';
      });
    });
    drop.addEventListener('drop', function (e) {
      if (!e.dataTransfer) return;
      Array.prototype.forEach.call(e.dataTransfer.files, function (f) { attached.push(f); });
      renderFiles();
    });
  }

  /* ======================================================================
     История обращений

     Два вида, переключаются демо-тумблером (VIEW):
       'classic' — как сейчас: обращение и один ответ;
       'thread'  — переписка внутри обращения с полем ответа.
     Данные общие: первая реплика — само обращение, вторая — m.answer,
     дальше — необязательный массив m.more.
     ====================================================================== */

  var VIEW = 'classic';

  // реплики обращения в хронологическом порядке
  function threadOf(m) {
    var turns = [{ side: 'client', date: m.date, text: m.text, files: m.files }];
    if (m.answer) turns.push({ side: 'company', date: m.answer.date, text: m.answer.text });
    return turns.concat(m.more || []);
  }

  // «обработано», пока последнее слово за компанией; ответил клиент — снова «принято»
  function isAnswered(m) {
    var turns = threadOf(m);
    return turns[turns.length - 1].side === 'company';
  }

  function renderMessages(openId) {
    nodes.msgs.innerHTML = '';

    if (!MESSAGES.length) {
      nodes.msgs.appendChild(el('div', 'lk-msg-empty', 'Обращений пока нет'));
      updateUnread();
      return;
    }

    MESSAGES.forEach(function (m) {
      var card = VIEW === 'thread' ? buildThreadCard(m) : buildMessage(m);
      nodes.msgs.appendChild(card);
      if (openId && m.id === openId) card.querySelector('[data-open]').click();
    });

    updateUnread();
  }

  function filesHtmlOf(files) {
    return files && files.length
      ? files.map(function (f) {
          return '<a class="lk-msg-file" href="#" data-lk-action="Скачать файл обращения ' + esc(f) + '">' +
                 ICO_FILE + esc(f) + '</a>';
        }).join('')
      : '<span class="lk-msg-nofile">—</span>';
  }

  // шапка карточки — общая для обоих видов
  function topHtml(m, uid, expandable, label) {
    var statusHtml = isAnswered(m)
      ? '<span class="lk-status lk-status--processed">обработано</span>'
      : '<span class="lk-status lk-status--accepted">принято</span>';

    return '<div class="lk-msg-top">' +
        '<div class="lk-msg-date">' + esc(m.date) + '</div>' +

        '<div>' +
          '<span class="lk-msg-topic">' + esc(m.topic) +
            (m.unread ? '<span class="lk-new-badge" data-new>новый ответ</span>' : '') +
          '</span>' +
          '<div class="lk-msg-text">' + esc(m.text) + '</div>' +
          '<div class="lk-msg-contract">Договор № ' + esc(m.contract) + '</div>' +
        '</div>' +

        '<div class="lk-msg-files">' + filesHtmlOf(m.files) + '</div>' +

        '<div class="lk-msg-status">' + statusHtml +
          (expandable
            ? '<button type="button" class="lk-msg-toggle" data-open aria-expanded="false" ' +
                      'aria-controls="' + uid + '" aria-label="' + label + '">' + ICO_CHEVRON + '</button>'
            : '') +
        '</div>' +
      '</div>';
  }

  /* ---------- вид 1: обращение и ответ ---------- */

  function buildMessage(m) {
    var answered = !!m.answer;
    var uid = 'answer-' + m.id;

    var card = el('article', 'lk-msg' +
      (answered ? ' has-answer is-answered' : '') +
      (m.unread ? ' is-unread' : ''));

    card.innerHTML =
      topHtml(m, uid, answered, 'Показать ответ') +
      (answered
        ? '<div class="lk-msg-answer" id="' + uid + '" hidden>' +
            '<div class="lk-answer-hdr">' + ICO_ANSWER + 'Ответ' +
              '<span class="lk-answer-date">' + esc(m.answer.date) + '</span>' +
            '</div>' +
            '<div class="lk-answer-text">' + esc(m.answer.text) + '</div>' +
          '</div>'
        : '');

    if (answered) bindPanel(card, m, '.lk-msg-answer', 'ответ');
    return card;
  }

  /* ---------- вид 2: переписка внутри обращения ---------- */

  function buildThreadCard(m) {
    var uid = 'thread-' + m.id;
    var turns = threadOf(m);

    var card = el('article', 'lk-msg lk-msg--thread' +
      (m.answer ? ' has-answer is-answered' : '') +
      (m.unread ? ' is-unread' : ''));

    var turnsHtml = turns.map(function (t) {
      return '<div class="lk-th-msg is-' + t.side + '">' +
               '<div class="lk-th-meta">' +
                 '<span class="lk-th-who">' + (t.side === 'client' ? 'Вы' : 'Новая энергия') + '</span>' +
                 '<span class="lk-th-date">' + esc(t.date) + '</span>' +
               '</div>' +
               '<div class="lk-th-text">' + esc(t.text) + '</div>' +
               (t.files && t.files.length
                 ? '<div class="lk-th-files">' + filesHtmlOf(t.files) + '</div>'
                 : '') +
             '</div>';
    }).join('');

    card.innerHTML =
      topHtml(m, uid, true, 'Показать переписку') +
      '<div class="lk-thread" id="' + uid + '" hidden>' +
        turnsHtml +
        (isAnswered(m)
          ? ''
          : '<div class="lk-th-wait">Обращение принято, ответ придёт сюда и на электронную почту</div>') +
        '<form class="lk-th-reply" data-th-reply>' +
          '<textarea class="lk-textarea lk-th-input" rows="2" name="reply" ' +
                    'placeholder="Написать в это обращение"></textarea>' +
          '<button type="submit" class="lk-btn-primary">Отправить</button>' +
        '</form>' +
      '</div>';

    bindPanel(card, m, '.lk-thread', 'переписку');
    bindReply(card, m);
    return card;
  }

  function bindReply(card, m) {
    var form = card.querySelector('[data-th-reply]');

    form.addEventListener('click', function (e) { e.stopPropagation(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var text = form.reply.value.trim();
      if (!text) { form.reply.focus(); return; }

      // заглушка отправки: реплика уходит в конец переписки
      console.log('[ЛК] ответ в обращение', m.id + ':', text);
      m.more = (m.more || []).concat([{ side: 'client', date: nowStamp(), text: text }]);

      renderMessages(m.id);
    });
  }

  /* ---------- раскрытие панели ---------- */

  function bindPanel(card, m, sel, what) {
    var top = card.querySelector('.lk-msg-top');
    var toggle = card.querySelector('.lk-msg-toggle');
    var panel = card.querySelector(sel);

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', (open ? 'Скрыть ' : 'Показать ') + what);
      panel.hidden = !open;

      // раскрыли — обращение больше не непрочитанное
      if (open && m.unread) {
        m.unread = false;
        card.classList.remove('is-unread');
        var badge = card.querySelector('[data-new]');
        if (badge) badge.remove();
        updateUnread();
      }
    }

    top.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;       // клик по файлу не раскрывает панель
      setOpen(panel.hidden);
    });
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(panel.hidden);
    });
  }

  /* ---------- демо-переключатель вида ---------- */

  function initViewSwitch() {
    var btns = document.querySelectorAll('[data-msg-view]');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        VIEW = btn.getAttribute('data-msg-view');
        btns.forEach(function (b) {
          b.classList.toggle('is-on', b === btn);
        });
        renderMessages();
      });
    });
  }

  function updateUnread() {
    var n = MESSAGES.filter(function (m) { return m.unread; }).length;

    nodes.unread.hidden = n === 0;
    nodes.unread.querySelector('[data-unread-text]').textContent =
      n + ' ' + plural(n, 'новый ответ', 'новых ответа', 'новых ответов');

    // бейдж в сайдбаре держим в согласии со списком
    document.querySelectorAll('.lk-nav-badge').forEach(function (b) {
      b.textContent = n;
      b.hidden = n === 0;
    });
  }

  /* ======================================================================
     Свёрнутая форма и переходы из других разделов

     Ссылка вида
       feedback.html?new=1&contract=ДЭС740201104&topic=t-meters&text=…
     сразу раскрывает форму и подставляет значения.
     topic принимает и id темы (t-meters), и её полное название.
     ====================================================================== */

  function openNew(opts) {
    opts = opts || {};

    nodes.panel.hidden = false;
    nodes.bar.hidden = true;
    nodes.toggle.setAttribute('aria-expanded', 'true');

    if (!opts.keepOk) nodes.ok.hidden = true;

    if (opts.scroll !== false) {
      nodes.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // фокус на первое незаполненное поле
    var first = ['contract', 'topic', 'message'].map(function (n) {
      return nodes.form.querySelector('[name="' + n + '"]');
    }).filter(function (f) { return !f.value; })[0];
    (first || nodes.form.querySelector('[name="message"]')).focus({ preventScroll: true });
  }

  function closeNew() {
    nodes.panel.hidden = true;
    nodes.bar.hidden = false;
    nodes.toggle.setAttribute('aria-expanded', 'false');
  }

  function initNewToggle() {
    nodes.toggle.addEventListener('click', function () { openNew(); });
    nodes.panel.querySelectorAll('[data-new-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeNew();
        nodes.toggle.focus();
      });
    });
  }

  // выбрать значение селекта; вернуть true, если такой пункт есть
  function presetSelect(select, value) {
    if (!value) return false;
    var found = Array.prototype.some.call(select.options, function (o) {
      return o.value === value;
    });
    if (found) select.value = value;
    return found;
  }

  function applyDeepLink() {
    var q = new URLSearchParams(window.location.search);
    var contract = q.get('contract');
    var topicKey = q.get('topic');
    var text = q.get('text');

    if (!q.has('new') && !contract && !topicKey && !text) return;

    if (contract) presetSelect(document.getElementById('lk-fb-contract'), contract);

    if (topicKey) {
      // допускаем и id темы, и её название
      var byId = TOPICS.filter(function (t) { return t.id === topicKey; })[0];
      presetSelect(document.getElementById('lk-fb-topic'), byId ? byId.name : topicKey);
    }

    if (text) nodes.form.message.value = text;

    openNew();
  }

  /* ======================================================================
     Отправка обращения
     ====================================================================== */

  function initForm() {
    var form = nodes.form;
    var ok = nodes.ok;

    function showError(name, show) {
      var field = form.querySelector('[name="' + name + '"]');
      var err = form.querySelector('[data-err-for="' + name + '"]');
      field.classList.toggle('is-invalid', show);
      err.hidden = !show;
    }

    ['contract', 'topic', 'message'].forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      field.addEventListener('input', function () { showError(name, false); });
      field.addEventListener('change', function () { showError(name, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ok.hidden = true;

      var contract = form.contract.value;
      var topic = form.topic.value;
      var message = form.message.value.trim();
      var bad = null;

      showError('contract', !contract);
      showError('topic', !topic);
      showError('message', !message);

      if (!contract) bad = 'contract';
      else if (!topic) bad = 'topic';
      else if (!message) bad = 'message';

      if (bad) { form.querySelector('[name="' + bad + '"]').focus(); return; }

      submitMessage({
        contract: contract,
        topic: topic,
        message: message,
        files: attached.map(function (f) { return f.name; })
      });

      form.reset();
      attached = [];
      renderFiles();
      closeNew();                      // форма сворачивается, подтверждение остаётся
      ok.hidden = false;
    });
  }

  // заглушка отправки: обращение сразу попадает в историю со статусом «принято»
  function submitMessage(data) {
    console.log('[ЛК] новое обращение:', data);

    MESSAGES.unshift({
      id: 'm-' + Date.now(),
      date: nowStamp(),
      contract: data.contract,
      topic: data.topic,
      text: data.message,
      files: data.files,
      status: 'accepted'
    });

    renderMessages();
  }

  /* ======================================================================
     Старт
     ====================================================================== */

  function init() {
    nodes.form = document.getElementById('lk-feedback-form');
    if (!nodes.form) return;                 // не эта страница

    nodes.msgs = document.getElementById('lk-msgs');
    nodes.unread = document.getElementById('lk-unread-count');
    nodes.fileList = nodes.form.querySelector('[data-file-list]');
    nodes.panel  = document.getElementById('lk-new-panel');
    nodes.bar    = document.getElementById('lk-new-bar');
    nodes.toggle = document.querySelector('[data-new-toggle]');
    nodes.ok     = document.querySelector('[data-form-ok]');

    fillSelect(document.getElementById('lk-fb-contract'),
      CONTRACTS.map(function (c) {
        return { value: c.num, label: '№ ' + c.num + ' — ' + c.service };
      }), 'Выберите договор');

    fillSelect(document.getElementById('lk-fb-topic'),
      TOPICS.map(function (t) { return { value: t.name, label: t.name }; }),
      'Выберите тему обращения');

    initFiles();
    initNewToggle();
    initForm();
    initViewSwitch();
    renderMessages();
    applyDeepLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

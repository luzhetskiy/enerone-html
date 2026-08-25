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

  // справочник тем обращения
  var TOPICS = [
    { id: 't-terminate', name: 'Расторжение договора' },
    { id: 't-lk',        name: 'Вопросы по работе личного кабинета' },
    { id: 't-other',     name: 'Прочее' },
    { id: 't-meters',    name: 'Вопросы по приборам учёта (неисправность/замена/допуск)' },
    { id: 't-refund',    name: 'Возврат/перенос денежных средств' },
    { id: 't-charges',   name: 'Вопросы по начислениям/проведение перерасчета' },
    { id: 't-changes',   name: 'Внесение изменений по договору' }
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
        author: 'Персональный менеджер, Соколова М. В.',
        text: 'Показания принимаются с 0:00 20 числа текущего месяца до 15:00 4 числа месяца, ' +
              'следующего за расчётным. В январе данные поступили 6 числа, поэтому не были учтены. ' +
              'Расчёт за январь скорректирован, изменения отражены в счёте за февраль.'
      }
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
        author: 'Персональный менеджер, Соколова М. В.',
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
        author: 'Персональный менеджер, Соколова М. В.',
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
        author: 'Персональный менеджер, Соколова М. В.',
        text: 'Направили на почту перечень документов и типовую форму заявки. ' +
              'После получения заявки срок подготовки технических условий — до 15 рабочих дней.'
      }
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
     ====================================================================== */

  function renderMessages() {
    nodes.msgs.innerHTML = '';

    if (!MESSAGES.length) {
      nodes.msgs.appendChild(el('div', 'lk-msg-empty', 'Обращений пока нет'));
      updateUnread();
      return;
    }

    MESSAGES.forEach(function (m) {
      nodes.msgs.appendChild(buildMessage(m));
    });

    updateUnread();
  }

  function buildMessage(m) {
    var answered = m.status === 'processed' && m.answer;
    var uid = 'answer-' + m.id;

    var card = el('article', 'lk-msg' +
      (answered ? ' has-answer is-answered' : '') +
      (m.unread ? ' is-unread' : ''));

    var filesHtml = m.files && m.files.length
      ? m.files.map(function (f) {
          return '<a class="lk-msg-file" href="#" data-lk-action="Скачать файл обращения ' + esc(f) + '">' +
                 ICO_FILE + esc(f) + '</a>';
        }).join('')
      : '<span class="lk-msg-nofile">—</span>';

    var statusHtml = answered
      ? '<span class="lk-status lk-status--processed">обработано</span>'
      : '<span class="lk-status lk-status--accepted">принято</span>';

    card.innerHTML =
      '<div class="lk-msg-top">' +
        '<div class="lk-msg-date">' + esc(m.date) + '</div>' +

        '<div>' +
          '<span class="lk-msg-topic">' + esc(m.topic) +
            (m.unread ? '<span class="lk-new-badge" data-new>новый ответ</span>' : '') +
          '</span>' +
          '<div class="lk-msg-text">' + esc(m.text) + '</div>' +
          '<div class="lk-msg-contract">Договор № ' + esc(m.contract) + '</div>' +
        '</div>' +

        '<div class="lk-msg-files">' + filesHtml + '</div>' +

        '<div class="lk-msg-status">' + statusHtml +
          (answered
            ? '<button type="button" class="lk-msg-toggle" aria-expanded="false" ' +
                      'aria-controls="' + uid + '" aria-label="Показать ответ">' + ICO_CHEVRON + '</button>'
            : '') +
        '</div>' +
      '</div>' +

      (answered
        ? '<div class="lk-msg-answer" id="' + uid + '" hidden>' +
            '<div class="lk-answer-hdr">' + ICO_ANSWER + 'Ответ' +
              '<span class="lk-answer-date">' + esc(m.answer.date) + '</span>' +
            '</div>' +
            '<div class="lk-answer-text">' + esc(m.answer.text) + '</div>' +
            '<div class="lk-answer-author">' + esc(m.answer.author) + '</div>' +
          '</div>'
        : '');

    if (answered) bindAnswer(card, m);
    return card;
  }

  function bindAnswer(card, m) {
    var top = card.querySelector('.lk-msg-top');
    var toggle = card.querySelector('.lk-msg-toggle');
    var panel = card.querySelector('.lk-msg-answer');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Скрыть ответ' : 'Показать ответ');
      panel.hidden = !open;

      // раскрыли ответ — обращение больше не непрочитанное
      if (open && m.unread) {
        m.unread = false;
        card.classList.remove('is-unread');
        var badge = card.querySelector('[data-new]');
        if (badge) badge.remove();
        updateUnread();
      }
    }

    top.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;       // клик по файлу не раскрывает ответ
      setOpen(panel.hidden);
    });
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(panel.hidden);
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

    var now = new Date();
    var months = ['января','февраля','марта','апреля','мая','июня',
                  'июля','августа','сентября','октября','ноября','декабря'];

    MESSAGES.unshift({
      id: 'm-' + Date.now(),
      date: now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear() + ' г. ' +
            now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'),
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
    renderMessages();
    applyDeepLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

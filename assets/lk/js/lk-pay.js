/* ==========================================================================
   ЛК «Новая энергия» — онлайн-оплата и экраны возврата из банка (прототип)

   Способы оплаты описаны данными (METHODS): у каждого своя комиссия,
   поэтому итоговая сумма пересчитывается при смене способа. Добавление
   нового способа — это запись в METHODS, интерфейс не меняется.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     ДАННЫЕ. В боевой версии приходят с бэкенда.
     ====================================================================== */

  var CONTRACTS = [
    { num: 'ДЭС740201104', service: 'Энергоснабжение', debt: 143200 },
    { num: 'ДЭС740201287', service: 'Энергоснабжение', debt: 0 }
  ];

  // Комиссия за оплату картой — одна и та же, привязанной или введённой заново.
  var CARD_FEE = { fee: 1, feeMin: 30 };

  // Карты, привязанные в разделе «Автоплатежи». Пустой массив — способ не предлагается.
  var SAVED_CARDS = [
    { id: 'card-1', mask: '220015xxxxxx2861', system: 'МИР', expires: '09/28' }
  ];

  // Способы оплаты. fee — процент комиссии, feeMin — минимальная сумма комиссии.
  // Привязанные карты идут первыми: по ним оплата в один клик, без ввода реквизитов.
  var METHODS = SAVED_CARDS.map(function (c) {
    return {
      id: 'saved-' + c.id,
      name: 'Привязанная карта',
      desc: c.system + ' · ' + c.mask + ' · до ' + c.expires,
      full: 'Привязанная карта ' + c.system + ' · ' + c.mask,
      fee: CARD_FEE.fee,
      feeMin: CARD_FEE.feeMin,
      available: true
    };
  }).concat([
    {
      id: 'card',
      name: 'Банковская карта',
      desc: 'Visa, Mastercard, МИР — ввод реквизитов на странице банка',
      fee: CARD_FEE.fee,
      feeMin: CARD_FEE.feeMin,
      available: true
    },
    {
      id: 'sbp',
      name: 'СБП',
      desc: 'По QR-коду или через приложение вашего банка',
      fee: 0.4,
      feeMin: 10,
      available: false          // включается, когда способ запустят
    }
  ]);

  /* ======================================================================
     Утилиты
     ====================================================================== */

  function money(n) {
    return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  function calcFee(method, amount) {
    if (!method || !method.fee) return 0;
    return round2(Math.max(amount * method.fee / 100, method.feeMin || 0));
  }

  function findContract(num) {
    return CONTRACTS.filter(function (c) { return c.num === num; })[0];
  }

  function nowLabel() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ======================================================================
     Страница оплаты
     ====================================================================== */

  var state = { contract: null, method: null, amount: 0, result: 'success' };
  var n = {};

  function initPay() {
    var form = document.getElementById('lk-pay-form');
    if (!form) return false;

    n.form    = form;
    n.methods = document.getElementById('lk-pay-methods');
    n.amount  = form.querySelector('[name="amount"]');
    n.agree   = form.querySelector('[name="agree"]');
    n.btn     = form.querySelector('[data-pay-btn]');
    n.btnText = form.querySelector('[data-pay-btn-text]');
    n.full    = form.querySelector('[data-pay-full]');

    // договор берём из ссылки: online-pay.html?contract=ДЭС740201104
    var q = new URLSearchParams(window.location.search);
    state.contract = findContract(q.get('contract')) || CONTRACTS[0];

    form.querySelector('[data-purpose]').textContent = state.contract.debt
      ? 'Оплата текущей задолженности по договору № ' + state.contract.num
      : 'Внесение аванса на лицевой счёт по договору № ' + state.contract.num;

    var start = parseFloat(q.get('amount'));
    if (!isFinite(start) || start <= 0) start = state.contract.debt;

    n.amount.value = start ? start.toFixed(2) : '';
    form.querySelector('[data-amount-hint]').textContent = state.contract.debt
      ? 'Задолженность по договору — ' + money(state.contract.debt) +
        '. Сумму можно изменить, в том числе оплатить частично.'
      : 'Задолженности по договору нет. Можно внести аванс на лицевой счёт.';

    if (state.contract.debt) {
      n.full.hidden = false;
      n.full.textContent = 'Оплатить всю задолженность';
      n.full.addEventListener('click', function () {
        n.amount.value = state.contract.debt.toFixed(2);
        recalc();
        n.amount.focus();
      });
    }

    renderMethods();
    n.amount.addEventListener('input', recalc);
    n.agree.addEventListener('change', recalc);
    form.addEventListener('submit', onSubmit);

    initSbpDemo();
    initResultDemo();
    recalc();
    return true;
  }

  function renderMethods() {
    n.methods.innerHTML = '';

    var enabled = METHODS.filter(function (m) { return m.available; });
    if (!state.method || !state.method.available) state.method = enabled[0] || null;

    METHODS.forEach(function (m) {
      var label = document.createElement('label');
      label.className = 'lk-method';

      var feeText = m.fee
        ? 'Комиссия ' + String(m.fee).replace('.', ',') + '%'
        : 'Без комиссии';

      label.innerHTML =
        '<input type="radio" name="method" value="' + m.id + '"' +
          (m === state.method ? ' checked' : '') +
          (m.available ? '' : ' disabled') + '>' +
        '<span class="lk-method-box">' +
          '<span class="lk-method-dot" aria-hidden="true"></span>' +
          '<span class="lk-method-body">' +
            '<span class="lk-method-name">' + esc(m.name) +
              (m.available ? '' : '<span class="lk-soon">скоро</span>') +
            '</span>' +
            '<span class="lk-method-desc">' + esc(m.desc) + '</span>' +
            '<span class="lk-method-fee' + (m.fee ? '' : ' is-free') + '">' + feeText + '</span>' +
          '</span>' +
        '</span>';

      label.querySelector('input').addEventListener('change', function () {
        state.method = m;
        recalc();
      });

      n.methods.appendChild(label);
    });
  }

  function readAmount() {
    var raw = n.amount.value.trim().replace(/\s/g, '').replace(',', '.');
    if (raw === '') return { value: 0, error: '' };
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return { value: 0, error: 'Введите сумму числом' };
    var v = parseFloat(raw);
    if (v <= 0) return { value: 0, error: 'Сумма должна быть больше нуля' };
    if (v > 5000000) return { value: 0, error: 'Максимальная сумма одного платежа — 5 000 000 ₽' };
    return { value: v, error: '' };
  }

  function recalc() {
    var res = readAmount();
    var err = n.form.querySelector('[data-err-amount]');

    n.amount.classList.toggle('is-invalid', !!res.error);
    err.hidden = !res.error;
    err.textContent = res.error;

    state.amount = res.value;

    var fee = calcFee(state.method, state.amount);
    var total = round2(state.amount + fee);

    n.form.querySelector('[data-sum-amount]').textContent = state.amount ? money(state.amount) : '—';
    n.form.querySelector('[data-sum-fee-label]').textContent =
      state.method && state.method.fee ? 'Комиссия банка' : 'Комиссия';
    n.form.querySelector('[data-sum-fee]').textContent = state.amount ? money(fee) : '—';
    n.form.querySelector('[data-sum-total]').textContent = state.amount ? money(total) : '—';

    var ready = state.amount > 0 && !res.error && state.method && n.agree.checked;
    n.btn.disabled = !ready;
    n.btnText.textContent = state.amount && !res.error ? 'Оплатить ' + money(total) : 'Оплатить';

    if (n.agree.checked) {
      document.getElementById('lk-pay-agree-wrap').classList.remove('is-invalid');
      n.form.querySelector('[data-err-agree]').hidden = true;
    }
  }

  function onSubmit(e) {
    e.preventDefault();

    var res = readAmount();
    if (!res.value || res.error) { n.amount.focus(); return; }

    if (!n.agree.checked) {
      document.getElementById('lk-pay-agree-wrap').classList.add('is-invalid');
      n.form.querySelector('[data-err-agree]').hidden = false;
      n.agree.focus();
      return;
    }

    var fee = calcFee(state.method, res.value);

    // прототип: вместо перехода в банк открываем экран возврата.
    // В боевой версии здесь редирект на платёжный шлюз.
    var params = new URLSearchParams({
      contract: state.contract.num,
      amount: res.value.toFixed(2),
      fee: fee.toFixed(2),
      method: state.method.full || state.method.name
    });

    console.log('[ЛК] переход к оплате:', params.toString());
    window.location.href = 'online-pay-' + state.result + '.html?' + params.toString();
  }

  // демо-переключатель второго способа оплаты
  function initSbpDemo() {
    document.querySelectorAll('[data-sbp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('data-sbp') === 'on';
        METHODS.filter(function (m) { return m.id === 'sbp'; })
               .forEach(function (m) { m.available = on; });
        renderMethods();
        recalc();
      });
    });
  }

  // демо-переключатель ответа банка
  function initResultDemo() {
    var btns = document.querySelectorAll('[data-result]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.result = btn.getAttribute('data-result');
        btns.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      });
    });
  }

  /* ======================================================================
     Экраны возврата из банка
     ====================================================================== */

  function initResult() {
    var root = document.querySelector('[data-pay-result]');
    if (!root) return false;

    var q = new URLSearchParams(window.location.search);
    var contract = q.get('contract') || CONTRACTS[0].num;
    var amount = parseFloat(q.get('amount'));
    var fee = parseFloat(q.get('fee'));
    var method = q.get('method') || METHODS[0].name;

    if (!isFinite(amount)) amount = CONTRACTS[0].debt;
    if (!isFinite(fee)) fee = calcFee(METHODS[0], amount);

    var ok = root.getAttribute('data-pay-result') === 'success';
    var total = round2(amount + fee);

    function set(sel, value) {
      var elm = root.querySelector(sel);
      if (elm) elm.textContent = value;
    }

    set('[data-result-total]', money(ok ? total : total));
    set('[data-result-contract]', '№ ' + contract);
    set('[data-result-amount]', money(amount));
    set('[data-result-fee]', money(fee));
    set('[data-result-method]', method);
    set('[data-result-date]', q.get('date') || nowLabel());
    set('[data-result-id]', q.get('id') || genId());
    set('[data-result-code]', q.get('code') || 'PAY-DECLINED-05');

    // в поддержку уходит черновик с реквизитами неудачной попытки
    var support = root.querySelector('[data-support]');
    if (support) {
      support.href = 'feedback.html?new=1&topic=t-refund' +
        '&contract=' + encodeURIComponent(contract) +
        '&text=' + encodeURIComponent(
          'Не проходит оплата по договору № ' + contract + ' на сумму ' + money(amount) +
          '. Код ошибки: ' + (q.get('code') || 'PAY-DECLINED-05') +
          ', время попытки: ' + (q.get('date') || nowLabel()) + '.');
    }

    return true;
  }

  function genId() {
    return 'NE-' + new Date().getFullYear() + '-' +
           String(Math.floor(Math.random() * 900000) + 100000);
  }

  /* ======================================================================
     Старт
     ====================================================================== */

  function init() {
    if (initPay()) return;
    initResult();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ==========================================================================
   ЛК «Новая энергия» — страница «Профиль» (прототип)

   Блок 1 — анкета: email и телефон только для чтения, остальное редактируется.
   Блок 2 — смена пароля: текущий, новый и повтор, с показом символов
            и живой проверкой требований.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     Требования к паролю
     ====================================================================== */

  var RULES = {
    length: function (v) { return v.length >= 8; },
    case:   function (v) { return /[a-zа-яё]/.test(v) && /[A-ZА-ЯЁ]/.test(v); },
    digit:  function (v) { return /\d/.test(v); }
  };

  function passOk(v) {
    return Object.keys(RULES).every(function (k) { return RULES[k](v); });
  }

  /* ======================================================================
     Общее
     ====================================================================== */

  function showError(form, name, message) {
    var field = form.querySelector('[name="' + name + '"]');
    var err = form.querySelector('[data-err-for="' + name + '"]');
    if (field) field.classList.toggle('is-invalid', !!message);
    if (!err) return;
    err.hidden = !message;
    if (message) err.textContent = message;
  }

  function clearErrors(form) {
    form.querySelectorAll('[data-err-for]').forEach(function (e) { e.hidden = true; });
    form.querySelectorAll('.is-invalid').forEach(function (e) { e.classList.remove('is-invalid'); });
  }

  /* ======================================================================
     Показ пароля
     ====================================================================== */

  function initEyes() {
    document.querySelectorAll('[data-pass-eye]').forEach(function (btn) {
      var input = btn.parentNode.querySelector('input');
      if (!input) return;

      btn.addEventListener('click', function () {
        var shown = btn.getAttribute('aria-pressed') === 'true';
        input.type = shown ? 'password' : 'text';
        btn.setAttribute('aria-pressed', String(!shown));
        btn.setAttribute('aria-label', shown ? 'Показать пароль' : 'Скрыть пароль');
        input.focus();
      });
    });
  }

  /* ======================================================================
     Блок 1 — анкета
     ====================================================================== */

  function initProfile() {
    var form = document.getElementById('lk-profile-form');
    if (!form) return;

    var saved = form.querySelector('[data-profile-saved]');

    // исходные значения — чтобы «Отменить» вернул анкету как было
    var initial = {};
    form.querySelectorAll('input:not([readonly])').forEach(function (i) {
      initial[i.name] = i.value;
    });

    form.querySelectorAll('input').forEach(function (i) {
      i.addEventListener('input', function () {
        showError(form, i.name, '');
        saved.hidden = true;
      });
    });

    form.querySelector('[data-profile-cancel]').addEventListener('click', function () {
      Object.keys(initial).forEach(function (name) {
        form.querySelector('[name="' + name + '"]').value = initial[name];
      });
      clearErrors(form);
      saved.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      saved.hidden = true;

      var required = [
        ['lastName', 'Укажите фамилию'],
        ['firstName', 'Укажите имя'],
        ['organization', 'Укажите название организации']
      ];

      var bad = null;
      required.forEach(function (r) {
        if (!form[r[0]].value.trim()) {
          showError(form, r[0], r[1]);
          if (!bad) bad = r[0];
        }
      });

      if (bad) { form[bad].focus(); return; }

      // прототип: здесь будет запрос сохранения анкеты
      var data = {};
      form.querySelectorAll('input').forEach(function (i) { data[i.name] = i.value.trim(); });
      console.log('[ЛК] сохранение анкеты:', data);

      Object.keys(initial).forEach(function (name) {
        initial[name] = form.querySelector('[name="' + name + '"]').value;
      });

      saved.hidden = false;
    });
  }

  /* ======================================================================
     Блок 2 — смена пароля
     ====================================================================== */

  function initPassword() {
    var form = document.getElementById('lk-password-form');
    if (!form) return;

    var saved = form.querySelector('[data-password-saved]');
    var rules = form.querySelectorAll('[data-rule]');

    function paintRules(value) {
      rules.forEach(function (li) {
        var check = RULES[li.getAttribute('data-rule')];
        li.classList.toggle('is-ok', !!value && check(value));
      });
    }

    form.password.addEventListener('input', function () {
      paintRules(form.password.value);
      showError(form, 'password', '');
      saved.hidden = true;
    });

    [form.current, form.repeat].forEach(function (i) {
      i.addEventListener('input', function () {
        showError(form, i.name, '');
        saved.hidden = true;
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      saved.hidden = true;

      var cur = form.current.value;
      var pass = form.password.value;
      var rep = form.repeat.value;

      if (!cur) {
        showError(form, 'current', 'Введите текущий пароль');
        form.current.focus();
        return;
      }
      if (!pass) {
        showError(form, 'password', 'Введите новый пароль');
        form.password.focus();
        return;
      }
      if (!passOk(pass)) {
        showError(form, 'password', 'Пароль не отвечает требованиям ниже');
        form.password.focus();
        return;
      }
      if (pass === cur) {
        showError(form, 'password', 'Новый пароль совпадает с текущим');
        form.password.focus();
        return;
      }
      if (rep !== pass) {
        showError(form, 'repeat', 'Пароли не совпадают');
        form.repeat.focus();
        return;
      }

      // прототип: здесь будет запрос смены пароля
      console.log('[ЛК] смена пароля');

      form.reset();
      paintRules('');
      saved.hidden = false;
    });
  }

  function init() {
    initEyes();
    initProfile();
    initPassword();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

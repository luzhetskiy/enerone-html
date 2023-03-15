"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

$(document).ready(function () {
  toggle();
  formElements();
  if (tippy) tippy('[data-tippy-content]', {
      allowHTML: true
  });
});

function toggle() {
  var $section = $('.toggle-section'),
      speed = 150;
  $section.each(function () {
    var $this = $(this),
        $toggle = $this.find('.toggle-section__trigger'),
        $content = $this.find('.toggle-section__content'),
        state = $this.hasClass('active') ? true : false,
        initialized;
    $toggle.on('click', function () {
      state = !state ? true : false;
      check();
    });

    if ($this.is('[data-hover]')) {
      var timeout;
      $toggle.add($content).on('mouseenter', function (event) {
        if (!TouchHoverEvents.touched) {
          if (timeout) clearTimeout(timeout);
          state = true;
          check();
        }
      });
      $toggle.add($content).on('mouseleave', function (event) {
        if (!TouchHoverEvents.touched) {
          var delay;

          if ($(this).is($toggle)) {
            delay = 500;
          } else {
            delay = 100;
          }

          timeout = setTimeout(function () {
            state = false;
            check();
          }, delay);
        }
      });
    }

    if ($this.is('[data-out-hide]') || $this.is('[data-hover]')) {
      $(document).on('click touchstart', function (event) {
        var $target = $(event.target);

        if (!$target.closest($content).length && !$target.closest($toggle).length && state) {
          state = false;
          check();
        }
      });
    }

    function check() {
      if (state) {
        $this.add($content).add($toggle).addClass('active');

        if ($this.is('[data-slide]')) {
          $content.show(speed);
        }
      } else {
        $this.add($toggle).add($content).removeClass('active');

        if ($this.is('[data-slide]')) {
          if (initialized) {
            $content.stop().slideUp(speed);
          }
        }
      }
    }

    check();
    initialized = true;
  });
}

function formElements() {
  var $inputs = document.querySelectorAll('.form-element__input');
  document.addEventListener('focus', function (event) {
    inputEvents(event);
  }, true);
  document.addEventListener('blur', function (event) {
    inputEvents(event);
  }, true);
  document.addEventListener('input', function (event) {
    inputEvents(event);
  }, true);
  document.addEventListener('change', function (event) {
    inputEvents(event);
  }, true);

  var inputEvents = function inputEvents(event) {
    var $element = event.target,
        $parent = event.target.parentNode;

    if ($parent && $parent.classList.contains('form-element')) {
      if (event.type == 'focus') {
        $parent.classList.add('focus');
      } else if (event.type == 'blur') {
        $parent.classList.remove('focus');
      } else {
        checkInput($element); //remove errors

        if ($parent.classList.contains('error')) {
          $parent.classList.remove('error');
          var $messages = $parent.querySelector('.errorlist');
          if ($messages) $messages.remove();
        }
      }
    }
  };

  var checkInput = function checkInput($element) {
    var value = $element.value.replace(/^\s+|\s+$/g, ''),
        $parent = $element.parentNode;

    if (value !== '') {
      $parent.classList.add('filled');
    } else {
      $parent.classList.remove('filled');
    }
  };

  $inputs.forEach(function ($element) {
    checkInput($element);
  }); //selects

  var $selects = $('.form-element__select');
  $selects.select2({
    theme: 'new-select',
    minimumResultsForSearch: Infinity,
    placeholder: {
      id: '',
      text: ''
    },
    allowClear: true
  });
  $selects.on('select2:select select2:open select2:close', function (event) {
    var $this = $(event.target),
        $parent = $this.parents('.form-element');

    if (event.type == 'select2:open') {
      $parent.addClass('focus');
    } else if (event.type == 'select2:close') {
      $parent.removeClass('focus');
    } else {
      $parent.addClass('filled'); //remove errors

      if ($parent.hasClass('error')) {
        $parent.removeClass('error');
        var $messages = $parent.find('.errorlist');
        if ($messages) $messages.remove();
      }
    }
  });
  $selects.each(function () {
    var $this = $(this),
        $parent = $this.parents('.form-element');

    if ($this.val().replace(/^\s+|\s+$/g, '') !== '') {
      $parent.addClass('filled');
    }
  }); //checkboxes 

  $(document).on('change', '[data-checkbox-group]', function (event) {
    var $target = $(event.target),
        type = $target.attr('data-checkbox-type'),
        group = $target.attr('data-checkbox-group'),
        $targets = $("[data-checkbox-group='".concat(group, "']"));

    if ($target.is(':checked')) {
      $targets.each(function () {
        var $this = $(this),
            self_type = $this.attr('data-checkbox-type');

        if (self_type !== type) {
          $this.prop('checked', false);
        }
      });
    }
  }); //file

  $(document).on('change', '.form-upload__input', function (event) {
    var $this = $(this),
        $parent = $this.parent(),
        $names = $parent.find('.form-upload__names'),
        $label = $parent.find('.form-upload__label'),
        val = $this.val();

    if (val) {
      var count = $this[0].files.length,
          names = [],
          i = 0;

      var _iterator = _createForOfIteratorHelper($this[0].files),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var file = _step.value;
          names[i] = file.name;
          i++;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if ($names.length) {
        $names.text(names.join(', '));
      } else {
        $label.after("<span class='form-upload__names'>".concat(names.join(', '), "</span>"));
      }

      $label.text("\u0417\u0430\u0433\u0440\u0443\u0436\u0443\u0435\u043D\u043E \u0444\u0430\u0439\u043B\u043E\u0432: ".concat(count));
    } else {
      if ($names.length) $names.remove();
      $label.text('Загрузить файлы');
    }
  });
}
//# sourceMappingURL=maps/lk.js.map

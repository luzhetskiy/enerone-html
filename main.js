"use strict";

(function ($) {
  /* Mobile Menu
    * ---------------------------------------------------- */
  var clMobileMenu = function clMobileMenu() {
    var navWrap = $('.header__nav-wrap'),
        closeNavWrap = navWrap.find('.header__overlay-close'),
        menuToggle = $('.header__toggle-menu'),
        siteBody = $('body');
    menuToggle.on('click', function (e) {
      var $this = $(this);
      e.preventDefault();
      e.stopPropagation();
      siteBody.addClass('nav-wrap-is-visible');
    });
    /*closeNavWrap.on('click', function(e) {
        
        var $this = $(this);
        
        e.preventDefault();
        e.stopPropagation();
    
        if(siteBody.hasClass('nav-wrap-is-visible')) {
            siteBody.removeClass('nav-wrap-is-visible');
        }
    });*/
    // open (or close) submenu items in mobile view menu. 
    // close all the other open submenu items.

    $('.header__nav .has-children').children('a').on('click', function (e) {
      e.preventDefault();

      if ($('.close-mobile-menu').is(':visible') == true) {
        $(this).toggleClass('sub-menu-is-open').next('ul').slideToggle(200).end().parent('.has-children').siblings('.has-children').children('a').removeClass('sub-menu-is-open').next('ul').slideUp(200);
      }
    });
  };

  $('.scroll-top').on('click', function () {
    $('body,html').animate({
      scrollTop: 0
    }, 400);
    return false;
  });
  /* Initialize
   * ------------------------------------------------------ */

  (function ssInit() {
    clMobileMenu();
  })();
})(jQuery);

window.chartColors = {
  red: '#EB6437',
  orange: 'rgb(255, 159, 64)',
  yellow: '#F1E14F',
  green: '#5AC37D',
  blue: '#78A0D4',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

(function (global) {
  var Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var COLORS = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#166a8f', '#00a950', '#58595b', '#8549ba']; // DEPRECATED

  window.randomScalingFactor = function () {
    return Math.round(Samples.utils.rand(-100, 100));
  };

  $('select.form-control').select2({
    theme: 'custom-select',
    minimumResultsForSearch: Infinity,
    placeholder: {
      id: '',
      // the value of the option
      text: ''
    },
    allowClear: true
  });
  $('.dropdown-select').select2({
    theme: 'custom-select',
    minimumResultsForSearch: Infinity,
    placeholder: {
      id: '',
      // the value of the option
      text: ''
    },
    allowClear: true
  });
  var $inputsList = $('.form-control[type="text"], .form-control[type="number"], .form-control[type="email"], .form-control[type="password"], textarea.form-control');
  $inputsList.on('focus', function (e) {
    $(e.target).siblings('.control-label').addClass('active-label');
  });
  $inputsList.on('blur', function (e) {
    if ($(e.target).val().length == 0) {
      $(e.target).siblings('.control-label').removeClass('active-label');
    }
  });
  $inputsList.each(function (index, el) {
    if (el.value != "") {
      $(el).siblings("label").addClass('active-label');
    }
  });
  $('select.form-control').on('select2:select', function (e) {
    $(e.target).siblings('.control-label').addClass('active-label');
  });
  $('select.form-control').on('select2:open', function (e) {
    $(e.target).siblings('.control-label').addClass('active-label');
  });
  $('select.form-control').on('select2:close', function (e) {
    if ($(this).val() == '') {
      $(e.target).siblings('.control-label').removeClass('active-label');
    }
  });
  $('select.form-control').each(function (e) {
    if ($(this).val() !== '') {
      $(this).siblings('.control-label').addClass('active-label');
    }
  }); // $('#providers, #subjects').on('select2:close', function (e) {
  //     var count = $(this).select2('data').length;
  //     console.log(count);
  //     if(count == 0) {
  //         $(e.target).siblings('.control-label').removeClass('active-label');
  //     }
  // });

  $('label.control-label').css("display", "block");
  $(document).on('click', '.js-titleBox', function () {
    $(this).hasClass('active') ? $(this).removeClass('active') : $(this).addClass('active');
  });
  $(document).on('hover', 'tr.odd', function () {
    console.log($(this).next());
  });
  $(document).on('click', '.show-pass', function (event) {
    event.preventDefault();
    var $curInput = $(this).siblings('input');
    var curType = $curInput.attr('type');
    curType == 'password' ? $curInput.attr('type', 'text') : $curInput.attr('type', 'password');
  });

  if ($("#userPhone").length > 0) {
    var userPhone = document.getElementById('userPhone');
    var maskPhone = new IMask(userPhone, {
      mask: '+{7}(000)000-00-00'
    });
  }

  ;

  if ($("#countEnergy").length > 0) {
    var countEnergy = document.getElementById('countEnergy');
    var maskEnergy = new IMask(countEnergy, {
      mask: Number,
      thousandsSeparator: ' '
    });
  }

  ;
  $('.icon-info').popover({
    container: 'body',
    boundary: 'viewport',
    placement: 'bottom',
    html: true,
    trigger: 'focus',
    content: function content() {
      //var id = $(this).attr('id')
      return $(this).next('.d-none').html();
    }
  });
  $('#lang_select').on('change', function (event) {
    $('#lang_select_form').submit();
  });
})(void 0);
//# sourceMappingURL=maps/main.js.map

"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

$(document).ready(function (event) {
    prepareInputs(); // инициализация слайдера с результатами работы

    if ($('.content_elements__slider').length > 0) {
        if ($.fn.owlCarousel) {
            $('.content_elements__slider').not('.owl-loaded').owlCarousel({
                loop: false,
                nav: false,
                dots: true,
                items: 3,
                margin: 15,
                freeDrag: false,
                autoWidth: false,
                responsive: {
                    10: {
                        items: 1,
                        margin: 0
                    },
                    650: {
                        items: 2,
                        margin: 15
                    },
                    900: {
                        items: 3,
                        margin: 15
                    }
                }
            });
        }
    } // конец
    // копируем кнопку пользовательского меню для мобильного отображения


    if ($('.header__content .header-user').length > 0) {
        var mobile_user_btn = $('.header__content .header-user').clone();
        mobile_user_btn.addClass('header-user-mobile-toggler-menu');
        $('.header__content').append(mobile_user_btn);
        mobile_user_btn = null;
    } // конец


    setBenefitsCornerPos();
    prepareContentImagesToDisplay();
    prepareContentTablesToDisplay();
});
$(window).resize(function (event) {
    setBenefitsCornerPos();
}); // если в них есть данные, то приводим к активному виду

function prepareInputs() {
    $('input , textarea').not('.input_placeholder, .form-checkbox__input, .form-radio__input').each(function (index) {
        var self = $(this);
        var label = self.parent().eq(0).find('label[for="' + self.attr('id') + '"]');

        if (_typeof(label) == 'object' && parseInt(self.val().length) > 0) {
            label.trigger('click');
            self.trigger('blur');
            return true;
        }

        if (parseInt(self.val().length) <= 0 && self.is('[required]')) {
            label.removeClass('label_invalid_input');
            self.addClass('default_at_pageload');
            return true;
        }

        self = null;
        label = null;
    });
} // отрисовка инпутов по фокусу и его потере


$(document).on('focus blur change', 'input , textarea', function (event) {
    var self = $(this);
    var label = self.parents('.form-group').eq(0).find('label[for="' + self.attr('id') + '"]');

    if (self.is(':invalid')) {
        label.addClass('label_invalid_input');
        self.addClass('input_invalid');
        self.removeClass('default_at_pageload');
    } else {
        label.removeClass('label_invalid_input');
        self.removeClass('input_invalid');
    }

    if (event.type == 'focusin' || event.type == 'change') {
        label.addClass('label_active_input');

        if (self.is('[type="password"]')) {
            self.parent().eq(0).find('.toggle_password__field').fadeIn(300);
        }
    } else {
        if (self.val().length <= 0 && !self.hasClass('active')) {
            label.removeClass('label_active_input').removeClass('active-label');

            if (self.is('[type="password"]')) {
                self.parent().eq(0).find('.toggle_password__field').fadeOut(300);
            }
        } else if (self.val().length > 0) {
            label.removeClass('label_invalid_input').addClass('active-label');
            self.removeClass('default_at_pageload');
            self.removeClass('input_invalid');
            self.parents('.form-group').eq(0).removeClass('is_invalid');
            self.parents('.form-group').eq(0).find('.form-group-message').fadeOut(300);
        }
    }
    /* switch(event.type) {
    case 'focusin':
        label.addClass('label_active_input');
        if (self.is('[type="password"]')) {
            self.parent().eq(0).find('.toggle_password__field').fadeIn(300);
        }
    break;
    case 'focusout':
        if (self.val().length <=0) {
            label.removeClass('label_active_input').removeClass('active-label');
                if (self.is('[type="password"]')) {
                self.parent().eq(0).find('.toggle_password__field').fadeOut(300);
            }
            } else if (self.val().length > 0) {
            label.removeClass('label_invalid_input').addClass('active-label');
            self.removeClass('default_at_pageload');
            self.removeClass('input_invalid');
            self.parents('.form-group').eq(0).removeClass('is_invalid');
            self.parents('.form-group').eq(0).find('.form-group-message').fadeOut(300);
        }
    break;
  } */


    self = null;
    event.preventDefault();
}); // проверка на валидность данных для стилизации полей с неверными значениями

$(document).on('keydown', 'input , textarea', function (event) {
    var self = $(this);
    var label = self.parent().eq(0).find('label[for="' + self.attr('id') + '"]');

    if (self.is(':invalid')) {
        label.addClass('label_invalid_input');
        self.removeClass('default_at_pageload');
    } else {
        label.removeClass('label_invalid_input');
    }

    self = null;
}); // вывод сообщений с ошибками для поля формы

function errorMessageToInput(message, input) {
    if (_typeof(input) == 'object') {
        if (typeof message == 'string' && message.length > 0) {
            var wrapper = input.parent().eq(0);

            if (wrapper.find('.form-group-message').length <= 0) {
                wrapper.prepend('<p class="form-group-message form-group-message-error">' + message + '</p>');
                var msgpopup = wrapper.find('.form-group-message');
            } else {
                var msgpopup = wrapper.find('.form-group-message');
            }

            input.addClass('input_invalid');
            input.removeClass('default_at_pageload');
            wrapper.find('label').addClass('label_invalid_input');
            msgpopup.fadeIn(300);
        }
    }
} // закрытие информационного сообщения (уведомления) поля формы


$(document).on('click', '.form-group-message:not(.form-group-message-inline)', function (event) {
    var msg = $(this);
    msg.fadeOut(300);
    msg.parent().eq(0).find('input').removeClass('input_invalid');
    msg.parent().eq(0).find('label').removeClass('label_invalid_input');
    event.preventDefault();
}); // закрытие информационного сообщения (уведомления) поля формы

$(document).on('click', '.form-group-message.form-group-message-inline', function (event) {
    var msg = $(this);
    msg.slideUp(300);
    msg.parent().eq(0).find('input').removeClass('input_invalid');
    msg.parent().eq(0).find('label').removeClass('label_invalid_input');
    event.preventDefault();
}); // проверка на идентичность паролей

$(document).on('keyup', 'input[id="reg-password-confirm"] , input[id="reg-password"]', function (event) {
    var passConfirm = $('input[id="reg-password-confirm"]');
    var passOrigin = $('input[id="reg-password"]');

    if (passConfirm.val().length <= 0 || passOrigin.val().length <= 0) {
        return false;
    } else {}

    if (passConfirm.val() != passOrigin.val()) {
        errorMessageToInput('Пароли не совпадают', $(this));
        passConfirm.parents('.form-group').eq(0).addClass('is_invalid');
        passConfirm.parents('.form-group').eq(0).find('label').addClass('label_invalid_input');
        passConfirm.addClass('input_invalid').removeClass('default_at_pageload');
        passOrigin.parents('.form-group').eq(0).addClass('is_invalid');
        passOrigin.parents('.form-group').eq(0).find('label').addClass('label_invalid_input');
        passOrigin.addClass('input_invalid').removeClass('default_at_pageload ');
    } else {
        passConfirm.parents('.form-group').eq(0).find('.form-group-message').fadeOut(300);
        passConfirm.parents('.form-group').eq(0).removeClass('is_invalid');
        passConfirm.parents('.form-group').eq(0).find('label').removeClass('label_invalid_input');
        passConfirm.removeClass('input_invalid');
        passOrigin.parents('.form-group').eq(0).removeClass('is_invalid');
        passOrigin.parents('.form-group').eq(0).find('label').removeClass('label_invalid_input');
        passOrigin.removeClass('input_invalid');
    }
}); // отработка клика по стилизованному чекбоксу

$(document).on('click', 'label.checkbox', function (event) {
    if ($(event.target).is('a')) {
        return true;
    }

    var label = $(this);
    var input = label.find('input');

    if (!label.hasClass('checked')) {
        label.addClass('checked');
        input.attr('checked', 'checked');
    } else {
        label.removeClass('checked');
        input.removeAttr('checked');
    }

    event.preventDefault();
}); // отработка клика по стилизованному радио инпуту

$(document).on('click', 'label.radio', function (event) {
    var label = $(this);
    var input = label.find('input');

    if (!label.hasClass('checked')) {
        label.parent().eq(0).find('label.checked').removeClass('checked').find('input').removeAttr('checked').trigger('change');
        label.addClass('checked');
        input.attr('checked', 'checked').trigger('change');
    }

    return true;
}); // валидация формы при сабмите, если есть обязательные поля
// которые не заполнены - показываем по ним сообщение

$(document).on('click', 'form [type="submit"]:not(".novalidate")', function (event) {
    if ($(this).parents('form').eq(0).find('[id="consent"]').length > 0) {
        var consent = $(this).parents('form').eq(0).find('[id="consent"]');

        if (!consent.is(':checked')) {
            consent.parents('.form-check').eq(0).find('.form-group-message').slideDown(300);
            return false;
        } else {
            consent.parents('.form-check').eq(0).find('.form-group-message').slideUp(300);
        }
    }

    $(this).parents('form').eq(0).find('[required]').each(function (index) {
        var self = $(this);

        if (self.val().length <= 0) {
            errorMessageToInput('Пожалуйста, заполните это поле.', self);
            self.parents('.form-group').eq(0).addClass('is_invalid');
            self.parents('.form-group').eq(0).find('label').addClass('label_invalid_input');
            self.addClass('input_invalid').removeClass('default_at_pageload');
            var offset = self.parents('.form-group').offset();
            if (offset) {
                $('html, body').animate({
                    scrollTop: offset.top - 80
                }, 300);

            }
            return false;
        }
    });
    return true;
}); // ввод только телефонного номера

$(document).on('keydown', '[name="phone"], .phone', function (event) {
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || // Allow: Ctrl/cmd+A
        event.keyCode == 65 && (event.ctrlKey === true || event.metaKey === true) || // Allow: Ctrl/cmd+C
        event.keyCode == 67 && (event.ctrlKey === true || event.metaKey === true) || // Allow: Ctrl/cmd+X
        event.keyCode == 88 && (event.ctrlKey === true || event.metaKey === true) || // Allow: home, end, left, right
        event.keyCode >= 35 && event.keyCode <= 39) {
        // let it happen, don't do anything
        return;
    } // Ensure that it is a number and stop the keypress


    if ((event.shiftKey || event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
    }
}); // ввод только телефонного номера

$(document).on('blur', '[name="email"] , [type="email"]', function (event) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var input = $(this);

    if (input.val().length > 0) {
        if (re.test(String(input.val()).toLowerCase())) {
            input.parents('.form-group').eq(0).removeClass('is_invalid');
            input.parents('.form-group').eq(0).find('label').removeClass('label_invalid_input');
            input.removeClass('input_invalid');
        } else {
            errorMessageToInput('Не верно указан E-mail', input);
            input.parents('.form-group').eq(0).addClass('is_invalid');
            input.parents('.form-group').eq(0).find('label').addClass('label_invalid_input').removeClass('label_active_input').addClass('label_active_input');
            input.addClass('input_invalid').removeClass('default_at_pageload');
            $('html, body').animate({
                scrollTop: input.parents('.form-group').offset().top - 80
            }, 300);
            return false;
        }
    }
}); // управление менюшкой пользовательской
// (сайдбар в разделе личного кабинета)
// в мобильной версии

/* $(document).on('click', 'a.header-user-mobile-toggler-menu', function(event) {
    if ($(window).width() <= 850) {
        if ($('.user_mobile_menu__wrapper')) {
            var toggler = $(this);
            var topPosition = toggler.offset().top + 15 + toggler.outerHeight();
            var leftPosition = toggler.offset().left + (toggler.outerWidth() / 2) - 16;
            var menu = $('.user_mobile_menu__wrapper');
            if(!menu.is('.user_mobile_menu__wrapper__active')) {
                menu.css({
                    top: topPosition + 'px'
                });
                menu.find('.user_mobile_menu__corner').css({
                    marginTop: '-16px' ,
                    left: leftPosition + 'px'
                });
                $('body').css({ overflow: 'hidden' });
                menu.addClass('user_mobile_menu__wrapper__active');
                menu.slideDown(200);

            } else {
                menu.removeClass('user_mobile_menu__wrapper__active');
                menu.slideUp(200);
                menu.find('.user_mobile_menu__corner').css({
                    marginTop: '0px' ,
                    left: '-1000%'
                });
                $('body').css({ overflow: 'visible' });
            }
            topPosition = null;
            toggler = null;
            menu = null;
        }
        event.preventDefault();

    } else {
        return true;
    }
}); */
// отображение попапа отчета по наведению на иконку

$(document).on('click', '.report_popup__toggler', function (event) {
    var toggler = $(this);
    var popup = toggler.parent().eq(0).find('.report_popup__wrapper');

    if (!popup.is('.report_popup__wrapper__active')) {
        $('.report_popup__wrapper').stop().removeClass('report_popup__wrapper__active').fadeOut(200);
        popup.addClass('report_popup__wrapper__active');
        popup.fadeIn(200);
    } else {
        popup.removeClass('report_popup__wrapper__active');
        popup.fadeOut(200);
    }

    toggler = null;
    popup = null;
    corner = null;
    leftPosition = null;
    event.preventDefault();
}); // скрытие попапа отчета если он теряет фокус мыши

$(document).on('mouseover mouseleave', '.report_popup__wrapper', function (event) {
    var popup = $(this);

    switch (event.type) {
        case 'mouseover':
            popup.addClass('report_popup__wrapper__active');
            break;

        case 'mouseleave':
            popup.removeClass('report_popup__wrapper__active');
            popup.fadeOut(200);
            break;
    }

    popup = null;
    event.preventDefault();
}); // наши преимущества

$(document).on('click', '.benefits__element__title', function (event) {
    var benefit_title = $(this);
    var benefit_content = benefit_title.parent().eq(0).find('.benefits__element__description');
    var benefit_target = $('.benefits__element__content__wrapper');

    if (!benefit_title.is('.benefits__element__title__active')) {
        $('.benefits__element__title.benefits__element__title__active').removeClass('benefits__element__title__active');
        benefit_title.addClass('benefits__element__title__active');
        benefit_target.html(benefit_content.html());
        setBenefitsCornerPos();
    }

    event.preventDefault();
}); // позиционирование уголка контента наших преимуществ

function setBenefitsCornerPos() {
    if ($('.benefits__wrapper__corner').length > 0 && $('.benefits__element__title.benefits__element__title__active').length > 0) {
        var corner = $('.benefits__wrapper__corner');
        var target = $('.benefits__element__title.benefits__element__title__active').parent().eq(0);
        var leftPosition = target.position().left + target.outerWidth() / 2 - $('.benefits__element__content').offset().left - 22;
        corner.css({
            left: leftPosition + 'px'
        });
        corner = null;
        target = null;
        leftPosition = null;
    }
} // удаление файла с формы заявки


$(document).on('click', '.fileslist__element a', function (event) {
    var wrapper = $(this).parents('.fileslist__element').eq(0);
    var filesWrapper = wrapper.parents('.custom_form__fileslist__wrapper').eq(0);
    wrapper.slideUp(300);
    setTimeout(function (wrapper, filesWrapper) {
        wrapper.remove();

        if (filesWrapper.find('.fileslist__element').length <= 0) {
            filesWrapper.html('<div class="fileslist__element fileslist__element__nofile" style="display:none;"><span>Файл не выбран</span></div>');

            if (filesWrapper.find('.fileslist__element.fileslist__element__nofile').length > 0) {
                filesWrapper.find('.fileslist__element.fileslist__element__nofile').slideDown(300);
            }
        }
    }, 310, wrapper, filesWrapper);
    event.preventDefault();
}); // добавление файла на форму заявки

$(document).on('click', '.custom_form__files__wrapper .add_file', function (event) {
    var addButton = $(this);
    var wrapper = addButton.parents('.custom_form__files__wrapper').eq(0);
    var filesWrapper = wrapper.find('.custom_form__fileslist__wrapper');
    var input_name = addButton.attr('data-inputs-name') + '[]';
    var input_id = addButton.attr('data-inputs-name') + '_' + (filesWrapper.find('.fileslist__element:not(.fileslist__element__nofile)').length + 1);
    filesWrapper.find('.fileslist__element__nofile__default').remove();
    filesWrapper.append('<div class="fileslist__element fileslist__element__nofile__default" style="display: none;"><input type="file" name="' + input_name + '" id="' + input_id + '"><span></span><a href="#">&nbsp;</a></div');
    setTimeout(function (input_target) {
        input_target.trigger('click');
    }, 30, $('[id="' + input_id + '"]'));
    event.preventDefault();
}); // выбор файла в инпут с формы заявки

$(document).on('change', '.custom_form__files__wrapper .fileslist__element input', function (event) {
    var wrapper = $(this).parent().eq(0);
    var filesWrapper = wrapper.parents('.custom_form__fileslist__wrapper').eq(0);
    var file_name = $(this).val().replace(/C:\\fakepath\\/i, '');

    if (file_name.length > 0) {
        if (filesWrapper.find('.fileslist__element.fileslist__element__nofile').length > 0) {
            var toremove = filesWrapper.find('.fileslist__element.fileslist__element__nofile');
            toremove.slideUp(300);
            setTimeout(function (toremove) {
                toremove.remove();
            }, 310, toremove);
            toremove = null;
        }

        wrapper.find('span').html(file_name);
        wrapper.find('a').html('Удалить');
        wrapper.removeClass('fileslist__element__nofile__default').slideDown(300);
    }
}); // переключение вида формы заявки на ПОЛНУЮ форму

$(document).on('click', '.custom_request__to_complex', function (event) {
    if ($('.custom_request_form__content__wrapper').length > 0) {
        $('.custom_request_form__content__wrapper .row').html($('[id="custom_request__to_complex"]').html());
    }

    event.preventDefault();
}); // переключение вида формы заявки на УПРОЩЁННУЮ форму

$(document).on('click', '.custom_request__to_default', function (event) {
    if ($('.custom_request_form__content__wrapper').length > 0) {
        $('.custom_request_form__content__wrapper .row').html($('[id="custom_request__to_default"]').html());
        $('html, body').animate({
            scrollTop: parseInt($('.custom_request_form__content__wrapper').parents('form').eq(0).offset().top) - 80
        }, 300);
    }

    event.preventDefault();
}); // удаление загруженного файла в анкете пользователя

$(document).on('click', '.user_area__personal_data__fileslist .btn-file-remove', function (event) {
    $(this).parents('.listFiles__item').eq(0).slideUp(300);
    setTimeout(function (toremove) {
        toremove.remove();
    }, 310, $(this).parents('.listFiles__item'));
    event.preventDefault();
}); // удаление сохранённого отчета

$(document).on('click', '.table__saved_reports .btn-actions-red', function (event) {
    $(this).parents('tr').eq(0).slideUp(300);
    setTimeout(function (toremove) {
        toremove.remove();
    }, 310, $(this).parents('tr'));
    event.preventDefault();
}); // удаление сохранённого отчета

$(document).on('click', '.table__saved_reports .btn-actions-red', function (event) {
    $(this).parents('tr').eq(0).slideUp(300);
    setTimeout(function (toremove) {
        toremove.remove();
    }, 310, $(this).parents('tr'));
    event.preventDefault();
}); // удаление всех сохранённых отчетов

$(document).on('click', '.remove-all-pdfreports', function (event) {
    $('.table__saved_reports').html('<tr class="table_head"><th>Нет сохранённых отчётов</th></tr>');
    event.preventDefault();
}); // закрытие мобильного меню

$(document).on('click', '.header__overlay-close', function (event) {
    $('.header__nav-wrap').fadeOut(200);
    setTimeout(function (hPos) {
        hPos.removeAttr('style');
        $('body').removeClass('nav-wrap-is-visible').css({
            overflow: 'visible'
        });
        var menu = $('.user_mobile_menu__wrapper');
        menu.removeClass('user_mobile_menu__wrapper__active');
        menu.slideUp(200);
        menu.find('.user_mobile_menu__corner').css({
            marginTop: '0px',
            left: '-1000%'
        });
    }, 300, $('.header__nav-wrap'));
    event.preventDefault();
});

function prepareContentImagesToDisplay() {
    if ($('.content_page__container img').length > 0) {
        $('.content_page__container img:not(.no_js)').each(function (index) {
            var img = $(this);
            img.wrap('<div class="image_element__wrapper"></div>');
            var wrapper = img.parents('.image_element__wrapper').eq(0);
            wrapper.append('<p class="image_element__decription">' + img.attr('alt') + '</p>');
        });
    }
}

function prepareContentTablesToDisplay() {
    if ($('.content_page__container table').length > 0) {
        $('.content_page__container table:not(.no_js)').each(function (index) {
            $(this).wrap('<div class="table_element__wrapper"></div>');
        });
    }
}

$(document).ready(function (event) {
    popup.init();
});
window.popup = {
    init: function init() {
        this.$trigger = $('[data-popup-open]');
        this.$close = $('[data-popup-close]');
        this.$trigger.on('click', function (event) {
            event.preventDefault();
            var $popup = $($(this).attr('href'));

            if ($popup.length) {
                popup.open($popup);
            }
        });
        $(document).on('click', function (event) {
            var $target = $(event.target);

            if ($target.closest(popup.$close).length || $target.closest('.popup').length && $target.closest('.popup-block__container').length == 0) {
                event.preventDefault();
                var $popup = $target.closest('.popup').length ? $target.closest('.popup') : $('.city-question-popup');
                popup.close($popup);
            }
        });
    },
    open: function open($popup) {
        var _this = this;

        var event = function event() {
            _this.active = $popup;
            scrollLock.disablePageScroll();
            $popup.addClass('active'); //succes

            if ($popup.hasClass('popup-succes')) {
                var $icon = $popup.find('path')[0],
                    w = $icon.getTotalLength();
                $icon.style.cssText = "stroke-dasharray:".concat(w, ";stroke-dashoffset:").concat(w, ";");
                setTimeout(function () {
                    $icon.style.transition = '.5s ease-out';
                    $icon.style.strokeDashoffset = '0';
                });
            }
        };

        if (this.active) {
            popup.close(this.active, function () {
                event();
            });
        } else {
            event();
        }
    },
    close: function close($popup, callback) {
        var _this2 = this;

        scrollLock.enablePageScroll();
        $popup.removeClass('active');
        setTimeout(function () {
            _this2.active = undefined;
            typeof callback === 'function' && callback();
        }, 250);
    }
};
//# sourceMappingURL=maps/global.js.map

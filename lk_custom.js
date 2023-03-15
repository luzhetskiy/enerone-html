$(document).ready(function () {
    // $('.js-show').show();
    listenUnbindContract();
    listenDateRangeFilter();
    listenSettlementsTable();
    listenPrintReviseAct();
    listenContractObjectSelect();
    listenPaymentForm();
    listenSupportFormBtn();
});

function listenSettlementsTable() {
    let table = $('table.settlements-table'),
        checkboxes = $('.settlements-table-checkbox', table);
    $('#check-all-for-table', table).on('click', function() {
        checkboxes.prop( "checked", this.checked );
    })
}

function processDateRangeStatus(form) {
    let dateRangeInput = $('.js-calendar input', form),
        filterChoices = $('select.need-date-range', form),
        dateRangeStatus = true;
    dateRangeInput.each(function (index) {
        if (!this.value) {
            dateRangeStatus = false;
        }
    })
    if (dateRangeStatus) {
        $('.filter-button:hidden', form).show();
        filterChoices.prop('disabled', false);
    } else {
        filterChoices.prop('disabled', true);
    }

}

function listenDateRangeFilter() {
    let form = $('form.lc-filters');
    processDateRangeStatus(form);
    $('.js-calendar input').change(function() {
        processDateRangeStatus(form);
    });
    $('.apply-on-change', form).change(function() {
        form.submit();
    })
}


function listenUnbindContract() {
    let unbindContractButtons = $('.btn-unbind-contract');
    // The button will be displayed only when JS is enabled.
    unbindContractButtons.show();
    unbindContractButtons.click(function(event) {
        event.stopPropagation();
        let $this = $(this);
        $.post(this.dataset.href, { contract_number: this.dataset.contractNumber })
            .done(function( data ) {
                if(data['success']) {
                    console.log(data)
                    $this.parents('.lc-contract').hide('slow');
                }
            });
    })

}

function listenPrintReviseAct() {
    const printLine = $('.lc-print-line'),
        contractTable = $('table.settlements-table');
    let printActButton = $('.print-revise-act');

    printActButton.click(function(e) {
        e.preventDefault();
        dates = $('.settlements-table-checkbox:checked');
        if (!dates.length) {
            popup.open($('#popup-date-not-select'));
        } else {
            let startDate = dates.filter(':first').data('item-date'),
                endDate = dates.filter(':last').data('item-date'),
                contract = contractTable.data('contract-num'),
                url = contractTable.data('post-url');
            if (startDate && endDate && contract && url) {
                let oldText = printActButton.text();
                printActButton
                    .addClass('processing')
                    .text('Подготовка Акта-сверки...');

                let xhttp = new XMLHttpRequest();
                xhttp.open("POST", url, true);

                xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhttp.responseType = 'blob';

                let postData = 'contract_num=' + contract;
                postData += '&&start_date=' + startDate;
                postData += '&&end_date=' + endDate;

                xhttp.send(postData);

                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        let a = document.createElement('a'),
                            today = new Date();
                        a.href = window.URL.createObjectURL(xhttp.response);
                        a.download = "revise_act__" + today.toDateString()
                            .split(' ').join('_') + ".pdf";
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        printActButton
                            .text(oldText)
                            .removeClass('processing');
                        return a.click();
                    }
                };
            }
        }
    });

    let checkboxes = $('.settlements-table-checkbox');

    if (checkboxes.length && checkboxes.has(':checked')) {
        printLine.filter(':hidden').show();
    }

    $.merge($('#check-all-for-table'), checkboxes).click(function() {
        let checked = $('.settlements-table-checkbox:checked'),
            cnt = checked.length;
        if (cnt) {
            printLine.filter(':hidden').show();

        } else {
            printLine.hide();
        }

        if (cnt > 1) {
            // select the range of checkboxes to be checked
            let first = checkboxes.index(checked.filter(':first')),
                last = checkboxes.index(checked.filter(':last'));
            checkboxes.slice(first, last).prop('checked', true);
        };
    });
}

function listenContractObjectSelect() {
    let form = $('#contract-object-select-form');
    $('select[name="contract_num"]', form).change(function(e) {
        if (this.value) {
            $('select[name="contract_object_id"] option:selected', form).attr('value','');
            form.submit();
        }

    });

}
function preventNonNumbers(el) {
    el.addEventListener('keypress', function (e) {
        var allowedChars = '0123456789';
        function contains(stringValue, charValue) {
            return stringValue.indexOf(charValue) > -1;
        }

        var invalidKey = e.key.length === 1 && !contains(allowedChars, e.key)
            || e.key === '.' && contains(e.target.value, '.');
        invalidKey && e.preventDefault();
    });

}

function listenPaymentForm() {
    var sum = document.querySelector('input#id_amount_to_pay');

    if (sum) {
        var sumResult = document.querySelector('.gpb-payment-sum'),
            bankCommission = parseFloat(sum.dataset.bankCommission),
            bankCommissionResult = document.querySelector('.bank-commission-value');

        updatePaymentSum(sum.value);


        sum.oninput = function() {
            updatePaymentSum(sum.value);
        };
    }

    function updatePaymentSum(sumVal) {
        sumVal = parseFloat(sumVal)
        if (isNaN(sumVal)) {
            return
        }
        if (bankCommission) {
            let commission = sumVal/100 * bankCommission;
            bankCommissionResult.textContent = commission.toFixed(2)
            sumVal += commission;
        }
        sumResult.textContent = sumVal.toFixed(2) + ' руб.'
    }

}

function listenSupportFormBtn() {
    $('[data-popup-open]').click(function() {
        let form = $(this.getAttribute('href'));

        if ('contractNumber' in this.dataset) {
            $('#id_contract_number', form).val(this.dataset.contractNumber)
                .attr('readonly', 'readonly')
                .trigger('blur');
        }
        else if ('contractDefault' in form.data()) {
            $('#id_contract_number', form)
                .removeAttr('readonly')
                .val(form.data('contractDefault'));
        }

        if ('formSubject' in this.dataset) {
            $('.popup__title', form).text(this.dataset.formSubject);
            $('input#id_subject', form).val(this.dataset.formSubject);
        }
        else if ('subjectDefault' in form.data()) {
            $('.popup__title', form).text(form.data('subjectDefault'));
            $('input#id_subject', form).val(form.data('subjectDefault'));
        }
    })
}

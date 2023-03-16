//после выбора "не знаю" и после клика на узнать тариф надо открыть блок -  Наш специалист поможет вам узнать ваш уровень тарифного напряжения
$(document).ready(function () {
   $(".form-check-input").change(function(){
    if ($('.form-check-input#ne-znayu').is(':checked')){
        $(".getRate").hide()
        $(".getRateHiddenCopy").show()
        $(".getRateHiddenCopy").click(function(event){
            event.preventDefault();
            $("#ne-znayu-form").slideDown(500)
            if (window.matchMedia('(max-width: 991px)').matches) {
                $("html, body").animate({
                    scrollTop: $("#ne-znayu-form").offset().top
                });
            }
        })
    }
    else {
        $(".getRate").show()
        $(".getRateHiddenCopy").hide()
        $("#ne-znayu-form").slideUp(500)
    }
   })
});
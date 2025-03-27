$(document).ready(function () {
	let isChanging = false

	function resetInputFields($input) {
		if (isChanging) return
		isChanging = true

		if ($input.is('input, textarea')) {
			$input.val('').removeClass('input_invalid').addClass('default_at_pageload')
			$input.closest('.form-group').find('label').removeClass('label_active_input active-label label_invalid_input')
		}
		if ($input.is('select')) {
			$input.val(null).trigger('change')
			$input.closest('.form-element').removeClass('filled')
		}

		isChanging = false
	}

	function toggleCheckedTarget(name, initial = false) {
		$(`input[name="${name}"]`).each(function () {
			const targetId = $(this).attr('id')
			const targetElement = $(`[data-checked-target="${targetId}"]`)

			if ($(this).is(':checked')) {
				targetElement.find(':input').prop('disabled', false) // Убираем disabled у полей
				initial ? targetElement.show() : targetElement.slideDown(300) // Показ сразу при загрузке или с анимацией
			} else {
				targetElement.find(':input').prop('disabled', true) // Ставим disabled у полей
				initial ? targetElement.hide() : targetElement.slideUp(300) // Скрытие сразу при загрузке или с анимацией
			}
		})

		const commonElement = $(`[data-checked-target="id-client-identifier-all"]`);
		// Если меняется client-type – смотрим, какой вариант выбран
		if (name === "client-type") {
			const selectedId = $(`input[name="client-type"]:checked`).attr("id");
			if (selectedId === "id-client-type-1") {
				commonElement.find(':input').prop('disabled', false);
				initial ? commonElement.show() : commonElement.slideDown(300);
			} else if (selectedId === "id-client-type-2") {
				commonElement.find(':input').prop('disabled', true);
				initial ? commonElement.hide() : commonElement.slideUp(300);
			}
		} else {
			// Для остальных групп (например, client-identifier) оставляем прежнюю логику
			if ($(`input[name="${name}"]:checked`).length > 0) {
				commonElement.find(':input').prop('disabled', false);
				initial ? commonElement.show() : commonElement.slideDown(300);
			} else {
				commonElement.find(':input').prop('disabled', true);
				initial ? commonElement.hide() : commonElement.slideUp(300);
			}
		}
	}

	toggleCheckedTarget('client-type', true)
	toggleCheckedTarget('client-identifier', true)

	$('input[name="client-type"]').on('change', function () {
		toggleCheckedTarget('client-type')
	})

	$('input[name="client-identifier"]').on('change', function () {
		toggleCheckedTarget('client-identifier')
	})
})

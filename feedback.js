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

		// Если выбран хотя бы один вариант, показываем общий блок
		if ($(`input[name="${name}"]:checked`).length > 0) {
			const commonElement = $(`[data-checked-target="id-client-identifier-all"]`);
			commonElement.find(':input').prop('disabled', false);
			initial ? commonElement.show() : commonElement.slideDown(300);
		} else {
			const commonElement = $(`[data-checked-target="id-client-identifier-all"]`);
			commonElement.find(':input').prop('disabled', true);
			initial ? commonElement.hide() : commonElement.slideUp(300);
		}
	}

	function toggleInputCollapseTarget(initial = false, resetInput = false) {
		if (resetInput) {
			$('[data-input-collapse-id]').each(function () {
				const collapseId = $(this).data('input-collapse-id')
				const targetElement = $(`[data-input-collapse-target="${collapseId}"]`)

				resetInputFields($(this))

				targetElement.find(':input').each(function () {
					resetInputFields($(this))
				})

				targetElement.find(':input').prop('disabled', true)
				initial ? targetElement.hide() : targetElement.slideUp(300)
			})

			return
		}


		$('[data-input-collapse-id]:not(:disabled)').each(function () {
			const collapseId = $(this).data('input-collapse-id')
			const targetElement = $(`[data-input-collapse-target="${collapseId}"]`)
			const value = $(this).val()

			if (!$(this).hasClass('input_invalid') && value && value.trim() !== '') {
				targetElement.find(':input').prop('disabled', false)
				initial ? targetElement.show() : targetElement.slideDown(300)
			} else {
				targetElement.find(':input').prop('disabled', true)
				initial ? targetElement.hide() : targetElement.slideUp(300)
			}

			const collapseIdNumber = parseInt(collapseId.match(/\d+/))

			if (!value.trim()) {
				$('[data-input-collapse-target]').each(function () {
					const targetId = $(this).data('input-collapse-target')
					const targetIdNumber = parseInt(targetId.match(/\d+/))

					if (targetIdNumber > collapseIdNumber) {
						initial ? targetElement.hide() : targetElement.slideUp(300)
						targetElement.find(':input').each(function () {
							resetInputFields($(this))
						})
						$(this).find(':input').each(function () {
							resetInputFields($(this))
						})
					}
				})
			}
		})
	}

	toggleCheckedTarget('client-type', true)
	toggleCheckedTarget('client-identifier', true)
	toggleInputCollapseTarget(false, true)

	$('input[name="client-type"]').on('change', function () {
		toggleCheckedTarget('client-type')
		toggleInputCollapseTarget(false, true)
	})

	$('input[name="client-identifier"]').on('change', function () {
		toggleCheckedTarget('client-identifier')
		toggleInputCollapseTarget(false, true)
	})

	$(document).on('change keyup', '[data-input-collapse-id]', function () {
		toggleInputCollapseTarget()
	})
})

const regionSelect = $('#id_region');
const powerSupplierSelect = $('#id_power_supplier');
const maxPowerSelect = $('#id_maximum_power');
const consumptionVolumeInput = $('#id_consumption_volume');
const resultDisplay = $('#id_result_display');
let jsonData = []; // Переменная для хранения данных JSON

// Функция для получения процента на основе значения потребления
function getPercentage(consumptionVolume) {
	if (consumptionVolume <= 70000) return 0
	if (consumptionVolume <= 400000) return 0.3
	if (consumptionVolume <= 1500000) return 0.5
	if (consumptionVolume <= 2500000) return 0.7
	return 0.9
}

// Функция расчета результата
function calculateResult() {
	const consumptionVolume = parseFloat(consumptionVolumeInput.val()) || 0
	const maxPowerValue = parseFloat(maxPowerSelect.val().replace(',', '.')) || 0
	const percentage = getPercentage(consumptionVolume)

	// Проверяем, выбраны ли все необходимые поля
	if (!regionSelect.val() || !powerSupplierSelect.val() || !maxPowerSelect.val() || consumptionVolume === 0) {
		resultDisplay.text('') // Очищаем поле результата, если выбор не завершён
		return
	}

	// Рассчитываем экономию
	const result = consumptionVolume * maxPowerValue * percentage * 12

	// Проверяем, есть ли экономия
	if (result > 0) {
		resultDisplay.text(`Возможная экономия в год: ${Math.trunc(result).toLocaleString('ru-RU')} ₽`)
	} else {
		resultDisplay.text('К сожалению, при таком объеме потребления экономии от работы на оптовом рынке не будет.')
	}
}

// Функция для обновления powerSupplierSelect и maxPowerSelect
function updatePowerSupplierSelect() {
	const selectedRegion = regionSelect.val()

	// Фильтруем данные по региону
	const filteredSuppliers = [...new Set(jsonData.filter(item => item['Регион'] === selectedRegion).map(item => item['ГП']))]

	// Очищаем powerSupplierSelect перед добавлением новых значений
	powerSupplierSelect.empty()
	powerSupplierSelect.append(new Option('', '')) // Пустая опция

	// Заполняем powerSupplierSelect
	filteredSuppliers.forEach(supplier => {
		powerSupplierSelect.append(new Option(supplier, supplier))
	})

	// Отключаем maxPowerSelect и powerSupplierSelect, пока не выбраны значения
	maxPowerSelect.prop('disabled', true).closest('.form-element').removeClass('filled')
	powerSupplierSelect.prop('disabled', false) // Разрешаем выбор поставщика
}

// Функция для обновления maxPowerSelect в зависимости от выбранного региона и поставщика
function updateMaxPowerSelect() {
	const selectedRegion = regionSelect.val()
	const selectedSupplier = powerSupplierSelect.val()

	// Фильтруем данные по региону и поставщику
	const filteredData = jsonData.filter(item =>
		item['Регион'] === selectedRegion && item['ГП'] === selectedSupplier
	)

	// Очищаем maxPowerSelect перед добавлением новых значений
	maxPowerSelect.empty()
	maxPowerSelect.append(new Option('', '')) // Пустая опция

	// Проверяем, были ли найдены данные
	if (filteredData.length > 0) {
		const dataItem = filteredData[0]
		const neededKeys = ['до 670 кВтч', 'от 670 до 10', 'свыше 10']
		neededKeys.forEach(key => {
			if (dataItem.hasOwnProperty(key)) {
				const value = dataItem[key]
				maxPowerSelect.append(new Option(key, value))
			}
		})
		console.log("Выбранные категории для региона и поставщика:", dataItem)
	}

	// Отключаем maxPowerSelect, если нет доступных значений
	const isDisabled = filteredData.length === 0
	maxPowerSelect.prop('disabled', isDisabled)

	// Убираем или добавляем класс filled у родителя
	if (isDisabled) {
		maxPowerSelect.closest('.form-element').removeClass('filled')
	}

	calculateResult() // Пересчитываем результат при обновлении списка
}

// Установка обработчиков событий без инициализации select2
$(document).ready(function () {
	// Отключаем maxPowerSelect и powerSupplierSelect по умолчанию
	maxPowerSelect.prop('disabled', true).closest('.form-element').removeClass('filled')
	powerSupplierSelect.prop('disabled', true).closest('.form-element').removeClass('filled')

	// Обработчики для пересчета при изменении значений
	consumptionVolumeInput.on('input', calculateResult)
	maxPowerSelect.on('change', calculateResult)
	regionSelect.on('change', function () {
		powerSupplierSelect.closest('.form-element').removeClass('filled')

		updatePowerSupplierSelect()
		updateMaxPowerSelect() // Сбросить maxPowerSelect при изменении региона
	})
	powerSupplierSelect.on('change', updateMaxPowerSelect)

	// Загрузка данных из JSON и инициализация selects
	$.ajax({
		url: 'calc.json',
		dataType: 'json',
		success: function (data) {
			jsonData = data // Сохраняем данные в глобальную переменную

			// Получаем уникальные регионы для заполнения selectов
			const regions = [...new Set(jsonData.map(item => item['Регион']))].sort()

			// Заполняем regionSelect
			regionSelect.append(new Option('', '')) // Пустая опция сначала
			regions.forEach(region => {
				regionSelect.append(new Option(region, region))
			})
		},
		error: function (xhr, status, error) {
			console.error('Error loading JSON:', error)
		}
	})
})

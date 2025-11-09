import { getChoices, enableChoices, clearChoices, disableChoices } from './functions/choices.js'

// --- Форматирование и парсинг чисел ---
const consumptionThresholds = [
  { max: 70000, percent: 0 },
  { max: 400000, percent: 0.3 },
  { max: 1500000, percent: 0.5 },
  { max: 2500000, percent: 0.7 },
  { max: Infinity, percent: 0.9 }
]

function formatNumber(value) {
  const cleanedValue = value.replace(/\D/g, '')
  return cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function parseFormattedNumber(value) {
  return parseFloat(value.replace(/\s/g, '')) || 0
}

// --- Процент в зависимости от объема ---
function getPercentage(consumptionVolume) {
  const threshold = consumptionThresholds.find(t => consumptionVolume <= t.max)
  return threshold?.percent ?? 0
}



const renderChoice = (choices, data, getValuesFn) => {
  const items = [...new Set(getValuesFn(data))]
    .filter(Boolean)
    .sort((a, b) => {
      const aStr = a.name ?? a.value ?? a
      const bStr = b.name ?? b.value ?? b
      return aStr.localeCompare(bStr, 'ru')
    })

  getChoices(choices).setChoices(
    items.map(item => ({
      value: item.value ?? item,
      label: item.name ?? item
    })),
    'value',
    'label',
    true
  )
}

const enableInput = (element) => element.disabled = false

const clearInput = (element) => element.value = ''

const disableInput = (element) => {
  element.disabled = true
  clearInput(element)
}

const resetResult = (element) => element.textContent = '0 ₽'

const initCalcForm = (form, data) => {
  const choiceRegion = form.querySelector('select[name="region"]')
  const choiceSupplier = form.querySelector('select[name="supplier"]')
  const choiceMaxPower = form.querySelector('select[name="max-power"]')
  const inputConsumptionVolume = form.querySelector('input[name="consumption-volume"]')
  const resultDisplay = form.querySelector('[data-result="calc-savings"]')

  resetResult(resultDisplay)
  disableChoices(choiceSupplier)
  disableChoices(choiceMaxPower)
  disableInput(inputConsumptionVolume)

  renderChoice(
    choiceRegion,
    data,
    items => items.map(i => i['region'])
  )

  // --- При изменении региона ---
  choiceRegion.addEventListener('change', () => {
    const selectedRegion = getChoices(choiceRegion).getValue(true)

    clearChoices(choiceSupplier)
    renderChoice(
      choiceSupplier,
      data,
      items => items.filter(i => i['region'] === selectedRegion).map(i => i['company'])
    )

    enableChoices(choiceSupplier)
    disableChoices(choiceMaxPower)
    disableInput(inputConsumptionVolume)
    resetResult(resultDisplay)
  })

  // --- При изменении поставщика ---
  choiceSupplier.addEventListener('change', () => {
    const selectedRegion = getChoices(choiceRegion).getValue(true)
    const selectedSupplier = getChoices(choiceSupplier).getValue(true)

    clearChoices(choiceMaxPower)
    renderChoice(
      choiceMaxPower,
      data,
      items =>
        items
          .filter(i => i['region'] === selectedRegion && i['company'] === selectedSupplier)
          .flatMap(i => i.rates)
    )
    enableChoices(choiceMaxPower)
    disableInput(inputConsumptionVolume)
    resetResult(resultDisplay)
  })

  // --- При изменении макс. мощности ---
  choiceMaxPower.addEventListener('change', () => {
    enableInput(inputConsumptionVolume)
    clearInput(inputConsumptionVolume)
    resetResult(resultDisplay)
  })

  // --- При изменении потребления ---
  inputConsumptionVolume.addEventListener('input', () => {
    inputConsumptionVolume.value = formatNumber(inputConsumptionVolume.value.replace(/\D/g, ''))

    const value = parseFormattedNumber(inputConsumptionVolume.value)
    const valueChoiceMaxPower = parseFloat(getChoices(choiceMaxPower).getValue(true).replace(',', '.')) || 0

    const isValid = value >= consumptionThresholds[0].max

    if (value && valueChoiceMaxPower && isValid) {
      const percentage = getPercentage(value)
      const result = value * valueChoiceMaxPower * percentage * 12
      resultDisplay.textContent = `${Math.trunc(result).toLocaleString('ru-RU')}\u00A0₽`

      inputConsumptionVolume.classList.remove('is-invalid')
      inputConsumptionVolume.parentElement.classList.remove('is-invalid')
    } else {
      resetResult(resultDisplay)

      if (!isValid && value) {
        inputConsumptionVolume.classList.add('is-invalid')
        inputConsumptionVolume.parentElement.classList.add('is-invalid')
      } else {
        inputConsumptionVolume.classList.remove('is-invalid')
        inputConsumptionVolume.parentElement.classList.remove('is-invalid')
      }
    }
  })
}

fetch('./calc.json')
  .then(res => res.ok ? res.json() : Promise.reject(`Ошибка загрузки JSON: ${res.status}`))
  .then(data => {
    document.querySelectorAll('[data-form="calc-savings"]').forEach(form => {
      initCalcForm(form, data)
    })
  })
  .catch(err => console.error('Ошибка при запросе JSON:', err))

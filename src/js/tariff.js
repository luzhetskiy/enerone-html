import { getChoices } from './functions/choices.js'
import { addClassInvalid, removeClassValid } from './functions/validation.js'

document.querySelectorAll('[data-form="calc-tariff"]')?.forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const target = e.target
    const url = target.dataset.action
    const submitBtn = target.querySelector('[type="submit"]')

    const region = getChoices(target.elements['region'])
    const regionElement = region.containerOuter.element
    const radios = Array.from(target.elements['voltage-level'])
    const regionValue = region.getValue(true)
    const radioValue = radios.find(radio => radio.checked)?.value

    regionElement.addEventListener('change', () => {
      removeClassValid(regionElement)
    })

    radios.forEach(radio => {
      radio.addEventListener('change', () => radios.forEach(radio => removeClassValid(radio)))
    })

    if (!regionValue) {
      addClassInvalid(regionElement)

      return
    }
    if (!radioValue) {
      radios.forEach(element => addClassInvalid(element))

      return
    }

    submitBtn.disabled = true

    const params = new URLSearchParams({
      region: regionValue,
      voltage_level: radioValue
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: params.toString()
      })

      if (!response.ok) {
        console.error('Ошибка сервера:', response.status, await response.text())
        return
      }

      const data = await response.json()

      const modalCallbackEl = document.querySelector('#modal-callback')
      const modalTariffEl = document.querySelector('#modal-tariff')

      if (Object.keys(data).length > 1) {
        modalTariffEl.querySelectorAll('[data-result]').forEach(el => {
          const key = el.dataset.result
          if (data[key] !== undefined) {
            el.textContent = data[key]
          }
        })

        const modalTariff = bootstrap.Modal.getInstance(modalTariffEl) || new bootstrap.Modal(modalTariffEl)
        modalTariff.show()
      } else {
        const modalCallback = bootstrap.Modal.getInstance(modalCallbackEl) || new bootstrap.Modal(modalCallbackEl)
        modalCallback.show()
      }

    } catch (error) {
      console.error('Ошибка при запросе:', error)
    } finally {
      submitBtn.disabled = false
    }
  })
})

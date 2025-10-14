import IMask from 'imask';

const telInputs = document.querySelectorAll('input[type="tel"]')

telInputs?.forEach(input => {
  IMask(input, {
    mask: '+{7} (000) 000-00-00'
  })
})

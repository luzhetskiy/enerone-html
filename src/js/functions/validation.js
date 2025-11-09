const addClassInvalid = (element) => {
  element.parentElement.classList.add('is-invalid')
  element.classList.add('is-invalid')
}

const removeClassValid = (element) => {
  element.parentElement.classList.remove('is-invalid')
  element.classList.remove('is-invalid')
}

export { addClassInvalid, removeClassValid }

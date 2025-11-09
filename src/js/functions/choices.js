const getChoices = (element) => window.choicesInstances.find(obj => obj.element === element)?.instance || null

const enableChoices = (element) => getChoices(element)?.enable()

const clearChoices = (element) => getChoices(element)?.clearChoices(true, true)

const disableChoices = (element) => {
  getChoices(element)?.disable()
  clearChoices(element)
}

export { getChoices, enableChoices, clearChoices, disableChoices }

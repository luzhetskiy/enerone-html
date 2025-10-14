import Modal from "bootstrap/js/dist/modal.js"
import Offcanvas from "bootstrap/js/dist/offcanvas.js"
import Dropdown from "bootstrap/js/dist/dropdown.js"
// import Tab from "bootstrap/js/dist/tab.js"
import Collapse from "bootstrap/js/dist/collapse.js"
// import Alert from "bootstrap/js/dist/alert.js"

window.bootstrap = window.bootstrap || {}
window.bootstrap.Modal = Modal
window.bootstrap.Offcanvas = Offcanvas
window.bootstrap.Dropdown = Dropdown
// window.bootstrap.Tab = Tab
window.bootstrap.Collapse = Collapse
// window.bootstrap.Alert = Alert



document.querySelectorAll('input[data-bs-toggle="collapse-checked"]')?.forEach(toggleInput => {
  const targetSelector = toggleInput.dataset.bsTarget
  const target = document.querySelector(targetSelector)

  if (!target) return

  const collapse = new bootstrap.Collapse(target, {
    toggle: false
  })

  function updateCollapse() {
    if (toggleInput.checked) {
      collapse.show()
    } else {
      collapse.hide()
    }
  }

  updateCollapse()

  const scope = toggleInput.closest('form') || document
  const groupName = toggleInput.name

  const groupRadios = Array.from(scope.querySelectorAll(`input[name="${CSS.escape(groupName)}"]`))
  groupRadios.forEach(radio => {
    radio.addEventListener('change', updateCollapse)
  })
})

let currentDropdown = null
let hideTimeout


document.querySelectorAll('[data-bs-toggle="dropdown-hover"]').forEach(trigger => {
  const dropdown = new bootstrap.Dropdown(trigger, { autoClose: true })
  const dropdownParent = trigger.closest(".dropdown")

  if (!dropdownParent) return

  // Убираем автофокус при открытии
  bootstrap.Dropdown.prototype._selectMenuItem = function () {}
  bootstrap.Dropdown.prototype._focusFirstItem = function () {}

  dropdownParent.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout)

    if (currentDropdown && currentDropdown !== dropdown) {
      currentDropdown.hide()
    }

    dropdown.show()
    currentDropdown = dropdown
  })

  dropdownParent.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => {
      dropdown.hide()
      if (currentDropdown === dropdown) {
        currentDropdown = null
      }
    }, 200)
  })
})


/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/functions/choices.js":
/*!*************************************!*\
  !*** ./src/js/functions/choices.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearChoices: () => (/* binding */ clearChoices),
/* harmony export */   disableChoices: () => (/* binding */ disableChoices),
/* harmony export */   enableChoices: () => (/* binding */ enableChoices),
/* harmony export */   getChoices: () => (/* binding */ getChoices)
/* harmony export */ });
const getChoices = element => window.choicesInstances.find(obj => obj.element === element)?.instance || null;
const enableChoices = element => getChoices(element)?.enable();
const clearChoices = element => getChoices(element)?.clearChoices(true, true);
const disableChoices = element => {
  getChoices(element)?.disable();
  clearChoices(element);
};


/***/ }),

/***/ "./src/js/functions/validation.js":
/*!****************************************!*\
  !*** ./src/js/functions/validation.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addClassInvalid: () => (/* binding */ addClassInvalid),
/* harmony export */   removeClassValid: () => (/* binding */ removeClassValid)
/* harmony export */ });
const addClassInvalid = element => {
  element.parentElement.classList.add('is-invalid');
  element.classList.add('is-invalid');
};
const removeClassValid = element => {
  element.parentElement.classList.remove('is-invalid');
  element.classList.remove('is-invalid');
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/js/tariff.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _functions_choices_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/choices.js */ "./src/js/functions/choices.js");
/* harmony import */ var _functions_validation_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./functions/validation.js */ "./src/js/functions/validation.js");


document.querySelectorAll('[data-form="calc-tariff"]')?.forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const target = e.target;
    const url = target.dataset.action;
    const submitBtn = target.querySelector('[type="submit"]');
    const region = (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.getChoices)(target.elements['region']);
    const regionElement = region.containerOuter.element;
    const radios = Array.from(target.elements['voltage-level']);
    const regionValue = region.getValue(true);
    const radioValue = radios.find(radio => radio.checked)?.value;
    regionElement.addEventListener('change', () => {
      (0,_functions_validation_js__WEBPACK_IMPORTED_MODULE_1__.removeClassValid)(regionElement);
    });
    radios.forEach(radio => {
      radio.addEventListener('change', () => radios.forEach(radio => (0,_functions_validation_js__WEBPACK_IMPORTED_MODULE_1__.removeClassValid)(radio)));
    });
    if (!regionValue) {
      (0,_functions_validation_js__WEBPACK_IMPORTED_MODULE_1__.addClassInvalid)(regionElement);
      return;
    }
    if (!radioValue) {
      radios.forEach(element => (0,_functions_validation_js__WEBPACK_IMPORTED_MODULE_1__.addClassInvalid)(element));
      return;
    }
    submitBtn.disabled = true;
    const params = new URLSearchParams({
      region: regionValue,
      voltage_level: radioValue
    });
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: params.toString()
      });
      if (!response.ok) {
        console.error('Ошибка сервера:', response.status, await response.text());
        return;
      }
      const data = await response.json();
      const modalCallbackEl = document.querySelector('#bid-request-popup-form-modal');
      const modalTariffEl = document.querySelector('#modal-tariff');
      const modalCallbackRegion = (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.getChoices)(modalCallbackEl.querySelector('select[name="region"]'));
      if (Object.keys(data).length > 1) {
        modalTariffEl.querySelectorAll('[data-result]').forEach(el => {
          const key = el.dataset.result;
          if (data[key] !== undefined) {
            el.textContent = data[key];
          }
        });
        const modalTariff = bootstrap.Modal.getInstance(modalTariffEl) || new bootstrap.Modal(modalTariffEl);
        modalTariff.show();
      } else {
        const modalCallback = bootstrap.Modal.getInstance(modalCallbackEl) || new bootstrap.Modal(modalCallbackEl);
        modalCallback.show();
      }
      modalCallbackRegion.setChoiceByValue(regionValue);
    } catch (error) {
      console.error('Ошибка при запросе:', error);
    } finally {
      submitBtn.disabled = false;
    }
  });
});
})();

/******/ })()
;
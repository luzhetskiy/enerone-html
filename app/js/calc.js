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
/*!************************!*\
  !*** ./src/js/calc.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _functions_choices_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/choices.js */ "./src/js/functions/choices.js");


// --- Форматирование и парсинг чисел ---
const consumptionThresholds = [{
  max: 70000,
  percent: 0
}, {
  max: 400000,
  percent: 0.3
}, {
  max: 1500000,
  percent: 0.5
}, {
  max: 2500000,
  percent: 0.7
}, {
  max: Infinity,
  percent: 0.9
}];
function formatNumber(value) {
  const cleanedValue = value.replace(/\D/g, '');
  return cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
function parseFormattedNumber(value) {
  return parseFloat(value.replace(/\s/g, '')) || 0;
}

// --- Процент в зависимости от объема ---
function getPercentage(consumptionVolume) {
  const threshold = consumptionThresholds.find(t => consumptionVolume <= t.max);
  return threshold?.percent ?? 0;
}
const renderChoice = (choices, data, getValuesFn) => {
  const items = [...new Set(getValuesFn(data))].filter(Boolean).sort((a, b) => {
    const aStr = a.name ?? a.value ?? a;
    const bStr = b.name ?? b.value ?? b;
    return aStr.localeCompare(bStr, 'ru');
  });
  (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.getChoices)(choices).setChoices(items.map(item => ({
    value: item.value ?? item,
    label: item.name ?? item
  })), 'value', 'label', true);
};
const enableInput = element => element.disabled = false;
const clearInput = element => element.value = '';
const disableInput = element => {
  element.disabled = true;
  clearInput(element);
};
const resetResult = element => element.textContent = '0 ₽';
const initCalcForm = (form, data) => {
  const choiceRegion = form.querySelector('select[name="region"]');
  const choiceSupplier = form.querySelector('select[name="supplier"]');
  const choiceMaxPower = form.querySelector('select[name="max-power"]');
  const inputConsumptionVolume = form.querySelector('input[name="consumption-volume"]');
  const resultDisplay = form.querySelector('[data-result="calc-savings"]');
  resetResult(resultDisplay);
  (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.disableChoices)(choiceSupplier);
  (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.disableChoices)(choiceMaxPower);
  disableInput(inputConsumptionVolume);
  renderChoice(choiceRegion, data, items => items.map(i => i['region']));

  // --- При изменении региона ---
  choiceRegion.addEventListener('change', () => {
    const selectedRegion = (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.getChoices)(choiceRegion).getValue(true);
    (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.clearChoices)(choiceSupplier);
    renderChoice(choiceSupplier, data, items => items.filter(i => i['region'] === selectedRegion).map(i => i['company']));
    (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.enableChoices)(choiceSupplier);
    (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.disableChoices)(choiceMaxPower);
    disableInput(inputConsumptionVolume);
    resetResult(resultDisplay);
  });

  // --- При изменении поставщика ---
  choiceSupplier.addEventListener('change', () => {
    const selectedRegion = (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.getChoices)(choiceRegion).getValue(true);
    const selectedSupplier = (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.getChoices)(choiceSupplier).getValue(true);
    (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.clearChoices)(choiceMaxPower);
    renderChoice(choiceMaxPower, data, items => items.filter(i => i['region'] === selectedRegion && i['company'] === selectedSupplier).flatMap(i => i.rates));
    (0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.enableChoices)(choiceMaxPower);
    disableInput(inputConsumptionVolume);
    resetResult(resultDisplay);
  });

  // --- При изменении макс. мощности ---
  choiceMaxPower.addEventListener('change', () => {
    enableInput(inputConsumptionVolume);
    clearInput(inputConsumptionVolume);
    resetResult(resultDisplay);
  });

  // --- При изменении потребления ---
  inputConsumptionVolume.addEventListener('input', () => {
    inputConsumptionVolume.value = formatNumber(inputConsumptionVolume.value.replace(/\D/g, ''));
    const value = parseFormattedNumber(inputConsumptionVolume.value);
    const valueChoiceMaxPower = parseFloat((0,_functions_choices_js__WEBPACK_IMPORTED_MODULE_0__.getChoices)(choiceMaxPower).getValue(true).replace(',', '.')) || 0;
    const isValid = value >= consumptionThresholds[0].max;
    if (value && valueChoiceMaxPower && isValid) {
      const percentage = getPercentage(value);
      const result = value * valueChoiceMaxPower * percentage * 12;
      resultDisplay.textContent = `${Math.trunc(result).toLocaleString('ru-RU')}\u00A0₽`;
      inputConsumptionVolume.classList.remove('is-invalid');
      inputConsumptionVolume.parentElement.classList.remove('is-invalid');
    } else {
      resetResult(resultDisplay);
      if (!isValid && value) {
        inputConsumptionVolume.classList.add('is-invalid');
        inputConsumptionVolume.parentElement.classList.add('is-invalid');
      } else {
        inputConsumptionVolume.classList.remove('is-invalid');
        inputConsumptionVolume.parentElement.classList.remove('is-invalid');
      }
    }
  });
};
fetch('./calc.json').then(res => res.ok ? res.json() : Promise.reject(`Ошибка загрузки JSON: ${res.status}`)).then(data => {
  document.querySelectorAll('[data-form="calc-savings"]').forEach(form => {
    initCalcForm(form, data);
  });
}).catch(err => console.error('Ошибка при запросе JSON:', err));
})();

/******/ })()
;
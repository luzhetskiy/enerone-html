import Choices from "choices.js"

document.querySelectorAll('[data-choices]')?.forEach((element) => {

  const choice = new Choices(element, {
    allowHTML: true,
    searchEnabled: false,
    itemSelectText: null,
    shouldSort: false,
    loadingText: "Загрузка...",
    noResultsText: "Результаты не найдены",
    noChoicesText: "Нет вариантов для выбора",
  })

  const inner = choice.containerInner.element;

  if (!inner.querySelector('.icon')) {
    inner.insertAdjacentHTML(
      'beforeend',
      `
        <span class="icon">
          <svg>
            <use xlink:href="img/icons/dropdown.svg#svg-dropdown"></use>
          </svg>
        </span>
      `
    );
  }
})

export default class Transfer {
	constructor() {
		this.originElements = document.querySelectorAll('[data-transfer-origin]')
		this.stored = new Map()

		if (this.originElements.length) {
			this.init()
		}
	}

	init() {
		this.originElements.forEach(element => {
			const parent = element.parentNode

			// Если для родителя еще нет данных, инициализируем их
			if (!this.stored.has(parent)) {
				this.stored.set(parent, {
					children: [] // Хранение последовательности элементов
				})
			}

			// Сохраняем элемент в массив детей родителя
			this.stored.get(parent).children.push(element)
		})

		// Инициализируем первое состояние
		this.handleTransfer()

		// Добавляем слушатель resize
		window.addEventListener('resize', this.throttle(() => {
			this.handleTransfer()
		}))
	}

	handleTransfer() {
		this.originElements.forEach(element => {
			const originValue = element.dataset.transferOrigin
			const breakpoint = parseInt(element.dataset.transferBreakpoint)
			const windowWidth = window.innerWidth
			const placement = element.dataset.transferPlacement || 'last'

			// Получаем все возможные целевые элементы
			const targets = Array.from(document.querySelectorAll('[data-transfer-target]'))
			const targetElement = targets.find(target =>
				target.dataset.transferTarget.split(' ').includes(originValue)
			)

			if (windowWidth <= breakpoint && targetElement) {
				// Перемещаем в target с учётом placement
				if (element.parentNode !== targetElement) {
					this.insertElementWithPlacement(targetElement, element, placement)
				}
			} else if (windowWidth > breakpoint) {
				// Возвращаем на исходную позицию
				this.returnToOriginalPosition(element)
			}
		})
	}

	/**
	 * Вставка элемента с учётом placement
	 * @param {HTMLElement} target - целевой контейнер
	 * @param {HTMLElement} element - перемещаемый элемент
	 * @param {string} placement - положение: 'first', 'last' или число
	 */
	insertElementWithPlacement(target, element, placement) {
		if (placement === 'first') {
			target.insertBefore(element, target.firstChild)
		} else if (placement === 'last') {
			target.appendChild(element)
		} else if (!isNaN(placement)) {
			const index = parseInt(placement) - 1
			const children = Array.from(target.children)

			if (index >= 0 && index < children.length) {
				target.insertBefore(element, children[index])
			} else {
				target.appendChild(element) // Если индекс выходит за границы, вставляем в конец
			}
		} else {
			target.appendChild(element) // На случай некорректного значения
		}
	}

	/**
 * Возвращает элемент на оригинальную позицию с учетом порядка
 * @param {HTMLElement} element 
 */
	returnToOriginalPosition(element) {
		const originalParentData = Array.from(this.stored.entries()).find(([parent, data]) =>
			data.children.includes(element)
		)

		if (!originalParentData) return

		const [parent, { children }] = originalParentData

		// Проверяем, если элемент уже на своём месте
		if (element.parentNode === parent) return

		// Находим индекс текущего элемента
		const index = children.indexOf(element)
		const nextSibling = children[index + 1]

		// Проверяем, находится ли nextSibling всё ещё в родителе
		if (nextSibling && nextSibling.parentNode === parent) {
			parent.insertBefore(element, nextSibling)
		} else {
			// Вставляем в конец, если nextSibling недоступен
			parent.appendChild(element)
		}
	}

	throttle(func, delay = 250) {
		let isThrottled = false;
		let savedArgs = null;
		let savedThis = null;

		return function wrap(...args) {
			if (isThrottled) {
				savedArgs = args,
					savedThis = this;
				return;
			}

			func.apply(this, args);
			isThrottled = true;

			setTimeout(() => {
				isThrottled = false;

				if (savedThis) {
					wrap.apply(savedThis, savedArgs);
					savedThis = null;
					savedArgs = null;
				}

			}, delay);
		}
	}
}
const resizableSwiper = (breakpoint, swiperClass, swiperSettings, callback) => {
	let swiper;

	breakpoint = window.matchMedia(breakpoint);

	const enableSwiper = function (className, settings) {
		swiper = new Swiper(className, settings);

		if (callback) {
			callback(swiper);
		}
	};

	const checker = function () {
		if (breakpoint.matches) {
			return enableSwiper(swiperClass, swiperSettings);
		} else {
			if (swiper !== undefined) swiper.destroy(true, true);
			return;
		}
	};

	breakpoint.addEventListener('change', checker);
	checker();
};

export { resizableSwiper };
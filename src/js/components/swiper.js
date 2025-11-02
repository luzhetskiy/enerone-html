import Swiper from "swiper";
import { EffectCreative, Navigation } from 'swiper/modules';

document.querySelectorAll('[data-swiper]')?.forEach(container => {
  const type = container.dataset.swiper

  const next = container.querySelector('.swiper-button-next')
  const prev = container.querySelector('.swiper-button-prev')

  switch (type) {
    case "menu": {
      const menuSwiper = new Swiper(container.querySelector('.swiper'), {
        modules: [ EffectCreative ],
        effect: 'creative',
        creativeEffect: {
          prev: {
            translate: ["-100%", 0, 0],
            opacity: 0,
            shadow: false,
          },
          next: {
            translate: ["100%", 0, 0],
            opacity: 0,
            shadow: false,
          },
        },
        allowTouchMove: false,
        slidesPerView: 1,
        autoHeight: true,
      });

      container.querySelectorAll("[data-slide-target]").forEach(btn => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.slideTarget;
          const targetIndex = [...menuSwiper.slides].findIndex(
            slide => slide.dataset.slideSubmenu === target
          );
          if (targetIndex !== -1) {
            menuSwiper.slideTo(targetIndex);
          }
        });
      });

      container.querySelectorAll("[data-slide-target='back']").forEach(btn => {
        btn.addEventListener("click", () => {
          menuSwiper.slideTo(0);
        });
      });

      break;
    }

    case "cards": {
      const nav = container.querySelector('.swiper-navigation')

      const cardsSwiper = new Swiper(container.querySelector('.swiper'), {
        modules: [ Navigation ],
        slidesPerView: 3,
        spaceBetween: 20,
        navigation: {
          nextEl: next,
          prevEl: prev,
        },

        breakpoints: {
          0: {
            slidesPerView: 1,
            spaceBetween: 16
          },
          576: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          992: {
            slidesPerView: 3,
            spaceBetween: 20
          }
        },

        on: {
          init() {
            toggleNav(this);
          },
          resize() {
            toggleNav(this);
          },
          update() {
            toggleNav(this);
          }
        }
      });

      function toggleNav(swiper) {
        let perView = swiper.params.slidesPerView;
        if (perView === 'auto') {
          perView = Math.floor(swiper.width / swiper.slides[0].offsetWidth);
        }

        if (swiper.slides.length <= perView) {
          nav.classList.add('d-none');
        } else {
          nav.classList.remove('d-none');
        }
      }

      break;
    }

    default:
      console.warn(`Неизвестный swiper: ${type}`);
  }
})

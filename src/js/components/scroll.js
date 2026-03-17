const header = document.querySelector(".header");

document.querySelectorAll("[data-scroll-to]").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    e.preventDefault();

    const selector = trigger.dataset.scrollTo;
    const target = document.querySelector(selector);

    if (!target) return;

    const offset = header ? header.offsetHeight + 24 : 24;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  });
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-type-password="toggle"]');
  if (!btn) return;

  const container = btn.closest('[data-type-password="container"]');
  const input = container.querySelector('[data-type-password="input"]');
  const isVisible = input.type === 'text';

  input.type = isVisible ? 'password' : 'text';
  btn.classList.toggle('active', !isVisible);
});

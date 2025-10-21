export const getHeaderHeight = () => {
  const headerHeight = document?.querySelector('[data-header]').offsetHeight;
  document.querySelector(':root').style.setProperty('--header-height', `${headerHeight}px`);
}

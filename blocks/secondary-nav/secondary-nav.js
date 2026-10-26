import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Normalizes a pathname for comparison: drops a trailing slash and `.html`.
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  return (path || '/').replace(/\.html$/, '').replace(/(.)\/+$/, '$1').toLowerCase();
}

/**
 * Shows the scroll buttons only when the list overflows, and disables the one
 * pointing at an edge that is already reached.
 */
function updateArrows(list, prev, next) {
  const max = list.scrollWidth - list.clientWidth;
  const overflow = max > 1;
  prev.hidden = !overflow;
  next.hidden = !overflow;
  // scrollLeft is negative in RTL; compare magnitudes
  const pos = Math.abs(list.scrollLeft);
  prev.disabled = pos <= 1;
  next.disabled = pos >= max - 1;
}

function createArrow(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `secondary-nav-arrow secondary-nav-arrow-${direction}`;
  button.setAttribute('aria-label', label);
  button.hidden = true;
  return button;
}

/**
 * Secondary nav: in-section sub-navigation bar for mini-sites.
 * One row, one richtext cell holding a <ul> of links (paragraph links are
 * accepted too). Rendered as <nav aria-label="Section navigation">.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const links = [...cell.querySelectorAll('a[href]')];

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Section navigation');
  moveInstrumentation(cell, nav);

  const list = document.createElement('ul');
  list.className = 'secondary-nav-list';

  const current = normalizePath(window.location.pathname);
  links.forEach((a) => {
    const li = document.createElement('li');
    li.className = 'secondary-nav-item';
    a.className = 'secondary-nav-link';
    a.removeAttribute('title');
    let path = '';
    try {
      const url = new URL(a.href, window.location.href);
      if (url.origin === window.location.origin) path = normalizePath(url.pathname);
    } catch (e) {
      // ignore malformed hrefs
    }
    if (path && path === current) a.setAttribute('aria-current', 'page');
    li.append(a);
    list.append(li);
  });

  const prev = createArrow('prev', 'Scroll section navigation left');
  const next = createArrow('next', 'Scroll section navigation right');
  const step = () => Math.max(list.clientWidth * 0.75, 120);
  const dir = () => (getComputedStyle(list).direction === 'rtl' ? -1 : 1);
  prev.addEventListener('click', () => list.scrollBy({ left: -step() * dir(), behavior: 'smooth' }));
  next.addEventListener('click', () => list.scrollBy({ left: step() * dir(), behavior: 'smooth' }));

  nav.append(prev, list, next);
  block.replaceChildren(nav);

  const update = () => updateArrows(list, prev, next);
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(list);

  // keep the current item in view on narrow screens
  const active = list.querySelector('[aria-current="page"]');
  if (active) {
    requestAnimationFrame(() => {
      const item = active.parentElement;
      const offset = item.offsetLeft - list.offsetLeft;
      list.scrollLeft = offset - (list.clientWidth - item.offsetWidth) / 2;
      update();
    });
  }
}

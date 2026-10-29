import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

function isSvg(src) {
  try {
    return new URL(src, window.location.href).pathname.toLowerCase().endsWith('.svg');
  } catch (e) {
    return false;
  }
}

/**
 * A cell is the QR cell when it holds a picture, no heading, no links and little text.
 * @param {Element} cell The column cell
 * @returns {boolean}
 */
function isQrCell(cell) {
  return !!cell.querySelector('picture, img')
    && !cell.querySelector('h1, h2, h3, h4, h5, h6, a[href]')
    && cell.textContent.trim().length < 80;
}

/**
 * Turns "image paragraph followed by a link-only paragraph" into an image link,
 * so badges authored as image + link (Universal Editor) render like `<a><picture></a>`.
 * @param {Element} body The text cell
 */
function joinImageLinks(body) {
  [...body.querySelectorAll(':scope > p')].forEach((p) => {
    const pic = p.querySelector(':scope > picture, :scope > img');
    if (!pic || p.textContent.trim() || p.querySelector('a')) return;
    const next = p.nextElementSibling;
    const link = next?.matches('p, .button-container')
      && next.children.length === 1 && next.querySelector(':scope > a[href], :scope > strong > a[href], :scope > em > a[href]');
    if (!link) return;
    const a = document.createElement('a');
    a.href = link.href;
    const label = link.title || link.textContent.trim();
    if (label) a.title = label;
    const img = pic.matches('img') ? pic : pic.querySelector('img');
    if (img && !img.alt && label) img.alt = label;
    moveInstrumentation(link, a);
    a.append(pic);
    p.append(a);
    next.remove();
  });
}

/**
 * Groups the paragraphs holding image links (store badges) into one badge list.
 * @param {Element} body The text cell
 */
function decorateBadges(body) {
  const badgeLinks = [...body.querySelectorAll('a[href]')].filter((a) => a.querySelector('picture, img') && !a.textContent.trim());
  if (!badgeLinks.length) return;
  const list = document.createElement('ul');
  list.className = 'columns-app-download-badges';
  let firstHost = badgeLinks[0];
  while (firstHost.parentElement && firstHost.parentElement !== body) {
    firstHost = firstHost.parentElement;
  }
  firstHost.before(list);
  badgeLinks.forEach((a) => {
    const host = a.parentElement;
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    a.classList.add('columns-app-download-badge');
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
    if (host && host !== body && !host.textContent.trim() && !host.querySelector('picture, img, a')) host.remove();
  });
}

/**
 * Columns App Download: heading + app store badge links | QR code.
 * One row, two cells (either order): [heading, badge image links] | [QR code picture].
 * The QR cell is found by content (picture without heading/links).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-app-download-row');
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img, [data-aue-prop]')) {
        cell.remove();
        return;
      }
      if (isQrCell(cell)) {
        cell.classList.add('columns-app-download-qr');
      } else {
        cell.classList.add('columns-app-download-body');
        joinImageLinks(cell);
        decorateBadges(cell);
      }
    });
    if (!row.children.length) row.remove();
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    if (!isSameOrigin(img.src) || isSvg(img.src)) {
      img.setAttribute('loading', 'lazy');
      return;
    }
    const qr = !!img.closest('.columns-app-download-qr');
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: qr ? '300' : '400' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

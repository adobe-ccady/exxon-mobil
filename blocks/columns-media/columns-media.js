import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

function isMediaCell(cell) {
  return !!cell.querySelector('picture')
    && !cell.querySelector('h1, h2, h3, h4, h5, h6')
    && cell.textContent.trim().length < 120;
}

/**
 * Columns media: a large image beside heading + text + link.
 * One row, two cells in either order: [image (optional video link)] | [heading, text, link].
 * The image side follows the authored cell order (image second = image on the right).
 * The image is loaded eagerly (LCP) only when the block sits in the page's first section.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const firstSection = block.closest('main')?.querySelector(':scope > .section');
  const eager = !!firstSection && firstSection === block.closest('.section');

  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    const cells = [...row.children];
    cells.forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, [data-aue-prop]')) {
        cell.remove();
        return;
      }
      cell.classList.add(isMediaCell(cell) ? 'columns-media-image' : 'columns-media-body');
    });
    const kept = [...row.children];
    if (!kept.length) {
      row.remove();
      return;
    }
    const imageIndex = kept.findIndex((c) => c.classList.contains('columns-media-image'));
    if (imageIndex > 0) row.classList.add('columns-media-image-right');
    if (imageIndex === -1) row.classList.add('columns-media-no-image');
  });

  block.querySelectorAll('.columns-media-image picture > img').forEach((img) => {
    if (!isSameOrigin(img.src)) {
      // images still hosted on the source site can't take the optimization query params
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      return;
    }
    const optimized = createOptimizedPicture(img.src, img.alt, eager, [
      { media: '(min-width: 900px)', width: '1200' },
      { width: '750' },
    ]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

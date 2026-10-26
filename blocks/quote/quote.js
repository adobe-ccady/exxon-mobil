import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Quote: a pull quote with an optional round author portrait and attribution.
 * Rows (each one cell): [quotation], [image], [attribution: name, role].
 * Empty or missing rows are tolerated; the image row is found by its picture.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const imageCell = cells.find((c) => c.querySelector('picture, img'));
  const textCells = cells.filter((c) => c !== imageCell && c.textContent.trim());
  const [quoteCell, attributionCell] = textCells;

  const figure = document.createElement('figure');

  const blockquote = document.createElement('blockquote');
  if (quoteCell) {
    moveInstrumentation(quoteCell, blockquote);
    // an authored <blockquote> is unwrapped so quotes never nest
    const inner = quoteCell.querySelector(':scope > blockquote');
    blockquote.append(...(inner || quoteCell).childNodes);
  }
  figure.append(blockquote);

  if (imageCell || attributionCell) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-attribution';

    if (imageCell) {
      const img = imageCell.querySelector('img');
      const portrait = document.createElement('div');
      portrait.className = 'quote-portrait';
      moveInstrumentation(imageCell, portrait);
      const picture = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      portrait.append(picture);
      caption.append(portrait);
    }

    if (attributionCell) {
      const text = document.createElement('div');
      text.className = 'quote-author';
      moveInstrumentation(attributionCell, text);
      text.append(...attributionCell.childNodes);
      const lines = [...text.querySelectorAll(':scope > p')];
      if (lines[0]) lines[0].classList.add('quote-author-name');
      lines.slice(1).forEach((p) => p.classList.add('quote-author-role'));
      caption.append(text);
    }

    figure.append(caption);
  }

  block.replaceChildren(figure);
}

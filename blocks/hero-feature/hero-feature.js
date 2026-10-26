import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

function isCtaParagraph(el) {
  const links = [...el.querySelectorAll('a[href]')];
  if (!links.length) return false;
  return el.textContent.trim() === links.map((a) => a.textContent).join('').trim();
}

/**
 * Hero feature: full-width photo band with left-aligned text over the image.
 * Row 1 = background image, row 2 = rich text: optional eyebrow paragraph, heading,
 * description paragraph(s), CTA link(s). Rows may be missing or empty.
 * The image is loaded eagerly (LCP) only when the block sits in the page's first section.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  let media;
  let content;
  [...block.children].forEach((row) => {
    if (!media && row.querySelector('picture')) {
      media = row;
      row.classList.add('hero-feature-media');
    } else if (!content && (row.textContent.trim() || row.querySelector('[data-aue-prop]'))) {
      content = row;
      row.classList.add('hero-feature-body');
    } else if (content && row.textContent.trim()) {
      // extra authored text rows are merged into the content row
      content.firstElementChild?.append(...(row.firstElementChild || row).childNodes);
      row.remove();
    } else {
      row.remove();
    }
  });

  // lay out the items of the text cell (or of the Universal Editor rich-text wrapper inside it)
  let items = content?.firstElementChild;
  const richtext = items?.querySelector(':scope > [data-aue-type="richtext"]');
  if (richtext && items.children.length === 1) items = richtext;
  if (items) {
    items.classList.add('hero-feature-content');
    const children = [...items.children];
    const headingIndex = children.findIndex((el) => /^H[1-6]$/.test(el.tagName));
    children.forEach((el, i) => {
      if (i < headingIndex && el.tagName === 'P' && !isCtaParagraph(el)) {
        el.classList.add('hero-feature-eyebrow');
      } else if (isCtaParagraph(el)) {
        el.classList.add('hero-feature-cta');
        el.querySelectorAll('a[href]').forEach((a) => {
          if (!a.classList.contains('button')) a.classList.add('button', 'primary');
        });
      }
    });
  }

  const img = media?.querySelector('picture > img');
  if (!img) {
    block.classList.add('hero-feature-no-image');
    return;
  }

  const firstSection = block.closest('main')?.querySelector(':scope > .section');
  const eager = !!firstSection && firstSection === block.closest('.section');

  if (!isSameOrigin(img.src)) {
    // images still hosted on the source site can't take the optimization query params
    img.setAttribute('loading', eager ? 'eager' : 'lazy');
    if (eager) img.setAttribute('fetchpriority', 'high');
    return;
  }

  const optimized = createOptimizedPicture(img.src, img.alt, eager, [
    { media: '(min-width: 900px)', width: '2000' },
    { media: '(min-width: 600px)', width: '1200' },
    { width: '750' },
  ]);
  const optimizedImg = optimized.querySelector('img');
  if (eager) optimizedImg.setAttribute('fetchpriority', 'high');
  moveInstrumentation(img, optimizedImg);
  img.closest('picture').replaceWith(optimized);
}

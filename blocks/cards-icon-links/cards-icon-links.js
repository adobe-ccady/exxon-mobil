import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isExternal(href) {
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch (e) {
    return false;
  }
}

function isSameOriginRaster(src) {
  try {
    const url = new URL(src, window.location.href);
    return url.origin === window.location.origin && !url.pathname.endsWith('.svg');
  } catch (e) {
    return false;
  }
}

/**
 * Icon link tiles ("Follow us" social tiles): row per tile, [icon] | [title, description, link].
 * The tile's title becomes its link (the whole tile is clickable); the authored link
 * paragraph is folded into the title when the title has no link of its own.
 * Description and icon are optional; empty cells are dropped.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      const hasImage = !!div.querySelector('picture, img');
      if (hasImage && !div.textContent.trim()) {
        div.className = 'cards-icon-links-icon';
      } else if (!div.textContent.trim() && !div.querySelector('[data-aue-prop]')) {
        div.remove();
      } else {
        div.className = 'cards-icon-links-body';
      }
    });

    const body = li.querySelector('.cards-icon-links-body');
    if (body) {
      // Universal Editor groups rich text into one editable wrapper; read the items inside it
      const content = body.querySelector(':scope > [data-aue-type="richtext"]') || body;
      const items = [...content.children].filter((el) => el.textContent.trim());
      const title = items[0];
      if (title) {
        title.classList.add('cards-icon-links-title');
        const linkItem = items.slice(1).reverse().find((el) => el.querySelector('a[href]')
          && el.textContent.trim() === el.querySelector('a[href]').textContent.trim());
        let link = title.querySelector('a[href]');
        if (!link && linkItem) {
          const source = linkItem.querySelector('a[href]');
          link = document.createElement('a');
          link.href = source.getAttribute('href');
          link.append(...title.childNodes);
          title.append(link);
          linkItem.remove();
        }
        if (link) {
          link.className = 'cards-icon-links-link';
          if (isExternal(link.href)) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          }
        }
        // the tile is not in the document yet: check the parent, not isConnected
        items.slice(1).filter((el) => el.parentElement)
          .forEach((el) => el.classList.add('cards-icon-links-description'));
      }
    }

    // the icon sits after the text (source: label left, icon right)
    const icon = li.querySelector('.cards-icon-links-icon');
    if (icon) {
      li.append(icon);
      const img = icon.querySelector('img');
      const titleText = li.querySelector('.cards-icon-links-title')?.textContent.trim();
      // the icon repeats the label: hide it from assistive tech
      if (img && titleText && img.alt.trim() === titleText) img.alt = '';
    }

    ul.append(li);
  });

  ul.querySelectorAll('.cards-icon-links-icon picture > img').forEach((img) => {
    if (!isSameOriginRaster(img.src)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  block.replaceChildren(ul);
}

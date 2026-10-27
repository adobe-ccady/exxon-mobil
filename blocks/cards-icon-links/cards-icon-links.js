import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

let idCounter = 0;

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

function isLinkOnly(el) {
  const a = el.querySelector('a[href]');
  return !!a && el.textContent.trim() === a.textContent.trim();
}

/**
 * Icon link tiles ("Follow us" social tiles): row per tile, [icon] | [title, description, link].
 * Source (iconGrid): label + icon on the right; the description and "Learn more" link
 * slide open on hover / focus (tap toggles on touch). Description and icon are optional.
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
    const title = (() => {
      if (!body) return null;
      // Universal Editor groups rich text into one editable wrapper; read the items inside it
      const content = body.querySelector(':scope > [data-aue-type="richtext"]') || body;
      const items = [...content.children].filter((el) => el.textContent.trim());
      const [first, ...rest] = items;
      if (!first) return null;
      first.classList.add('cards-icon-links-title');
      rest.forEach((el) => {
        el.classList.add(isLinkOnly(el) ? 'cards-icon-links-cta' : 'cards-icon-links-description');
      });
      return first;
    })();

    if (title) {
      idCounter += 1;
      title.id = title.id || `cards-icon-links-title-${idCounter}`;
    }

    li.querySelectorAll('a[href]').forEach((link) => {
      if (isExternal(link.href)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      // "Learn more" alone is ambiguous: tie it to the tile label
      if (title && link.closest('.cards-icon-links-cta')) link.setAttribute('aria-describedby', title.id);
    });

    // the icon sits after the text (source: label left, icon right)
    const icon = li.querySelector('.cards-icon-links-icon');
    if (icon) {
      li.append(icon);
      const img = icon.querySelector('img');
      const titleText = title?.textContent.trim();
      // the icon repeats the label: hide it from assistive tech
      if (img && titleText && img.alt.trim() === titleText) img.alt = '';
    }

    if (li.querySelector('.cards-icon-links-cta, .cards-icon-links-description')) {
      li.classList.add('cards-icon-links-expandable');
    }

    ul.append(li);
  });

  ul.querySelectorAll('.cards-icon-links-icon picture > img').forEach((img) => {
    if (!isSameOriginRaster(img.src)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  // touch has no hover: a tap on the tile (outside its link) toggles it open
  ul.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) return;
    const li = e.target.closest('li.cards-icon-links-expandable');
    if (!li) return;
    const open = !li.classList.contains('is-open');
    ul.querySelectorAll(':scope > li.is-open').forEach((el) => el.classList.remove('is-open'));
    li.classList.toggle('is-open', open);
  });

  block.replaceChildren(ul);
}

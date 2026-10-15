/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-links. Base: cards.
 * Source: https://corporate.exxonmobil.com/ (.highlight--wrapper.highlight-white > .highlight--content)
 * Model (cards-links-item): image, text (richtext).
 * Row per card: [image] | [h3 title, ul of quick links].
 * Iterates li.highlight--item (block-level); empty carousel filler items are skipped.
 * Image: .lazy-bg[data-desktop] on the live page; full-size <img> in cleaned HTML.
 */
function getImage(item, document) {
  const bg = item.querySelector('.highlight--section-image .lazy-bg, .lazy-bg');
  const imgs = [...item.querySelectorAll('.highlight--section-image img')];
  const altImg = imgs.find((i) => i.getAttribute('alt'));
  const alt = altImg ? altImg.getAttribute('alt') : '';
  let src = bg ? (bg.getAttribute('data-desktop') || bg.getAttribute('data-tablet') || bg.getAttribute('data-mobile')) : null;
  if (!src) {
    const full = imgs.find((i) => !/[?&]w=40\b/.test(i.getAttribute('src') || '')) || imgs[0];
    if (full) src = full.getAttribute('src');
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  return img;
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('li.highlight--item')];
  const cells = [];

  items.forEach((item) => {
    const img = getImage(item, document);
    const titleEl = item.querySelector('.highlight--section-title h2, .highlight--section-title h3, .highlight--section-title h4, h3');
    const description = item.querySelector('.highlight--section-description');
    const links = [...item.querySelectorAll('.highlight--links a')];

    const textContent = [];
    if (titleEl && titleEl.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      textContent.push(h);
    }
    if (description && description.textContent.trim()) {
      const paras = [...description.querySelectorAll('p')];
      if (paras.length) textContent.push(...paras);
      else {
        const p = document.createElement('p');
        p.textContent = description.textContent.trim();
        textContent.push(p);
      }
    }
    if (links.length) {
      const ul = document.createElement('ul');
      links.forEach((a) => {
        const li = document.createElement('li');
        a.setAttribute('href', (a.getAttribute('href') || '').trim());
        li.append(a);
        ul.append(li);
      });
      textContent.push(ul);
    }

    if (!img && !textContent.length) return;
    cells.push([
      img ? [document.createComment(' field:image '), img] : '',
      textContent.length ? [document.createComment(' field:text '), ...textContent] : '',
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-links', cells });
  element.replaceWith(block);
}

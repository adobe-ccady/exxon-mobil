/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-business. Base: cards.
 * Source: https://corporate.exxonmobil.com/ (.highlight--wrapper.highlight-gray > .highlight--content)
 * Model (cards-business-item): image, text (richtext).
 * Row per card: [image] | [h3 title, description, CTA link paragraph(s)].
 * Iterates li.highlight--item (block-level); empty carousel filler items are skipped.
 * Image: .lazy-bg[data-desktop] on the live page; full-size <img> in cleaned HTML.
 * Also: topic/index pages (div.topic--wrapper section.highlight .highlight--content): same
 * li.highlight--item structure with the CTA in .highlight--section-cta (arrow icon dropped);
 * items may have no image (empty image cell, no hint). The .highlight--header (title,
 * description) sits outside the parsed element and stays default content before the block.
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
    if (description) {
      const paras = [...description.querySelectorAll('p')];
      if (paras.length) textContent.push(...paras);
      else if (description.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = description.textContent.trim();
        textContent.push(p);
      }
    }
    links.forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      textContent.push(p);
    });
    // topic/index pages: single CTA in .highlight--section-cta (a.cta + <i class="icon"> arrow)
    [...item.querySelectorAll('.highlight--section-cta a')]
      .filter((src) => src.textContent.trim())
      .forEach((src) => {
        const a = document.createElement('a');
        a.href = src.getAttribute('href') || '';
        a.textContent = src.textContent.replace(/\s+/g, ' ').trim();
        const p = document.createElement('p');
        p.append(a);
        textContent.push(p);
      });

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-business', cells });
  element.replaceWith(block);
}

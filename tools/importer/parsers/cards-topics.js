/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-topics. Base: cards.
 * Source: https://corporate.exxonmobil.com/ (section.keytopicstrending .keytopics.keytopics-two-up)
 * Model (cards-topics-item): image, text (richtext).
 * Row per card: [image] | [linked title heading, tag link].
 * Iterates the stable block wrapper .keytopics--item (not the a.keytopics--link anchors,
 * which wrap block content and can be merged by html2md preprocessing).
 * Image: article.lazy-image[data-desktop] on the live page; <img> in cleaned HTML.
 */
function getImage(item, document, alt) {
  const holder = item.querySelector('.keytopics--image, .lazy-image, article');
  const existing = item.querySelector('.keytopics--image img, picture img');
  if (existing && !/[?&]w=40\b/.test(existing.getAttribute('src') || '')) return existing;
  let src = holder ? (holder.getAttribute('data-desktop') || holder.getAttribute('data-tablet') || holder.getAttribute('data-mobile')) : null;
  if (!src && existing) src = existing.getAttribute('src');
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  return img;
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.keytopics--item')];
  const cells = [];

  items.forEach((item) => {
    const link = item.querySelector('a.keytopics--link') || item.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;
    const titleEl = item.querySelector('.keytopics--title, h3, h4');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const img = getImage(item, document, title);

    const textContent = [];
    if (title) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h.append(a);
      } else {
        h.textContent = title;
      }
      textContent.push(h);
    }
    const tag = item.querySelector('.article--info .tag, .tag');
    if (tag && tag.textContent.trim()) {
      const p = document.createElement('p');
      const tagLink = tag.querySelector('a');
      if (tagLink) p.append(tagLink);
      else p.textContent = tag.textContent.trim();
      textContent.push(p);
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-topics', cells });
  element.replaceWith(block);
}

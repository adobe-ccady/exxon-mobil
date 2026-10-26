/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-topics. Base: cards.
 * Sources:
 *  - home: https://corporate.exxonmobil.com/ (section.keytopicstrending .keytopics.keytopics-two-up)
 *    Row per card: [image] | [linked title heading, tag link].
 *  - article "Explore more": section.featureGrid--wrapper div.featureGrid--container
 *    Row per card: [image] | [linked title heading, description, tag link, "type • date"].
 * Model (cards-topics-item): image, text (richtext).
 * Iterates the stable block wrappers .featureGrid--item / .keytopics--item (not the link anchors,
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

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

/** Article "Explore more" grid: .featureGrid--item wrappers (stable block containers). */
function parseFeatureGridItem(item, document) {
  const link = item.querySelector('a.featureGrid--link') || item.querySelector('a[href]:not(.tag a)');
  const href = link ? link.getAttribute('href') : null;
  const titleEl = item.querySelector('.featureGrid--title');
  const title = titleEl ? clean(titleEl.textContent) : '';

  let img = null;
  const srcImg = item.querySelector('img.featureGrid--image, picture img, img');
  if (srcImg && srcImg.getAttribute('src')) {
    img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || title;
  }

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
  const descEl = item.querySelector('.featureGrid--description');
  const desc = descEl ? clean(descEl.textContent) : '';
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    textContent.push(p);
  }
  const info = item.querySelector('.article--info');
  if (info) {
    const tag = info.querySelector('.tag');
    if (tag && clean(tag.textContent)) {
      const p = document.createElement('p');
      const tagLink = tag.querySelector('a[href]');
      if (tagLink) {
        const a = document.createElement('a');
        a.href = tagLink.getAttribute('href');
        a.textContent = clean(tagLink.textContent);
        p.append(a);
      } else {
        p.textContent = clean(tag.textContent);
      }
      textContent.push(p);
    }
    const type = clean((info.querySelector('.content-type') || {}).textContent);
    const date = clean((info.querySelector('.date') || {}).textContent);
    const meta = [type, date].filter(Boolean).join(' • ');
    if (meta) {
      const p = document.createElement('p');
      p.textContent = meta;
      textContent.push(p);
    }
  }

  if (!img && !textContent.length) return null;
  return [
    img ? [document.createComment(' field:image '), img] : '',
    textContent.length ? [document.createComment(' field:text '), ...textContent] : '',
  ];
}

export default function parse(element, { document }) {
  const cells = [];

  const gridItems = [...element.querySelectorAll('.featureGrid--item')];
  if (gridItems.length) {
    gridItems.forEach((item) => {
      const row = parseFeatureGridItem(item, document);
      if (row) cells.push(row);
    });
  }

  const items = gridItems.length ? [] : [...element.querySelectorAll('.keytopics--item')];

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

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

/*
 * exxonmobilfuels.com variant (/en/rewards/frequent-filler): ul.l01-list.list-3-up >
 * li > div.s01-surfaced-item: (a >) .surfaced-item-image picture + .surfaced-item-copy (h3, p).
 * Image: largest <source srcset> (else img src), absolute to www.exxonmobilfuels.com.
 * Links (copy links, or an href on the image wrapper rebuilt onto the title) are absolute.
 */
const FUELS_ORIGIN = 'https://www.exxonmobilfuels.com';

function fuelsClean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function fuelsUsable(src) {
  const s = (src || '').trim().split(/\s+/)[0];
  return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : '';
}

function fuelsAbs(href) {
  const raw = (href || '').trim();
  if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
  try {
    const url = new URL(raw, `${FUELS_ORIGIN}/`);
    url.searchParams.delete('_gl');
    return url.href;
  } catch (e) {
    return raw;
  }
}

function fuelsImage(item, document) {
  const imgEl = item.querySelector('.surfaced-item-image img') || item.querySelector('img');
  if (!imgEl) return null;
  const picture = imgEl.closest('picture');
  let best = '';
  let bestW = -1;
  if (picture) {
    [...picture.querySelectorAll('source')].forEach((s) => {
      const set = (s.getAttribute('srcset') || s.getAttribute('data-srcset') || '').split(',')
        .map((c) => fuelsUsable(c)).filter(Boolean);
      if (!set.length) return;
      const w = parseInt(s.getAttribute('width'), 10) || 0;
      if (w >= bestW) { bestW = w; best = set[set.length - 1]; }
    });
  }
  const src = best || fuelsUsable(imgEl.getAttribute('data-src')) || fuelsUsable(imgEl.getAttribute('src'));
  if (!src) return null;
  const img = document.createElement('img');
  img.src = fuelsAbs(src);
  img.alt = fuelsClean(imgEl.getAttribute('alt'));
  return img;
}

function parseSurfacedList(element, document) {
  const items = [...element.querySelectorAll('.s01-surfaced-item, .surfaced-item')]
    .filter((el, i, all) => !all.some((o) => o !== el && o.contains(el)));
  const cells = [];
  items.forEach((item) => {
    const img = fuelsImage(item, document);
    const copy = item.querySelector('.surfaced-item-copy') || item;
    const titleEl = copy.querySelector('h1, h2, h3, h4, h5, h6');
    const wrapLink = [...item.querySelectorAll('a[href]')].find((a) => !copy.contains(a));
    // ancestor match limited to the copy container (the list itself is a <ul>)
    const inCopy = (el, sel) => {
      const anc = el && el.closest(sel);
      return !!anc && copy.contains(anc);
    };
    const textContent = [];
    if (titleEl && fuelsClean(titleEl.textContent)) {
      const h = document.createElement('h3');
      const title = fuelsClean(titleEl.textContent);
      const titleLink = titleEl.querySelector('a[href]') || wrapLink;
      if (titleLink) {
        const a = document.createElement('a');
        a.href = fuelsAbs(titleLink.getAttribute('href'));
        a.textContent = title;
        h.append(a);
      } else h.textContent = title;
      textContent.push(h);
    }
    [...copy.querySelectorAll('p, ul, ol')]
      .filter((el) => fuelsClean(el.textContent) && !(titleEl && titleEl.contains(el))
        && !inCopy(el.parentElement, 'p, ul, ol'))
      .forEach((el) => {
        el.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', fuelsAbs(a.getAttribute('href'))));
        el.removeAttribute('class');
        textContent.push(el);
      });
    // CTA links outside paragraphs (e.g. buttons)
    [...copy.querySelectorAll('a[href]')]
      .filter((a) => fuelsClean(a.textContent) && !inCopy(a, 'p, ul, ol, h1, h2, h3, h4, h5, h6'))
      .forEach((src) => {
        const a = document.createElement('a');
        a.href = fuelsAbs(src.getAttribute('href'));
        a.textContent = fuelsClean(src.textContent);
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
  return cells;
}

export default function parse(element, { document }) {
  if (!element.querySelector('li.highlight--item') && element.querySelector('.s01-surfaced-item, .surfaced-item')) {
    const fuelsCells = parseSurfacedList(element, document);
    if (!fuelsCells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const fuelsBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-business', cells: fuelsCells });
    element.replaceWith(fuelsBlock);
    return;
  }

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

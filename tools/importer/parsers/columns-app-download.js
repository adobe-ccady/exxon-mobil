/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-app-download (variant of Columns: one row, two cells).
 * xwalk: Columns component - cells are not field-modelled, so no field hints.
 * Source: https://www.exxonmobilfuels.com/en/rewards/frequent-filler
 *   div.sp07-app-promotion > .app-promotion-wrapper > .app-content (h2) + .app-img (QR picture)
 *   + .app-content-links (a > picture > img badges).
 * Cell 1: heading + one <p> holding the badge image links (<a title><picture><img alt></a>).
 * Cell 2: QR code picture (omitted when the source has none).
 * Images resolve to the largest <source srcset> / src, absolute to www.exxonmobilfuels.com.
 */
const ORIGIN = 'https://www.exxonmobilfuels.com';
const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function usable(src) {
  const s = (src || '').trim().split(/\s+/)[0];
  return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : '';
}

function absUrl(href) {
  const raw = (href || '').trim();
  if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
  try {
    const url = new URL(raw, `${ORIGIN}/`);
    url.searchParams.delete('_gl');
    return url.href;
  } catch (e) {
    return raw;
  }
}

/** Largest <source srcset> of the picture, else img src / data-src / srcset. */
function imageSrc(img) {
  const picture = img.closest('picture');
  let best = '';
  let bestW = -1;
  if (picture) {
    [...picture.querySelectorAll('source')].forEach((s) => {
      const set = (s.getAttribute('srcset') || s.getAttribute('data-srcset') || '').split(',')
        .map((c) => usable(c)).filter(Boolean);
      if (!set.length) return;
      const w = parseInt(s.getAttribute('width'), 10) || 0;
      if (w >= bestW) { bestW = w; best = set[set.length - 1]; }
    });
  }
  const own = usable(img.getAttribute('data-src')) || usable(img.getAttribute('src'))
    || usable((img.getAttribute('srcset') || '').split(',').pop());
  return absUrl(best || own);
}

function makePicture(img, document) {
  const src = img && imageSrc(img);
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = clean(img.getAttribute('alt'));
  const picture = document.createElement('picture');
  picture.append(out);
  return picture;
}

export default function parse(element, { document }) {
  const content = element.querySelector('.app-content') || element;
  const linksEl = element.querySelector('.app-content-links');
  const qrImg = element.querySelector('.app-img img');

  const body = [];
  const heading = content.querySelector(HEADINGS);
  if (heading && clean(heading.textContent)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = clean(heading.textContent);
    body.push(h);
  }

  const badges = document.createElement('p');
  [...(linksEl || element).querySelectorAll('a[href]')]
    .filter((a) => a.querySelector('img') && !(qrImg && a.contains(qrImg)))
    .forEach((src) => {
      const picture = makePicture(src.querySelector('img'), document);
      if (!picture) return;
      const a = document.createElement('a');
      a.href = absUrl(src.getAttribute('href'));
      const title = clean(src.getAttribute('title')) || clean(src.querySelector('img').getAttribute('alt'));
      if (title) a.title = title;
      a.append(picture);
      if (badges.childNodes.length) badges.append(' ');
      badges.append(a);
    });
  if (badges.childNodes.length) body.push(badges);

  const qr = makePicture(qrImg, document);

  if (!body.length && !qr) {
    element.remove();
    return;
  }

  const row = [body.length ? body : ''];
  if (qr) row.push([qr]);
  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-app-download', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-feature (custom Hero Feature block, Hero convention:
 * block-name row + image row + text row). xwalk model `hero-feature`:
 * image (reference) + imageAlt (collapsed into img alt), text (richtext).
 * Sources (topic/index pages):
 *  - section.singleFeature:has(.lazy-bg) > div.lazy-bg (img ?w=2048 + img ?w=40 placeholder)
 *    + div.content > div.singleFeature--content (span.eyebrow, --textField--title h2,
 *    --textField--description, a.button)
 *  - section.variableFeature > div.lazy-bg + div.variableFeature--content
 *    (div.eyebrow > p, --textField--title h2, --textField--description, --button-block a.button)
 * Image: data-desktop on the live lazy-bg, else the full-size <img> (not the ?w=40 placeholder);
 * alt from any image in the lazy-bg that carries one. URLs made absolute.
 * Text row: eyebrow <p> (only when non-empty), heading (source level), description <p>(s),
 * CTA <p><strong><a></a></strong></p>. Hidden .toc-hidden headings are never imported.
 * Output: always two single-cell rows (image | text), field hints on non-empty cells.
 */
const DEFAULT_ORIGIN = 'https://corporate.exxonmobil.com';
const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function usable(src) {
  const s = (src || '').trim();
  return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : '';
}

function absolute(src) {
  try {
    return new URL(src, `${DEFAULT_ORIGIN}/`).href;
  } catch (e) {
    return src;
  }
}

function isPlaceholder(src) {
  return /[?&]w=40\b/.test(src || '');
}

function getImage(element, document) {
  const bg = [...element.querySelectorAll('.lazy-bg')].find((el) => !el.closest('.toc-hidden'));
  if (!bg) return null;
  const imgs = [...bg.querySelectorAll('img')];
  let src = usable(bg.getAttribute('data-desktop'))
    || usable(bg.getAttribute('data-tablet'))
    || usable(bg.getAttribute('data-mobile'));
  if (!src) {
    const full = imgs.find((i) => usable(i.getAttribute('src')) && !isPlaceholder(i.getAttribute('src')))
      || imgs.find((i) => usable(i.getAttribute('src')));
    if (full) src = full.getAttribute('src');
  }
  if (!src) return null;
  const altImg = imgs.find((i) => clean(i.getAttribute('alt')));
  const img = document.createElement('img');
  img.src = absolute(src);
  img.alt = altImg ? clean(altImg.getAttribute('alt')) : '';
  const picture = document.createElement('picture');
  picture.append(img);
  return picture;
}

function notHidden(el) {
  return el && !el.closest('.toc-hidden');
}

function getText(element, document) {
  const out = [];
  const content = element.querySelector('.singleFeature--content, .variableFeature--content') || element;

  // eyebrow
  const eyebrow = [...content.querySelectorAll('.eyebrow')].find(notHidden);
  if (eyebrow && clean(eyebrow.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(eyebrow.textContent);
    out.push(p);
  }

  // heading (keep source level)
  const titleWrap = content.querySelector('[class*="--textField--title"]');
  const heading = (titleWrap && titleWrap.querySelector(HEADINGS))
    || [...content.querySelectorAll(HEADINGS)].find(notHidden);
  if (heading && clean(heading.textContent)) {
    const level = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2';
    const h = document.createElement(level);
    h.textContent = clean(heading.textContent);
    out.push(h);
  } else if (titleWrap && clean(titleWrap.textContent)) {
    const h = document.createElement('h2');
    h.textContent = clean(titleWrap.textContent);
    out.push(h);
  }

  // description
  const desc = content.querySelector('[class*="--textField--description"]');
  if (desc && clean(desc.textContent)) {
    const blocks = [...desc.querySelectorAll(':scope > p, :scope > ul, :scope > ol')]
      .filter((b) => clean(b.textContent));
    if (blocks.length) out.push(...blocks);
    else {
      const p = document.createElement('p');
      p.textContent = clean(desc.textContent);
      out.push(p);
    }
  }

  // CTA(s)
  const ctas = [...content.querySelectorAll('a.button, .variableFeature--button-block a, a.cta')]
    .filter((a, i, arr) => notHidden(a) && arr.indexOf(a) === i && clean(a.textContent));
  ctas.forEach((cta) => {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href') || '';
    a.textContent = clean(cta.textContent);
    const strong = document.createElement('strong');
    strong.append(a);
    const p = document.createElement('p');
    p.append(strong);
    out.push(p);
  });

  return out;
}

export default function parse(element, { document }) {
  const picture = getImage(element, document);
  const text = getText(element, document);

  const cells = [
    [picture ? [document.createComment(' field:image '), picture] : ''],
    [text.length ? [document.createComment(' field:text '), ...text] : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}

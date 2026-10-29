import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

// zero-width characters rich text editors leave behind
const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF]/g;

function textOf(node) {
  return node.textContent.replace(INVISIBLE, '').trim();
}

function isCtaParagraph(el) {
  const links = [...el.querySelectorAll('a[href]')];
  if (!links.length) return false;
  return textOf(el) === links.map((a) => textOf(a)).join('');
}

/**
 * Splits a paragraph into one paragraph per line when a line (between <br>s) is link-only,
 * e.g. "description<br>Join<br>Open the app" after editing in Universal Editor,
 * so each CTA becomes its own button. Plain multi-line text is left as it is.
 * @param {Element} p The paragraph
 */
function splitCtaLines(p) {
  if (p.tagName !== 'P' || !p.querySelector(':scope > br')) return;
  const lines = [[]];
  [...p.childNodes].forEach((node) => {
    if (node.nodeName === 'BR') lines.push([]);
    else lines[lines.length - 1].push(node);
  });
  const paragraphs = lines.map((nodes) => {
    const line = p.cloneNode(false);
    line.append(...nodes);
    return line;
  }).filter((line) => textOf(line) || line.querySelector('picture, img'));
  if (paragraphs.length < 2 || !paragraphs.some(isCtaParagraph)) {
    // nothing to split out: put the nodes back with their line breaks
    p.replaceChildren(...lines.flatMap((nodes, i) => (i ? [document.createElement('br'), ...nodes] : nodes)));
    return;
  }
  p.replaceWith(...paragraphs);
}

/**
 * Makes the links of a CTA paragraph buttons, like decorateButtons does for links authored
 * alone in a paragraph: bold = primary, italic = secondary, both = accent, neither = primary.
 * @param {Element} el The CTA paragraph
 */
function decorateCta(el) {
  el.querySelectorAll('a[href]').forEach((a) => {
    if (a.classList.contains('button')) return;
    // formatting around the link (inside the paragraph) or inside it
    const wrappers = [];
    let outer = a;
    while (outer.parentElement !== el && outer.parentElement.matches('strong, b, em, i')) {
      outer = outer.parentElement;
      wrappers.push(outer);
    }
    const formatted = (selector) => wrappers.some((w) => w.matches(selector))
      || !!a.querySelector(selector);
    const bold = formatted('strong, b');
    const italic = formatted('em, i');
    let variant = 'primary';
    if (bold && italic) variant = 'accent';
    else if (italic) variant = 'secondary';
    a.classList.add('button', variant);
    // drop the formatting wrappers when they hold nothing but the link
    if (outer !== a && textOf(outer) === textOf(a)) outer.replaceWith(a);
  });
}

/**
 * Classes the items of a non-empty text row: eyebrow (paragraph before the heading),
 * title (first heading), description paragraphs and CTA paragraphs (link-only).
 * @param {Element} row The text row
 */
function decorateText(row) {
  let items = row.firstElementChild || row;
  // Universal Editor groups rich text into one editable wrapper: lay out the wrapper's items
  const richtext = items.querySelector(':scope > [data-aue-type="richtext"]');
  if (richtext && items.children.length === 1) items = richtext;
  items.classList.add('hero-article-banner-content');
  [...items.children].forEach(splitCtaLines);
  const children = [...items.children];
  const headingIndex = children.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  children.forEach((el, i) => {
    if (i === headingIndex) {
      el.classList.add('hero-article-banner-title');
    } else if (isCtaParagraph(el)) {
      el.classList.add('hero-article-banner-cta');
      decorateCta(el);
    } else if (i < headingIndex) {
      el.classList.add('hero-article-banner-eyebrow');
    } else {
      el.classList.add('hero-article-banner-description');
    }
  });
}

/**
 * Hero article banner: full-width banner above the article header.
 * Row 1 = image (required), row 2 = optional text. The text row is empty on article
 * (banner-content) pages; on topic/index pages it carries an optional eyebrow, the H1,
 * description paragraph(s) and an optional CTA, rendered as a white overlay on the photo
 * (block class `has-text`, the banner then grows with its text).
 * The banner image is the page's LCP image, so it is loaded eagerly with high fetch priority.
 * Option `large` (block class) shows the taller banner; unknown classes are ignored.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  let mediaFound = false;
  [...block.children].forEach((row) => {
    if (!mediaFound && row.querySelector('picture')) {
      mediaFound = true;
      row.classList.add('hero-article-banner-media');
    } else if (row.textContent.trim()) {
      row.classList.add('hero-article-banner-body');
      block.classList.add('has-text');
      decorateText(row);
    } else if (row.querySelector('[data-aue-prop]')) {
      // empty but instrumented text field: keep it editable in Universal Editor
      row.classList.add('hero-article-banner-body', 'hero-article-banner-empty');
    } else {
      row.remove();
    }
  });

  const img = block.querySelector('.hero-article-banner-media picture > img');
  if (!img) return;

  if (!isSameOrigin(img.src)) {
    // images still hosted on the source site can't take the optimization query params
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
    return;
  }

  const optimized = createOptimizedPicture(img.src, img.alt, true, [
    { media: '(min-width: 900px)', width: '2880' },
    { media: '(min-width: 600px)', width: '1600' },
    { width: '900' },
  ]);
  const optimizedImg = optimized.querySelector('img');
  optimizedImg.setAttribute('fetchpriority', 'high');
  moveInstrumentation(img, optimizedImg);
  img.closest('picture').replaceWith(optimized);
}

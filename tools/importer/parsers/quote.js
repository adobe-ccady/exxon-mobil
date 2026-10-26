/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote (custom Quote block). xwalk model `quote`: classes (select: '' | blue | black),
 * quotation (richtext), image (reference) + imageAlt (collapsed into img alt), attribution (richtext).
 * Sources: article body pull quotes (div.article--wrapper div.pullquote, #main-content div.pullquote), e.g.
 *  div.pullquote.pullquote-red > ... > blockquote.pullquote--blockquote > div.pullquote--text
 *  + div.author.author-inline (picture img.author--image, div.author--name, p.author--title).
 * Variant: pullquote-blue -> blue, pullquote-black -> black, pullquote-red/other -> none.
 * pullquote-half (width modifier) is ignored.
 * Output: always three single-cell rows (quotation | image | attribution), each with its field hint,
 * empty cells keep the hint so cells line up with the model.
 */
const DEFAULT_ORIGIN = 'https://corporate.exxonmobil.com';
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const OPEN_QUOTES = /^[\s ]*[“”„"]+[\s ]*/;
const CLOSE_QUOTES = /[\s ]*[“”"]+[\s ]*$/;

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function hasText(node) {
  return clean(node.textContent).length > 0;
}

function isBlank(n) {
  return n.nodeType === 8
    || (n.nodeType === 3 && !clean(n.textContent))
    || n.nodeName === 'BR';
}

function getOrigin(document, ctx) {
  const candidates = [];
  if (ctx && ctx.params && ctx.params.originalURL) candidates.push(ctx.params.originalURL);
  if (ctx && ctx.url) candidates.push(ctx.url);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) candidates.push(canonical.getAttribute('href'));
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) candidates.push(ogUrl.getAttribute('content'));
  for (let i = 0; i < candidates.length; i += 1) {
    try {
      const u = new URL(candidates[i]);
      if (/^https?:$/.test(u.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) return u.origin;
    } catch (e) { /* ignore */ }
  }
  return DEFAULT_ORIGIN;
}

function absolute(src, origin) {
  const s = (src || '').trim();
  if (!s) return '';
  try {
    return new URL(s, `${origin}/`).href;
  } catch (e) {
    return s;
  }
}

/** First text node / last text node in document order (descending into inline children). */
function edgeText(node, first) {
  const kids = [...node.childNodes];
  if (!first) kids.reverse();
  for (let i = 0; i < kids.length; i += 1) {
    const k = kids[i];
    if (k.nodeType === 3) {
      if (clean(k.textContent)) return k;
    } else if (k.nodeType === 1) {
      const t = edgeText(k, first);
      if (t) return t;
    }
  }
  return null;
}

function trimEdges(parent) {
  while (parent.firstChild && isBlank(parent.firstChild)) parent.firstChild.remove();
  while (parent.lastChild && isBlank(parent.lastChild)) parent.lastChild.remove();
  const f = edgeText(parent, true);
  if (f) f.textContent = f.textContent.replace(/^[\s ]+/, '');
  const l = edgeText(parent, false);
  if (l) l.textContent = l.textContent.replace(/[\s ]+$/, '');
}

/** Quotation content: <p> list keeping em/strong/br, curly quote marks stripped at the edges. */
function quotationContent(source, document) {
  const container = document.createElement('div');
  [...source.childNodes].forEach((n) => container.append(n.cloneNode(true)));
  container.querySelectorAll('script, style, noscript, .share, .author').forEach((n) => n.remove());
  container.querySelectorAll('b, i').forEach((el) => {
    const repl = document.createElement(el.tagName === 'B' ? 'strong' : 'em');
    repl.append(...el.childNodes);
    el.replaceWith(repl);
  });
  // unwrap non-semantic wrappers (inner .pullquote--text divs, spans, nested blockquotes)
  container.querySelectorAll('div, span, font, blockquote, q').forEach((el) => {
    el.replaceWith(...el.childNodes);
  });

  // normalise whitespace in text nodes (source line breaks inside the text render as spaces)
  const walker = document.createTreeWalker(container, 4 /* NodeFilter.SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => { t.textContent = t.textContent.replace(/[\s ]+/g, ' '); });

  // strip literal curly quote marks at the very start / end of the quotation
  const first = edgeText(container, true);
  if (first) first.textContent = first.textContent.replace(OPEN_QUOTES, '');
  const last = edgeText(container, false);
  if (last) last.textContent = last.textContent.replace(CLOSE_QUOTES, '');

  const out = [];
  let para = null;
  [...container.childNodes].forEach((n) => {
    if (n.nodeType === 8) return;
    if (n.nodeType === 1 && BLOCK_TAGS.has(n.tagName)) {
      para = null;
      out.push(n);
      return;
    }
    if (!para) {
      if (isBlank(n)) return;
      para = document.createElement('p');
      out.push(para);
    }
    para.append(n);
  });
  out.forEach((p) => trimEdges(p));
  return out.filter((p) => hasText(p));
}

function portrait(author, document, origin, fallbackAlt) {
  if (!author) return null;
  const srcImg = author.querySelector('img.author--image, picture img, img');
  let src = srcImg ? (srcImg.getAttribute('src') || srcImg.getAttribute('data-src')) : '';
  if (!src) {
    const holder = author.querySelector('[data-desktop], [data-tablet], [data-mobile]');
    if (holder) src = holder.getAttribute('data-desktop') || holder.getAttribute('data-tablet') || holder.getAttribute('data-mobile');
  }
  if (!src) {
    const source = author.querySelector('picture source[srcset]');
    if (source) src = source.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0];
  }
  if (!src || /^data:/.test(src)) return null;
  const img = document.createElement('img');
  img.src = absolute(src, origin);
  const alt = srcImg ? srcImg.getAttribute('alt') : null;
  img.alt = alt !== null ? clean(alt) : (fallbackAlt || '');
  return img;
}

function attributionContent(author, document) {
  if (!author) return [];
  const out = [];
  const nameEl = author.querySelector('.author--name');
  const name = nameEl ? clean(nameEl.textContent) : '';
  if (name) {
    const p = document.createElement('p');
    p.textContent = name;
    out.push(p);
  }
  author.querySelectorAll('.author--title').forEach((t) => {
    const role = clean(t.textContent);
    if (!role) return;
    const p = document.createElement('p');
    p.textContent = role;
    out.push(p);
  });
  return out;
}

export default function parse(element, { document }) {
  // the import script also passes { url, params }; read them without changing the signature
  // eslint-disable-next-line prefer-rest-params
  const ctx = arguments[1] || {};
  const origin = getOrigin(document, ctx);

  const variants = [];
  if (element.classList.contains('pullquote-blue')) variants.push('blue');
  else if (element.classList.contains('pullquote-black')) variants.push('black');

  const blockquote = element.querySelector('blockquote.pullquote--blockquote, blockquote');
  const textEl = element.querySelector('.pullquote--text') || blockquote;
  const quotation = textEl ? quotationContent(textEl, document) : [];

  const author = element.querySelector('.author');
  const attribution = attributionContent(author, document);
  const nameEl = author ? author.querySelector('.author--name') : null;
  const img = portrait(author, document, origin, nameEl ? clean(nameEl.textContent) : '');

  if (!quotation.length && !attribution.length && !img) {
    element.remove();
    return;
  }

  const cells = [
    [[document.createComment(' field:quotation '), ...quotation]],
    [img ? [document.createComment(' field:image '), img] : [document.createComment(' field:image ')]],
    [[document.createComment(' field:attribution '), ...attribution]],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote', variants, cells });
  element.replaceWith(block);
}

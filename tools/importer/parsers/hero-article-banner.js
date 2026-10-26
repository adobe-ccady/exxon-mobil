/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-article-banner (custom Hero Article Banner block, Hero convention:
 * block-name row + image row + text row). xwalk model `hero-article-banner`:
 * classes (select: '' | large), image (reference) + imageAlt (collapsed into img alt), text (richtext).
 * Sources: banner wrapper at the top of article / banner content pages
 * (section.articleHeader div.articleHeader--imagewrapper), e.g.
 *  div.articleHeader-small.articleHeader--imagewrapper > div.breadcrumbs-wrapper + picture
 *  > source* + img.articleHeader--image
 * Variant: wrapper WITHOUT articleHeader-small -> large; small crop -> no variant.
 * The breadcrumb (div.breadcrumbs-wrapper) is never imported (rendered by code).
 * The wrapper is a sibling of section.articleHeader > div.container (columns-article-header),
 * so replacing it never touches that block's element.
 * Output: always two single-cell rows (image | text), each with its field hint; text is empty.
 * Wrappers without a usable image are removed.
 */
const DEFAULT_ORIGIN = 'https://corporate.exxonmobil.com';

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
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

function usable(src) {
  const s = (src || '').trim();
  return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : '';
}

/** Largest candidate from a srcset string (by w / x descriptor; later entries win ties). */
function largestFromSrcset(srcset) {
  let best = '';
  let bestSize = -1;
  (srcset || '').split(',').forEach((part) => {
    const [url, desc] = part.trim().split(/\s+/);
    if (!usable(url)) return;
    let size = 0;
    const m = (desc || '').match(/^([\d.]+)([wx])$/i);
    if (m) size = parseFloat(m[1]) * (m[2].toLowerCase() === 'x' ? 10000 : 1);
    if (size >= bestSize) {
      best = url;
      bestSize = size;
    }
  });
  return best;
}

/** Desktop-most source of the banner image (data-desktop > widest <source> > img data-src/src). */
function bannerSource(element) {
  const img = element.querySelector('img.articleHeader--image') || element.querySelector('picture img, img');
  const holders = [element, ...element.querySelectorAll('[data-desktop]')];
  for (let i = 0; i < holders.length; i += 1) {
    const d = usable(holders[i].getAttribute('data-desktop'));
    if (d) return { src: d, img };
  }
  // <picture><source media="(min-width: N)" srcset> - prefer the widest min-width query
  const sources = [...element.querySelectorAll('picture source')]
    .map((s) => {
      const url = largestFromSrcset(s.getAttribute('srcset') || s.getAttribute('data-srcset'));
      const m = (s.getAttribute('media') || '').match(/min-width:\s*(\d+)/);
      return { url, min: m ? parseInt(m[1], 10) : -1 };
    })
    .filter((s) => s.url && s.min >= 0)
    .sort((a, b) => b.min - a.min);
  if (sources.length) return { src: sources[0].url, img };
  if (img) {
    const s = usable(img.getAttribute('data-src'))
      || largestFromSrcset(img.getAttribute('data-srcset'))
      || usable(img.getAttribute('src'))
      || largestFromSrcset(img.getAttribute('srcset'));
    if (s) return { src: s, img };
  }
  return { src: '', img };
}

/**
 * Topic/index page header text (section.topicHeader .header--content):
 * eyebrow <p> (only when non-empty), <h1>, description <p>(s) (inline links kept),
 * CTA <p><strong><a></a></strong></p>. The breadcrumb is never read.
 */
function topicHeaderText(element, document) {
  const out = [];
  const content = element.querySelector('.header--content');
  if (!content) return out;

  const eyebrow = content.querySelector('.eyebrow');
  if (eyebrow && clean(eyebrow.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(eyebrow.textContent);
    out.push(p);
  }

  const title = content.querySelector('.header--title') || content.querySelector('h1, h2');
  if (title && clean(title.textContent)) {
    const h1 = document.createElement('h1');
    h1.textContent = clean(title.textContent);
    out.push(h1);
  }

  const desc = content.querySelector('.header--description');
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

  [...content.querySelectorAll('a.button')]
    .filter((a) => !(desc && desc.contains(a)) && clean(a.textContent))
    .forEach((src) => {
      const a = document.createElement('a');
      a.href = src.getAttribute('href') || '';
      a.textContent = clean(src.textContent);
      const strong = document.createElement('strong');
      strong.append(a);
      const p = document.createElement('p');
      p.append(strong);
      out.push(p);
    });
  return out;
}

/** section.topicHeader (topic/index pages): image row + filled text row. */
function parseTopicHeader(element, document, origin) {
  // short crop (header-small) -> no variant, otherwise large
  const variants = element.classList.contains('header-small') ? [] : ['large'];
  const { src, img: srcImg } = bannerSource(element);
  const text = topicHeaderText(element, document);
  if (!src && !text.length) {
    element.remove();
    return;
  }

  let imageCell = '';
  if (src) {
    const img = document.createElement('img');
    img.src = absolute(src, origin);
    img.alt = srcImg ? clean(srcImg.getAttribute('alt')) : '';
    const picture = document.createElement('picture');
    picture.append(img);
    imageCell = [document.createComment(' field:image '), picture];
  }

  const cells = [
    [imageCell],
    [text.length ? [document.createComment(' field:text '), ...text] : [document.createComment(' field:text ')]],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article-banner', variants, cells });
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  // the import script also passes { url, params }; read them without changing the signature
  // eslint-disable-next-line prefer-rest-params
  const ctx = arguments[1] || {};
  const origin = getOrigin(document, ctx);

  if (element.matches('section.topicHeader')) {
    parseTopicHeader(element, document, origin);
    return;
  }

  const variants = element.classList.contains('articleHeader-small') ? [] : ['large'];

  const { src, img: srcImg } = bannerSource(element);
  if (!src) {
    element.remove();
    return;
  }

  const img = document.createElement('img');
  img.src = absolute(src, origin);
  img.alt = srcImg ? clean(srcImg.getAttribute('alt')) : '';
  const picture = document.createElement('picture');
  picture.append(img);

  const cells = [
    [[document.createComment(' field:image '), picture]],
    [[document.createComment(' field:text ')]],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article-banner', variants, cells });
  element.replaceWith(block);
}

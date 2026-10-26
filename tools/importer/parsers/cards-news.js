/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://corporate.exxonmobil.com/ (section.keytopicstrending .trending--content)
 * Model (cards-news-item): image, text (richtext).
 * Row per news item: [image (empty – items have no image)] | [title link, tag, read time].
 * Iterates the block-level .trending--item wrappers (never the inline title anchors).
 *
 * Also: topic/index pages (section.contentCollection, e.g. /news "Latest news",
 * /news/news-releases "All news releases"):
 *  section.contentCollection > .container > .contentCollection--wrapper
 *   > .contentCollection--title h2 (default content before the block)
 *   + .contentCollection--items > .contentCollection--item (server-rendered items)
 *     > .contentCollection--content (a.link-black title, .contentCollection--description,
 *       .article--info: .tag, .content-type, .read-time, .date)
 *     + .contentCollection--image (a > .lazy-image > img ?w=2048)
 *   + .contentCollection--buttons (Load More <button> dropped; a.contentCollection--cta
 *     kept as a default-content button after the block)
 * section.dynamicContentCollection (/community "Latest news", curated, fixed 5 items) uses the
 * same markup with the `dynamicContentCollection--` prefix (title inside --header, CTA in
 * .dynamicContentCollection--bottom, items without thumbnails -> empty image cell).
 * Row per item: [thumbnail picture] | [title link <p>, description (<ul> or <p>), tag <p>,
 *  meta <p> "content type • read time • date"].
 */
const CC_ORIGIN = 'https://corporate.exxonmobil.com';

function ccClean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function ccAbsolute(src) {
  try {
    return new URL(src, `${CC_ORIGIN}/`).href;
  } catch (e) {
    return src;
  }
}

function ccImage(item, document, px) {
  const wrap = item.querySelector(`.${px}--image`);
  if (!wrap) return null;
  const imgs = [...wrap.querySelectorAll('img')];
  const holder = wrap.querySelector('[data-desktop]');
  let src = holder ? ccClean(holder.getAttribute('data-desktop')) : '';
  if (!src) {
    const ok = (s) => s && !/^(data|blob):/i.test(s);
    const full = imgs.find((i) => ok(i.getAttribute('src')) && !/[?&]w=40\b/.test(i.getAttribute('src')))
      || imgs.find((i) => ok(i.getAttribute('src')))
      || imgs.find((i) => ok(i.getAttribute('data-src')));
    if (full) src = full.getAttribute('src') || full.getAttribute('data-src');
  }
  if (!src) return null;
  const altImg = imgs.find((i) => ccClean(i.getAttribute('alt')));
  const img = document.createElement('img');
  img.src = ccAbsolute(src);
  img.alt = altImg ? ccClean(altImg.getAttribute('alt')) : '';
  const picture = document.createElement('picture');
  picture.append(img);
  return picture;
}

function ccText(item, document, px) {
  const out = [];
  const content = item.querySelector(`.${px}--content`) || item;

  const titleSrc = content.querySelector('a.link-black')
    || [...content.querySelectorAll('a')].find((a) => !a.closest(`.tag, .article--info, .${px}--description`));
  if (titleSrc && ccClean(titleSrc.textContent)) {
    const a = document.createElement('a');
    a.href = titleSrc.getAttribute('href') || '';
    a.textContent = ccClean(titleSrc.textContent);
    const p = document.createElement('p');
    p.append(a);
    out.push(p);
  }

  const desc = content.querySelector(`.${px}--description`);
  if (desc && ccClean(desc.textContent)) {
    const blocks = [...desc.querySelectorAll(':scope > p, :scope > ul, :scope > ol')]
      .filter((b) => ccClean(b.textContent));
    if (blocks.length) out.push(...blocks);
    else {
      const p = document.createElement('p');
      p.textContent = ccClean(desc.textContent);
      out.push(p);
    }
  }

  const tag = content.querySelector('.article--info .tag, .tag');
  if (tag && ccClean(tag.textContent)) {
    const p = document.createElement('p');
    const tagLink = tag.querySelector('a');
    if (tagLink) {
      const a = document.createElement('a');
      a.href = tagLink.getAttribute('href') || '';
      a.textContent = ccClean(tagLink.textContent);
      p.append(a);
    } else p.textContent = ccClean(tag.textContent);
    out.push(p);
  }

  const meta = ['.content-type', '.read-time', '.date']
    .map((sel) => content.querySelector(`.article--info ${sel}`) || content.querySelector(sel))
    .map((el) => (el ? ccClean(el.textContent) : ''))
    .filter(Boolean);
  if (meta.length) {
    const p = document.createElement('p');
    p.textContent = meta.join(' • ');
    out.push(p);
  }
  return out;
}

function parseContentCollection(element, document, px) {
  const before = [];
  const after = [];

  const heading = element.querySelector(['h1', 'h2', 'h3', 'h4'].map((h) => `.${px}--title ${h}`).join(', '));
  if (heading && ccClean(heading.textContent)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = ccClean(heading.textContent);
    before.push(h);
  }

  [...element.querySelectorAll(`.${px}--buttons a, .${px}--bottom a, a.${px}--cta`)]
    .filter((a, i, arr) => arr.indexOf(a) === i && ccClean(a.textContent))
    .forEach((src) => {
      const a = document.createElement('a');
      a.href = src.getAttribute('href') || '';
      a.textContent = ccClean(src.textContent);
      const strong = document.createElement('strong');
      strong.append(a);
      const p = document.createElement('p');
      p.append(strong);
      after.push(p);
    });

  const cells = [];
  [...element.querySelectorAll(`.${px}--item`)].forEach((item) => {
    const picture = ccImage(item, document, px);
    const text = ccText(item, document, px);
    if (!picture && !text.length) return;
    cells.push([
      picture ? [document.createComment(' field:image '), picture] : '',
      text.length ? [document.createComment(' field:text '), ...text] : '',
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...before, ...after);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(...before, block, ...after);
}

export default function parse(element, { document }) {
  if (element.matches('section.contentCollection')) {
    parseContentCollection(element, document, 'contentCollection');
    return;
  }
  if (element.matches('section.dynamicContentCollection')) {
    parseContentCollection(element, document, 'dynamicContentCollection');
    return;
  }

  const items = [...element.querySelectorAll('.trending--item')];
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const titleLink = item.querySelector(':scope > a, a.link-black')
      || [...item.querySelectorAll('a')].find((a) => !a.closest('.tag'));
    const tag = item.querySelector('.article--info .tag, .tag');
    const readTime = item.querySelector('.read-time');

    const textContent = [];
    if (titleLink && titleLink.textContent.trim()) {
      const p = document.createElement('p');
      p.append(titleLink);
      textContent.push(p);
    }
    if (tag && tag.textContent.trim()) {
      const p = document.createElement('p');
      const tagLink = tag.querySelector('a');
      if (tagLink) p.append(tagLink);
      else p.textContent = tag.textContent.trim();
      textContent.push(p);
    }
    if (readTime && readTime.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = readTime.textContent.trim();
      textContent.push(p);
    }

    if (!textContent.length && !img) return;
    cells.push([
      img ? [document.createComment(' field:image '), img] : '',
      textContent.length ? [document.createComment(' field:text '), ...textContent] : '',
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}

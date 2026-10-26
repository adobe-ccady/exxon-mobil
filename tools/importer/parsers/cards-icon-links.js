/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon-links (custom Cards block). xwalk item model `cards-icon-links-item`:
 * image (reference, the icon), text (richtext: title, optional description, link).
 * Source: section.iconGrid > div.container > div.lazy-bg.iconGrid--bg (section background, dropped)
 *  + div.iconGrid--title (h3 + .iconGrid--title-description)
 *  + div.iconGrid--items > div.iconGrid--items-group > div.iconGrid--item-wrapper > div.iconGrid--item
 *    > div.iconGrid--item-title (h3 label + icon img) + div.iconGrid--item-content
 *      (.item--description, a.cta "Learn more" + <i class="icon">)
 * Iterates the block-level div.iconGrid--item wrappers.
 * Row per tile: [icon picture] | [title <p>, optional description <p>, link <p>].
 * The iconGrid heading and its description stay default content BEFORE the block
 * (the parser element is the whole section, so they are re-emitted ahead of the block).
 */
const DEFAULT_ORIGIN = 'https://corporate.exxonmobil.com';
const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function imgSrc(src) {
  let s = (src || '').trim();
  if (!s || /^data:/i.test(s) || /^blob:/i.test(s)) return '';
  // root-relative source paths -> absolute; keep already-absolute and local ./images paths
  if (s.startsWith('/') && !s.startsWith('//')) s = `${DEFAULT_ORIGIN}${s}`;
  else if (s.startsWith('//')) s = `https:${s}`;
  // html2md turns any <img> whose src ends in ".svg" into a :name: icon token, which would
  // not land in the `image` reference field; a neutral Sitecore media param keeps it an image.
  if (/\.svg$/i.test(s)) s = `${s}?iar=0`;
  return s;
}

/** Description content as block elements (or a single <p>), empty when blank. */
function blocksOf(el, document) {
  if (!el || !clean(el.textContent)) return [];
  const blocks = [...el.querySelectorAll(':scope > p, :scope > ul, :scope > ol')]
    .filter((b) => clean(b.textContent));
  if (blocks.length) return blocks;
  const p = document.createElement('p');
  p.textContent = clean(el.textContent);
  return [p];
}

export default function parse(element, { document }) {
  const before = [];

  // section heading + description -> default content before the block
  const titleWrap = element.querySelector('.iconGrid--title');
  if (titleWrap) {
    const heading = titleWrap.querySelector(HEADINGS);
    if (heading && clean(heading.textContent)) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = clean(heading.textContent);
      before.push(h);
    }
    before.push(...blocksOf(titleWrap.querySelector('.iconGrid--title-description'), document));
  }

  const cells = [];
  [...element.querySelectorAll('.iconGrid--item')].forEach((item) => {
    const titleArea = item.querySelector('.iconGrid--item-title');
    const contentArea = item.querySelector('.iconGrid--item-content');

    // icon
    let picture = null;
    const icon = (titleArea && titleArea.querySelector('img')) || item.querySelector('img');
    const src = icon ? imgSrc(icon.getAttribute('src') || icon.getAttribute('data-src')) : '';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = clean(icon.getAttribute('alt'));
      picture = document.createElement('picture');
      picture.append(img);
    }

    // text: title, optional description, link
    const text = [];
    const label = titleArea ? titleArea.querySelector(HEADINGS) : item.querySelector(HEADINGS);
    if (label && clean(label.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(label.textContent);
      text.push(p);
    }
    if (contentArea) {
      text.push(...blocksOf(contentArea.querySelector('.item--description'), document));
      const links = [...contentArea.querySelectorAll('a')]
        .filter((a) => !a.closest('.item--description') && clean(a.textContent));
      links.forEach((srcA) => {
        const a = document.createElement('a');
        a.href = srcA.getAttribute('href') || '';
        a.textContent = clean(srcA.textContent);
        const p = document.createElement('p');
        p.append(a);
        text.push(p);
      });
    }

    if (!picture && !text.length) return;
    cells.push([
      picture ? [document.createComment(' field:image '), picture] : '',
      text.length ? [document.createComment(' field:text '), ...text] : '',
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...before);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-links', cells });
  element.replaceWith(...before, block);
}

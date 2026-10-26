/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-article-header. Base: columns.
 * Source: https://corporate.exxonmobil.com/ article pages (section.articleHeader > div.container)
 * Structure: one row, two cells.
 *   Cell 1 (metadata rail): tag link (.tag a), content type (.content-type), date (.date). All optional.
 *   Cell 2: H1 title (.articleHeader--title), intro paragraph (.articleHeader--description, optional).
 * Share/print widgets and the mobile info duplicate are removed by the cleanup transformer;
 * metadata is read from .articleHeader--metadata only so a leftover mobile copy is never duplicated.
 * Columns blocks do not take field hints (xwalk hinting rule exception).
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const meta = element.querySelector('.articleHeader--metadata') || element;
  const content = element.querySelector('.articleHeader--content') || element;

  const metaCell = [];
  const tag = meta.querySelector('.tag');
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
    metaCell.push(p);
  }
  ['.content-type', '.date'].forEach((sel) => {
    const el = meta.querySelector(sel);
    const text = el ? clean(el.textContent) : '';
    if (!text) return;
    const p = document.createElement('p');
    p.textContent = text;
    metaCell.push(p);
  });

  const contentCell = [];
  const titleEl = content.querySelector('.articleHeader--title, h1, h2');
  const title = titleEl ? clean(titleEl.textContent) : '';
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title;
    contentCell.push(h1);
  }
  const descEl = content.querySelector('.articleHeader--description');
  const desc = descEl ? clean(descEl.textContent) : '';
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    contentCell.push(p);
  }

  if (!metaCell.length && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[metaCell.length ? metaCell : '', contentCell.length ? contentCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-article-header', cells });
  element.replaceWith(block);
}

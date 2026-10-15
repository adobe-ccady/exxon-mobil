/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-stock-ticker. Base: columns.
 * Source: https://corporate.exxonmobil.com/ (section.stockTicker .stockTicker--wrapper)
 * Structure: one row, two cells.
 *   Cell 1: ticker label heading (.stockTicker--title h2)
 *   Cell 2: price, change, timestamp paragraphs (.stockTicker--data-item)
 * Columns blocks do not take field hints (xwalk hinting rule exception).
 */
export default function parse(element, { document }) {
  const titleWrap = element.querySelector('.stockTicker--title') || element;
  const heading = titleWrap.querySelector('h1, h2, h3, h4, h5, h6');

  const dataWrap = element.querySelector('.stockTicker--data');
  const dataItems = dataWrap
    ? [...dataWrap.querySelectorAll(':scope > .stockTicker--data-item')]
    : [...element.querySelectorAll('.stockTicker--price, .stockTicker--change, .stockTicker--time')];

  const dataCell = [];
  dataItems.forEach((item) => {
    const text = item.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const p = document.createElement('p');
    p.textContent = text;
    dataCell.push(p);
  });

  if (!heading && !dataCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[heading || '', dataCell.length ? dataCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stock-ticker', cells });
  element.replaceWith(block);
}

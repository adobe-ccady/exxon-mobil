/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-benefits (variant of Table). xwalk model table-benefits-row: col1..col4.
 * Source: https://www.exxonmobilfuels.com/en/rewards/frequent-filler
 *   div.ibo-chart > div.ibo-chart-desktop (parsed) + div.ibo-chart-mobile (duplicate, removed).
 * Row 1 (header): __benefits | __pump (title, sublabel, first __pump-col) | next __pump-col |
 *   __store (title, sublabel, __store-col). Icons are inline data-URI SVGs and are dropped.
 * Rows 2..n: .ibo-desktop-row cells in order. Label cell: badge <p>, link <p>, sublabel <p>.
 *   Value cell: value <p> (keeps <sup>) + caption <p>. Link-only cell: <p><a></a></p>.
 * Every row has 4 cells (padded). The footer note ("100 points = $1") is emitted as a default
 * content paragraph after the block. Links are made absolute to www.exxonmobilfuels.com.
 */
const ORIGIN = 'https://www.exxonmobilfuels.com';
const MAX_COLS = 4;

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
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

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function linkPara(document, src) {
  const a = document.createElement('a');
  a.href = absUrl(src.getAttribute('href'));
  a.textContent = clean(src.textContent);
  const p = document.createElement('p');
  p.append(a);
  return p;
}

/** <p> with the inline content of el (keeps <sup>/<sub>/<strong>), whitespace trimmed. */
function richPara(document, el) {
  const p = document.createElement('p');
  [...el.childNodes].forEach((n) => p.append(n.cloneNode(true)));
  while (p.firstChild && p.firstChild.nodeType === 3 && !clean(p.firstChild.textContent)) p.firstChild.remove();
  while (p.lastChild && p.lastChild.nodeType === 3 && !clean(p.lastChild.textContent)) p.lastChild.remove();
  if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^[\s ]+/, '');
  if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/[\s ]+$/, '');
  return p;
}

function textOf(root, selector) {
  const el = root && root.querySelector(selector);
  return el ? clean(el.textContent) : '';
}

/** Header cells: [[p...], ...] */
function headerCells(header, document) {
  const cells = [];
  const corner = header.querySelector('.ibo-desktop-header__benefits');
  cells.push(corner && clean(corner.textContent) ? [para(document, clean(corner.textContent))] : []);

  ['pump', 'store'].forEach((group) => {
    const g = header.querySelector(`.ibo-desktop-header__${group}`);
    if (!g) return;
    const title = textOf(g, `.ibo-desktop-header__${group}-title`);
    const sublabel = textOf(g, `.ibo-desktop-header__${group}-sublabel`);
    const cols = [...g.querySelectorAll(`.ibo-desktop-header__${group}-col`)]
      .map((c) => clean(c.textContent)).filter(Boolean);
    const first = [];
    if (title) first.push(para(document, title));
    if (sublabel) first.push(para(document, sublabel));
    if (cols.length) first.push(para(document, cols[0]));
    if (first.length) cells.push(first);
    cols.slice(1).forEach((c) => cells.push([para(document, c)]));
  });
  return cells;
}

function labelCell(cell, document) {
  const out = [];
  [...cell.children].forEach((child) => {
    if (child.matches('a')) {
      if (clean(child.textContent)) out.push(linkPara(document, child));
      return;
    }
    const link = child.querySelector('a[href]');
    if (link && clean(link.textContent)) {
      out.push(linkPara(document, link));
      return;
    }
    const text = clean(child.textContent);
    if (text) out.push(para(document, text));
  });
  if (!out.length && clean(cell.textContent)) out.push(para(document, clean(cell.textContent)));
  return out;
}

function valueCell(cell, document) {
  const out = [];
  const value = cell.querySelector('.ibo-cell-value');
  const caption = cell.querySelector('.ibo-cell-subtext');
  if (value && clean(value.textContent)) out.push(richPara(document, value));
  if (caption && clean(caption.textContent)) out.push(para(document, clean(caption.textContent)));
  if (!out.length) {
    const link = cell.querySelector('a[href]');
    if (link && clean(link.textContent)) out.push(linkPara(document, link));
    else if (clean(cell.textContent)) out.push(para(document, clean(cell.textContent)));
  }
  return out;
}

function toRow(contents, document) {
  const row = [];
  for (let i = 0; i < MAX_COLS; i += 1) {
    const c = contents[i];
    row.push(c && c.length ? [document.createComment(` field:col${i + 1} `), ...c] : '');
  }
  return row;
}

export default function parse(element, { document }) {
  const desktop = element.matches('.ibo-chart-desktop')
    ? element
    : (element.querySelector('.ibo-chart-desktop') || element);

  // the mobile chart duplicates the desktop one
  const chart = element.closest('.ibo-chart') || element;
  [...chart.querySelectorAll('.ibo-chart-mobile')].forEach((m) => m.remove());

  const cells = [];
  const header = desktop.querySelector('.ibo-desktop-header');
  if (header) {
    const h = headerCells(header, document);
    if (h.some((c) => c.length)) cells.push(toRow(h, document));
  }

  [...desktop.querySelectorAll('.ibo-desktop-row')].forEach((row) => {
    const rowCells = [...row.querySelectorAll(':scope > .ibo-desktop-cell')];
    const contents = rowCells.map((cell, i) => (
      i === 0 || cell.matches('.ibo-desktop-cell--label') ? labelCell(cell, document) : valueCell(cell, document)
    ));
    if (contents.some((c) => c.length)) cells.push(toRow(contents, document));
  });

  const footer = desktop.querySelector('.ibo-desktop-footer');
  const note = footer ? clean(footer.textContent) : '';

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-benefits', cells });
  element.replaceWith(block);
  if (note) block.after(para(document, note));
}

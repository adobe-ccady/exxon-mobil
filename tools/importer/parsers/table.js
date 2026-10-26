/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table (library Table). xwalk model: container `table` (classes: striped, bordered,
 * no-header) with `table-row` items (richtext col1..col11).
 * Sources: article body tables (div.article--wrapper table, #main-content table), e.g.
 *  https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/pmi/pmi-marine
 * Output: one row per source <tr> (thead rows first, then tbody/bare rows, then tfoot), one cell
 * per grid position; colspan/rowspan content goes in the first position, spanned positions stay
 * empty. Every row has the same number of cells (column count, max 11).
 * Header row (thead, or first row made only of <th>) is emitted as the first row with no special
 * markup; otherwise the block gets the `no-header` variant.
 */
const MAX_COLS = 11;
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE']);

function isCell(n) {
  return n.tagName === 'TD' || n.tagName === 'TH';
}

function directRows(table) {
  const rows = [];
  const children = [...table.children];
  children.filter((c) => c.tagName === 'THEAD')
    .forEach((s) => rows.push(...[...s.children].filter((c) => c.tagName === 'TR')));
  children.forEach((child) => {
    if (child.tagName === 'TBODY') rows.push(...[...child.children].filter((c) => c.tagName === 'TR'));
    else if (child.tagName === 'TR') rows.push(child);
  });
  children.filter((c) => c.tagName === 'TFOOT')
    .forEach((s) => rows.push(...[...s.children].filter((c) => c.tagName === 'TR')));
  return rows;
}

function hasText(node) {
  return (node.textContent || '').replace(/[\s ]+/g, '').length > 0;
}

function isBlank(n) {
  return n.nodeType === 8
    || (n.nodeType === 3 && !n.textContent.replace(/ /g, ' ').trim())
    || n.nodeName === 'BR';
}

/** Clean a cell's cloned content in place. */
function cleanCell(container, document) {
  container.querySelectorAll('script, style, noscript').forEach((n) => n.remove());
  // empty anchors (duplicate <a href="mailto:..."></a> etc.)
  container.querySelectorAll('a').forEach((a) => {
    if (!hasText(a) && !a.querySelector('img')) a.remove();
  });
  // non-semantic wrappers
  container.querySelectorAll('div, font, section, article, center, span').forEach((el) => {
    el.replaceWith(...el.childNodes);
  });
  // b -> strong, i -> em
  container.querySelectorAll('b, i').forEach((el) => {
    const repl = document.createElement(el.tagName === 'B' ? 'strong' : 'em');
    repl.append(...el.childNodes);
    el.replaceWith(repl);
  });
  // normalise &nbsp; and whitespace runs in text nodes
  const walker = document.createTreeWalker(container, 4 /* NodeFilter.SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => {
    t.textContent = t.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ');
  });
  container.querySelectorAll('p, strong, em, u, li').forEach((el) => {
    if (!hasText(el) && !el.querySelector('img')) el.remove();
  });
}

function trimEdges(parent) {
  while (parent.firstChild && isBlank(parent.firstChild)) parent.firstChild.remove();
  while (parent.lastChild && isBlank(parent.lastChild)) parent.lastChild.remove();
  if (parent.firstChild && parent.firstChild.nodeType === 3) {
    parent.firstChild.textContent = parent.firstChild.textContent.replace(/^\s+/, '');
  }
  if (parent.lastChild && parent.lastChild.nodeType === 3) {
    parent.lastChild.textContent = parent.lastChild.textContent.replace(/\s+$/, '');
  }
}

/** Cell content nodes: block elements kept; runs of inline content wrapped in <p>. */
function cellContent(td, document) {
  const container = document.createElement('div');
  [...td.childNodes].forEach((n) => container.append(n.cloneNode(true)));
  cleanCell(container, document);
  if (!hasText(container) && !container.querySelector('img')) return [];

  const out = [];
  let para = null;
  [...container.childNodes].forEach((n) => {
    if (n.nodeType === 8) return;
    if (n.nodeType === 1 && BLOCK_TAGS.has(n.tagName)) {
      para = null;
      if (n.tagName === 'P') trimEdges(n);
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
  out.forEach((p) => { if (p.tagName === 'P') trimEdges(p); });
  return out.filter((p) => hasText(p) || (p.querySelector && p.querySelector('img')));
}

export default function parse(element, { document }) {
  const table = element.tagName === 'TABLE' ? element : element.querySelector('table');
  if (!table) return;
  // Both instance selectors can match the same table, and a generated block is itself a <table>:
  // never re-parse a block this parser already produced (or a table nested inside one).
  if (table.closest('table[data-import-block]')) return;

  const rows = directRows(table);

  // Positional grid honouring colspan/rowspan (spanned slots stay empty).
  const grid = rows.map(() => []);
  const occupied = rows.map(() => []);
  rows.forEach((tr, r) => {
    let c = 0;
    [...tr.children].filter(isCell).forEach((cell) => {
      while (occupied[r][c]) c += 1;
      const colspan = Math.max(1, parseInt(cell.getAttribute('colspan'), 10) || 1);
      const rowspan = Math.max(1, parseInt(cell.getAttribute('rowspan'), 10) || 1);
      grid[r][c] = cell;
      for (let dr = 0; dr < rowspan && r + dr < rows.length; dr += 1) {
        for (let dc = 0; dc < colspan; dc += 1) occupied[r + dr][c + dc] = true;
      }
      c += colspan;
    });
  });

  let colCount = occupied.reduce((m, row) => Math.max(m, row.length), 0);
  if (colCount > MAX_COLS) {
    console.warn(`[table parser] source table has ${colCount} columns; keeping the first ${MAX_COLS}.`);
    colCount = MAX_COLS;
  }
  if (!rows.length || !colCount) {
    element.remove();
    return;
  }

  // Header: <thead> row(s), or a first row made only of <th>.
  const firstCells = [...rows[0].children].filter(isCell);
  let hasHeader = rows[0].parentElement.tagName === 'THEAD'
    || (firstCells.length > 0 && firstCells.every((n) => n.tagName === 'TH'));

  const cells = [];
  rows.forEach((tr, r) => {
    const row = [];
    let rowHasContent = false;
    for (let c = 0; c < colCount; c += 1) {
      const src = grid[r][c];
      const content = src ? cellContent(src, document) : [];
      if (content.length) {
        rowHasContent = true;
        row.push([document.createComment(` field:col${c + 1} `), ...content]);
      } else {
        row.push('');
      }
    }
    if (!rowHasContent) {
      // An empty header row would be dropped on the page, so treat the table as headerless.
      if (r === 0) hasHeader = false;
      return;
    }
    cells.push(row);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const variants = hasHeader ? [] : ['no-header'];
  const block = WebImporter.Blocks.createBlock(document, { name: 'table', variants, cells });
  block.setAttribute('data-import-block', 'table');
  element.replaceWith(block);
}

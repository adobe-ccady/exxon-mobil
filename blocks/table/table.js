import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Returns true when a cell holds no authored content (text, media or links).
 * Universal Editor keeps empty rich-text wrappers, so only real content counts.
 * @param {Element} cell The authored cell
 * @returns {boolean}
 */
function isEmptyCell(cell) {
  if (!cell) return true;
  if (cell.textContent.trim()) return false;
  return !cell.querySelector('img, picture, svg, iframe, video, a[href]');
}

/**
 * Number of columns actually used: the model always renders every field (col1…col11),
 * so trailing columns that are empty in every row are dropped.
 * @param {Element[][]} rows Authored cells per row
 * @returns {number}
 */
function usedColumnCount(rows) {
  return rows.reduce((max, cells) => {
    let last = cells.length;
    while (last > 0 && isEmptyCell(cells[last - 1])) last -= 1;
    return Math.max(max, last);
  }, 0);
}

/**
 * Builds a table cell from an authored cell, keeping Universal Editor instrumentation.
 * @param {Element|undefined} source The authored cell (may be missing for short rows)
 * @param {string} tag 'th' or 'td'
 * @returns {Element}
 */
function buildCell(source, tag) {
  const cell = document.createElement(tag);
  if (tag === 'th') cell.scope = 'col';
  if (!source) return cell;
  moveInstrumentation(source, cell);
  cell.append(...source.childNodes);
  // global button decoration must not turn data links into buttons
  cell.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
  cell.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
  return cell;
}

/**
 * Finds an accessible name for the scroll region from the closest preceding heading.
 * @param {Element} block The block element
 * @returns {string}
 */
function regionLabel(block) {
  const prev = block.parentElement?.previousElementSibling;
  if (prev) {
    const headings = prev.matches('h1, h2, h3, h4, h5, h6')
      ? [prev] : [...prev.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const text = headings.pop()?.textContent.trim();
    if (text) return text;
  }
  return 'Data table';
}

/**
 * A stats table (e.g. "#1 / 80% / 66%"): two rows, where every filled cell of the
 * first row holds only a large heading (the figure) and the second row the caption.
 * @param {Element[][]} rows Authored cells per (non-empty) row
 * @returns {boolean}
 */
function isStatsTable(rows) {
  if (rows.length !== 2) return false;
  const figures = rows[0].filter((cell) => !isEmptyCell(cell));
  return figures.length > 1 && figures.every((cell) => {
    const children = [...cell.children];
    return children.length === 1 && children[0].matches('h1, h2, h3')
      && cell.textContent.trim() === children[0].textContent.trim();
  });
}

/**
 * Table: block > one div per row > one div per cell.
 * The first row is the header row unless the `no-header` option is set.
 * Options (block classes): striped, bordered, no-header.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rowEls = [...block.children];
  const rows = rowEls.map((row) => [...row.children]);
  const columns = usedColumnCount(rows);
  const stats = block.classList.contains('no-header')
    && isStatsTable(rows.filter((cells) => !cells.every(isEmptyCell)));
  const hasHeader = !block.classList.contains('no-header') && rowEls.length > 1;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rowEls.forEach((row, i) => {
    const isHeaderRow = hasHeader && i === 0;
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    const cells = rows[i];
    // drop fully empty rows on the page, but keep them in the editor so they stay selectable
    if (!tr.hasAttribute('data-aue-resource') && cells.every(isEmptyCell)) return;
    // rows are padded/trimmed to the used column count so the grid stays regular
    for (let c = 0; c < Math.max(columns, 1); c += 1) {
      tr.append(buildCell(cells[c], isHeaderRow ? 'th' : 'td'));
    }
    (isHeaderRow ? thead : tbody).append(tr);
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);
  block.classList.add(`table-${columns}-cols`);
  if (stats) block.classList.add('table-stats');

  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', regionLabel(block));
  scroller.append(table);
  block.replaceChildren(scroller);
}

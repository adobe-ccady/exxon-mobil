import { moveInstrumentation } from '../../scripts/scripts.js';

const MEDIA = 'img, picture, svg, span.icon';
const INLINE = 'a, strong, em, b, i, u, sup, sub, span, img, picture, br';

/**
 * Returns true when a cell holds no authored content (text, media or links).
 * @param {Element} cell The authored cell
 * @returns {boolean}
 */
function isEmptyCell(cell) {
  if (!cell) return true;
  if (cell.textContent.trim()) return false;
  return !cell.querySelector(`${MEDIA}, a[href]`);
}

/**
 * Number of columns actually used: trailing columns empty in every row are dropped.
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
 * Block-level children of a cell. Loose text/inline content is wrapped in a <p>
 * so every cell can be read as a list of lines.
 * @param {Element} cell The cell
 * @returns {Element[]}
 */
function linesOf(cell) {
  const isInline = (n) => n.nodeType === Node.TEXT_NODE
    || (n.nodeType === Node.ELEMENT_NODE && n.matches(INLINE));
  let run = null;
  [...cell.childNodes].forEach((n) => {
    if (!isInline(n)) {
      run = null;
      return;
    }
    if (!run) {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) return;
      run = document.createElement('p');
      n.before(run);
    }
    run.append(n);
  });
  return [...cell.children].filter((el) => el.textContent.trim() || el.matches(MEDIA)
    || el.querySelector(MEDIA));
}

/**
 * True when a line is an icon only (picture / img / icon span, no text).
 * @param {Element} el The line
 * @returns {boolean}
 */
function isIconLine(el) {
  return !el.textContent.trim() && (el.matches(MEDIA) || !!el.querySelector(MEDIA));
}

/**
 * Global button decoration must not turn links in the chart into buttons.
 * @param {Element} el Container
 */
function stripButtons(el) {
  el.querySelectorAll('.button-container, .button-wrapper')
    .forEach((p) => p.classList.remove('button-container', 'button-wrapper'));
  el.querySelectorAll('a.button')
    .forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      if (!a.classList.length) a.removeAttribute('class');
    });
}

/**
 * Moves an authored cell into a new table cell, keeping UE instrumentation.
 * @param {Element|undefined} source Authored cell
 * @param {string} tag 'th' or 'td'
 * @returns {Element}
 */
function adoptCell(source, tag) {
  const cell = document.createElement(tag);
  if (!source) return cell;
  moveInstrumentation(source, cell);
  cell.append(...source.childNodes);
  stripButtons(cell);
  return cell;
}

/**
 * Header: cell 1 is the row-label heading ("Benefits"). A header cell with several
 * lines opens a column group: its last line is the column label ("Premium gas"),
 * the lines before it (icon, "At the pump", "per gallon") the group heading.
 * Following single-line header cells join that group ("All other fuels").
 * Without any group the header is a single row.
 * @param {Element[]} cells Authored header cells (padded to the column count)
 * @param {number} columns Column count
 * @returns {{rows: Element[], colGroups: number[]}}
 */
function buildHeader(cells, columns) {
  const groups = []; // { start, span, lines }
  const labels = []; // per column: Element[] of label lines
  const colGroups = []; // per column: group index (1-based) or 0
  let open = null;

  for (let c = 0; c < columns; c += 1) {
    const cell = cells[c];
    const lines = cell ? linesOf(cell) : [];
    if (c > 0 && lines.length > 1) {
      open = {
        start: c, span: 1, lines: lines.slice(0, -1), source: cell,
      };
      groups.push(open);
      labels.push(lines.slice(-1));
    } else {
      if (c > 0 && open) open.span += 1;
      labels.push(lines);
    }
    colGroups.push(c > 0 && open ? groups.length : 0);
  }

  const labelRow = document.createElement('tr');
  labelRow.className = 'table-benefits-labels';
  if (!groups.length) {
    for (let c = 0; c < columns; c += 1) {
      const th = adoptCell(cells[c], 'th');
      th.scope = 'col';
      th.classList.add(`table-benefits-col-${c + 1}`);
      if (c === 0) th.classList.add('table-benefits-corner');
      labelRow.append(th);
    }
    return { rows: [labelRow], colGroups };
  }

  const groupRow = document.createElement('tr');
  groupRow.className = 'table-benefits-groups';
  for (let c = 0; c < columns; c += 1) {
    const group = groups.find((g) => g.start === c);
    if (group) {
      const th = document.createElement('th');
      th.scope = 'colgroup';
      th.colSpan = group.span;
      th.classList.add('table-benefits-group', `table-benefits-group-${groups.indexOf(group) + 1}`);
      moveInstrumentation(group.source, th);
      let titled = false;
      group.lines.forEach((line) => {
        if (isIconLine(line)) line.classList.add('table-benefits-group-icon');
        else if (!titled) {
          line.classList.add('table-benefits-group-title');
          titled = true;
        } else line.classList.add('table-benefits-group-sublabel');
        th.append(line);
      });
      groupRow.append(th);
    }
    if (!colGroups[c]) {
      // ungrouped columns (incl. the corner cell) span both header rows
      const th = adoptCell(cells[c], 'th');
      th.scope = 'col';
      th.rowSpan = 2;
      th.classList.add(`table-benefits-col-${c + 1}`);
      if (c === 0) th.classList.add('table-benefits-corner');
      groupRow.append(th);
    } else {
      const th = document.createElement('th');
      th.scope = 'col';
      th.classList.add('table-benefits-label', `table-benefits-col-${c + 1}`, `table-benefits-group-${colGroups[c]}`);
      if (!group) moveInstrumentation(cells[c], th);
      th.append(...labels[c]);
      labelRow.append(th);
    }
  }
  return { rows: [groupRow, labelRow], colGroups };
}

/**
 * Row label cell: lines before the program link are pills ("Now stackable"),
 * the link line is the program name, lines after it are sub-labels ("Member benefit").
 * @param {Element} th The row header cell
 */
function decorateLabelCell(th) {
  const lines = linesOf(th);
  const linkIndex = lines.findIndex((l) => l.querySelector('a[href]') || l.matches('a[href]'));
  lines.forEach((line, i) => {
    if (linkIndex === -1) {
      line.classList.add(i === 0 ? 'table-benefits-program' : 'table-benefits-sublabel');
    } else if (i < linkIndex) line.classList.add('table-benefits-pill');
    else if (i === linkIndex) line.classList.add('table-benefits-program');
    else line.classList.add('table-benefits-sublabel');
  });
}

/**
 * Value cell: first line is the value ("+6¢"), later lines the caption ("In points").
 * A cell holding only a link is an offer pill ("+ Special offers").
 * @param {Element} td The data cell
 */
function decorateValueCell(td) {
  const lines = linesOf(td);
  if (!lines.length) {
    td.classList.add('table-benefits-empty');
    return;
  }
  const links = td.querySelectorAll('a[href]');
  if (lines.length === 1 && links.length === 1
    && links[0].textContent.trim() === td.textContent.trim()) {
    td.classList.add('table-benefits-offer');
    links[0].classList.add('table-benefits-offer-link');
    return;
  }
  lines.forEach((line, i) => line.classList.add(i === 0 ? 'table-benefits-value' : 'table-benefits-caption'));
}

/**
 * Accessible name for the scroll region from the closest preceding heading.
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
  return 'Benefits comparison';
}

/**
 * Table Benefits: comparison chart of programs (rows) against benefit columns.
 * block > one div per row > one div per cell (up to 4).
 * Row 1 = header (column groups, see buildHeader); rows 2..n = [program label | values…];
 * the last row is the totals row unless the `no-total` option is set.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rowEls = [...block.children];
  const rows = rowEls.map((row) => [...row.children]);
  const columns = Math.max(usedColumnCount(rows), 1);
  const showTotal = !block.classList.contains('no-total');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  let colGroups = new Array(columns).fill(0);
  rowEls.forEach((row, i) => {
    const cells = rows[i];
    if (i === 0 && rowEls.length > 1) {
      moveInstrumentation(row, thead);
      const header = buildHeader(cells, columns);
      ({ colGroups } = header);
      thead.append(...header.rows);
      return;
    }
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    // drop empty rows on the page, keep them in the editor so they stay selectable
    if (!tr.hasAttribute('data-aue-resource') && cells.every(isEmptyCell)) return;
    for (let c = 0; c < columns; c += 1) {
      const cell = adoptCell(cells[c], c === 0 ? 'th' : 'td');
      cell.classList.add(`table-benefits-col-${c + 1}`);
      if (colGroups[c]) cell.classList.add(`table-benefits-group-${colGroups[c]}`);
      if (c === 0) {
        cell.scope = 'row';
        cell.classList.add('table-benefits-row-label');
        decorateLabelCell(cell);
      } else decorateValueCell(cell);
      tr.append(cell);
    }
    tbody.append(tr);
  });

  if (showTotal && tbody.children.length > 1) {
    tbody.lastElementChild.classList.add('table-benefits-total');
  }

  if (thead.children.length) table.append(thead);
  table.append(tbody);
  block.classList.add(`table-benefits-${columns}-cols`);

  const scroller = document.createElement('div');
  scroller.className = 'table-benefits-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', regionLabel(block));
  scroller.append(table);
  block.replaceChildren(scroller);
}

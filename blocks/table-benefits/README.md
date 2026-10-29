# table-benefits

**table-benefits** block (variant of library Table). Purpose: the Rewards+ benefits stacking chart (source `div.ibo-chart-desktop` on /en/rewards/frequent-filler): programs (rows) against benefit columns grouped under icon headers ("At the pump" / "In-store"), value tiles, and a totals row. Renders a semantic `<table>` (two-row grouped `<thead>`, row headers) in a horizontally scrollable region.

## Content structure (contract for authors and the import parser)

Block element, then one `div` per row, then one `div` per cell, **max 4 cells per row** (UE `col1` … `col4`). Options are block classes. No configuration rows.

```html
<div class="table-benefits">
  <!-- row 1 = header row -->
  <div>
    <div><p>Benefits</p></div>                        <!-- corner label (one line) -->
    <div>                                             <!-- several lines = opens a column group -->
      <p><picture><img src="pump.png" alt=""></picture></p>  <!-- optional icon line -->
      <p>At the pump</p>                              <!-- group title -->
      <p>per gallon</p>                               <!-- optional group sub-label -->
      <p>Premium gas</p>                              <!-- LAST line = this column's label -->
    </div>
    <div><p>All other fuels</p></div>                 <!-- one line = joins the open group -->
    <div>
      <p><picture><img src="store.png" alt=""></picture></p>
      <p>In-store</p>
      <p>per dollar</p>
      <p>Purchase</p>
    </div>
  </div>
  <!-- rows 2..n-1 = program rows -->
  <div>
    <div>
      <p>Now stackable</p>                            <!-- optional: lines BEFORE the link = pill -->
      <p><a href="/en/directdebitplus">Exxon Mobil Direct Debit+™ account</a></p>
      <p>Linked account</p>                           <!-- optional: lines AFTER the link = sub-label -->
    </div>
    <div><p>+12¢<sup>§</sup></p><p>Instant savings</p></div>  <!-- value line, caption line -->
    <div><p>+10¢<sup>§</sup></p><p>Instant savings</p></div>
    <div></div>                                       <!-- empty cell: keep it -->
  </div>
  <!-- last row = totals row -->
  <div>
    <div><p>Total benefits</p></div>
    <div><p>20¢</p><p>In benefits</p></div>
    <div><p>15¢</p><p>In benefits</p></div>
    <div><p><a href="/en/rewards/earn-rewards-plus-points">+ Special offers</a></p></div>  <!-- link only = offer pill -->
  </div>
</div>
```

Parser notes:

- Use only the desktop markup (`.ibo-chart-desktop`); `.ibo-chart-mobile` duplicates it. Header: `ibo-desktop-header__benefits` → cell 1; `__pump` (icon, title, sublabel, first `__pump-col`) → cell 2; second `__pump-col` → cell 3; `__store` (icon, title, sublabel, `__store-col`) → cell 4.
- Body rows: `ibo-desktop-cell--label` → cell 1 (`.ibo-badge` text as its own first `<p>`, link `<p>`, `.ibo-benefit-sublabel` `<p>`); each value cell → `<p>` value (keep `<sup>`) + `<p>` caption (`.ibo-cell-subtext`). Values are paragraphs, never headings.
- The footer note "100 points = $1" is default content after the block.
- Source icons are inline data-URI SVGs: export them as image files or drop the icon line; an `<img>`/`<picture>` or `:icon:` span all work.
- Each cell is one `<p>` per line. Loose text/inline content in a cell is wrapped into a `<p>` by the block.
- Emit 4 cells in every row; an empty cell is `<div></div>`.

## Header grouping rules

- Cell 1 of the header is the row-label heading (corner); it spans both header rows.
- A header cell (2+) with more than one line opens a group: the last line is the column label, the lines before it (icon line, title, sub-label) become the group heading `<th scope="colgroup" colspan>`.
- A following header cell with a single line joins the open group as another column.
- If no header cell has several lines, the header is a single row of column labels.

## Supported variations

| Variation | Option class | Effect |
| --- | --- | --- |
| No totals row | `no-total` | The last row is a normal program row (no `table-benefits-total` class) |

## Universal Editor

- **Table Benefits** (`table-benefits`): container block. Field `classes` (multiselect): No totals row. Accepts **Table Benefits Row** children only.
- **Table Benefits Row** (`table-benefits-row`): item with rich-text fields `col1` … `col4` (cell N → `colN`).
- md2jcr: block name `table-benefits` → definition title `Table Benefits`; each row `div` → a `table-benefits-row` item.

## Rendering (classes for the design pass)

- `div.table-benefits-scroll[role=region][tabindex=0][aria-label]` (label = nearest preceding heading) wraps the `<table>`.
- Block gets `table-benefits-<n>-cols`.
- `thead`: `tr.table-benefits-groups` (corner `th.table-benefits-corner`, `th.table-benefits-group.table-benefits-group-K` holding `.table-benefits-group-icon`, `.table-benefits-group-title`, `.table-benefits-group-sublabel`), then `tr.table-benefits-labels` (`th.table-benefits-label`).
- Every cell has `table-benefits-col-N` (1-based) and, when grouped, `table-benefits-group-K` — use these for column colours (col-2 dark blue, col-3 pale blue, col-4 grey).
- Body: `th.table-benefits-row-label[scope=row]` with `.table-benefits-pill`, `.table-benefits-program`, `.table-benefits-sublabel`; value cells with `.table-benefits-value` and `.table-benefits-caption`; empty cells `td.table-benefits-empty`; link-only cells `td.table-benefits-offer` with `a.table-benefits-offer-link`.
- Totals: `tr.table-benefits-total` (last body row, unless `no-total`).
- Links are never styled as buttons. Fully empty rows are dropped on the published page.

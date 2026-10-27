# table

**table** block (library Table). Purpose: data tables in article body copy (contact/email lists, publication lists, ESG metrics, privacy-policy tables). Renders a semantic, horizontally scrollable `<table>` with 1-11 columns and any number of rows.

## Content structure (contract for authors and the import parser)

Block element, then one `div` per table row, then one `div` per cell. Options are block classes. No configuration rows.

```html
<div class="table striped bordered">     <!-- options as extra classes, or just class="table" -->
  <div>                                  <!-- row 1 = header row (unless no-header) -->
    <div><p>Name</p></div>
    <div><p>Email</p></div>
  </div>
  <div>                                  <!-- row 2..n = body rows -->
    <div><p>Marine fuels</p></div>
    <div><p><a href="mailto:x@exxonmobil.com">x@exxonmobil.com</a></p></div>
  </div>
</div>
```

- Cell N of a row maps to UE field `colN` (`col1` … `col11`), by position.
- Cells are rich text: paragraphs, links, `strong`/`em`, lists, `br`. An empty cell is an empty `<div></div>`; keep it so later cells stay in the right column.
- Emit the same number of cells in every row (the source column count, up to 11). The block pads short rows and ignores trailing columns that are empty in every row, so rows rendered with all 11 fields work too.
- Header row: the first row becomes `<thead>` with `<th scope="col">`. Do not mark it in the markup. If the source table has no header row, add the `no-header` class and every row goes in `<tbody>`.
- Spanned source cells (`colspan`/`rowspan`) are not supported: put the content in the first cell and leave the spanned positions as empty `<div></div>`.
- Rows with no content are dropped on the published page.

## Supported variations

| Variation | Option class | Effect |
| --- | --- | --- |
| Striped | `striped` | Alternate rows get the light grey background (`--brand-grey`). This is also the default look of every non-stats table, matching the source data tables, so the option is kept for authoring clarity only |
| Bordered | `bordered` | 1px grey (#808080) rules on the table and every cell (source `border="1"` tables, e.g. PMI Marine contacts, Scope 3 estimates) |
| No header row | `no-header` | First row is a body row; no `<thead>` |

Automatic: a `no-header` table with exactly two rows whose filled first-row cells each hold only an `h1`–`h3` (e.g. "#1 / 80% / 66%") gets the `table-stats` class: centered figures over captions, a 2px red rule above each caption, empty cells act as 5% spacers, no shading, no scrolling.

Options combine, e.g. `class="table striped no-header"`.

## Universal Editor

- **Table** (`table`): container block. Field `classes` (multiselect): Striped, Bordered, No header row. Accepts **Table Row** children only.
- **Table Row** (`table-row`): item with rich-text fields `col1` … `col11` (labels "Column 1" … "Column 11"); any can be empty.
- md2jcr: block name `table` → definition title `Table`; each row `div` → a `table-row` item; cell index → `colN`.

## Rendering

- `<div class="table-scroll" role="region" tabindex="0" aria-label="…">` wraps the table, so wide tables scroll horizontally on small screens. The label is the nearest preceding heading, or "Data table".
- The block gets a `table-<n>-cols` class (used column count). Cells have the source minimum widths (td 120px, th 130px), so wide tables scroll horizontally inside the article column and on small screens.
- Links in cells are never styled as buttons.

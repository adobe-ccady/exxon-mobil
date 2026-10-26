# quote

Custom **quote** block. Purpose: pull quote in article bodies (source `div.pullquote`).

Rendered as `<figure><blockquote>…</blockquote><figcaption class="quote-attribution">…</figcaption></figure>`
with a large opening quote mark and a left accent rule. The portrait is shown round.

## Authoring

Model: `quote`. Three rows, one cell each:

1. **Quotation** (richtext, required): the quote text, one or more paragraphs. Bold/italic allowed. Do not type the curly quote marks; the block draws the opening mark.
2. **Author portrait** (image, optional), with alt text (`imageAlt`). Leave the alt text empty if the name below already identifies the person.
3. **Attribution** (richtext, optional): first paragraph is the name, each further paragraph is a role/title line.

Empty rows are tolerated: the block finds the image row by its picture and takes the remaining text rows in order (quotation, then attribution).

## Supported variations

| Variation | Option class | Source class |
| --- | --- | --- |
| Red (default) | none | `pullquote-red` |
| Blue | `blue` | `pullquote-blue` |
| Black | `black` | `pullquote-black` |

`pullquote-half` is a source width/layout modifier and is not mapped to an option.

## Universal Editor fields

| Field | Component | Cell |
| --- | --- | --- |
| `classes` | select (Red default / Blue / Black) | block class, no cell |
| `quotation` | richtext | row 1 |
| `image` | reference | row 2 |
| `imageAlt` | text (collapsed into `image` as the img `alt`) | row 2 |
| `attribution` | richtext | row 3 |

## Expected block HTML (importer parser contract)

The importer parser should emit this table structure (xwalk field hints as comments,
`imageAlt` is the `alt` of the img and needs no hint of its own):

```html
<table>
  <tr><th>Quote (blue)</th></tr>
  <tr><td><!-- field:quotation --><p><em>We have to be thoughtful about the transition…</em></p></td></tr>
  <tr><td><!-- field:image --><img src="https://…/darren-woods.jpg" alt="Darren Woods"></td></tr>
  <tr><td><!-- field:attribution --><p>Darren Woods</p><p>Chairman and CEO</p></td></tr>
</table>
```

- Header cell: `Quote` for the default (red) style, `Quote (blue)` or `Quote (black)` for the colour variants.
- Keep all three rows even when the image or attribution is missing (an empty `<td>` with its field hint), so the cells line up with the model.
- Quotation: take the inner content of `blockquote.pullquote--blockquote`; keep `<p>`, `<em>`, `<strong>`, drop literal leading/trailing curly quote characters.
- Image: the portrait `img` inside `div.author` (resolve lazy `data-*` sources to an absolute URL).
- Attribution: the author name and role from `div.author` as two `<p>` elements, name first.

Delivered markup (what `decorate` receives):

```html
<div class="quote blue">
  <div><div><p><em>We have to be thoughtful…</em></p></div></div>
  <div><div><picture><img src="…" alt="Darren Woods"></picture></div></div>
  <div><div><p>Darren Woods</p><p>Chairman and CEO</p></div></div>
</div>
```

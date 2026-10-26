# columns-media

Custom **columns** block. Purpose: media-feature.

## Authoring (Document Authoring)

Model: `columns`

Single block table. Content: one row, one cell of content.

## Supported variations

No variations.

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- Universal Editor Columns component (`core/franklin/components/columns/v1/columns`, 2 columns x 1 row); each column accepts text, image, button and title. No style options.

## Expected block HTML (importer parser contract)

Block name `columns-media`. Source: `section.shortVideoHeadline` (`/community` "Worldwide giving"). One row, two cells. The cell order is the visual order (image first = image left, as on the source):

| Cell | Content | Required |
| --- | --- | --- |
| 1 | `<picture><img src="..." alt="..."></picture>` from `.shortVideoHeadline--image .lazy-bg > img` (the `?w=2048` one). When the item has a video (`[data-videotype]` / `modal-video`), add a `<p><a href="VIDEO_URL">VIDEO_URL</a></p>` after the picture | yes |
| 2 | heading (`<h2>`), description `<p>`(s), link `<p><a href="...">Explore the report</a></p>` (drop the `<i class="icon">` arrow) | yes |

Columns are not field-modelled in xwalk: no `<!-- field:... -->` hints in the cells.

```html
<div class="columns-media">
  <div>
    <div>
      <picture><img src="https://corporate.exxonmobil.com/-/media/global/images/fpo-images/worldwide-giving-report/gettyimages-1472932742-170667a.jpg?w=2048" alt=""></picture>
    </div>
    <div>
      <h2>Worldwide giving</h2>
      <p>In 2025, ExxonMobil, together with its divisions, affiliates, employees, retirees, and the ExxonMobil Foundation, collectively provided $204 million in community investments worldwide.</p>
      <p><a href="/community/worldwide-giving-report">Explore the report</a></p>
    </div>
  </div>
</div>
```

Put the block in a section with style `dark-grey` (source `shortVideoHeadline-gray-2`); the block itself has no colours. Do not import the empty `.modal-video` container.

## Behavior

- A cell with a picture and no heading (and under 120 characters of text) is the image cell (`columns-media-image`); the other is the body (`columns-media-body`). Empty cells are dropped.
- Mobile: stacked in authored order. From 900px: side by side, image about 45% wide and stretched to the row height (`object-fit: cover`), body vertically centred.
- Image eager only when the block is in the first section, lazy otherwise; source-origin images keep their URL.

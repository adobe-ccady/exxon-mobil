# hero-feature

Custom **hero** block. Purpose: feature-band.

## Authoring (Document Authoring)

Model: `hero`

Single block table. Content: one row, one cell of content.

## Supported variations

No variations.

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- Fields: `image` (reference) + `imageAlt` (text) form row 1; `text` (richtext) forms row 2. No style options.

## Expected block HTML (importer parser contract)

Block name `hero-feature`. Source: `section.singleFeature` with a photo background (`/news` "Publications") and `section.variableFeature` (`/community` "STEM education"). Two rows, one cell each, in this order:

| Row | Cell content | Field hint (xwalk) | Required |
| --- | --- | --- | --- |
| 1 | `<picture><img src="..." alt="..."></picture>`: the full-size background image (`.lazy-bg > img` with `?w=2048`, not the `?w=40` placeholder); alt from the placeholder `img` when the large one has none | `<!-- field:image -->` (alt maps to `imageAlt`) | yes |
| 2 | rich text, in order: eyebrow `<p>` (only when the source eyebrow is non-empty, e.g. "Community"), heading (keep source level, normally `<h2>`), description `<p>`(s), CTA `<p><strong><a href="...">label</a></strong></p>` | `<!-- field:text -->` | yes |

```html
<div class="hero-feature">
  <div>
    <div>
      <!-- field:image -->
      <picture><img src="https://corporate.exxonmobil.com/-/media/digizuite-media-library/2025/08/27/15/35/2565941.jpeg?w=2048" alt="Happy STEM student smiles and shows off 3d printed shapes"></picture>
    </div>
  </div>
  <div>
    <div>
      <!-- field:text -->
      <p>Community</p>
      <h2>STEM education</h2>
      <p>Supporting education is part of our DNA. ...</p>
      <p><strong><a href="/community/stem">Learn more about our commitment to STEM education</a></strong></p>
    </div>
  </div>
</div>
```

Do not import the hidden `.toc-hidden` heading (table-of-contents copy) or empty eyebrow spans. The section around the block needs no style: the photo belongs to the block.

## Behavior

- Row 1 is rendered as a full-bleed background (`object-fit: cover`) with a dark left gradient; row 2 sits on top, left-aligned, max 66% wide on desktop.
- A paragraph before the first heading becomes the eyebrow (`hero-feature-eyebrow`); a link-only paragraph becomes the CTA (`hero-feature-cta`; links get `button primary` when not already buttonized).
- Image loading: eager + `fetchpriority="high"` only when the block is in the page's first section, lazy otherwise. Images still hosted on the source origin keep their URL.
- Missing image: the block renders text only (`hero-feature-no-image`). Extra text rows are merged into the text row.
- Heights (structural): min 360 / 420 / 480px at mobile / 600px / 900px.

# hero-article-banner

Custom **hero** block. Purpose: article-banner.

## Authoring (Document Authoring)

Model: `hero`

Single block table. Content: one row, one cell of content.

## Supported variations

| Variation | Option class |
| --- | --- |
| Large | `large` |

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- `classes` select for options: Large.

## Expected block HTML (importer parser contract)

Block name `hero-article-banner`; add `(large)` / class `large` only when the source banner is not the short crop (source `div.articleHeader--imagewrapper` without `articleHeader-small`). Two rows, one cell each, in this order:

| Row | Cell content | Field hint (xwalk) | Required |
| --- | --- | --- | --- |
| 1 | `<picture><img src="..." alt="..."></picture>` (source `img.articleHeader--image`, keep `alt`) | `<!-- field:image -->` (alt maps to `imageAlt`) | yes |
| 2 | rich text: empty on article (banner-content) pages; on topic/index pages (source `section.topicHeader .header--content`): eyebrow `<p>` (only when `.eyebrow` is non-empty), `<h1>` (`.header--title` text), description `<p>`(s) (`.header--description`, keep inline links), CTA `<p><strong><a href="...">label</a></strong></p>` (`a.button`) | `<!-- field:text -->` | no (may be empty) |

```html
<div class="hero-article-banner large">
  <div>
    <div>
      <!-- field:image -->
      <picture><img src="https://corporate.exxonmobil.com/-/media/.../banner-2880x600.jpg" alt="Guyana One offshore vessel"></picture>
    </div>
  </div>
  <div>
    <div><!-- field:text --></div>
  </div>
</div>
```

Topic/index page example (text row filled):

```html
<div class="hero-article-banner">
  <div>
    <div>
      <!-- field:image -->
      <picture><img src="https://corporate.exxonmobil.com/-/media/digizuite-media-library/2025/08/27/17/59/2542250.png" alt="Liza Destiny"></picture>
    </div>
  </div>
  <div>
    <div>
      <!-- field:text -->
      <p>Newsroom</p>
      <h1>News releases</h1>
      <p>Stay up to date with the latest news from ExxonMobil.</p>
      <p>Members of the media can <a href="/news/media-contacts">click here</a> for a list of our global in-country media relations contacts.</p>
      <p><strong><a href="/news/subscribe#Subscribe">Sign up to receive the latest news from ExxonMobil</a></strong></p>
    </div>
  </div>
</div>
```

Do not import the source breadcrumb (`.breadcrumbs-wrapper`) into the block: it is rendered by code. The `classes` field carries the size option and does not produce a row.

## Behavior

- Row 1 is the page's LCP image: `decorate` rebuilds it with `createOptimizedPicture(..., eager = true)` and sets `fetchpriority="high"`; images still hosted on the source origin keep their URL and only get `loading="eager"` + `fetchpriority="high"`. The block must sit in the page's first section (`loadEager` waits for its first image).
- An empty text row is removed (kept, but hidden from layout, when it carries Universal Editor instrumentation); the banner keeps its fixed heights. This is the article-page behaviour and is unchanged.
- A non-empty text row adds class `has-text` to the block: the image becomes the absolute background with a dark left gradient, the text is a white, left-aligned overlay (max 720px wide) and the banner grows with its text (min-height = the fixed height below). Items are classed: paragraph before the heading = `hero-article-banner-eyebrow`, first heading = `hero-article-banner-title`, link-only paragraph = `hero-article-banner-cta` (links get `button primary` when not already buttonized), others = `hero-article-banner-description`. The Universal Editor rich-text wrapper is handled.
- Heights (structural): small 200 / 260 / 310px, large 360 / 520 / 750px at mobile / 600px / 900px; image `object-fit: cover`.

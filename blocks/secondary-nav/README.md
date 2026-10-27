# secondary-nav

Custom **secondary-nav** block. Purpose: the in-section sub-navigation bar of mini-sites
(Greenpoint, System updates hub, Global Outlook, Investing in people, Advancing climate
solutions, Worldwide giving report). Source: `nav.secondaryNav > ul.secondaryNav--list > li > a.secondaryNav--link`.

Placed directly below `hero-article-banner` and above `columns-article-header`.

Rendered as:

```html
<nav aria-label="Section navigation">
  <button class="secondary-nav-arrow secondary-nav-arrow-prev" aria-label="Scroll section navigation left" hidden></button>
  <ul class="secondary-nav-list">
    <li class="secondary-nav-item"><a class="secondary-nav-link" href="/greenpoint">ExxonMobil and Greenpoint</a></li>
    <li class="secondary-nav-item"><a class="secondary-nav-link" href="/greenpoint/stay-informed" aria-current="page">Stay informed</a></li>
  </ul>
  <button class="secondary-nav-arrow secondary-nav-arrow-next" aria-label="Scroll section navigation right" hidden></button>
</nav>
```

- The link whose path equals `window.location.pathname` (trailing slash and `.html` ignored,
  same origin only) gets `aria-current="page"`; it is set in semibold and scrolled into view.
  Links are 14px charcoal; on hover they turn dark red (`--brand-red-dark`) and are underlined.
- The list scrolls horizontally (`overflow-x: auto`, scrollbar hidden). The arrow buttons are real
  `<button>`s with aria-labels, overlaid on the list edges with a white fade and a red chevron.
  They are shown only when the list overflows, and each is hidden (disabled) once its edge is reached.
  Keyboard users can also simply Tab through the links (the list scrolls to the focused link).

## Authoring

Model: `secondary-nav`. One row, one cell:

1. **Links** (richtext, required): a bulleted list of links, the section home first.
   Link text is the label shown in the bar. Paragraph-per-link is tolerated, but a list is preferred.

No other fields and no style options.

## Universal Editor fields

| Field | Component | Cell |
| --- | --- | --- |
| `links` | richtext | row 1 |

## Expected block HTML (importer parser contract)

```html
<table>
  <tr><th>Secondary Nav</th></tr>
  <tr><td><!-- field:links --><ul>
    <li><a href="/greenpoint">ExxonMobil and Greenpoint</a></li>
    <li><a href="/greenpoint/our-commitment">Our commitment</a></li>
    <li><a href="/greenpoint/community-programs">Community programs</a></li>
    <li><a href="/greenpoint/newsletters">Newsletters</a></li>
    <li><a href="/greenpoint/remediation">Remediation progress</a></li>
    <li><a href="/greenpoint/stay-informed">Stay informed</a></li>
  </ul></td></tr>
</table>
```

- Header cell: `Secondary Nav` (no variants).
- One `<li><a>` per `li.secondaryNav--item`, in source order; link text is
  `span.secondaryNav--link-text` (trimmed), href is the source `href` (site-relative paths kept
  relative, apply the same locale/path rewriting as other internal links).
- Drop the arrow buttons, `secondaryNav--link-active`, `aria-current` and empty `target` attributes:
  the current item is computed at runtime.

Delivered markup (what `decorate` receives):

```html
<div class="secondary-nav">
  <div><div><ul>
    <li><a href="/greenpoint">ExxonMobil and Greenpoint</a></li>
    …
  </ul></div></div>
</div>
```

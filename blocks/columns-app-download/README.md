# columns-app-download

**columns-app-download** block (variant of library Columns). Purpose: app promotion band (source `div.sp07-app-promotion` on /en/rewards/frequent-filler): heading and App Store / Google Play badge image links on the left, QR code on the right. The QR code is hidden below 900px. The light-grey background is the section style (`light-grey`), not the block.

## Content structure (contract for authors and the import parser)

One row, two cells. Cell order is free: the QR cell is found by content (a picture with no heading and no links).

```html
<div class="columns-app-download">
  <div>
    <div>
      <h2>Earn automatically with the Exxon Mobil Rewards+™ app</h2>
      <p>
        <a href="https://exxon-us.app.link/GCUrL2PE1Yb" title="Download on the Apple App Store">
          <picture><img src="app-store.png" alt="Download on the Apple App Store"></picture>
        </a>
        <a href="https://exxon-us.app.link/7IBZdaSE1Yb" title="Exxon and Mobil Fuel Finder app on Google Play">
          <picture><img src="google-play.png" alt="Exxon and Mobil Fuel Finder app on Google Play"></picture>
        </a>
      </p>
    </div>
    <div>
      <picture><img src="qr.png" alt="QR Code redirecting to app store"></picture>
    </div>
  </div>
</div>
```

Parser notes:

- Cell 1: `.app-content h2`, then the `.app-content-links` image links (`<a>` wrapping the badge `<img>`, keep the `alt`). Badges may share one `<p>` or have one `<p>` each.
- Cell 2: `.app-img img` (QR code). Leave the cell out if the source has no QR code.
- Universal Editor alternative for a badge: an image paragraph immediately followed by a paragraph holding only a link (`<p><picture/></p><p><a href>App Store</a></p>`). The block joins them into one image link (the link text becomes the `title`, and the `alt` if the image has none).

## Supported variations

No variations.

## Universal Editor

- **Columns App Download** (`columns-app-download`): columns block (`core/franklin/components/columns/v1/columns`, template 2 columns x 1 row), fields `columns` / `rows`. Each column accepts the default `column` content (text, image, button, title).
- md2jcr: block name `columns-app-download` → definition title `Columns App Download`.

## Rendering (classes for the design pass)

- Row: `.columns-app-download-row` (column on mobile, row with space-between from 900px).
- Text cell: `.columns-app-download-body`; badge links are collected into `ul.columns-app-download-badges > li > a.columns-app-download-badge` (40px high badges) at the position of the first badge.
- QR cell: `.columns-app-download-qr` (hidden on mobile, max 160px wide).
- Same-origin, non-SVG images are optimized (`createOptimizedPicture`); others are lazy-loaded as-is.

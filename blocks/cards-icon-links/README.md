# cards-icon-links

Custom **cards** block. Purpose: social-follow-links.

## Authoring (Document Authoring)

Model: `cards`

Single block table. Content: one row, one cell of content.

## Supported variations

No variations.

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- Item `cards-icon-links-item`: `image` (reference, the icon) and `text` (richtext: title, optional description, link). No style options.

## Expected block HTML (importer parser contract)

Block name `cards-icon-links`. Source: `section.iconGrid` items (`.iconGrid--item`) on `/community`, `/community/stem`, `/community/royalty-owners`, teacher STEM training. One row per tile, two cells:

| Cell | Content | Field hint (xwalk) | Required |
| --- | --- | --- | --- |
| 1 | icon `<picture><img src="..." alt="LinkedIn"></picture>` from `.iconGrid--item-title img` | `<!-- field:image -->` | no |
| 2 | title `<p>` (text of `.iconGrid--item-title h3`, `<br>` removed), optional description `<p>` (`.item--description`, only when non-empty), link `<p><a href="https://...">Learn more</a></p>` (`.iconGrid--item-content a.cta`, drop the `<i class="icon">` arrow) | `<!-- field:text -->` | yes |

```html
<div class="cards-icon-links">
  <div>
    <div>
      <!-- field:image -->
      <picture><img src="./images/fef62e03129e8cbc79d8fa03d423eff6.png" alt="LinkedIn"></picture>
    </div>
    <div>
      <!-- field:text -->
      <p>LinkedIn</p>
      <p><a href="https://www.linkedin.com/showcase/exxonmobilgiving/">Learn more</a></p>
    </div>
  </div>
  <div>
    <div>
      <!-- field:image -->
      <picture><img src="./images/4a812951e5aa1d71f1a65217ef9aab96.png" alt="Instagram"></picture>
    </div>
    <div>
      <!-- field:text -->
      <p>Instagram</p>
      <p><a href="https://www.instagram.com/teenengineering/">Learn more</a></p>
    </div>
  </div>
</div>
```

The iconGrid heading (`.iconGrid--title h3`, e.g. "Follow us for more about ...") and its description are default content before the block, not part of it. The section background (`orange.png`) maps to the section style `orange-gradient`.

## Behavior

- The first text item is the label (`.cards-icon-links-title`); link-only paragraphs become the CTA (`.cards-icon-links-cta`, "Learn more" with a trailing arrow, `aria-describedby` the label); other paragraphs are descriptions. A label that already contains a link keeps it.
- As on the source iconGrid, a tile is collapsed to its label row (80px mobile, 100px from 768px). Hover, keyboard focus on the CTA (`:focus-within`) or a tap (`.is-open`) opens it to show the description and CTA; the other tiles' red border turns grey (#939598) while one is open.
- External links open in a new tab (`target="_blank" rel="noopener noreferrer"`).
- The icon is moved after the text (label left, 24px icon right, centred on the label row); its alt is cleared when it repeats the label.
- Layout: one column (10px gap); two columns from 768px (30px row gap, 20px column gap, 44px from 1024px); white tiles with a 4px red left border.

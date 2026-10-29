# accordion-legal

**accordion-legal** block (accordion). Purpose: legal disclaimer panels (source `div.c01-accordion` with `accordion-item active` / `.show` panels under "Legal disclaimers" on /en/rewards/frequent-filler). All items are **open on load** and can be collapsed. Built on native `<details open>`/`<summary>`, so it works with the keyboard (Tab, Enter/Space) and screen readers.

## Content structure (contract for authors and the import parser)

One row per item, two cells: title, legal text.

```html
<div class="accordion-legal">
  <div>
    <div><p>The Exxon Mobil Rewards+ program</p></div>                     <!-- title (plain text) -->
    <div>                                                                 <!-- legal text (rich text) -->
      <p>Exxon Mobil Rewards+™ is a rewards program … Go to
        <a href="https://rewards.exxonmobilfuels.com/en/welcome/enrollment">Exxon Mobil Rewards+ website</a> …</p>
      <p>We reserve the right … View full
        <a href="https://www.exxonmobilfuels.com/en/rewards/faqs/terms-conditions">Exxon Mobil Rewards+ program terms and conditions</a>.</p>
    </div>
  </div>
  <div>
    <div><p>Exxon Mobil Rewards+ Frequent Filler program</p></div>
    <div><p>…</p></div>
  </div>
</div>
```

Parser notes:

- Title: text of `.accordion-header > a` (drop the two icon `<img>`s). Legal text: content of `.accordion-body .paragraph`; keep paragraphs and inline links.
- Strip Google Analytics `_gl` query parameters from links (e.g. the enrollment link).
- The H2 "Legal disclaimers" before the block is default content.

## Supported variations

No variations. (FAQs that start closed use `accordion-faq`.)

## Universal Editor

- **Accordion Legal** (`accordion-legal`): container block, accepts **Accordion Legal Item** children only.
- **Accordion Legal Item** (`accordion-legal-item`): `summary` (text, "Title") → cell 1, `text` (rich text, "Legal text") → cell 2.
- md2jcr: block name `accordion-legal` → definition title `Accordion Legal`; each row `div` → an `accordion-legal-item`.

## Rendering (classes for the design pass)

- Each row becomes `details.accordion-legal-item[open]` > `summary.accordion-legal-item-label` + `div.accordion-legal-item-body`.
- Structural 2px left rule on each item (`currentcolor`; the design pass sets the brand blue). The summary marker is hidden; a `+` / `−` indicator is drawn with `summary::after`.
- Links in the legal text are never styled as buttons. Fully empty rows are dropped on the published page.

# accordion-faq

**accordion-faq** block (accordion). Purpose: FAQ question / answer list (source `div.c01-accordion` with collapsed items on /en/rewards/frequent-filler). All items are **closed on load**. Built on native `<details>`/`<summary>`, so it works with the keyboard (Tab, Enter/Space) and screen readers with no script state.

## Content structure (contract for authors and the import parser)

One row per item, two cells: question, answer.

```html
<div class="accordion-faq">
  <div>
    <div><p>How do I earn points with the Exxon Mobil Rewards+ program?</p></div>   <!-- question (plain text) -->
    <div>                                                                          <!-- answer (rich text) -->
      <p>With the Exxon Mobil Rewards+ program, you can earn points on items …</p>
    </div>
  </div>
  <div>
    <div><p>What is the Exxon Mobil Rewards+ Frequent Filler program?</p></div>
    <div>
      <p>Frequent Filler is a bonus program …</p>
      <p>Once you qualify as a Frequent Filler, …</p>
    </div>
  </div>
</div>
```

Parser notes:

- Question: text of `.accordion-header > a` (drop the two icon `<img>`s). Answer: content of `.accordion-body .paragraph`; wrap loose text in `<p>`.
- The H2 "Frequently asked questions" and the intro paragraph before the block are default content.

## Supported variations

No variations. (Legal disclaimers that start open use `accordion-legal`.)

## Universal Editor

- **Accordion Faq** (`accordion-faq`): container block, accepts **Accordion Faq Item** children only.
- **Accordion Faq Item** (`accordion-faq-item`): `summary` (text, "Question") → cell 1, `text` (rich text, "Answer") → cell 2.
- md2jcr: block name `accordion-faq` → definition title `Accordion Faq`; each row `div` → an `accordion-faq-item`.

## Rendering (classes for the design pass)

- Each row becomes `details.accordion-faq-item` > `summary.accordion-faq-item-label` + `div.accordion-faq-item-body`.
- The summary marker is hidden; a `+` / `−` indicator is drawn with `summary::after` (switches on `[open]`). Replace with the blue circled icon in the design pass.
- Fully empty rows are dropped on the published page.

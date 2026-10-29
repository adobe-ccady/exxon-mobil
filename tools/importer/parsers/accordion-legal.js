/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-legal (Accordion; all items open on load).
 * xwalk model accordion-legal-item: summary (text) | text (richtext).
 * Source: https://www.exxonmobilfuels.com/en/rewards/frequent-filler
 *   div.c01-accordion (open .show items, #accordion-28) > div.accordion-item
 *   > .accordion-header > a (title + 2 icon imgs) + .accordion-body .paragraph (legal text).
 * Only the matched element's own items are read (the collapsed FAQ accordion is accordion-faq).
 * Row per item: [title <p>] | [legal text paragraphs / lists; loose text wrapped in <p>].
 * Links are made absolute to www.exxonmobilfuels.com and stripped of _gl tracking params.
 */
const ORIGIN = 'https://www.exxonmobilfuels.com';
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'TABLE', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function absUrl(href) {
  const raw = (href || '').trim();
  if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
  try {
    const url = new URL(raw, `${ORIGIN}/`);
    url.searchParams.delete('_gl');
    return url.href;
  } catch (e) {
    return raw;
  }
}

/** Rich-text content of the legal text: block children kept, loose inline runs wrapped in <p>. */
function richContent(container, document) {
  const out = [];
  let run = null;
  const flush = () => {
    if (run && clean(run.textContent)) out.push(run);
    run = null;
  };
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 8) return; // comments
    if (node.nodeType === 1 && /^(LINK|STYLE|SCRIPT)$/.test(node.tagName)) return;
    if (node.nodeType === 1 && BLOCK_TAGS.has(node.tagName)) {
      flush();
      if (clean(node.textContent) || node.querySelector('img')) out.push(node);
      return;
    }
    if (node.nodeType === 1 && node.tagName === 'DIV') {
      flush();
      out.push(...richContent(node, document));
      return;
    }
    if (node.nodeType === 1 && node.tagName === 'BR' && (!run || !clean(run.textContent))) return;
    if (!run) run = document.createElement('p');
    run.append(node);
  });
  flush();
  out.forEach((el) => {
    if (el.nodeType !== 1) return;
    const links = el.matches('a[href]') ? [el] : [...el.querySelectorAll('a[href]')];
    links.forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
  });
  return out;
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.accordion-item')]
    .filter((item) => item.closest('.c01-accordion') === element || !element.matches('.c01-accordion'));
  const cells = [];

  items.forEach((item) => {
    const toggle = item.querySelector('.accordion-header a, .accordion-header button, .accordion-header');
    const title = toggle ? clean(toggle.textContent) : '';
    const body = item.querySelector('.accordion-body .paragraph') || item.querySelector('.accordion-body');
    const text = body ? richContent(body, document) : [];
    if (!title && !text.length) return;

    const summaryCell = [];
    if (title) {
      const p = document.createElement('p');
      p.textContent = title;
      summaryCell.push(document.createComment(' field:summary '), p);
    }
    cells.push([
      summaryCell.length ? summaryCell : '',
      text.length ? [document.createComment(' field:text '), ...text] : '',
    ]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-legal', cells });
  element.replaceWith(block);
}

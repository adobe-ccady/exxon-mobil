/* eslint-disable */
/* global WebImporter */
/**
 * Parser for secondary-nav (custom Secondary Nav block). xwalk model `secondary-nav`:
 * links (richtext) - one row, one cell holding a bulleted list of links.
 * Source: nav.secondaryNav > div.secondaryNav--container > div.secondaryNav--content
 *   > ul.secondaryNav--list > li.secondaryNav--item > a.secondaryNav--link
 *   > span.secondaryNav--link-text (+ arrow <button>s, dropped).
 * Works wherever the nav sits (inside div.stickyNav-wrapper, or moved by the cleanup
 * transformer to just before section.articleHeader > div.container).
 * Output: <!-- field:links --><ul><li><a href>text</a></li>...</ul>; hrefs are kept as-is
 * (the cleanup transformer's link normaliser rewrites internal hrefs afterwards).
 * Classes, target, aria-current and the active-state class are dropped (computed at runtime).
 * A nav without any usable link is removed.
 */
function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let anchors = [...element.querySelectorAll('li.secondaryNav--item a[href]')];
  if (!anchors.length) anchors = [...element.querySelectorAll('a.secondaryNav--link[href], li a[href]')];
  // de-duplicate (overlapping fallback selectors) while keeping document order
  anchors = anchors.filter((a, i) => anchors.indexOf(a) === i);

  const ul = document.createElement('ul');
  anchors.forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    const span = a.querySelector('.secondaryNav--link-text');
    const text = clean(span ? span.textContent : a.textContent);
    if (!href || !text || /^javascript:/i.test(href)) return;
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = text;
    li.append(link);
    ul.append(li);
  });

  if (!ul.children.length) {
    element.remove();
    return;
  }

  const cells = [
    [[document.createComment(' field:links '), ul]],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'secondary-nav', cells });
  element.replaceWith(block);
}

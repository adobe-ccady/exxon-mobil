/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://corporate.exxonmobil.com/ (section.keytopicstrending .trending--content)
 * Model (cards-news-item): image, text (richtext).
 * Row per news item: [image (empty – items have no image)] | [title link, tag, read time].
 * Iterates the block-level .trending--item wrappers (never the inline title anchors).
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.trending--item')];
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const titleLink = item.querySelector(':scope > a, a.link-black')
      || [...item.querySelectorAll('a')].find((a) => !a.closest('.tag'));
    const tag = item.querySelector('.article--info .tag, .tag');
    const readTime = item.querySelector('.read-time');

    const textContent = [];
    if (titleLink && titleLink.textContent.trim()) {
      const p = document.createElement('p');
      p.append(titleLink);
      textContent.push(p);
    }
    if (tag && tag.textContent.trim()) {
      const p = document.createElement('p');
      const tagLink = tag.querySelector('a');
      if (tagLink) p.append(tagLink);
      else p.textContent = tag.textContent.trim();
      textContent.push(p);
    }
    if (readTime && readTime.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = readTime.textContent.trim();
      textContent.push(p);
    }

    if (!textContent.length && !img) return;
    cells.push([
      img ? [document.createComment(' field:image '), img] : '',
      textContent.length ? [document.createComment(' field:text '), ...textContent] : '',
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * News list: row per item, [optional thumbnail] | [text].
 * The text cell holds, in any order, items recognised by shape:
 *  - title: the first paragraph/heading consisting only of a link
 *  - description (optional): a list, or a paragraph of prose
 *  - tag (optional): a link-only paragraph (topic/section page) or a short label paragraph
 *  - meta (optional): "N min read" or "type • read time • date"
 * Tag and meta are grouped into one meta line under the title/description.
 * @param {Element} block The block element
 */

const META_RE = /\bmin(ute)?s?\s+read\b|•|\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}\b/i;

const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();

/** paragraph/heading whose whole text is a single link */
function isLinkOnly(el) {
  if (!/^(P|H[1-6])$/.test(el.tagName)) return false;
  const links = el.querySelectorAll('a');
  return links.length === 1 && text(links[0]) && text(links[0]) === text(el);
}

function isMeta(el) {
  return el.tagName === 'P' && !el.querySelector('a, picture') && META_RE.test(text(el));
}

/** short plain label such as "Investors": no sentence punctuation, a few words */
function isLabel(el) {
  if (el.tagName !== 'P' || el.querySelector('a, picture')) return false;
  const t = text(el);
  return t.length > 0 && t.length <= 40 && t.split(' ').length <= 5 && !/[.!?:;]$/.test(t);
}

function classifyBody(content) {
  const items = [...content.children].filter((el) => text(el) || el.querySelector('picture'));
  const roles = new Map();

  const title = items.find(isLinkOnly) || items[0];
  if (title) roles.set(title, 'title');

  items.filter((el) => !roles.has(el) && isMeta(el)).forEach((el) => roles.set(el, 'meta'));

  // tag: a link-only paragraph after the title, else a trailing short label (e.g. "Investors")
  const rest = items.filter((el) => !roles.has(el));
  const last = rest[rest.length - 1];
  const tag = rest.find(isLinkOnly) || (last && isLabel(last) ? last : null);
  if (tag) roles.set(tag, 'tag');

  items.filter((el) => !roles.has(el)).forEach((el) => roles.set(el, 'description'));
  return { items, roles };
}

function decorateBody(body) {
  // Universal Editor groups rich text into one editable wrapper; read the items inside it
  const content = body.querySelector(':scope > [data-aue-type="richtext"]') || body;
  const { items, roles } = classifyBody(content);
  const metaItems = [];
  items.forEach((el) => {
    const role = roles.get(el);
    if (role === 'title') el.classList.add('cards-news-title');
    else if (role === 'description') el.classList.add('cards-news-description');
    else if (role === 'tag') {
      el.classList.add('cards-news-tag');
      metaItems.unshift(el);
    } else if (role === 'meta') {
      el.classList.add('cards-news-readtime');
      metaItems.push(el);
    }
  });
  if (metaItems.length) {
    const meta = document.createElement('div');
    meta.className = 'cards-news-meta';
    meta.append(...metaItems);
    content.append(meta);
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !text(div)) {
        div.className = 'cards-news-card-image';
      } else if (!text(div)) {
        // empty image cell (most news items are authored without images)
        div.remove();
      } else {
        div.className = 'cards-news-card-body';
      }
    });

    const body = li.querySelector('.cards-news-card-body');
    if (body) decorateBody(body);
    if (li.querySelector('.cards-news-card-image')) li.classList.add('cards-news-has-image');

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}

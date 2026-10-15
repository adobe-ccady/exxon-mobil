/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://corporate.exxonmobil.com/ (section.singleFeature.singleFeature-variable)
 * Model (hero-banner): image (+ imageAlt collapsed), text (richtext).
 * Rows: [image], [text: heading, description, CTA(s)].
 * Background image: .lazy-bg[data-desktop] on the live page; an <img> (non-placeholder) in cleaned HTML.
 */
function getBackgroundImage(element, document) {
  const bg = element.querySelector('.lazy-bg, .reponsive-background > div:first-child');
  const imgs = bg ? [...bg.querySelectorAll('img')] : [];
  const altImg = imgs.find((i) => i.getAttribute('alt'));
  const alt = altImg ? altImg.getAttribute('alt') : '';
  let src = bg ? (bg.getAttribute('data-desktop') || bg.getAttribute('data-tablet') || bg.getAttribute('data-mobile')) : null;
  if (!src) {
    // Prefer the full-size image over the w=40 blur placeholder
    const full = imgs.find((i) => !/[?&]w=40\b/.test(i.getAttribute('src') || '')) || imgs[0];
    if (full) src = full.getAttribute('src');
  }
  if (!src && bg) {
    const m = (bg.getAttribute('style') || '').match(/url\(["']?([^"')]+)["']?\)/);
    if (m) [, src] = m;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  return img;
}

export default function parse(element, { document }) {
  const img = getBackgroundImage(element, document);

  const content = element.querySelector('.content') || element;
  const titleWrap = content.querySelector('.singleFeature--textField--title');
  const heading = (titleWrap || content).querySelector('h1, h2, h3, h4');
  if (heading) {
    // Unwrap presentational <sub>/<sup> used to size the heading text
    heading.querySelectorAll('sub, sup').forEach((s) => s.replaceWith(...s.childNodes));
  }
  const eyebrow = content.querySelector('.singleFeature--textField--eyebrow');
  const description = content.querySelector('.singleFeature--textField--description');
  const ctas = [...content.querySelectorAll('.singleFeature--buttons a, a.button')]
    .filter((a, i, arr) => arr.indexOf(a) === i);

  const textContent = [];
  if (eyebrow && eyebrow.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    textContent.push(p);
  }
  if (heading) textContent.push(heading);
  if (description) {
    const paras = [...description.querySelectorAll('p')];
    if (paras.length) textContent.push(...paras);
    else if (description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textContent.push(p);
    }
  }
  ctas.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    textContent.push(p);
  });

  if (!img && !textContent.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([img ? [document.createComment(' field:image '), img] : '']);
  cells.push([textContent.length ? [document.createComment(' field:text '), ...textContent] : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}

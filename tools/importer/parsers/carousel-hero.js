/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://corporate.exxonmobil.com/ (header.homeHero .homeHero--content)
 * Model (carousel-hero-item): media_image (+ media_imageAlt collapsed), content_text.
 * Each slide row: [image cell, text cell (eyebrow p, heading, optional text, CTA)].
 * Iteration keyed on the inner .homeHero--itemWrapper (stable block wrapper),
 * with the slide image read from the enclosing .homeHero--item.
 */
export default function parse(element, { document }) {
  let wrappers = [...element.querySelectorAll('.homeHero--itemWrapper')];
  let slides = wrappers.map((wrapper) => ({
    wrapper,
    item: wrapper.closest('.homeHero--item') || wrapper.parentElement,
  }));
  if (!slides.length) {
    slides = [...element.querySelectorAll('.homeHero--item')].map((item) => ({ wrapper: item, item }));
  }

  const cells = [];
  const seenImages = new Set();

  slides.forEach(({ wrapper, item }) => {
    // Image: first slide uses <picture><img class="homeHero--image">, others a direct <img>
    let img = null;
    if (item && item !== wrapper) {
      img = item.querySelector(':scope > picture img, :scope > img')
        || [...item.querySelectorAll('img')].find((i) => !wrapper.contains(i));
    }
    if (!img) img = item ? item.querySelector('img.homeHero--image') : null;
    if (img && seenImages.has(img)) img = null;
    if (img) seenImages.add(img);

    // Live DOM: lazy-loaded slides (data-script="imageLazyLoading") carry the image as data-desktop / background-image
    if (!img && item) {
      let src = item.getAttribute('data-desktop') || item.getAttribute('data-tablet') || item.getAttribute('data-mobile');
      if (!src) {
        const bgEl = [item, ...item.querySelectorAll('canvas')].find((el) => /url\(/.test(el.getAttribute('style') || ''));
        const m = bgEl ? (bgEl.getAttribute('style') || '').match(/url\(["']?([^"')]+)["']?\)/) : null;
        if (m) [, src] = m;
      }
      if (src) {
        img = document.createElement('img');
        img.src = src;
        const title = wrapper.querySelector('.homeHero--title, h1, h2, h3');
        img.alt = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
      }
    }

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:media_image '));
      imageCell.push(img);
    }

    // Text content: eyebrow, heading, optional description, CTA
    const textCell = [];
    const eyebrow = wrapper.querySelector('.eyebrow p, .eyebrow');
    const heading = wrapper.querySelector('.homeHero--title, h1, h2, h3');
    const text = wrapper.querySelector('.homeHero--text, p.h6');
    const ctas = [...wrapper.querySelectorAll('.homeHero--ctaContainer a, a.button')];
    const uniqueCtas = ctas.filter((a, i) => ctas.indexOf(a) === i);

    const content = [];
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow.textContent.trim();
      content.push(p);
    }
    if (heading) content.push(heading);
    if (text && text !== eyebrow) content.push(text);
    uniqueCtas.forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    });

    if (!img && !content.length) return;
    if (content.length) {
      textCell.push(document.createComment(' field:content_text '));
      textCell.push(...content);
    }
    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}

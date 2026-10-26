/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ExxonMobil section breaks + Section Metadata.
 * Uses payload.template.sections (selectors verified in migration-work/cleaned.html):
 * header.homeHero, section.stockTicker, section.singleFeature.singleFeature-variable,
 * section.keytopicstrending, section.highlight:has(.highlight-gray),
 * section.singleFeature.singleFeature-centerContent, section.highlight:has(.highlight-white).
 * article / banner-content-page templates: section.articleHeader (rc2),
 * div.article--wrapper (rc3), div.article--wrapper > section.singleFeature (rc3b,
 * CTA bands - handled generically, see below), section.featureGrid--wrapper (rc3c).
 * topic-page template: section.topicHeader (t1), div.topic--wrapper >
 * section.topicContainer (t2 - every container is its own section, handled
 * generically like the rc3b bands; style derived from the container's
 * component colour classes, see topicStyle()).
 *
 * Breaks are inserted in beforeTransform (before parsers can replace section
 * elements); metadata is inserted in afterTransform anchored to marker <hr>s.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';
const BAND_STYLE_ATTR = 'data-excat-band-style';

// Section id whose presence switches on the generic CTA band handling.
const BAND_SECTION_ID = 'rc3b';
const BAND_SELECTOR = 'div.article--wrapper > section.singleFeature';
// singleFeature-* modifier classes that are not colours.
const BAND_NON_COLOUR = new Set(['variable', 'noGradient', 'noBackground', 'centerContent']);

// Section id whose presence switches on the generic topic-container handling.
const TOPIC_SECTION_ID = 't2';
const TOPIC_SELECTOR = 'div.topic--wrapper > section.topicContainer';

// Section styles available in models/_section.json (style options). A derived
// style outside this list is dropped (no Section Metadata).
const KNOWN_STYLES = new Set([
  'highlight', 'grey', 'trending-split', 'blue-gradient', 'blue', 'indigo-gradient', 'indigo',
  'image-band', 'plain', 'black-gradient', 'black', 'burgundy-gradient', 'gray-3',
  'gray-4-gradient', 'gray-7', 'sea-blue-gradient', 'sea-blue', 'blue-3', 'light-grey', 'split',
  'dark', 'dark-grey', 'orange-gradient',
]);

// section.selector is an array of candidate selectors - first match wins.
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    let el = null;
    try {
      el = root.querySelector(sel);
    } catch (e) {
      el = null; // unsupported selector in this environment - try next candidate
    }
    if (el) return el;
  }
  return null;
}

// --- CTA bands (div.article--wrapper > section.singleFeature) ----------------

// Background image of an image band: div.lazy-bg[data-desktop|data-tablet|data-mobile]
// (lazy-loaded; style="background-image:url(...)" only once loaded).
function bandImageUrl(band) {
  const bg = band.querySelector(':scope > .lazy-bg, .lazy-bg');
  if (!bg) return null;
  const fromData = bg.getAttribute('data-desktop') || bg.getAttribute('data-tablet') || bg.getAttribute('data-mobile');
  if (fromData && fromData.trim()) return fromData.trim();
  const m = (bg.getAttribute('style') || '').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  return m ? m[1] : null;
}

/**
 * Section style from the band classes:
 * blue / indigo / any other colour -> "<colour>" (noGradient) or "<colour>-gradient";
 * background image and no colour -> "image-band"; no colour, no image -> "plain"
 * (transparent background, dark text on the source).
 */
function bandStyle(band, hasImage) {
  const mods = [...band.classList]
    .filter((c) => c.startsWith('singleFeature-'))
    .map((c) => c.slice('singleFeature-'.length));
  const colour = mods.find((m) => m && !BAND_NON_COLOUR.has(m));
  const gradient = !mods.includes('noGradient');
  if (colour) return gradient ? `${colour}-gradient` : colour;
  if (hasImage) return 'image-band';
  return 'plain';
}

// Normalise band content to default content: eyebrow <span> -> <p>, each
// button link in its own <p>, background image kept as an <img>.
function normalizeBand(doc, band, imageUrl) {
  band.querySelectorAll('span.eyebrow, .singleFeature--textField--eyebrow').forEach((span) => {
    if (span.nodeName === 'P') return;
    const p = doc.createElement('p');
    p.append(...span.childNodes);
    span.replaceWith(p);
  });
  band.querySelectorAll('.singleFeature--buttons a').forEach((a) => {
    if (a.parentElement && a.parentElement.nodeName === 'P') return;
    const p = doc.createElement('p');
    a.before(p);
    p.append(a);
  });
  band.querySelectorAll('.lazy-bg').forEach((bg) => bg.remove());
  if (imageUrl) {
    const p = doc.createElement('p');
    const img = doc.createElement('img');
    img.setAttribute('src', imageUrl);
    img.setAttribute('alt', '');
    p.append(img);
    band.prepend(p);
  }
}

// --- Topic containers (div.topic--wrapper > section.topicContainer) -----------

// Component colour modifier (`<prefix>-<colour>`) -> section style. Measured
// on the live /news and /community pages (getComputedStyle):
// gray #f1f2f2 -> light-grey, gray-2 #5a5a5a -> dark-grey, black #333 -> dark,
// white -> no style.
const COMPONENT_COLOUR_STYLE = {
  white: null,
  gray: 'light-grey',
  grey: 'light-grey',
  'gray-1': 'light-grey',
  'gray-2': 'dark-grey',
  black: 'dark',
};

function colourModifier(el, prefix) {
  if (!el) return null;
  // `<prefix>--element` (BEM element classes, e.g. highlight--wrapper) are not colours.
  const cls = [...el.classList].find((c) => c.startsWith(`${prefix}-`) && !c.startsWith(`${prefix}--`));
  return cls ? cls.slice(prefix.length + 1) : null;
}

function knownStyle(style) {
  return style && KNOWN_STYLES.has(style) ? style : null;
}

/**
 * Section style for one topicContainer, from its component classes:
 * - photo bands (section.variableFeature, section.singleFeature with a
 *   div.lazy-bg) -> none (the photo belongs to the hero-feature block);
 * - colour singleFeature -> same rule as the CTA bands (singleFeature-blue -> blue-gradient);
 * - two-column layout (div.topicContainer--twoColumn) -> split;
 * - pullquote-* / shortVideoHeadline-* / highlight-* -> COMPONENT_COLOUR_STYLE;
 * - iconGrid with a background (div.iconGrid--bg, /-/media/.../backgrounds/<colour>.png)
 *   -> <colour>-gradient (orange when the lazy-bg URL is not available);
 * - anything else (plain white) -> none.
 */
function topicStyle(container) {
  if (container.querySelector('section.variableFeature')) return null;
  const feature = container.querySelector('section.singleFeature');
  if (feature) {
    if (feature.querySelector('.lazy-bg')) return null;
    const style = bandStyle(feature, false);
    return style === 'plain' ? null : knownStyle(style);
  }
  if (container.querySelector('.topicContainer--twoColumn')) return 'split';

  const pullquote = container.querySelector('.pullquote');
  if (pullquote) return knownStyle(COMPONENT_COLOUR_STYLE[colourModifier(pullquote, 'pullquote')]);
  const shortVideo = container.querySelector('section.shortVideoHeadline');
  if (shortVideo) {
    return knownStyle(COMPONENT_COLOUR_STYLE[colourModifier(shortVideo, 'shortVideoHeadline')]);
  }
  const highlight = container.querySelector('.highlight--wrapper');
  if (highlight) return knownStyle(COMPONENT_COLOUR_STYLE[colourModifier(highlight, 'highlight')]);

  const iconGrid = container.querySelector('section.iconGrid');
  if (iconGrid) {
    const bg = iconGrid.querySelector('.iconGrid--bg, .lazy-bg');
    if (!bg && !iconGrid.classList.contains('bgImg')) return null;
    const url = bg ? (bg.getAttribute('data-desktop') || bg.getAttribute('data-tablet')
      || bg.getAttribute('data-mobile') || bg.getAttribute('style') || '') : '';
    const m = url.match(/\/backgrounds\/([a-z0-9-]+)\.[a-z]+/i);
    if (m) return knownStyle(`${m[1].toLowerCase()}-gradient`);
    return url.trim() ? null : 'orange-gradient';
  }
  return null;
}

function insertTopicBreaks(doc, element) {
  const containers = [...element.querySelectorAll(TOPIC_SELECTOR)];
  containers.forEach((container) => {
    const style = topicStyle(container);
    const hr = doc.createElement('hr');
    if (style) hr.setAttribute(BAND_STYLE_ATTR, style);
    container.before(hr);
  });
  return containers.length;
}

const MEDIA = 'img, picture, video, iframe, svg, table';

function isMeaningfulNode(node) {
  if (node.nodeType === 3) return node.textContent.trim() !== '';
  if (node.nodeType !== 1) return false;
  if (node.nodeName === 'HR') return false;
  if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(node.nodeName)) return false;
  return node.textContent.trim() !== '' || node.matches(MEDIA) || !!node.querySelector(MEDIA);
}

// Is there authorable content after `el` (document order) inside `root`?
function hasContentAfter(el, root) {
  let node = el;
  while (node && node !== root) {
    for (let sib = node.nextSibling; sib; sib = sib.nextSibling) {
      if (isMeaningfulNode(sib)) return true;
    }
    node = node.parentNode;
  }
  return false;
}

/**
 * Remove <hr>s that would open an empty section: two breaks with no authorable
 * content between them (document order), or a break with nothing after it.
 * Marked breaks (carrying Section Metadata) win over unmarked ones.
 */
function dedupeBreaks(doc, root) {
  const walker = doc.createTreeWalker(root, 1 | 4); // SHOW_ELEMENT | SHOW_TEXT
  const tokens = [];
  let skipUntil = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (skipUntil && skipUntil.contains(n)) continue;
    skipUntil = null;
    if (n.nodeType === 1 && n.nodeName === 'HR') {
      tokens.push({ hr: n });
    } else if (n.nodeType === 3) {
      if (n.textContent.trim() !== '' && !n.parentElement.closest('script, style, noscript, template')) tokens.push({ content: true });
    } else if (n.matches(MEDIA)) {
      tokens.push({ content: true });
      skipUntil = n;
    }
  }
  const isMarked = (hr) => hr.hasAttribute(SECTION_MARKER_ATTR) || hr.hasAttribute(BAND_STYLE_ATTR);
  let prevHr = null;
  let seenContent = false;
  tokens.forEach((t) => {
    if (t.content) {
      seenContent = true;
      return;
    }
    if (prevHr && !seenContent) {
      if (isMarked(t.hr) && !isMarked(prevHr)) {
        prevHr.remove();
        prevHr = t.hr;
      } else if (!isMarked(t.hr)) {
        t.hr.remove();
      } else {
        prevHr = t.hr;
      }
    } else {
      prevHr = t.hr;
    }
    seenContent = false;
  });
  if (prevHr && !seenContent && !isMarked(prevHr)) prevHr.remove();
}

function insertBandBreaks(doc, element) {
  const bands = [...element.querySelectorAll(BAND_SELECTOR)];
  bands.forEach((band) => {
    const imageUrl = bandImageUrl(band);
    const style = bandStyle(band, !!imageUrl);
    normalizeBand(doc, band, imageUrl);

    const scope = band.closest('main') || element;
    if (hasContentAfter(band, scope)) band.after(doc.createElement('hr'));
    const hr = doc.createElement('hr');
    hr.setAttribute(BAND_STYLE_ATTR, style);
    band.before(hr);
  });
  return bands.length;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || document;
  const hasBands = sections.some((s) => s.id === BAND_SECTION_ID);
  const hasTopics = sections.some((s) => s.id === TOPIC_SECTION_ID);

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (hasBands && section.id === BAND_SECTION_ID) {
        // Every band gets its own section (no generic single-match break).
        insertBandBreaks(doc, element);
        continue;
      }
      if (hasTopics && section.id === TOPIC_SECTION_ID) {
        // Every topic container gets its own section.
        insertTopicBreaks(doc, element);
        continue;
      }
      if (i === 0 && !section.style) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
    if (hasBands || hasTopics) dedupeBreaks(doc, element.querySelector('main') || element);
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (hasBands && section.id === BAND_SECTION_ID) continue;
      if (hasTopics && section.id === TOPIC_SECTION_ID) continue;
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }

    if (hasBands || hasTopics) {
      element.querySelectorAll(`hr[${BAND_STYLE_ATTR}]`).forEach((hr) => {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: hr.getAttribute(BAND_STYLE_ATTR) },
        });
        hr.after(metadataBlock);
        hr.removeAttribute(BAND_STYLE_ATTR);
      });
    }
  }
}

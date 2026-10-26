/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media (custom Columns block: one row, two cells, visual order).
 * xwalk: Columns component - cells are not field-modelled, so no field hints.
 * Source: section.shortVideoHeadline > div.container > div.shortVideoHeadline--wrapper
 *  > div.shortVideoHeadline--item > div.shortVideoHeadline--image (.lazy-bg > img ?w=2048 + ?w=40)
 *  + div.shortVideoHeadline--content (--headline h2, --description p, a.cta)
 * Cell 1 (media): <picture><img></picture>; when the item has a video (Brightcove player
 *  data-*, [data-videotype] / [data-video-id], YouTube/Brightcove iframe) a
 *  <p><a href="VIDEO_URL">VIDEO_URL</a></p> follows the picture (video block contract).
 * Cell 2 (body): heading (source level), description paragraph(s), link paragraph(s)
 *  (icon <i> dropped). The empty .modal-video container is never imported.
 * If the source puts the content before the media, the cell order follows the source.
 */
const DEFAULT_ORIGIN = 'https://corporate.exxonmobil.com';
const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function usable(src) {
  const s = (src || '').trim();
  return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : '';
}

function absolute(src) {
  try {
    return new URL(src, `${DEFAULT_ORIGIN}/`).href;
  } catch (e) {
    return src;
  }
}

function youTubeId(src) {
  const s = (src || '').trim();
  if (!s) return '';
  let m = s.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{6,})/i);
  if (m) return m[1];
  m = s.match(/youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/i);
  if (m) return m[1];
  m = s.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
  return m ? m[1] : '';
}

function brightcoveFromIframe(src) {
  try {
    const u = new URL(src, 'https://players.brightcove.net/');
    if (!/players\.brightcove\.net$/i.test(u.hostname)) return '';
    const m = u.pathname.match(/^\/(\d+)\/([^/_]+)_([^/]+)\/index\.html$/);
    const videoId = u.searchParams.get('videoId');
    if (!m || !videoId) return '';
    return `https://players.brightcove.net/${m[1]}/${m[2]}_${m[3]}/index.html?videoId=${videoId}`;
  } catch (e) {
    return '';
  }
}

/** Video URL for the item (Brightcove / YouTube), or ''. */
function findVideoUrl(root) {
  // Brightcove player element with account + video id
  const bc = [...root.querySelectorAll('[data-video-id][data-account]')]
    .find((el) => clean(el.getAttribute('data-video-id')) && clean(el.getAttribute('data-account')));
  if (bc) {
    const account = clean(bc.getAttribute('data-account'));
    const videoId = clean(bc.getAttribute('data-video-id'));
    const player = clean(bc.getAttribute('data-player')) || 'default';
    const embed = clean(bc.getAttribute('data-embed')) || 'default';
    return `https://players.brightcove.net/${account}/${player}_${embed}/index.html?videoId=${videoId}`;
  }
  // iframes
  const iframes = [...root.querySelectorAll('iframe')];
  for (let i = 0; i < iframes.length; i += 1) {
    const src = iframes[i].getAttribute('src') || iframes[i].getAttribute('data-src') || '';
    const yt = youTubeId(src);
    if (yt) return `https://www.youtube.com/watch?v=${yt}`;
    const b = brightcoveFromIframe(src);
    if (b) return b;
  }
  // Sitecore trigger: [data-videotype] with a video id / url
  const typed = [...root.querySelectorAll('[data-videotype], [data-video-type]')];
  for (let i = 0; i < typed.length; i += 1) {
    const el = typed[i];
    const type = clean(el.getAttribute('data-videotype') || el.getAttribute('data-video-type')).toLowerCase();
    const url = clean(el.getAttribute('data-videourl') || el.getAttribute('data-video-url') || el.getAttribute('data-src'));
    const id = clean(el.getAttribute('data-videoid') || el.getAttribute('data-video-id'));
    if (url && (youTubeId(url) || brightcoveFromIframe(url))) {
      return youTubeId(url) ? `https://www.youtube.com/watch?v=${youTubeId(url)}` : brightcoveFromIframe(url);
    }
    if (id && /youtube/.test(type)) return `https://www.youtube.com/watch?v=${id}`;
    const account = clean(el.getAttribute('data-account'));
    if (id && account) {
      const player = clean(el.getAttribute('data-player')) || 'default';
      return `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${id}`;
    }
  }
  return '';
}

function getPicture(mediaEl, document) {
  if (!mediaEl) return null;
  const bg = mediaEl.querySelector('.lazy-bg') || mediaEl;
  const imgs = [...mediaEl.querySelectorAll('img')];
  let src = usable(bg.getAttribute('data-desktop'))
    || usable(bg.getAttribute('data-tablet'))
    || usable(bg.getAttribute('data-mobile'));
  if (!src) {
    const full = imgs.find((i) => usable(i.getAttribute('src')) && !/[?&]w=40\b/.test(i.getAttribute('src')))
      || imgs.find((i) => usable(i.getAttribute('src')));
    if (full) src = full.getAttribute('src');
  }
  if (!src) return null;
  const altImg = imgs.find((i) => clean(i.getAttribute('alt')));
  const img = document.createElement('img');
  img.src = absolute(src);
  img.alt = altImg ? clean(altImg.getAttribute('alt')) : '';
  const picture = document.createElement('picture');
  picture.append(img);
  return picture;
}

function getBody(contentEl, document) {
  const out = [];
  if (!contentEl) return out;
  const heading = contentEl.querySelector(HEADINGS);
  if (heading && clean(heading.textContent)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = clean(heading.textContent);
    out.push(h);
  }
  const desc = contentEl.querySelector('.shortVideoHeadline--description');
  if (desc && clean(desc.textContent)) {
    const blocks = [...desc.querySelectorAll(':scope > p, :scope > ul, :scope > ol')]
      .filter((b) => clean(b.textContent));
    if (blocks.length) out.push(...blocks);
    else {
      const p = document.createElement('p');
      p.textContent = clean(desc.textContent);
      out.push(p);
    }
  }
  [...contentEl.querySelectorAll('a')]
    .filter((a) => !(desc && desc.contains(a)) && !(heading && heading.contains(a)) && clean(a.textContent))
    .forEach((src) => {
      const a = document.createElement('a');
      a.href = src.getAttribute('href') || '';
      a.textContent = clean(src.textContent);
      const p = document.createElement('p');
      p.append(a);
      out.push(p);
    });
  return out;
}

export default function parse(element, { document }) {
  const item = element.querySelector('.shortVideoHeadline--item') || element;
  const mediaEl = item.querySelector('.shortVideoHeadline--image');
  const contentEl = item.querySelector('.shortVideoHeadline--content');

  const media = [];
  const picture = getPicture(mediaEl, document);
  if (picture) media.push(picture);
  // video triggers may sit on the media wrapper or the item; never read the empty modal
  const videoUrl = findVideoUrl(item);
  if (videoUrl) {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    const p = document.createElement('p');
    p.append(a);
    media.push(p);
  }
  const body = getBody(contentEl, document);

  if (!media.length && !body.length) {
    element.remove();
    return;
  }

  const mediaFirst = !mediaEl || !contentEl
    || !(mediaEl.compareDocumentPosition(contentEl) & 2 /* PRECEDING */);
  const mediaCell = media.length ? media : '';
  const bodyCell = body.length ? body : '';
  const cells = [mediaFirst ? [mediaCell, bodyCell] : [bodyCell, mediaCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}

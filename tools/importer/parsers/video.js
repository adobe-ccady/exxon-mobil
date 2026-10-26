/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video (custom Video block). xwalk model `video`: link (text), title (text),
 * poster (reference) + posterAlt (collapsed into img alt).
 * Sources: article body media sections (div.article--wrapper section.articleMedia-video,
 * #main-content section.articleMedia-video), e.g.
 *  section.articleMedia.articleMedia-video > div.container > article.articleMedia--content
 *  > div.articleMedia--imageWrapper > div.video-js[data-account][data-player][data-embed][data-video-id]
 *  (initialised player: inner <video> with blob: src + signed poster, title in .vjs-title-bar-title).
 * Also supported: uninitialised <video-js>/<video> with the same data-* attributes, Brightcove
 * player iframes and YouTube iframes.
 * Output: always three single-cell rows (link | title | poster), each with its field hint.
 * The poster row is always empty (source posters are short-lived signed URLs).
 * Caption text in the section (figcaption, .articleMedia--caption) is kept as paragraphs after the block.
 * Sections without a recognisable video are left untouched.
 */
const GENERIC_TITLES = /^(video player|video|player|youtube video player)$/i;
const CAPTION_SELECTOR = 'figcaption, .articleMedia--caption, .articleMedia--captionText, .caption';
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'H2', 'H3', 'H4', 'H5', 'H6']);

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function usableTitle(text) {
  const t = clean(text);
  return t && !GENERIC_TITLES.test(t) ? t : '';
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

function findVideo(element) {
  // 1. Brightcove player element (initialised div.video-js, uninitialised <video-js>/<video>)
  const bcCandidates = [...element.querySelectorAll('[data-video-id][data-account]')]
    .filter((el) => clean(el.getAttribute('data-video-id')) && clean(el.getAttribute('data-account')));
  if (bcCandidates.length) {
    const el = bcCandidates[0];
    // player/embed may be set on the wrapper or only on the inner <video>
    const pick = (name) => {
      for (let i = 0; i < bcCandidates.length; i += 1) {
        const v = clean(bcCandidates[i].getAttribute(name));
        if (v) return v;
      }
      return '';
    };
    const account = clean(el.getAttribute('data-account'));
    const videoId = clean(el.getAttribute('data-video-id'));
    const player = pick('data-player') || 'default';
    const embed = pick('data-embed') || 'default';
    const url = `https://players.brightcove.net/${account}/${player}_${embed}/index.html?videoId=${videoId}`;

    const titleEl = element.querySelector('.vjs-title-bar-title');
    let title = titleEl ? usableTitle(titleEl.textContent) : '';
    if (!title) {
      const vids = element.querySelectorAll('video, video-js, [data-video-id]');
      for (let i = 0; i < vids.length && !title; i += 1) {
        title = usableTitle(vids[i].getAttribute('aria-label'))
          || usableTitle(vids[i].getAttribute('title'))
          || usableTitle(vids[i].getAttribute('data-title'));
      }
    }
    return { url, title };
  }

  // 2. iframes (YouTube or Brightcove player)
  const iframes = [...element.querySelectorAll('iframe')];
  for (let i = 0; i < iframes.length; i += 1) {
    const f = iframes[i];
    const src = f.getAttribute('src') || f.getAttribute('data-src') || '';
    const ytId = youTubeId(src);
    const title = usableTitle(f.getAttribute('title')) || usableTitle(f.getAttribute('aria-label'));
    if (ytId) return { url: `https://www.youtube.com/watch?v=${ytId}`, title };
    const bc = brightcoveFromIframe(src);
    if (bc) return { url: bc, title };
  }
  return null;
}

/** Caption content as a list of paragraphs (inline formatting and links kept). */
function captions(element, document) {
  const out = [];
  const seen = [];
  element.querySelectorAll(CAPTION_SELECTOR).forEach((cap) => {
    // skip nested matches (a .caption inside a figcaption) to avoid duplicate text
    if (seen.some((s) => s.contains(cap))) return;
    if (cap.closest('.video-js, video-js, .vjs-title-bar')) return;
    seen.push(cap);
    const c = cap.cloneNode(true);
    c.querySelectorAll('script, style, noscript, img, picture, video, video-js, iframe, svg, button').forEach((n) => n.remove());
    c.querySelectorAll('a[href^="blob:"]').forEach((a) => a.replaceWith(...a.childNodes));
    if (!clean(c.textContent)) return;
    const blocks = [...c.children].filter((k) => BLOCK_TAGS.has(k.tagName));
    if (blocks.length) {
      blocks.forEach((b) => { if (clean(b.textContent)) out.push(b); });
      return;
    }
    const p = document.createElement('p');
    p.append(...c.childNodes);
    out.push(p);
  });
  return out;
}

export default function parse(element, { document }) {
  const video = findVideo(element);
  if (!video) return; // no recognisable video: leave the section untouched

  const caps = captions(element, document);

  const link = document.createElement('a');
  link.href = video.url;
  link.textContent = video.url;

  const cells = [
    [[document.createComment(' field:link '), link]],
    [video.title
      ? [document.createComment(' field:title '), document.createTextNode(video.title)]
      : [document.createComment(' field:title ')]],
    [[document.createComment(' field:poster ')]],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'video', cells });
  element.replaceWith(block, ...caps);
}

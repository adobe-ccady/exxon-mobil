import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const IFRAME_ALLOW = 'autoplay; encrypted-media; fullscreen; picture-in-picture';

/**
 * Parses an authored URL string, returning null when it is not http(s).
 * @param {string} value
 * @returns {URL|null}
 */
function toUrl(value) {
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url : null;
  } catch (e) {
    return null;
  }
}

/**
 * Builds a Brightcove player embed URL from a players.brightcove.net URL.
 * The URL is rebuilt from validated parts so no authored query leaks through.
 * @param {URL} url
 * @param {boolean} autoplay
 * @returns {string|null}
 */
function brightcoveEmbed(url, autoplay) {
  if (url.hostname !== 'players.brightcove.net') return null;
  const match = url.pathname.match(/^\/(\d+)\/([\w-]+)_([\w-]+)\/index\.html$/);
  const videoId = url.searchParams.get('videoId');
  if (!match || !videoId || !/^(ref:)?[\w-]+$/.test(videoId)) return null;
  const [, account, player, embed] = match;
  const src = new URL(`https://players.brightcove.net/${account}/${player}_${embed}/index.html`);
  src.searchParams.set('videoId', videoId);
  if (autoplay) src.searchParams.set('autoplay', 'true');
  return src.toString();
}

/**
 * Builds a privacy-enhanced YouTube embed URL from watch / short / embed URLs.
 * @param {URL} url
 * @param {boolean} autoplay
 * @returns {string|null}
 */
function youtubeEmbed(url, autoplay) {
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  let id = null;
  if (host === 'youtu.be') {
    [, id] = url.pathname.split('/');
  } else if (['youtube.com', 'youtube-nocookie.com'].includes(host)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      if (match) [, id] = match;
    }
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  const src = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  src.searchParams.set('rel', '0');
  if (autoplay) {
    src.searchParams.set('autoplay', '1');
  }
  return src.toString();
}

/**
 * Resolves the embed URL for a supported provider.
 * @param {URL} url
 * @param {boolean} autoplay
 * @returns {string|null}
 */
function getEmbedSrc(url, autoplay) {
  return brightcoveEmbed(url, autoplay) || youtubeEmbed(url, autoplay);
}

function createIframe(src, title) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.loading = 'lazy';
  iframe.allow = IFRAME_ALLOW;
  iframe.allowFullscreen = true;
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  return iframe;
}

/**
 * Video: responsive 16:9 Brightcove or YouTube player.
 * Rows (one cell each): [link], [title, optional], [poster image, optional].
 * The iframe is created when the block nears the viewport, or on click when a
 * poster is authored. Unsupported URLs render as a plain link.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const posterCell = cells.find((c) => c.querySelector('picture, img'));
  const textCells = cells.filter((c) => c !== posterCell);

  // the link cell is the first one holding an anchor or a URL-looking text
  const linkCell = textCells.find((c) => c.querySelector('a[href]') || /^\s*https?:\/\//.test(c.textContent));
  const anchor = linkCell?.querySelector('a[href]');
  const rawUrl = anchor ? anchor.getAttribute('href') : (linkCell?.textContent || '');
  const titleCell = textCells.find((c) => c !== linkCell && c.textContent.trim());
  const title = titleCell?.textContent.trim() || 'Video player';

  const url = toUrl(rawUrl);
  const embedSrc = url ? getEmbedSrc(url, false) : null;

  const wrapper = document.createElement('div');
  wrapper.className = 'video-player';
  if (linkCell) moveInstrumentation(linkCell, wrapper);

  if (!embedSrc) {
    // unknown or invalid URL: fall back to a plain link (or nothing)
    block.classList.add('video-fallback');
    if (url) {
      const a = document.createElement('a');
      a.href = url.toString();
      a.textContent = titleCell ? title : url.toString();
      const p = document.createElement('p');
      p.append(a);
      wrapper.append(p);
      block.replaceChildren(wrapper);
    } else {
      block.replaceChildren();
    }
    return;
  }

  block.dataset.provider = embedSrc.includes('brightcove') ? 'brightcove' : 'youtube';

  if (posterCell) {
    const img = posterCell.querySelector('img');
    const poster = document.createElement('div');
    poster.className = 'video-poster';
    moveInstrumentation(posterCell, poster);
    const picture = createOptimizedPicture(img.src, img.alt || '', false, [
      { media: '(min-width: 900px)', width: '1200' },
      { width: '750' },
    ]);
    moveInstrumentation(img, picture.querySelector('img'));
    poster.append(picture);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'video-play';
    button.setAttribute('aria-label', `Play video: ${title}`);
    poster.append(button);

    poster.addEventListener('click', () => {
      wrapper.replaceChildren(createIframe(getEmbedSrc(url, true), title));
      wrapper.querySelector('iframe').focus();
    }, { once: true });

    wrapper.append(poster);
    block.replaceChildren(wrapper);
    return;
  }

  block.replaceChildren(wrapper);

  const load = () => {
    if (!wrapper.querySelector('iframe')) wrapper.append(createIframe(embedSrc, title));
  };

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px 0px' });
  observer.observe(block);
}

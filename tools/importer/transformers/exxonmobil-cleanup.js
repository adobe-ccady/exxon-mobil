/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ExxonMobil (corporate.exxonmobil.com) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// --- Loose inline content normalisation (article template) -----------------
// Some article bodies (e.g. div.rich-text--content > div.p, table footnote
// divs) hold text nodes / <sup> / <em> / <a> directly inside a <div>, separated
// by <br><br>, with no <p>. helix-importer maps <sup>/<sub>/<u> to custom
// mdast nodes that are not "phrasing", so such a run is split and the inline
// pieces bubble up to the markdown root; the root is then serialised as
// phrasing and every block (grid tables, <hr>, headings) gets glued into one
// paragraph ("+-----+---Since ExxonMobil..."). Wrapping each inline run in a
// <p> keeps the inline content inside a paragraph.
const INLINE_TAGS = new Set([
  'A', 'ABBR', 'B', 'BDI', 'BDO', 'BR', 'CITE', 'CODE', 'DATA', 'DEL', 'DFN', 'EM', 'FONT',
  'I', 'IMG', 'INS', 'KBD', 'LABEL', 'MARK', 'PICTURE', 'Q', 'S', 'SAMP', 'SMALL', 'SPAN',
  'STRIKE', 'STRONG', 'SUB', 'SUP', 'TIME', 'TT', 'U', 'VAR', 'WBR',
]);
// Elements whose content is already a phrasing context (or a block table).
const PHRASING_CONTEXT = 'p, li, dt, dd, td, th, caption, h1, h2, h3, h4, h5, h6, pre, blockquote, figcaption, table, a, button';

function isInlineNode(node) {
  if (node.nodeType === 3) return true;
  if (node.nodeType !== 1 || !INLINE_TAGS.has(node.nodeName)) return false;
  // An "inline" wrapper that contains block content is treated as a block.
  return ![...node.querySelectorAll('*')].some((d) => !INLINE_TAGS.has(d.nodeName));
}

function isMeaningful(node) {
  if (node.nodeType === 3) return node.textContent.trim() !== '';
  if (node.nodeType !== 1 || node.nodeName === 'BR') return false;
  return node.textContent.trim() !== '' || !!node.querySelector('img');
}

function isBr(node) {
  return node.nodeType === 1 && node.nodeName === 'BR';
}

// Wrap one run of inline sibling nodes into <p>s, splitting on <br><br>+.
function wrapInlineRun(doc, run) {
  if (!run.some(isMeaningful)) return;
  const segments = [];
  let current = [];
  for (let i = 0; i < run.length; i += 1) {
    const node = run[i];
    if (isBr(node)) {
      // Look ahead (over whitespace text) for another <br>.
      let j = i + 1;
      while (j < run.length && run[j].nodeType === 3 && run[j].textContent.trim() === '') j += 1;
      if (j < run.length && isBr(run[j])) {
        // A <br><br>+ separator: consume all consecutive <br>s and whitespace.
        while (j < run.length && (isBr(run[j]) || (run[j].nodeType === 3 && run[j].textContent.trim() === ''))) j += 1;
        run.slice(i, j).forEach((n) => n.remove());
        segments.push(current);
        current = [];
        i = j - 1;
        continue;
      }
    }
    current.push(node);
  }
  segments.push(current);

  segments.forEach((seg) => {
    // Drop leading/trailing <br>s and whitespace around the paragraph.
    const trimmable = (n) => isBr(n) || (n.nodeType === 3 && n.textContent.trim() === '');
    while (seg.length && trimmable(seg[0])) seg.shift().remove();
    while (seg.length && trimmable(seg[seg.length - 1])) seg.pop().remove();
    if (!seg.some(isMeaningful)) return;
    const p = doc.createElement('p');
    seg[0].before(p);
    seg.forEach((n) => p.append(n));
  });
}

function normalizeContainer(doc, container) {
  const children = [...container.childNodes];
  if (!children.some((n) => isInlineNode(n) && isMeaningful(n))) return;
  let run = [];
  children.forEach((node) => {
    if (node.nodeType === 8) return; // comments: leave in place, don't break runs
    if (isInlineNode(node)) {
      run.push(node);
    } else {
      wrapInlineRun(doc, run);
      run = [];
    }
  });
  wrapInlineRun(doc, run);
}

// <sup>/<sub>/<u> map to non-phrasing mdast nodes (see above).
const NON_PHRASING_INLINE = 'sup, sub, u';

function normalizeLooseInline(doc, root) {
  const containers = [root, ...root.querySelectorAll('*')].filter((el) => (
    el.nodeType === 1
    && !INLINE_TAGS.has(el.nodeName)
    && !el.closest(PHRASING_CONTEXT)
  ));
  containers.forEach((el) => normalizeContainer(doc, el));
  // <figcaption> has no mdast equivalent: its children are passed through to
  // the parent (often the markdown root), so a loose <sup>/<sub>/<u> in a
  // caption (e.g. "...since 2016<sup><a>7</a></sup>") collapses the whole page
  // the same way. Wrap such captions' inline runs in <p>. Captions without
  // these elements are left untouched.
  root.querySelectorAll('figcaption').forEach((fc) => {
    if (fc.closest('table') || !fc.querySelector(NON_PHRASING_INLINE)) return;
    normalizeContainer(doc, fc);
  });
}

// --- Tables nested in headings ----------------------------------------------
// Some article bodies put a stats <table> inside a heading
// (div.articleMedia--wrapper > h3 > table, e.g. community/investing-in-people/
// attract-the-best-talent). The table parser would turn it into a block table
// inside a heading, which serialises as "### +-----+" grid text and collapses
// the page. Move the table out: the heading keeps its non-table content (and
// is dropped when that is empty), followed by the table(s).
function hoistTablesFromHeadings(root) {
  const headings = [...root.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .filter((h) => h.querySelector('table') && !h.closest('table'));
  // Innermost first so nested headings are handled before their ancestors.
  headings.reverse().forEach((h) => {
    const tables = [...h.querySelectorAll('table')].filter((t) => !t.parentElement.closest('table'));
    if (!tables.length) return;
    tables.forEach((t) => t.remove());
    const keep = h.textContent.trim() !== '' || !!h.querySelector('img, picture');
    if (keep) {
      h.after(...tables);
    } else {
      h.replaceWith(...tables);
    }
  });
}

// --- Internal link normalisation ---------------------------------------------
// Imported pages are written to sanitised paths (see "Sanitized path" in
// import-article.js / import-home.js), e.g. /global-legal-pages/privacy-policy_icm_upstream_english
// is saved as /global-legal-pages/privacy-policy-icm-upstream-english. Rewrite
// internal page links to the same form so they resolve after import.
const SOURCE_HOST = 'corporate.exxonmobil.com';
const SOURCE_ORIGIN = `https://${SOURCE_HOST}`;
// Translated pages (?content-lang=xx) that are imported under a /xx/ prefix.
const PREFIXED_LANGS = ['es', 'fr'];
// Source paths that have an in-scope translation, per language. Copied from
// migration-work/translated-paths.json (es: 15, fr: 9); normalised like
// normalizeInternalHref's raw path: lowercase, no trailing slash, no .html.
// The source site keeps the language in a cookie, so links on a translated
// page usually omit ?content-lang; such links are pointed at the same-language
// page when it is listed here, otherwise they keep the English path.
const TRANSLATED_PATHS = {
  es: new Set([
    '/greenpoint',
    '/greenpoint/community-programs',
    '/greenpoint/remediation',
    '/system-updates/hub',
    '/greenpoint/our-commitment',
    '/greenpoint/newsletters',
    '/system-updates/hub/customers-getting-started',
    '/greenpoint/stay-informed',
    '/system-updates/hub/customers-getting-started/lubricants',
    '/system-updates/hub/customers-getting-started/fuels',
    '/system-updates/hub/customers-getting-started/chemicals',
    '/system-updates/hub/news-and-updates',
    '/locations/european-region/european-newsroom/2025/aligning-eu-policy-with-innovation',
    '/greenpoint/community-programs/us-military-academy-at-west-point',
    '/system-updates/hub/frequently-asked-questions',
  ]),
  fr: new Set([
    '/locations/luxembourg',
    '/system-updates/hub',
    '/system-updates/hub/customers-getting-started',
    '/locations/european-region/european-newsroom/2025/aligning-eu-policy-with-innovation',
    '/system-updates/hub/news-and-updates',
    '/system-updates/hub/customers-getting-started/lubricants',
    '/system-updates/hub/customers-getting-started/chemicals',
    '/system-updates/hub/customers-getting-started/fuels',
    '/system-updates/hub/frequently-asked-questions',
  ]),
};

// Language of the page being imported ('es' / 'fr'), or '' for English.
function getPageLang(payload) {
  const candidates = [payload && payload.params && payload.params.originalURL, payload && payload.url];
  for (let i = 0; i < candidates.length; i += 1) {
    const u = candidates[i];
    if (u) {
      try {
        const lang = (new URL(u, SOURCE_ORIGIN).searchParams.get('content-lang') || '').toLowerCase();
        if (PREFIXED_LANGS.includes(lang)) return lang;
      } catch (e) { /* ignore */ }
    }
  }
  return '';
}

// Asset/file links: kept untouched (mapped to the DAM later).
const ASSET_PATH_PREFIXES = ['/-/', '/~/', '/sitecore/', '/content/dam/'];
const ASSET_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'csv', 'txt', 'rtf', 'zip',
  'xml', 'json', 'ashx', 'axd', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif', 'bmp',
  'tif', 'tiff', 'ico', 'mp4', 'm4v', 'mov', 'webm', 'mp3', 'wav', 'ics', 'vcf', 'eps', 'ai',
]);

// Exact equivalent of helix-importer FileUtils.sanitizeFilename / sanitizePath,
// used only when WebImporter.FileUtils is not available at runtime.
function fallbackSanitizeFilename(name) {
  if (!name) return '';
  let decoded = name;
  try { decoded = decodeURIComponent(name); } catch (e) { /* keep raw */ }
  return decoded.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fallbackSanitizePath(path) {
  if (!path) return '';
  const extension = path.split('.').pop();
  const pathname = extension !== path ? path.substring(0, path.lastIndexOf('.')) : path;
  let sanitized = '';
  pathname.split('/').forEach((p) => {
    if (p !== '') sanitized += `/${fallbackSanitizeFilename(p)}`;
  });
  if (extension !== path) sanitized += `.${extension}`;
  return sanitized;
}

function sanitizeImportPath(path) {
  const fu = (typeof WebImporter !== 'undefined' && WebImporter.FileUtils) || null;
  if (fu && typeof fu.sanitizePath === 'function') return fu.sanitizePath(path);
  return fallbackSanitizePath(path);
}

/**
 * Returns the normalised root-relative href for an internal page link, or
 * null when the link must be left exactly as it is.
 */
function normalizeInternalHref(href, pageLang = '') {
  if (!href) return null;
  const raw = href.trim();
  if (!raw || raw.startsWith('#')) return null;
  // Only root-relative ("/x", not "//host") or absolute http(s) links.
  const isRootRelative = raw.startsWith('/') && !raw.startsWith('//');
  if (!isRootRelative && !/^(https?:)?\/\//i.test(raw)) return null; // mailto:, tel:, javascript:, relative, ...
  let url;
  try {
    url = new URL(raw, SOURCE_ORIGIN);
  } catch (e) {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  if (url.hostname.toLowerCase() !== SOURCE_HOST) return null;

  // Asset / file links stay as-is.
  const lowerPath = url.pathname.toLowerCase();
  if (ASSET_PATH_PREFIXES.some((p) => lowerPath.startsWith(p))) return null;
  const lastSegment = lowerPath.replace(/\/+$/, '').split('/').pop();
  const ext = lastSegment.includes('.') ? lastSegment.split('.').pop() : '';
  if (ext && ASSET_EXTENSIONS.has(ext)) return null;

  // Same steps as the import scripts' "Sanitized path".
  let rawPath = lowerPath.replace(/\/+$/, '').replace(/\.html?$/, '');
  let lang = (url.searchParams.get('content-lang') || '').toLowerCase();
  // Translated page + untagged link: follow the page language when that
  // translation is in scope (links with an explicit content-lang are unchanged).
  if (!url.searchParams.has('content-lang') && pageLang && rawPath
    && TRANSLATED_PATHS[pageLang] && TRANSLATED_PATHS[pageLang].has(rawPath)) {
    lang = pageLang;
  }
  let path;
  if (PREFIXED_LANGS.includes(lang)) {
    path = rawPath ? sanitizeImportPath(`/${lang}${rawPath}`) : `/${lang}/`;
  } else {
    path = rawPath ? sanitizeImportPath(rawPath) : '/';
  }
  if (!path) path = '/';
  return `${path}${url.hash || ''}`;
}

function normalizeInternalLinks(root, pageLang = '') {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    const normalized = normalizeInternalHref(href, pageLang);
    if (normalized !== null && normalized !== href) a.setAttribute('href', normalized);
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / consent that can interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk', // OneTrust cookie banner + preference center (cleaned.html line ~1744)
      '.searchBar', // search overlay outside <main> (line ~1034)
      '.spinner.spinner-global', // loading spinner at end of <main> (line ~1654)
    ]);

    // Section "mini-site" sub-navigation (greenpoint, system-updates/hub,
    // publications/global-outlook, ...): nav.secondaryNav sits inside
    // section.articleHeader > div.stickyNav-wrapper, which is removed below.
    // Rescue it first: move it out to just before the header's div.container
    // (i.e. after the banner div.articleHeader--imagewrapper) so the
    // secondary-nav parser can convert it. Everything else in the sticky bar
    // is still dropped.
    element.querySelectorAll('div.stickyNav-wrapper').forEach((sticky) => {
      const navs = [...sticky.querySelectorAll('nav.secondaryNav')];
      if (!navs.length) return;
      const header = sticky.closest('section.articleHeader');
      const container = header
        ? [...header.children].find((c) => c.matches('div.container'))
        : null;
      // Topic pages: the sticky bar is a sibling of section.topicHeader
      // (main > section.topicHeader + div.stickyNav-wrapper + div.topic--wrapper);
      // keep the nav right after the topic header banner.
      const topicHeader = !header && sticky.parentElement
        ? [...sticky.parentElement.children].find((c) => c.matches('section.topicHeader'))
        : null;
      let topicAnchor = topicHeader;
      navs.forEach((nav) => {
        if (container) {
          container.before(nav);
        } else if (topicAnchor) {
          topicAnchor.after(nav);
          topicAnchor = nav;
        } else {
          sticky.before(nav);
        }
      });
    });

    // Article template chrome. These live inside section.articleHeader /
    // div.container, which the columns-article-header parser consumes, so they
    // must be removed before parsers run. None of these exist on the home page.
    WebImporter.DOMUtils.remove(element, [
      'div.breadcrumbs-wrapper', // breadcrumbs - rebuilt in code (article cleaned.html line ~1095)
      'div.stickyNav-wrapper', // sticky TOC / share bar (line ~1110)
      'section.stickyToc', // sticky TOC (line ~1111)
      'section.tableOfContent', // empty d-none TOC placeholder (line ~1194)
      'div.share', // share + print widget wrapper (line ~1140)
      'button.icon-share', // share toggle (line ~1141)
      'div.shareInfo', // share popover with social buttons (line ~1143)
      'a.icon-print', // print link (line ~1176)
      'div.articleHeader--info-mobile', // mobile duplicate of type/date (line ~1183)
      'div.data-analytics', // empty d-none analytics hook (line ~1371)
      '#data-xom-search', // empty d-none search hook (line ~1373)
      // Topic pages (/news, /community, ...): client-side "Load More" pager of
      // the server-rendered content collection (news cleaned.html
      // section.contentCollection > button.contentCollection--loadMore).
      'section.contentCollection button.contentCollection--loadMore',
      'section.contentCollection button.button-loadMore',
      'section.dynamicContentCollection button.button-loadMore',
    ]);

    // Hidden table-of-contents anchors: div.toc-hidden > h2.table-of-contents
    // (cleaned.html lines ~1300, ~1400, ~1418). Positioned off-flow with a
    // transparent text colour on the source, they only feed the "Navigate to"
    // menu and duplicate the visible H2s. Only the TOC headings are removed; any
    // other (unexpected) child of the wrapper is kept in place.
    element.querySelectorAll('div.toc-hidden').forEach((toc) => {
      toc.querySelectorAll('.table-of-contents').forEach((h) => h.remove());
      const hasOther = [...toc.children].length > 0 || toc.textContent.trim() !== '';
      if (hasOther) {
        toc.replaceWith(...toc.childNodes);
      } else {
        toc.remove();
      }
    });

    // Tables nested in headings must become normal table blocks (before the
    // table parser runs).
    hoistTablesFromHeadings(element);

    // Bare <blockquote>s in body copy (outside the div.pullquote component, e.g.
    // /community/stem/teacher-stem-training-program) are not supported by the
    // Universal Editor JCR conversion. Wrap them like a pull quote so the quote
    // parser (instances `... div.pullquote`) turns them into a quote block.
    element.querySelectorAll('div.article--wrapper blockquote, div.topic--wrapper blockquote').forEach((bq) => {
      if (bq.closest('div.pullquote, table')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'pullquote';
      bq.replaceWith(wrapper);
      wrapper.append(bq);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome (non-authorable). NOTE: never remove bare `header` -
    // the hero carousel is a `header.homeHero` inside <main>.
    WebImporter.DOMUtils.remove(element, [
      'section.skip-content', // "Skip to content" link (line 2)
      'header.header-static', // site header containing nav.mainNav + globalSelectorV2 (line 7)
      'nav.mainNav', // main nav (line 8)
      'section.globalSelectorV2', // country/region selector (line 653)
      'section.searchModule', // search module (line 1045)
      'footer.bg-dark', // site footer (line 1658)
      // Topic pages: decorative "Follow us" background (orange.png). Its colour is
      // already carried by the orange-gradient section style, so drop the image
      // after exxonmobil-sections.js has read it in beforeTransform.
      'section.iconGrid div.iconGrid--bg',
      // Carousel/slider UI controls (not authorable content)
      '.homeHero--interactiveControl', // play/pause + #carouselStatus (line 1096)
      '.homeHero--control', // slide title tabs (line 1162)
      '.homeHero--arrow', // scroll-down arrow (line 1178)
      '.highlight--arrows', // slider arrows (lines ~1442, ~1555)
      '.highlight--controls', // slider bullets (lines ~1525, ~1646)
      // Tracking / embeds
      'iframe#universal_pixel_p6xsd8s', // TTD pixel (line 2027)
      'iframe.ot-text-resize', // OneTrust iframe (line 2023)
      '[id^="batBeacon"]', // Bing beacon (line 2029)
      'canvas', // empty canvases in hero/topic images
      'iframe',
      'link',
      'noscript',
      'script',
      'style',
    ]);

    // Article template only (none of these exist on the home page): wrap loose
    // inline content in <p>s so it can't leak to the markdown root. Runs after
    // the parsers, so block tables are skipped and parser input is untouched.
    const doc = element.ownerDocument || document;
    const articleRoots = [...element.querySelectorAll('div.article--wrapper, section.articleHeader')];
    articleRoots.forEach((root) => normalizeLooseInline(doc, root));
    // Never leave a section <hr> next to bare inline content.
    if (articleRoots.length) {
      const hrParents = new Set([...element.querySelectorAll('hr')].map((hr) => hr.parentElement));
      hrParents.forEach((parent) => {
        if (parent && !INLINE_TAGS.has(parent.nodeName) && !parent.closest(PHRASING_CONTEXT)) {
          normalizeContainer(doc, parent);
        }
      });
    }

    // Rewrite internal page links to the sanitised import paths. Runs after
    // the parsers so links inside block tables are covered too.
    normalizeInternalLinks(element, getPageLang(payload));
  }
}

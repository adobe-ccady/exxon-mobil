/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ExxonMobil Fuels (www.exxonmobilfuels.com) site-wide cleanup.
 *
 * Every import script imports all transformers in this folder, so this one is
 * a strict no-op unless the page being imported is an exxonmobilfuels.com page
 * (params.originalURL / payload.url host) or uses the "rewards" template.
 *
 * Selectors verified in migration-work/cleaned.html and
 * tools/importer/bd-snapshots/www.exxonmobilfuels.com/en/rewards/frequent-filler.html
 * (body > div#wrapper > header.nav-header + main > div#content + footer;
 * body > div#onetrust-consent-sdk; body > iframe (doubleclick pixel)).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const FUELS_HOSTS = ['www.exxonmobilfuels.com', 'exxonmobilfuels.com'];
const FUELS_TEMPLATES = ['rewards'];

function isFuelsPage(payload) {
  if (!payload) return false;
  const template = payload.template && payload.template.name;
  if (template && FUELS_TEMPLATES.includes(template)) return true;
  const candidates = [payload.params && payload.params.originalURL, payload.url];
  return candidates.some((u) => {
    if (!u) return false;
    try {
      return FUELS_HOSTS.includes(new URL(u).hostname.toLowerCase());
    } catch (e) {
      return false;
    }
  });
}

// Non-authorable chrome. Removed in beforeTransform so it can't be matched by
// block selectors (e.g. the mega-menu contains link lists / headings).
const CHROME = [
  // Header: brand bar (Exxon / Mobil / Rewards / Commercial), rewards nav, mega-menu, search
  'header.nav-header',
  'header.navbar-main-header',
  'div.nav-wrapper',
  'div.nav-meganav-wrapper',
  'div.nav-main-search',
  'div.nav-header-divider',
  // Footer (div#footer.footer-wrapper inside <footer>), mobile nav mask, GDPR flag input
  'footer',
  '#footer',
  'div.footer-wrapper',
  'div.body-mask',
  'input#gdpr_enabled',
  // Breadcrumbs (not on frequent-filler, defensive for other rewards pages)
  'nav[aria-label="breadcrumb"]',
  '.breadcrumb',
  '.breadcrumbs',
  // Cookie consent (OneTrust banner + preference center + filter modal)
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '#onetrust-pc-sdk',
  '#ot-fltr-modal',
  '.onetrust-pc-dark-filter',
  'iframe.ot-text-resize',
  // Generic modals
  '.modal',
  '.modal-backdrop',
  // App-store / smart-banner popups
  '.smartbanner',
  '#smartbanner',
  '#branch-banner',
  '#branch-banner-iframe',
  '.branch-journeys-top',
  // Chat / feedback widgets (Medallia / Kampyle, LivePerson)
  '#nebula_div_btn',
  '[id^="kampyle"]',
  '.kampyle_vertical_button',
  '#MDigitalInvitationWrapper',
  '#MDigitalLightboxWrapper',
  '[id^="LPMcontainer"]',
  '.LPMcontainer',
  // Skip links
  'a.skip-link',
  '.skip-link',
  '.skip-to-content',
  'a[href="#content"]',
  'a[href="#main-content"]',
  // Mobile duplicate of the benefits chart (div.ibo-chart > .ibo-chart-desktop
  // + .ibo-chart-mobile): only the desktop chart is parsed (table-benefits).
  '.ibo-chart-mobile',
  // Hidden / print-only
  '[hidden]',
  '.d-none',
  '.hidden',
  '.visible-print',
  '.visible-print-block',
  '.d-print-block',
  '.d-print-inline',
  '.print-only',
  // Stray resources (div#content holds ~27 <link> stylesheet nodes between components)
  'link',
  'meta',
  'script',
  'style',
  'noscript',
  'template',
  'iframe', // doubleclick floodlight pixel (body > iframe)
];

// div.sp05-button-bar > div.button-bar > div.b05-button > a > div(...) -> <p><a>label</a></p>
function normalizeButtonBars(doc, root) {
  root.querySelectorAll('div.sp05-button-bar').forEach((bar) => {
    const links = [...bar.querySelectorAll('a[href]')];
    if (!links.length) return;
    const paragraphs = links.map((src) => {
      const a = doc.createElement('a');
      a.setAttribute('href', src.getAttribute('href'));
      const label = src.textContent.replace(/\s+/g, ' ').trim() || src.getAttribute('title') || '';
      if (src.getAttribute('title')) a.setAttribute('title', src.getAttribute('title'));
      a.textContent = label;
      const p = doc.createElement('p');
      p.append(a);
      return p;
    });
    bar.replaceChildren(...paragraphs);
  });
}

// FAQ callout (div.f01-featured-item > .expanding-box-static): the CTA <a> sits
// next to the eyebrow <p>; give it its own paragraph.
function wrapBareCtas(doc, root) {
  root.querySelectorAll('.expanding-box-static > a[href]').forEach((a) => {
    const p = doc.createElement('p');
    a.before(p);
    p.append(a);
  });
}

// Drop the Google Analytics cross-domain linker param (?_gl=...) from links.
function stripTrackingParams(root) {
  root.querySelectorAll('a[href*="_gl="]').forEach((a) => {
    const href = a.getAttribute('href');
    try {
      const url = new URL(href);
      url.searchParams.delete('_gl');
      a.setAttribute('href', url.toString());
    } catch (e) { /* relative or malformed - leave as is */ }
  });
}

// Sitecore / analytics attributes on the live page (bd-snapshot: data-unique-id,
// data-component-id, data-source, data-additional-detail, data-cmpvariant,
// data-analytics, data-variantitemid, data-variantfieldname, data-updateddate).
// data-excat-* section markers are never touched.
const TRACKING_ATTRS = [
  'data-unique-id', 'data-component-id', 'data-source', 'data-additional-detail',
  'data-cmpvariant', 'data-analytics', 'data-variantitemid', 'data-variantfieldname',
  'data-updateddate', 'onclick',
];

function stripTrackingAttrs(root) {
  const selector = TRACKING_ATTRS.map((a) => `[${a}]`).join(', ');
  [root, ...root.querySelectorAll(selector)].forEach((el) => {
    TRACKING_ATTRS.forEach((a) => el.removeAttribute && el.removeAttribute(a));
  });
}

export default function transform(hookName, element, payload) {
  if (!isFuelsPage(payload)) return;
  const doc = element.ownerDocument || document;

  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, CHROME);
    normalizeButtonBars(doc, element);
    wrapBareCtas(doc, element);
  }

  if (hookName === TransformHook.afterTransform) {
    // Anything parsers left behind.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.ibo-chart-mobile',
      'link',
      'meta',
      'script',
      'style',
      'noscript',
      'iframe',
    ]);
    stripTrackingParams(element);
    stripTrackingAttrs(element);
  }
}

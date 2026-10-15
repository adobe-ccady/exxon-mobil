/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ExxonMobil (corporate.exxonmobil.com) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / consent that can interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk', // OneTrust cookie banner + preference center (cleaned.html line ~1744)
      '.searchBar', // search overlay outside <main> (line ~1034)
      '.spinner.spinner-global', // loading spinner at end of <main> (line ~1654)
    ]);
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
  }
}

/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsStockTickerParser from './parsers/columns-stock-ticker.js';
import heroBannerParser from './parsers/hero-banner.js';
import cardsTopicsParser from './parsers/cards-topics.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsBusinessParser from './parsers/cards-business.js';
import heroCenteredParser from './parsers/hero-centered.js';
import cardsLinksParser from './parsers/cards-links.js';

// TRANSFORMER IMPORTS
import exxonmobilCleanupTransformer from './transformers/exxonmobil-cleanup.js';
import exxonmobilSectionsTransformer from './transformers/exxonmobil-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-stock-ticker': columnsStockTickerParser,
  'hero-banner': heroBannerParser,
  'cards-topics': cardsTopicsParser,
  'cards-news': cardsNewsParser,
  'cards-business': cardsBusinessParser,
  'hero-centered': heroCenteredParser,
  'cards-links': cardsLinksParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  urls: [
    'https://corporate.exxonmobil.com/',
  ],
  description: 'ExxonMobil corporate homepage: hero slider, stock ticker, banners, trending topics/news, business divisions, brands promo and quick links',
  blocks: [
    { name: 'carousel-hero', instances: ['header.homeHero .homeHero--content'] },
    { name: 'columns-stock-ticker', instances: ['section.stockTicker .stockTicker--wrapper'] },
    { name: 'hero-banner', instances: ['section.singleFeature.singleFeature-variable'] },
    { name: 'cards-topics', instances: ['section.keytopicstrending .keytopics.keytopics-two-up'] },
    { name: 'cards-news', instances: ['section.keytopicstrending .trending--content'] },
    { name: 'cards-business', instances: ['.highlight--wrapper.highlight-gray > .highlight--content'] },
    { name: 'hero-centered', instances: ['section.singleFeature.singleFeature-centerContent'] },
    { name: 'cards-links', instances: ['.highlight--wrapper.highlight-white > .highlight--content'] },
  ],
  sections: [
    {
      id: '1', name: 'Home hero slider', selector: ['header.homeHero'], style: null, blocks: ['carousel-hero'], defaultContent: [],
    },
    {
      id: '2', name: 'Stock ticker', selector: ['section.stockTicker'], style: null, blocks: ['columns-stock-ticker'], defaultContent: [],
    },
    {
      id: '3', name: 'Mission statement banner', selector: ['section.singleFeature.singleFeature-variable'], style: null, blocks: ['hero-banner'], defaultContent: [],
    },
    {
      id: '4', name: 'Trending topics and latest news', selector: ['section.keytopicstrending'], style: 'trending-split', blocks: ['cards-topics', 'cards-news'], defaultContent: ['.keytopics--section-title', '.trending--title'],
    },
    {
      id: '5', name: 'Our global organization', selector: ['section.highlight:has(.highlight-gray)', '.home--wrapper > section.highlight:nth-of-type(4)'], style: 'grey', blocks: ['cards-business'], defaultContent: ['.highlight-gray > .highlight--header'],
    },
    {
      id: '6', name: 'Our global brands', selector: ['section.singleFeature.singleFeature-centerContent'], style: null, blocks: ['hero-centered'], defaultContent: [],
    },
    {
      id: '7', name: 'Quick links (About us / Careers / Motorists)', selector: ['section.highlight:has(.highlight-white)', '.home--wrapper > section.highlight:nth-of-type(6)'], style: null, blocks: ['cards-links'], defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  exxonmobilCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [exxonmobilSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup + section break markers)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

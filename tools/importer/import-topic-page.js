/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroArticleBannerParser from './parsers/hero-article-banner.js';
import secondaryNavParser from './parsers/secondary-nav.js';
import cardsNewsParser from './parsers/cards-news.js';
import heroFeatureParser from './parsers/hero-feature.js';
import cardsBusinessParser from './parsers/cards-business.js';
import quoteParser from './parsers/quote.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsIconLinksParser from './parsers/cards-icon-links.js';
import cardsTopicsParser from './parsers/cards-topics.js';
import tableParser from './parsers/table.js';
import videoParser from './parsers/video.js';

// TRANSFORMER IMPORTS
import exxonmobilCleanupTransformer from './transformers/exxonmobil-cleanup.js';
import exxonmobilSectionsTransformer from './transformers/exxonmobil-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-article-banner': heroArticleBannerParser,
  'secondary-nav': secondaryNavParser,
  'cards-news': cardsNewsParser,
  'hero-feature': heroFeatureParser,
  'cards-business': cardsBusinessParser,
  'quote': quoteParser,
  'columns-media': columnsMediaParser,
  'cards-icon-links': cardsIconLinksParser,
  'cards-topics': cardsTopicsParser,
  'table': tableParser,
  'video': videoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "topic-page",
  "description": "News/community index (landing) pages: photo topic header with H1, then stacked section.topicContainer bands (news collections, feature photo bands, card highlights, pull quotes, media+text, social icon grid, colour CTA bands, Explore more).",
  "representativeUrl": "https://corporate.exxonmobil.com/news",
  "urls": [
    "https://corporate.exxonmobil.com/community",
    "https://corporate.exxonmobil.com/community/investing-in-people",
    "https://corporate.exxonmobil.com/community/royalty-owners",
    "https://corporate.exxonmobil.com/community/stem",
    "https://corporate.exxonmobil.com/community/stem/newsroom",
    "https://corporate.exxonmobil.com/community/stem/teacher-stem-training-program",
    "https://corporate.exxonmobil.com/community/the-fight-against-malaria",
    "https://corporate.exxonmobil.com/community/womens-economic-opportunity",
    "https://corporate.exxonmobil.com/community/worldwide-giving-report",
    "https://corporate.exxonmobil.com/news",
    "https://corporate.exxonmobil.com/news/corporate-news/mergers-and-acquisitions",
    "https://corporate.exxonmobil.com/news/covid-19-exxonmobils-response",
    "https://corporate.exxonmobil.com/news/covid-19-exxonmobils-response/our-communities",
    "https://corporate.exxonmobil.com/news/exxonmobil-and-ukraine",
    "https://corporate.exxonmobil.com/news/news-releases",
    "https://corporate.exxonmobil.com/news/subscribe",
    "https://corporate.exxonmobil.com/news/texas-is-home",
    "https://corporate.exxonmobil.com/news/viewpoints",
    "https://corporate.exxonmobil.com/news/viewpoints/exxonmobil-reducing-greenhouse-gas-emissions",
    "https://corporate.exxonmobil.com/news/viewpoints/houston-ccs-hub"
  ],
  "blocks": [
    {
      "name": "hero-article-banner",
      "instances": [
        "#main-content > section.topicHeader",
        "section.topicHeader"
      ]
    },
    {
      "name": "secondary-nav",
      "instances": [
        "#main-content nav.secondaryNav"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        "div.topic--wrapper section.contentCollection",
        "div.topic--wrapper section.dynamicContentCollection"
      ]
    },
    {
      "name": "hero-feature",
      "instances": [
        "div.topic--wrapper section.variableFeature",
        "div.topic--wrapper section.singleFeature:has(.lazy-bg)"
      ]
    },
    {
      "name": "cards-business",
      "instances": [
        "div.topic--wrapper section.highlight .highlight--content"
      ]
    },
    {
      "name": "quote",
      "instances": [
        "div.topic--wrapper div.pullquote"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "div.topic--wrapper section.shortVideoHeadline"
      ]
    },
    {
      "name": "cards-icon-links",
      "instances": [
        "div.topic--wrapper section.iconGrid .iconGrid--items"
      ]
    },
    {
      "name": "cards-topics",
      "instances": [
        "div.topic--wrapper section.featureGrid--wrapper div.featureGrid--container"
      ]
    },
    {
      "name": "table",
      "instances": [
        "div.topic--wrapper table"
      ]
    },
    {
      "name": "video",
      "instances": [
        "div.topic--wrapper section.articleMedia-video"
      ]
    }
  ],
  "sections": [
    {
      "id": "t1",
      "name": "Topic header",
      "selector": [
        "#main-content > section.topicHeader",
        "section.topicHeader"
      ],
      "style": null,
      "blocks": [
        "hero-article-banner",
        "secondary-nav"
      ],
      "defaultContent": []
    },
    {
      "id": "t2",
      "name": "Topic sections (each div.topic--wrapper > section.topicContainer is its own section; style from its component colour - handled generically by exxonmobil-sections.js)",
      "selector": [
        "div.topic--wrapper > section.topicContainer"
      ],
      "style": null,
      "blocks": [
        "cards-news",
        "hero-feature",
        "cards-business",
        "quote",
        "columns-media",
        "cards-icon-links",
        "cards-topics",
        "table",
        "video"
      ],
      "defaultContent": [
        "div.topic--wrapper section.rich-text",
        "div.topic--wrapper section.singleFeature:not(:has(.lazy-bg))",
        "div.topic--wrapper .featureGrid--section-title",
        "div.topic--wrapper .highlight--header"
      ]
    }
  ]
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

    // 6. Sanitized path; root URL maps to /index.
    // Translations (?content-lang=es|fr) go under a language folder prefix, e.g. /es/greenpoint
    const sourceUrl = new URL(params.originalURL);
    const lang = sourceUrl.searchParams.get('content-lang');
    let rawPath = sourceUrl.pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    if (lang === 'es' || lang === 'fr') rawPath = `/${lang}${rawPath || '/index'}`;
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

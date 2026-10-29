/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsBusinessParser from './parsers/cards-business.js';
import tableBenefitsParser from './parsers/table-benefits.js';
import columnsMediaParser from './parsers/columns-media.js';
import columnsAppDownloadParser from './parsers/columns-app-download.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import accordionLegalParser from './parsers/accordion-legal.js';

// TRANSFORMER IMPORTS
import exxonmobilCleanupTransformer from './transformers/exxonmobil-cleanup.js';
import exxonmobilSectionsTransformer from './transformers/exxonmobil-sections.js';
import exxonmobilfuelsCleanupTransformer from './transformers/exxonmobilfuels-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'cards-business': cardsBusinessParser,
  'table-benefits': tableBenefitsParser,
  'columns-media': columnsMediaParser,
  'columns-app-download': columnsAppDownloadParser,
  'accordion-faq': accordionFaqParser,
  'accordion-legal': accordionLegalParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "rewards",
  "urls": [
    "https://www.exxonmobilfuels.com/en/rewards/frequent-filler"
  ],
  "representativeUrl": "https://www.exxonmobilfuels.com/en/rewards/frequent-filler",
  "description": "ExxonMobil fuels rewards program page (exxonmobilfuels.com) migrated under /rewards",
  "blocks": [
    {
      "name": "cards-business",
      "instances": [
        "ul.l01-list.list-3-up",
        "#content ul.l01-list"
      ]
    },
    {
      "name": "table-benefits",
      "instances": [
        "div.ibo-chart.ibo-chart-desktop",
        ".ibo-chart-desktop"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "div.f01-featured-item.featured-title-split-left"
      ]
    },
    {
      "name": "columns-app-download",
      "instances": [
        "div.sp07-app-promotion",
        "div.app-promotion"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "div.c01-accordion:has(#accordion-24)",
        "div.c01-accordion:not(:has(.show))"
      ]
    },
    {
      "name": "accordion-legal",
      "instances": [
        "div.c01-accordion:has(#accordion-28)",
        "div.c01-accordion:has(.show)"
      ]
    }
  ],
  "urlPattern": "/en/rewards/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Intro: title, hero image, join CTA, 3-up explainer",
      "selector": [
        "div.component.t01-screen-title",
        "#content div.t01-screen-title"
      ],
      "style": null,
      "blocks": [
        "cards-business"
      ],
      "defaultContent": [
        "div.t01-screen-title",
        "div.b06-heading",
        "div.b01-paragraph",
        "div.sp05-button-bar"
      ]
    },
    {
      "id": "section-2",
      "name": "Benefits stacking chart",
      "selector": [
        "ul.l01-list ~ div.b06-heading"
      ],
      "style": null,
      "blocks": [
        "table-benefits"
      ],
      "defaultContent": [
        "div.b06-heading",
        "div.b01-paragraph"
      ]
    },
    {
      "id": "section-3",
      "name": "In-store points boost feature",
      "selector": [
        "div.f01-featured-item.featured-title-split-left"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "App download promo",
      "selector": [
        "div.sp07-app-promotion"
      ],
      "style": "light-grey",
      "blocks": [
        "columns-app-download"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "Frequently asked questions",
      "selector": [
        "div.sp07-app-promotion ~ div.b06-heading"
      ],
      "style": null,
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [
        "div.b06-heading",
        "div.b01-paragraph"
      ]
    },
    {
      "id": "section-6",
      "name": "FAQ page callout",
      "selector": [
        "div.f01-featured-item:not(.featured-title-split-left)"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        "div.f01-featured-item:not(.featured-title-split-left)"
      ]
    },
    {
      "id": "section-7",
      "name": "Legal disclaimers",
      "selector": [
        "div.f01-featured-item:not(.featured-title-split-left) ~ div.b06-heading"
      ],
      "style": null,
      "blocks": [
        "accordion-legal"
      ],
      "defaultContent": [
        "div.b06-heading"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  exxonmobilfuelsCleanupTransformer,
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
    let rawPath = sourceUrl.pathname.replace(/^\/en(?=\/)/, '')
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

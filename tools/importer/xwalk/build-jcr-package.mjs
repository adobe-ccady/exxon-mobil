/* eslint-disable */
// Converts migrated EDS content (content/*.plain.html) into an AEM (xwalk) FileVault content package.
// Usage: node tools/importer/xwalk/build-jcr-package.mjs [outDir] [pages=nav,footer]
import fs from 'node:fs';
import path from 'node:path';

const NM = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules';
const { JSDOM } = await import(`${NM}/jsdom/lib/api.js`);
const { html2md } = await import(`${NM}/@adobe/helix-importer/src/index.js`);
const { md2jcr } = await import(`${NM}/@adobe/helix-md2jcr/src/index.js`);
const JSZip = (await import(`${NM}/jszip/lib/index.js`)).default;
const DOMUtils = (await import(`${NM}/@adobe/helix-importer/src/utils/DOMUtils.js`)).default;
// keep section breaks (<hr>) and Universal Editor field hints (<!-- field:x -->)
const origRemove = DOMUtils.remove.bind(DOMUtils);
DOMUtils.remove = (doc, sels) => origRemove(doc, sels.filter((s) => s !== 'hr'));
DOMUtils.removeComments = (doc) => {
  const FIELD_HINT = /^\s*field:/;
  const walker = doc.createTreeWalker(doc.body, 128);
  const drop = [];
  while (walker.nextNode()) if (!FIELD_HINT.test(walker.currentNode.data)) drop.push(walker.currentNode);
  drop.forEach((c) => c.remove());
};

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const OUT = process.argv[2] || path.join(REPO, 'migration-work/aem-package');
const PAGES = (process.argv[3] || 'nav,footer').split(',');
const SITE_PATH = '/content/exxon-mobil';
const LIVE_ORIGIN = 'https://main--exxon-mobil--adobe-ccady.aem.live';

const components = {
  models: JSON.parse(fs.readFileSync(`${REPO}/component-models.json`, 'utf8')),
  definition: JSON.parse(fs.readFileSync(`${REPO}/component-definition.json`, 'utf8')),
  filters: JSON.parse(fs.readFileSync(`${REPO}/component-filters.json`, 'utf8')),
};

const toTitle = (cls) => cls.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

// .plain.html (sections as divs, blocks as div.name) -> importer DOM (sections split by <hr>, blocks as tables)
function toImporterHtml(plain, page) {
  const { document } = new JSDOM(`<body>${plain}</body>`).window;
  if (page === 'nav') {
    // brand logo: author as a text link; the header block renders the logo from code
    const brandLink = document.querySelector('body > div:first-child a');
    const brandImg = brandLink?.querySelector('img');
    if (brandImg) brandLink.textContent = brandImg.getAttribute('alt') || 'ExxonMobil';
  }
  // <sup>/<sub> wrappers in headings carry no meaning and get lost in conversion
  document.querySelectorAll('h1 sup, h2 sup, h3 sup, h1 sub, h2 sub, h3 sub').forEach((s) => s.replaceWith(...s.childNodes));
  // drop empty trailing sections
  [...document.body.children].forEach((s) => { if (!s.textContent.trim() && !s.querySelector('img')) s.remove(); });
  // repo-relative assets (../icons/x.svg, images/x.png) -> absolute URLs on the EDS site
  document.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (/^https?:/.test(src)) return;
    const base = `${LIVE_ORIGIN}/content/${page}`;
    img.setAttribute('src', new URL(src, base).href.replace('/content/images/', '/content/images/'));
  });
  const sections = [...document.body.children];
  const parts = sections.map((section) => {
    [...section.querySelectorAll(':scope > div[class]')].forEach((block) => {
      const table = document.createElement('table');
      const head = table.insertRow();
      const th = document.createElement('th');
      th.textContent = toTitle(block.classList[0]);
      head.append(th);
      [...block.children].forEach((row) => {
        const tr = table.insertRow();
        [...row.children].forEach((cell) => {
          const td = tr.insertCell();
          td.innerHTML = cell.innerHTML;
        });
      });
      th.colSpan = Math.max(1, ...[...table.rows].slice(1).map((r) => r.cells.length));
      block.replaceWith(table);
    });
    return section.innerHTML;
  });
  return `<html><body><main>${parts.join('<hr>')}</main></body></html>`;
}

// Title components hold plain text only: headings containing links become Text components
function fixLinkedTitles(xml) {
  let n = 0;
  return xml.replace(/<(title(?:_\d+)?) sling:resourceType="core\/franklin\/components\/title\/v1\/title" jcr:primaryType="nt:unstructured" title="([^"]*&lt;a [^"]*)" titleType="(h[1-6])"\/>/g,
    (m, name, title, level) => {
      n += 1;
      return `<text_heading_${n} sling:resourceType="core/franklin/components/text/v1/text" jcr:primaryType="nt:unstructured" text="&lt;${level}&gt;${title}&lt;/${level}&gt;"/>`;
    });
}

// md2jcr writes every columns block as plain "Columns"; restore variant names (e.g. Columns Stock Ticker)
function nameColumnsVariants(xml, plain) {
  const { document } = new JSDOM(`<body>${plain}</body>`).window;
  const variants = [...document.querySelectorAll('div[class^="columns"]')].map((b) => b.classList[0]);
  let i = 0;
  return xml.replace(/<(columns(?:_\d+)?) sling:resourceType="core\/franklin\/components\/columns\/v1\/columns"/g, (m, name) => {
    const variant = variants[i];
    i += 1;
    if (!variant || variant === 'columns') return m;
    return `${m} name="${toTitle(variant)}" model="${variant}" filter="${variant}"`;
  });
}

const createDocumentFromString = (html) => new JSDOM(html).window.document;
const results = {};
for (const page of PAGES) {
  const plain = fs.readFileSync(`${REPO}/content/${page}.plain.html`, 'utf8');
  const html = toImporterHtml(plain, page);
  const doc = createDocumentFromString(html);
  const { md } = await html2md(`https://corporate.exxonmobil.com/${page}`, doc, {
    transform: ({ document }) => [{ element: document.querySelector('main'), path: `/${page}` }],
  }, { createDocumentFromString, setBackgroundImagesFromCSS: false });
  const titles = { nav: 'Navigation', footer: 'Footer', index: 'ExxonMobil' };
  let xml = (await md2jcr(md, components)).toString();
  if (!/<jcr:content [^>]*jcr:title=/.test(xml)) {
    xml = xml.replace('<jcr:content ', `<jcr:content jcr:title="${titles[page] || page}" `);
  }
  xml = fixLinkedTitles(xml);
  xml = nameColumnsVariants(xml, plain);
  fs.mkdirSync(`${OUT}/md`, { recursive: true });
  fs.writeFileSync(`${OUT}/md/${page}.md`, md);
  results[page] = xml;
}

// FileVault package
const zip = new JSZip();
const filters = [];
for (const [page, xml] of Object.entries(results)) {
  const jcrPath = `${SITE_PATH}/${page}`;
  filters.push(jcrPath);
  zip.file(`jcr_root${jcrPath}/.content.xml`, xml);
  fs.mkdirSync(`${OUT}/jcr${jcrPath}`, { recursive: true });
  fs.writeFileSync(`${OUT}/jcr${jcrPath}/.content.xml`, xml);
}
zip.file('META-INF/vault/filter.xml', `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
${filters.map((f) => `  <filter root="${f}"/>`).join('\n')}
</workspaceFilter>
`);
const now = new Date().toISOString();
zip.file('META-INF/vault/properties.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <comment>FileVault Package Properties</comment>
  <entry key="name">exxon-mobil-content</entry>
  <entry key="group">my_packages</entry>
  <entry key="version">1.0.0</entry>
  <entry key="packageType">content</entry>
  <entry key="description">ExxonMobil migrated content: ${PAGES.join(', ')}</entry>
  <entry key="created">${now}</entry>
  <entry key="createdBy">migration</entry>
</properties>
`);
const buf = await zip.generateAsync({ type: 'nodebuffer' });
fs.writeFileSync(`${OUT}/exxon-mobil-content.zip`, buf);
console.log('pages:', Object.keys(results).join(', '), 'package bytes:', buf.length);

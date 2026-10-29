import { loadCSS } from '../../scripts/aem.js';

const HEADING = 'h1, h2, h3, h4, h5, h6';

/**
 * The two cells of a one-row, two-column block, or null for any other shape.
 * @param {Element} block The block element
 * @returns {Element[]|null}
 */
function twoCells(block) {
  const rows = [...block.children];
  if (rows.length !== 1 || rows[0].children.length !== 2) return null;
  return [...rows[0].children];
}

/**
 * A cell holding only a picture (and at most a short caption or video link).
 * @param {Element} cell The column cell
 * @param {number} maxText Longest text the cell may carry
 * @returns {boolean}
 */
function isImageCell(cell, maxText) {
  return !!cell.querySelector('picture, img')
    && !cell.querySelector(HEADING)
    && cell.textContent.trim().length < maxText;
}

/** [heading] | [share price, change, timestamp] */
function isStockTicker(block) {
  const cells = twoCells(block);
  if (!cells) return false;
  const [label, figures] = cells;
  const price = figures.querySelector('p');
  return !!label.querySelector(HEADING)
    && !!price && /^\$\s?\d[\d,]*(\.\d+)?$/.test(price.textContent.trim());
}

/** [heading, store badge image links] | [QR code], in either order */
function isAppDownload(block) {
  const cells = twoCells(block);
  if (!cells) return false;
  const qr = cells.find((cell) => isImageCell(cell, 80) && !cell.querySelector('a[href]'));
  const body = cells.find((cell) => cell !== qr);
  return !!qr && !!body.querySelector(HEADING)
    && [...body.querySelectorAll('a[href]')].some((a) => a.querySelector('picture, img'));
}

/** [tag link, content type] | [page H1, description] */
function isArticleHeader(block) {
  const cells = twoCells(block);
  if (!cells) return false;
  const [meta, title] = cells;
  return !!title.querySelector('h1') && !meta.querySelector(`${HEADING}, picture, img`);
}

/** [image] | [heading, text, link], in either order */
function isMedia(block) {
  const cells = twoCells(block);
  if (!cells) return false;
  const image = cells.find((cell) => isImageCell(cell, 120));
  const body = cells.find((cell) => cell !== image);
  return !!image && !!body.querySelector(HEADING);
}

/*
 * Converting a page for AEM keeps only the Columns component for every columns-* block,
 * so imported content arrives as a plain Columns block (a block added in Universal Editor
 * keeps its own name). Each variant is recognised by its content; first match wins.
 */
const VARIANTS = [
  ['columns-stock-ticker', isStockTicker],
  ['columns-app-download', isAppDownload],
  ['columns-article-header', isArticleHeader],
  ['columns-media', isMedia],
];

/**
 * Renders a plain Columns block with the columns-* variant block it was imported from.
 * @param {Element} block The block element
 * @param {string} name The variant block name
 */
async function decorateAs(block, name) {
  block.classList.replace('columns', name);
  block.parentElement?.classList.replace('columns-wrapper', `${name}-wrapper`);
  block.closest('.section')?.classList.add(`${name}-container`);
  const [, { default: decorateVariant }] = await Promise.all([
    loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`),
    import(`../${name}/${name}.js`),
  ]);
  await decorateVariant(block);
}

export default async function decorate(block) {
  const variant = VARIANTS.find(([, matches]) => matches(block));
  if (variant) {
    await decorateAs(block, variant[0]);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}

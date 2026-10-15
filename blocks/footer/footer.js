import { getMetadata } from '../../scripts/aem.js';

/**
 * Loads the footer fragment: the `footer` page metadata when set, otherwise /footer.
 * Pages served from a /content/ folder (local import preview) try /content/footer first.
 * @returns {Promise<{doc: Document, base: string}|null>}
 */
async function fetchFooterFragment() {
  const footerMeta = getMetadata('footer');
  const candidates = footerMeta ? [new URL(footerMeta, window.location).pathname] : [];
  if (window.location.pathname.startsWith('/content/')) candidates.push('/content/footer');
  candidates.push('/footer');
  let resp;
  // eslint-disable-next-line no-restricted-syntax
  for (const footerPath of candidates) {
    // eslint-disable-next-line no-await-in-loop
    resp = await fetch(`${footerPath.replace(/(\.plain)?\.html$/, '')}.plain.html`);
    if (resp.ok) break;
  }
  if (!resp?.ok) return null;
  const html = await resp.text();
  // parse into an inert document so relative image paths are not requested
  // against the page URL before they are rebased onto the fragment URL
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return { doc, base: resp.url };
}

/**
 * Rebases relative src attributes onto the fragment URL so the footer
 * renders the same on every page depth.
 * @param {Element} root
 * @param {string} base
 */
function rebaseImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
}

/**
 * @param {Element} group a list or paragraph
 * @returns {boolean} true if every link in the group is image-only
 */
function isImageLinkGroup(group) {
  const links = [...group.querySelectorAll('a')];
  return links.length > 0 && links.every((a) => a.querySelector('img') && !a.textContent.trim());
}

/**
 * Image links carry a base image and an optional hover image.
 * Exposes the base image alt as the link's accessible name.
 * @param {Element} group
 */
function decorateImageLinks(group) {
  group.querySelectorAll('a').forEach((a) => {
    const [base, hover] = a.querySelectorAll('img');
    if (base) {
      base.classList.add('icon-base');
      if (base.alt) a.setAttribute('aria-label', base.alt);
      base.alt = '';
    }
    if (hover) {
      hover.classList.add('icon-hover');
      hover.alt = '';
    }
  });
}

/**
 * Normalizes a group of links into a list with one link per item.
 * @param {Element} group a list or paragraph
 */
function toList(group) {
  if (group.tagName === 'UL' || group.tagName === 'OL') return group;
  const ul = document.createElement('ul');
  group.querySelectorAll('a').forEach((a) => {
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  return ul;
}

/**
 * Builds one footer band from a fragment section.
 * The first band holds primary links + social icons,
 * later bands hold brand logos, legal links and copyright.
 * @param {Element} section
 * @param {boolean} isFirst
 * @returns {Element}
 */
function buildBand(section, isFirst) {
  const band = document.createElement('section');
  band.className = isFirst ? 'footer-top' : 'footer-bottom';
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  band.append(inner);

  let legalWrap;
  [...section.children].forEach((group) => {
    const hasLinks = !!group.querySelector('a');
    if (!hasLinks) {
      // plain text paragraph: copyright / notice
      group.classList.add('footer-copyright');
      if (!legalWrap) {
        legalWrap = document.createElement('div');
        legalWrap.className = 'footer-legal-wrap';
        inner.append(legalWrap);
      }
      legalWrap.append(group);
      return;
    }
    if (isImageLinkGroup(group)) {
      const list = toList(group);
      list.classList.add(isFirst ? 'footer-social' : 'footer-brands');
      decorateImageLinks(list);
      inner.append(list);
      return;
    }
    const list = toList(group);
    if (isFirst) {
      list.classList.add('footer-links');
      inner.append(list);
    } else {
      list.classList.add('footer-legal');
      if (!legalWrap) {
        legalWrap = document.createElement('div');
        legalWrap.className = 'footer-legal-wrap';
        inner.append(legalWrap);
      }
      legalWrap.prepend(list);
    }
  });
  return band;
}

/**
 * Links pointing at #privacy-center open the consent manager's
 * preference center when one is present on the page (OneTrust).
 * @param {Element} block
 */
function bindConsentLinks(block) {
  block.querySelectorAll('a[href="#privacy-center"]').forEach((a) => {
    a.setAttribute('role', 'button');
    a.addEventListener('click', (e) => {
      const { OneTrust } = window;
      if (OneTrust && typeof OneTrust.ToggleInfoDisplay === 'function') {
        e.preventDefault();
        OneTrust.ToggleInfoDisplay();
      }
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;

  const { doc, base } = fragment;
  rebaseImages(doc.body, base);
  const sections = [...doc.body.children].filter((el) => el.tagName === 'DIV');
  const wrapper = document.createElement('div');
  wrapper.className = 'footer-bands';
  sections.forEach((section, i) => {
    wrapper.append(buildBand(document.adoptNode(section), i === 0));
  });

  block.append(wrapper);
  bindConsentLinks(block);
}

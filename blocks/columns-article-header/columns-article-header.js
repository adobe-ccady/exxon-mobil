const ICONS = {
  share: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="18" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="19" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  print: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
};

/**
 * Returns the authored items of a cell; Universal Editor groups rich text into one
 * editable wrapper, in which case the items are read from inside it.
 * @param {Element} cell The column cell
 * @returns {Element} The element holding the items
 */
function contentOf(cell) {
  const richtext = cell.querySelector(':scope > [data-aue-type="richtext"]');
  return richtext && cell.children.length === 1 ? richtext : cell;
}

/**
 * Builds a share link list for the current page.
 * @returns {Array<{label: string, href: string}>}
 */
function shareTargets() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  return [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${url}&text=${title}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: 'Email', href: `mailto:?subject=${title}&body=${url}` },
  ];
}

/**
 * Builds the share and print tools (functional, not authored).
 * @returns {Element}
 */
function buildTools() {
  const tools = document.createElement('div');
  tools.className = 'columns-article-header-tools';

  const share = document.createElement('div');
  share.className = 'columns-article-header-share';

  const shareButton = document.createElement('button');
  shareButton.type = 'button';
  shareButton.className = 'columns-article-header-share-button';
  shareButton.setAttribute('aria-label', 'Share');
  shareButton.setAttribute('aria-expanded', 'false');
  shareButton.innerHTML = ICONS.share;

  const panel = document.createElement('div');
  panel.className = 'columns-article-header-share-panel';
  panel.hidden = true;
  const list = document.createElement('ul');
  shareTargets().forEach(({ label, href }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (!href.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    li.append(a);
    list.append(li);
  });
  const copyLi = document.createElement('li');
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy link';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copy.textContent = 'Link copied';
    } catch { /* clipboard unavailable */ }
  });
  copyLi.append(copy);
  list.append(copyLi);
  panel.append(list);

  const setOpen = (open) => {
    panel.hidden = !open;
    shareButton.setAttribute('aria-expanded', String(open));
  };
  shareButton.addEventListener('click', () => setOpen(panel.hidden));
  share.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      shareButton.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !share.contains(e.target)) setOpen(false);
  });
  share.append(shareButton, panel);

  const print = document.createElement('button');
  print.type = 'button';
  print.className = 'columns-article-header-print';
  print.setAttribute('aria-label', 'Print');
  print.innerHTML = ICONS.print;
  print.addEventListener('click', () => window.print());

  tools.append(share, print);
  return tools;
}

/**
 * Article header: one row, two cells.
 * Cell 1: metadata rail (tag link, content type, date). Cell 2: title (h1) and intro.
 * Share and print tools are added by code.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cols = [...row.children];
  block.classList.add(`columns-article-header-${cols.length}-cols`);

  // a single cell holds only the title: add an empty rail so tools still render
  let [meta, content] = cols;
  if (cols.length === 1) {
    content = meta;
    meta = document.createElement('div');
    row.prepend(meta);
  }

  meta.classList.add('columns-article-header-meta');
  const metaItems = [...contentOf(meta).children];
  const textRoles = ['type', 'date'];
  let tagFound = false;
  metaItems.forEach((item) => {
    if (!item.textContent.trim()) return;
    if (!tagFound && item.querySelector('a[href]')) {
      tagFound = true;
      item.classList.add('columns-article-header-tag');
      return;
    }
    const role = textRoles.shift();
    if (role) item.classList.add(`columns-article-header-${role}`);
  });
  meta.append(buildTools());

  if (content) {
    content.classList.add('columns-article-header-content');
    const items = contentOf(content);
    const title = items.querySelector('h1, h2, h3, h4, h5, h6');
    if (title) title.classList.add('columns-article-header-title');
    const intro = [...items.children].find((el) => el.tagName === 'P' && el.textContent.trim());
    if (intro) intro.classList.add('columns-article-header-intro');
  }

  // additional authored rows are kept but marked so they can be laid out gracefully
  [...block.children].slice(1).forEach((extra) => extra.classList.add('columns-article-header-extra'));
}

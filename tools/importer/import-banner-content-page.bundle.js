/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-banner-content-page.js
  var import_banner_content_page_exports = {};
  __export(import_banner_content_page_exports, {
    default: () => import_banner_content_page_default
  });

  // tools/importer/parsers/hero-article-banner.js
  var DEFAULT_ORIGIN = "https://corporate.exxonmobil.com";
  function clean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function getOrigin(document2, ctx) {
    const candidates = [];
    if (ctx && ctx.params && ctx.params.originalURL) candidates.push(ctx.params.originalURL);
    if (ctx && ctx.url) candidates.push(ctx.url);
    const canonical = document2.querySelector('link[rel="canonical"]');
    if (canonical) candidates.push(canonical.getAttribute("href"));
    const ogUrl = document2.querySelector('meta[property="og:url"]');
    if (ogUrl) candidates.push(ogUrl.getAttribute("content"));
    for (let i = 0; i < candidates.length; i += 1) {
      try {
        const u = new URL(candidates[i]);
        if (/^https?:$/.test(u.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) return u.origin;
      } catch (e) {
      }
    }
    return DEFAULT_ORIGIN;
  }
  function absolute(src, origin) {
    const s = (src || "").trim();
    if (!s) return "";
    try {
      return new URL(s, `${origin}/`).href;
    } catch (e) {
      return s;
    }
  }
  function usable(src) {
    const s = (src || "").trim();
    return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : "";
  }
  function largestFromSrcset(srcset) {
    let best = "";
    let bestSize = -1;
    (srcset || "").split(",").forEach((part) => {
      const [url, desc] = part.trim().split(/\s+/);
      if (!usable(url)) return;
      let size = 0;
      const m = (desc || "").match(/^([\d.]+)([wx])$/i);
      if (m) size = parseFloat(m[1]) * (m[2].toLowerCase() === "x" ? 1e4 : 1);
      if (size >= bestSize) {
        best = url;
        bestSize = size;
      }
    });
    return best;
  }
  function bannerSource(element) {
    const img = element.querySelector("img.articleHeader--image") || element.querySelector("picture img, img");
    const holders = [element, ...element.querySelectorAll("[data-desktop]")];
    for (let i = 0; i < holders.length; i += 1) {
      const d = usable(holders[i].getAttribute("data-desktop"));
      if (d) return { src: d, img };
    }
    const sources = [...element.querySelectorAll("picture source")].map((s) => {
      const url = largestFromSrcset(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      const m = (s.getAttribute("media") || "").match(/min-width:\s*(\d+)/);
      return { url, min: m ? parseInt(m[1], 10) : -1 };
    }).filter((s) => s.url && s.min >= 0).sort((a, b) => b.min - a.min);
    if (sources.length) return { src: sources[0].url, img };
    if (img) {
      const s = usable(img.getAttribute("data-src")) || largestFromSrcset(img.getAttribute("data-srcset")) || usable(img.getAttribute("src")) || largestFromSrcset(img.getAttribute("srcset"));
      if (s) return { src: s, img };
    }
    return { src: "", img };
  }
  function topicHeaderText(element, document2) {
    const out = [];
    const content = element.querySelector(".header--content");
    if (!content) return out;
    const eyebrow = content.querySelector(".eyebrow");
    if (eyebrow && clean(eyebrow.textContent)) {
      const p = document2.createElement("p");
      p.textContent = clean(eyebrow.textContent);
      out.push(p);
    }
    const title = content.querySelector(".header--title") || content.querySelector("h1, h2");
    if (title && clean(title.textContent)) {
      const h1 = document2.createElement("h1");
      h1.textContent = clean(title.textContent);
      out.push(h1);
    }
    const desc = content.querySelector(".header--description");
    if (desc && clean(desc.textContent)) {
      const blocks = [...desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol")].filter((b) => clean(b.textContent));
      if (blocks.length) out.push(...blocks);
      else {
        const p = document2.createElement("p");
        p.textContent = clean(desc.textContent);
        out.push(p);
      }
    }
    [...content.querySelectorAll("a.button")].filter((a) => !(desc && desc.contains(a)) && clean(a.textContent)).forEach((src) => {
      const a = document2.createElement("a");
      a.href = src.getAttribute("href") || "";
      a.textContent = clean(src.textContent);
      const strong = document2.createElement("strong");
      strong.append(a);
      const p = document2.createElement("p");
      p.append(strong);
      out.push(p);
    });
    return out;
  }
  function parseTopicHeader(element, document2, origin) {
    const variants = element.classList.contains("header-small") ? [] : ["large"];
    const { src, img: srcImg } = bannerSource(element);
    const text = topicHeaderText(element, document2);
    if (!src && !text.length) {
      element.remove();
      return;
    }
    let imageCell = "";
    if (src) {
      const img = document2.createElement("img");
      img.src = absolute(src, origin);
      img.alt = srcImg ? clean(srcImg.getAttribute("alt")) : "";
      const picture = document2.createElement("picture");
      picture.append(img);
      imageCell = [document2.createComment(" field:image "), picture];
    }
    const cells = [
      [imageCell],
      [text.length ? [document2.createComment(" field:text "), ...text] : [document2.createComment(" field:text ")]]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-article-banner", variants, cells });
    element.replaceWith(block);
  }
  function parse(element, { document: document2 }) {
    const ctx = arguments[1] || {};
    const origin = getOrigin(document2, ctx);
    if (element.matches("section.topicHeader")) {
      parseTopicHeader(element, document2, origin);
      return;
    }
    const variants = element.classList.contains("articleHeader-small") ? [] : ["large"];
    const { src, img: srcImg } = bannerSource(element);
    if (!src) {
      element.remove();
      return;
    }
    const img = document2.createElement("img");
    img.src = absolute(src, origin);
    img.alt = srcImg ? clean(srcImg.getAttribute("alt")) : "";
    const picture = document2.createElement("picture");
    picture.append(img);
    const cells = [
      [[document2.createComment(" field:image "), picture]],
      [[document2.createComment(" field:text ")]]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-article-banner", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/secondary-nav.js
  function clean2(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function parse2(element, { document: document2 }) {
    let anchors = [...element.querySelectorAll("li.secondaryNav--item a[href]")];
    if (!anchors.length) anchors = [...element.querySelectorAll("a.secondaryNav--link[href], li a[href]")];
    anchors = anchors.filter((a, i) => anchors.indexOf(a) === i);
    const ul = document2.createElement("ul");
    anchors.forEach((a) => {
      const href = (a.getAttribute("href") || "").trim();
      const span = a.querySelector(".secondaryNav--link-text");
      const text = clean2(span ? span.textContent : a.textContent);
      if (!href || !text || /^javascript:/i.test(href)) return;
      const li = document2.createElement("li");
      const link = document2.createElement("a");
      link.setAttribute("href", href);
      link.textContent = text;
      li.append(link);
      ul.append(li);
    });
    if (!ul.children.length) {
      element.remove();
      return;
    }
    const cells = [
      [[document2.createComment(" field:links "), ul]]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "secondary-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-article-header.js
  function clean3(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse3(element, { document: document2 }) {
    const meta = element.querySelector(".articleHeader--metadata") || element;
    const content = element.querySelector(".articleHeader--content") || element;
    const metaCell = [];
    const tag = meta.querySelector(".tag");
    if (tag && clean3(tag.textContent)) {
      const p = document2.createElement("p");
      const tagLink = tag.querySelector("a[href]");
      if (tagLink) {
        const a = document2.createElement("a");
        a.href = tagLink.getAttribute("href");
        a.textContent = clean3(tagLink.textContent);
        p.append(a);
      } else {
        p.textContent = clean3(tag.textContent);
      }
      metaCell.push(p);
    }
    [".content-type", ".date"].forEach((sel) => {
      const el = meta.querySelector(sel);
      const text = el ? clean3(el.textContent) : "";
      if (!text) return;
      const p = document2.createElement("p");
      p.textContent = text;
      metaCell.push(p);
    });
    const contentCell = [];
    const titleEl = content.querySelector(".articleHeader--title, h1, h2");
    const title = titleEl ? clean3(titleEl.textContent) : "";
    if (title) {
      const h1 = document2.createElement("h1");
      h1.textContent = title;
      contentCell.push(h1);
    }
    const descEl = content.querySelector(".articleHeader--description");
    const desc = descEl ? clean3(descEl.textContent) : "";
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc;
      contentCell.push(p);
    }
    if (!metaCell.length && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[metaCell.length ? metaCell : "", contentCell.length ? contentCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-article-header", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-topics.js
  function getImage(item, document2, alt) {
    const holder = item.querySelector(".keytopics--image, .lazy-image, article");
    const existing = item.querySelector(".keytopics--image img, picture img");
    if (existing && !/[?&]w=40\b/.test(existing.getAttribute("src") || "")) return existing;
    let src = holder ? holder.getAttribute("data-desktop") || holder.getAttribute("data-tablet") || holder.getAttribute("data-mobile") : null;
    if (!src && existing) src = existing.getAttribute("src");
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = src;
    img.alt = alt || "";
    return img;
  }
  function clean4(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parseFeatureGridItem(item, document2) {
    const link = item.querySelector("a.featureGrid--link") || item.querySelector("a[href]:not(.tag a)");
    const href = link ? link.getAttribute("href") : null;
    const titleEl = item.querySelector(".featureGrid--title");
    const title = titleEl ? clean4(titleEl.textContent) : "";
    let img = null;
    const srcImg = item.querySelector("img.featureGrid--image, picture img, img");
    if (srcImg && srcImg.getAttribute("src")) {
      img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || title;
    }
    const textContent = [];
    if (title) {
      const h = document2.createElement("h3");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = title;
        h.append(a);
      } else {
        h.textContent = title;
      }
      textContent.push(h);
    }
    const descEl = item.querySelector(".featureGrid--description");
    const desc = descEl ? clean4(descEl.textContent) : "";
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc;
      textContent.push(p);
    }
    const info = item.querySelector(".article--info");
    if (info) {
      const tag = info.querySelector(".tag");
      if (tag && clean4(tag.textContent)) {
        const p = document2.createElement("p");
        const tagLink = tag.querySelector("a[href]");
        if (tagLink) {
          const a = document2.createElement("a");
          a.href = tagLink.getAttribute("href");
          a.textContent = clean4(tagLink.textContent);
          p.append(a);
        } else {
          p.textContent = clean4(tag.textContent);
        }
        textContent.push(p);
      }
      const type = clean4((info.querySelector(".content-type") || {}).textContent);
      const date = clean4((info.querySelector(".date") || {}).textContent);
      const meta = [type, date].filter(Boolean).join(" \u2022 ");
      if (meta) {
        const p = document2.createElement("p");
        p.textContent = meta;
        textContent.push(p);
      }
    }
    if (!img && !textContent.length) return null;
    return [
      img ? [document2.createComment(" field:image "), img] : "",
      textContent.length ? [document2.createComment(" field:text "), ...textContent] : ""
    ];
  }
  function parse4(element, { document: document2 }) {
    const cells = [];
    const gridItems = [...element.querySelectorAll(".featureGrid--item")];
    if (gridItems.length) {
      gridItems.forEach((item) => {
        const row = parseFeatureGridItem(item, document2);
        if (row) cells.push(row);
      });
    }
    const items = gridItems.length ? [] : [...element.querySelectorAll(".keytopics--item")];
    items.forEach((item) => {
      const link = item.querySelector("a.keytopics--link") || item.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const titleEl = item.querySelector(".keytopics--title, h3, h4");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const img = getImage(item, document2, title);
      const textContent = [];
      if (title) {
        const h = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          h.append(a);
        } else {
          h.textContent = title;
        }
        textContent.push(h);
      }
      const tag = item.querySelector(".article--info .tag, .tag");
      if (tag && tag.textContent.trim()) {
        const p = document2.createElement("p");
        const tagLink = tag.querySelector("a");
        if (tagLink) p.append(tagLink);
        else p.textContent = tag.textContent.trim();
        textContent.push(p);
      }
      if (!img && !textContent.length) return;
      cells.push([
        img ? [document2.createComment(" field:image "), img] : "",
        textContent.length ? [document2.createComment(" field:text "), ...textContent] : ""
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-topics", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table.js
  var MAX_COLS = 11;
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["P", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE"]);
  function isCell(n) {
    return n.tagName === "TD" || n.tagName === "TH";
  }
  function directRows(table) {
    const rows = [];
    const children = [...table.children];
    children.filter((c) => c.tagName === "THEAD").forEach((s) => rows.push(...[...s.children].filter((c) => c.tagName === "TR")));
    children.forEach((child) => {
      if (child.tagName === "TBODY") rows.push(...[...child.children].filter((c) => c.tagName === "TR"));
      else if (child.tagName === "TR") rows.push(child);
    });
    children.filter((c) => c.tagName === "TFOOT").forEach((s) => rows.push(...[...s.children].filter((c) => c.tagName === "TR")));
    return rows;
  }
  function hasText(node) {
    return (node.textContent || "").replace(/[\s ]+/g, "").length > 0;
  }
  function isBlank(n) {
    return n.nodeType === 8 || n.nodeType === 3 && !n.textContent.replace(/ /g, " ").trim() || n.nodeName === "BR";
  }
  function cleanCell(container, document2) {
    container.querySelectorAll("script, style, noscript").forEach((n) => n.remove());
    container.querySelectorAll("a").forEach((a) => {
      if (!hasText(a) && !a.querySelector("img")) a.remove();
    });
    container.querySelectorAll("div, font, section, article, center, span").forEach((el) => {
      el.replaceWith(...el.childNodes);
    });
    container.querySelectorAll("b, i").forEach((el) => {
      const repl = document2.createElement(el.tagName === "B" ? "strong" : "em");
      repl.append(...el.childNodes);
      el.replaceWith(repl);
    });
    const walker = document2.createTreeWalker(
      container,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      t.textContent = t.textContent.replace(/ /g, " ").replace(/\s+/g, " ");
    });
    container.querySelectorAll("p, strong, em, u, li").forEach((el) => {
      if (!hasText(el) && !el.querySelector("img")) el.remove();
    });
  }
  function trimEdges(parent) {
    while (parent.firstChild && isBlank(parent.firstChild)) parent.firstChild.remove();
    while (parent.lastChild && isBlank(parent.lastChild)) parent.lastChild.remove();
    if (parent.firstChild && parent.firstChild.nodeType === 3) {
      parent.firstChild.textContent = parent.firstChild.textContent.replace(/^\s+/, "");
    }
    if (parent.lastChild && parent.lastChild.nodeType === 3) {
      parent.lastChild.textContent = parent.lastChild.textContent.replace(/\s+$/, "");
    }
  }
  function cellContent(td, document2) {
    const container = document2.createElement("div");
    [...td.childNodes].forEach((n) => container.append(n.cloneNode(true)));
    cleanCell(container, document2);
    if (!hasText(container) && !container.querySelector("img")) return [];
    const out = [];
    let para = null;
    [...container.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1 && BLOCK_TAGS.has(n.tagName)) {
        para = null;
        if (n.tagName === "P") trimEdges(n);
        out.push(n);
        return;
      }
      if (!para) {
        if (isBlank(n)) return;
        para = document2.createElement("p");
        out.push(para);
      }
      para.append(n);
    });
    out.forEach((p) => {
      if (p.tagName === "P") trimEdges(p);
    });
    return out.filter((p) => hasText(p) || p.querySelector && p.querySelector("img"));
  }
  function parse5(element, { document: document2 }) {
    const table = element.tagName === "TABLE" ? element : element.querySelector("table");
    if (!table) return;
    if (table.closest("table[data-import-block]")) return;
    const rows = directRows(table);
    const grid = rows.map(() => []);
    const occupied = rows.map(() => []);
    rows.forEach((tr, r) => {
      let c = 0;
      [...tr.children].filter(isCell).forEach((cell) => {
        while (occupied[r][c]) c += 1;
        const colspan = Math.max(1, parseInt(cell.getAttribute("colspan"), 10) || 1);
        const rowspan = Math.max(1, parseInt(cell.getAttribute("rowspan"), 10) || 1);
        grid[r][c] = cell;
        for (let dr = 0; dr < rowspan && r + dr < rows.length; dr += 1) {
          for (let dc = 0; dc < colspan; dc += 1) occupied[r + dr][c + dc] = true;
        }
        c += colspan;
      });
    });
    let colCount = occupied.reduce((m, row) => Math.max(m, row.length), 0);
    if (colCount > MAX_COLS) {
      console.warn(`[table parser] source table has ${colCount} columns; keeping the first ${MAX_COLS}.`);
      colCount = MAX_COLS;
    }
    if (!rows.length || !colCount) {
      element.remove();
      return;
    }
    const firstCells = [...rows[0].children].filter(isCell);
    let hasHeader = rows[0].parentElement.tagName === "THEAD" || firstCells.length > 0 && firstCells.every((n) => n.tagName === "TH");
    const cells = [];
    rows.forEach((tr, r) => {
      const row = [];
      let rowHasContent = false;
      for (let c = 0; c < colCount; c += 1) {
        const src = grid[r][c];
        const content = src ? cellContent(src, document2) : [];
        if (content.length) {
          rowHasContent = true;
          row.push([document2.createComment(` field:col${c + 1} `), ...content]);
        } else {
          row.push("");
        }
      }
      if (!rowHasContent) {
        if (r === 0) hasHeader = false;
        return;
      }
      cells.push(row);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const variants = hasHeader ? [] : ["no-header"];
    const block = WebImporter.Blocks.createBlock(document2, { name: "table", variants, cells });
    block.setAttribute("data-import-block", "table");
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote.js
  var DEFAULT_ORIGIN2 = "https://corporate.exxonmobil.com";
  var BLOCK_TAGS2 = /* @__PURE__ */ new Set(["P", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6"]);
  var OPEN_QUOTES = /^[\s ]*[“”„"]+[\s ]*/;
  var CLOSE_QUOTES = /[\s ]*[“”"]+[\s ]*$/;
  function clean5(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function hasText2(node) {
    return clean5(node.textContent).length > 0;
  }
  function isBlank2(n) {
    return n.nodeType === 8 || n.nodeType === 3 && !clean5(n.textContent) || n.nodeName === "BR";
  }
  function getOrigin2(document2, ctx) {
    const candidates = [];
    if (ctx && ctx.params && ctx.params.originalURL) candidates.push(ctx.params.originalURL);
    if (ctx && ctx.url) candidates.push(ctx.url);
    const canonical = document2.querySelector('link[rel="canonical"]');
    if (canonical) candidates.push(canonical.getAttribute("href"));
    const ogUrl = document2.querySelector('meta[property="og:url"]');
    if (ogUrl) candidates.push(ogUrl.getAttribute("content"));
    for (let i = 0; i < candidates.length; i += 1) {
      try {
        const u = new URL(candidates[i]);
        if (/^https?:$/.test(u.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) return u.origin;
      } catch (e) {
      }
    }
    return DEFAULT_ORIGIN2;
  }
  function absolute2(src, origin) {
    const s = (src || "").trim();
    if (!s) return "";
    try {
      return new URL(s, `${origin}/`).href;
    } catch (e) {
      return s;
    }
  }
  function edgeText(node, first) {
    const kids = [...node.childNodes];
    if (!first) kids.reverse();
    for (let i = 0; i < kids.length; i += 1) {
      const k = kids[i];
      if (k.nodeType === 3) {
        if (clean5(k.textContent)) return k;
      } else if (k.nodeType === 1) {
        const t = edgeText(k, first);
        if (t) return t;
      }
    }
    return null;
  }
  function trimEdges2(parent) {
    while (parent.firstChild && isBlank2(parent.firstChild)) parent.firstChild.remove();
    while (parent.lastChild && isBlank2(parent.lastChild)) parent.lastChild.remove();
    const f = edgeText(parent, true);
    if (f) f.textContent = f.textContent.replace(/^[\s ]+/, "");
    const l = edgeText(parent, false);
    if (l) l.textContent = l.textContent.replace(/[\s ]+$/, "");
  }
  function quotationContent(source, document2) {
    const container = document2.createElement("div");
    [...source.childNodes].forEach((n) => container.append(n.cloneNode(true)));
    container.querySelectorAll("script, style, noscript, .share, .author").forEach((n) => n.remove());
    container.querySelectorAll("b, i").forEach((el) => {
      const repl = document2.createElement(el.tagName === "B" ? "strong" : "em");
      repl.append(...el.childNodes);
      el.replaceWith(repl);
    });
    container.querySelectorAll("div, span, font, blockquote, q").forEach((el) => {
      el.replaceWith(...el.childNodes);
    });
    const walker = document2.createTreeWalker(
      container,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      t.textContent = t.textContent.replace(/[\s ]+/g, " ");
    });
    const first = edgeText(container, true);
    if (first) first.textContent = first.textContent.replace(OPEN_QUOTES, "");
    const last = edgeText(container, false);
    if (last) last.textContent = last.textContent.replace(CLOSE_QUOTES, "");
    const out = [];
    let para = null;
    [...container.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1 && BLOCK_TAGS2.has(n.tagName)) {
        para = null;
        out.push(n);
        return;
      }
      if (!para) {
        if (isBlank2(n)) return;
        para = document2.createElement("p");
        out.push(para);
      }
      para.append(n);
    });
    out.forEach((p) => trimEdges2(p));
    return out.filter((p) => hasText2(p));
  }
  function portrait(author, document2, origin, fallbackAlt) {
    if (!author) return null;
    const srcImg = author.querySelector("img.author--image, picture img, img");
    let src = srcImg ? srcImg.getAttribute("src") || srcImg.getAttribute("data-src") : "";
    if (!src) {
      const holder = author.querySelector("[data-desktop], [data-tablet], [data-mobile]");
      if (holder) src = holder.getAttribute("data-desktop") || holder.getAttribute("data-tablet") || holder.getAttribute("data-mobile");
    }
    if (!src) {
      const source = author.querySelector("picture source[srcset]");
      if (source) src = source.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || /^data:/.test(src)) return null;
    const img = document2.createElement("img");
    img.src = absolute2(src, origin);
    const alt = srcImg ? srcImg.getAttribute("alt") : null;
    img.alt = alt !== null ? clean5(alt) : fallbackAlt || "";
    return img;
  }
  function attributionContent(author, document2) {
    if (!author) return [];
    const out = [];
    const nameEl = author.querySelector(".author--name");
    const name = nameEl ? clean5(nameEl.textContent) : "";
    if (name) {
      const p = document2.createElement("p");
      p.textContent = name;
      out.push(p);
    }
    author.querySelectorAll(".author--title").forEach((t) => {
      const role = clean5(t.textContent);
      if (!role) return;
      const p = document2.createElement("p");
      p.textContent = role;
      out.push(p);
    });
    return out;
  }
  function parse6(element, { document: document2 }) {
    const ctx = arguments[1] || {};
    const origin = getOrigin2(document2, ctx);
    const variants = [];
    if (element.classList.contains("pullquote-blue")) variants.push("blue");
    else if (element.classList.contains("pullquote-black")) variants.push("black");
    const blockquote = element.querySelector("blockquote.pullquote--blockquote, blockquote");
    const textEl = element.querySelector(".pullquote--text") || blockquote;
    const quotation = textEl ? quotationContent(textEl, document2) : [];
    const author = element.querySelector(".author");
    const attribution = attributionContent(author, document2);
    const nameEl = author ? author.querySelector(".author--name") : null;
    const img = portrait(author, document2, origin, nameEl ? clean5(nameEl.textContent) : "");
    if (!quotation.length && !attribution.length && !img) {
      element.remove();
      return;
    }
    const cells = [
      [[document2.createComment(" field:quotation "), ...quotation]],
      [img ? [document2.createComment(" field:image "), img] : [document2.createComment(" field:image ")]],
      [[document2.createComment(" field:attribution "), ...attribution]]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "quote", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video.js
  var GENERIC_TITLES = /^(video player|video|player|youtube video player)$/i;
  var CAPTION_SELECTOR = "figcaption, .articleMedia--caption, .articleMedia--captionText, .caption";
  var BLOCK_TAGS3 = /* @__PURE__ */ new Set(["P", "UL", "OL", "H2", "H3", "H4", "H5", "H6"]);
  function clean6(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function usableTitle(text) {
    const t = clean6(text);
    return t && !GENERIC_TITLES.test(t) ? t : "";
  }
  function youTubeId(src) {
    const s = (src || "").trim();
    if (!s) return "";
    let m = s.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{6,})/i);
    if (m) return m[1];
    m = s.match(/youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/i);
    if (m) return m[1];
    m = s.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    return m ? m[1] : "";
  }
  function brightcoveFromIframe(src) {
    try {
      const u = new URL(src, "https://players.brightcove.net/");
      if (!/players\.brightcove\.net$/i.test(u.hostname)) return "";
      const m = u.pathname.match(/^\/(\d+)\/([^/_]+)_([^/]+)\/index\.html$/);
      const videoId = u.searchParams.get("videoId");
      if (!m || !videoId) return "";
      return `https://players.brightcove.net/${m[1]}/${m[2]}_${m[3]}/index.html?videoId=${videoId}`;
    } catch (e) {
      return "";
    }
  }
  function findVideo(element) {
    const bcCandidates = [...element.querySelectorAll("[data-video-id][data-account]")].filter((el) => clean6(el.getAttribute("data-video-id")) && clean6(el.getAttribute("data-account")));
    if (bcCandidates.length) {
      const el = bcCandidates[0];
      const pick = (name) => {
        for (let i = 0; i < bcCandidates.length; i += 1) {
          const v = clean6(bcCandidates[i].getAttribute(name));
          if (v) return v;
        }
        return "";
      };
      const account = clean6(el.getAttribute("data-account"));
      const videoId = clean6(el.getAttribute("data-video-id"));
      const player = pick("data-player") || "default";
      const embed = pick("data-embed") || "default";
      const url = `https://players.brightcove.net/${account}/${player}_${embed}/index.html?videoId=${videoId}`;
      const titleEl = element.querySelector(".vjs-title-bar-title");
      let title = titleEl ? usableTitle(titleEl.textContent) : "";
      if (!title) {
        const vids = element.querySelectorAll("video, video-js, [data-video-id]");
        for (let i = 0; i < vids.length && !title; i += 1) {
          title = usableTitle(vids[i].getAttribute("aria-label")) || usableTitle(vids[i].getAttribute("title")) || usableTitle(vids[i].getAttribute("data-title"));
        }
      }
      return { url, title };
    }
    const iframes = [...element.querySelectorAll("iframe")];
    for (let i = 0; i < iframes.length; i += 1) {
      const f = iframes[i];
      const src = f.getAttribute("src") || f.getAttribute("data-src") || "";
      const ytId = youTubeId(src);
      const title = usableTitle(f.getAttribute("title")) || usableTitle(f.getAttribute("aria-label"));
      if (ytId) return { url: `https://www.youtube.com/watch?v=${ytId}`, title };
      const bc = brightcoveFromIframe(src);
      if (bc) return { url: bc, title };
    }
    return null;
  }
  function captions(element, document2) {
    const out = [];
    const seen = [];
    element.querySelectorAll(CAPTION_SELECTOR).forEach((cap) => {
      if (seen.some((s) => s.contains(cap))) return;
      if (cap.closest(".video-js, video-js, .vjs-title-bar")) return;
      seen.push(cap);
      const c = cap.cloneNode(true);
      c.querySelectorAll("script, style, noscript, img, picture, video, video-js, iframe, svg, button").forEach((n) => n.remove());
      c.querySelectorAll('a[href^="blob:"]').forEach((a) => a.replaceWith(...a.childNodes));
      if (!clean6(c.textContent)) return;
      const blocks = [...c.children].filter((k) => BLOCK_TAGS3.has(k.tagName));
      if (blocks.length) {
        blocks.forEach((b) => {
          if (clean6(b.textContent)) out.push(b);
        });
        return;
      }
      const p = document2.createElement("p");
      p.append(...c.childNodes);
      out.push(p);
    });
    return out;
  }
  function parse7(element, { document: document2 }) {
    const video = findVideo(element);
    if (!video) return;
    const caps = captions(element, document2);
    const link = document2.createElement("a");
    link.href = video.url;
    link.textContent = video.url;
    const cells = [
      [[document2.createComment(" field:link "), link]],
      [video.title ? [document2.createComment(" field:title "), document2.createTextNode(video.title)] : [document2.createComment(" field:title ")]],
      [[document2.createComment(" field:poster ")]]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "video", cells });
    element.replaceWith(block, ...caps);
  }

  // tools/importer/transformers/exxonmobil-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var INLINE_TAGS = /* @__PURE__ */ new Set([
    "A",
    "ABBR",
    "B",
    "BDI",
    "BDO",
    "BR",
    "CITE",
    "CODE",
    "DATA",
    "DEL",
    "DFN",
    "EM",
    "FONT",
    "I",
    "IMG",
    "INS",
    "KBD",
    "LABEL",
    "MARK",
    "PICTURE",
    "Q",
    "S",
    "SAMP",
    "SMALL",
    "SPAN",
    "STRIKE",
    "STRONG",
    "SUB",
    "SUP",
    "TIME",
    "TT",
    "U",
    "VAR",
    "WBR"
  ]);
  var PHRASING_CONTEXT = "p, li, dt, dd, td, th, caption, h1, h2, h3, h4, h5, h6, pre, blockquote, figcaption, table, a, button";
  function isInlineNode(node) {
    if (node.nodeType === 3) return true;
    if (node.nodeType !== 1 || !INLINE_TAGS.has(node.nodeName)) return false;
    return ![...node.querySelectorAll("*")].some((d) => !INLINE_TAGS.has(d.nodeName));
  }
  function isMeaningful(node) {
    if (node.nodeType === 3) return node.textContent.trim() !== "";
    if (node.nodeType !== 1 || node.nodeName === "BR") return false;
    return node.textContent.trim() !== "" || !!node.querySelector("img");
  }
  function isBr(node) {
    return node.nodeType === 1 && node.nodeName === "BR";
  }
  function wrapInlineRun(doc, run) {
    if (!run.some(isMeaningful)) return;
    const segments = [];
    let current = [];
    for (let i = 0; i < run.length; i += 1) {
      const node = run[i];
      if (isBr(node)) {
        let j = i + 1;
        while (j < run.length && run[j].nodeType === 3 && run[j].textContent.trim() === "") j += 1;
        if (j < run.length && isBr(run[j])) {
          while (j < run.length && (isBr(run[j]) || run[j].nodeType === 3 && run[j].textContent.trim() === "")) j += 1;
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
      const trimmable = (n) => isBr(n) || n.nodeType === 3 && n.textContent.trim() === "";
      while (seg.length && trimmable(seg[0])) seg.shift().remove();
      while (seg.length && trimmable(seg[seg.length - 1])) seg.pop().remove();
      if (!seg.some(isMeaningful)) return;
      const p = doc.createElement("p");
      seg[0].before(p);
      seg.forEach((n) => p.append(n));
    });
  }
  function normalizeContainer(doc, container) {
    const children = [...container.childNodes];
    if (!children.some((n) => isInlineNode(n) && isMeaningful(n))) return;
    let run = [];
    children.forEach((node) => {
      if (node.nodeType === 8) return;
      if (isInlineNode(node)) {
        run.push(node);
      } else {
        wrapInlineRun(doc, run);
        run = [];
      }
    });
    wrapInlineRun(doc, run);
  }
  var NON_PHRASING_INLINE = "sup, sub, u";
  function normalizeLooseInline(doc, root) {
    const containers = [root, ...root.querySelectorAll("*")].filter((el) => el.nodeType === 1 && !INLINE_TAGS.has(el.nodeName) && !el.closest(PHRASING_CONTEXT));
    containers.forEach((el) => normalizeContainer(doc, el));
    root.querySelectorAll("figcaption").forEach((fc) => {
      if (fc.closest("table") || !fc.querySelector(NON_PHRASING_INLINE)) return;
      normalizeContainer(doc, fc);
    });
  }
  function hoistTablesFromHeadings(root) {
    const headings = [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => h.querySelector("table") && !h.closest("table"));
    headings.reverse().forEach((h) => {
      const tables = [...h.querySelectorAll("table")].filter((t) => !t.parentElement.closest("table"));
      if (!tables.length) return;
      tables.forEach((t) => t.remove());
      const keep = h.textContent.trim() !== "" || !!h.querySelector("img, picture");
      if (keep) {
        h.after(...tables);
      } else {
        h.replaceWith(...tables);
      }
    });
  }
  var SOURCE_HOST = "corporate.exxonmobil.com";
  var SOURCE_ORIGIN = `https://${SOURCE_HOST}`;
  var PREFIXED_LANGS = ["es", "fr"];
  var TRANSLATED_PATHS = {
    es: /* @__PURE__ */ new Set([
      "/greenpoint",
      "/greenpoint/community-programs",
      "/greenpoint/remediation",
      "/system-updates/hub",
      "/greenpoint/our-commitment",
      "/greenpoint/newsletters",
      "/system-updates/hub/customers-getting-started",
      "/greenpoint/stay-informed",
      "/system-updates/hub/customers-getting-started/lubricants",
      "/system-updates/hub/customers-getting-started/fuels",
      "/system-updates/hub/customers-getting-started/chemicals",
      "/system-updates/hub/news-and-updates",
      "/locations/european-region/european-newsroom/2025/aligning-eu-policy-with-innovation",
      "/greenpoint/community-programs/us-military-academy-at-west-point",
      "/system-updates/hub/frequently-asked-questions"
    ]),
    fr: /* @__PURE__ */ new Set([
      "/locations/luxembourg",
      "/system-updates/hub",
      "/system-updates/hub/customers-getting-started",
      "/locations/european-region/european-newsroom/2025/aligning-eu-policy-with-innovation",
      "/system-updates/hub/news-and-updates",
      "/system-updates/hub/customers-getting-started/lubricants",
      "/system-updates/hub/customers-getting-started/chemicals",
      "/system-updates/hub/customers-getting-started/fuels",
      "/system-updates/hub/frequently-asked-questions"
    ])
  };
  function getPageLang(payload) {
    const candidates = [payload && payload.params && payload.params.originalURL, payload && payload.url];
    for (let i = 0; i < candidates.length; i += 1) {
      const u = candidates[i];
      if (u) {
        try {
          const lang = (new URL(u, SOURCE_ORIGIN).searchParams.get("content-lang") || "").toLowerCase();
          if (PREFIXED_LANGS.includes(lang)) return lang;
        } catch (e) {
        }
      }
    }
    return "";
  }
  var ASSET_PATH_PREFIXES = ["/-/", "/~/", "/sitecore/", "/content/dam/"];
  var ASSET_EXTENSIONS = /* @__PURE__ */ new Set([
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "xlsm",
    "ppt",
    "pptx",
    "csv",
    "txt",
    "rtf",
    "zip",
    "xml",
    "json",
    "ashx",
    "axd",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
    "webp",
    "avif",
    "bmp",
    "tif",
    "tiff",
    "ico",
    "mp4",
    "m4v",
    "mov",
    "webm",
    "mp3",
    "wav",
    "ics",
    "vcf",
    "eps",
    "ai"
  ]);
  function fallbackSanitizeFilename(name) {
    if (!name) return "";
    let decoded = name;
    try {
      decoded = decodeURIComponent(name);
    } catch (e) {
    }
    return decoded.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function fallbackSanitizePath(path) {
    if (!path) return "";
    const extension = path.split(".").pop();
    const pathname = extension !== path ? path.substring(0, path.lastIndexOf(".")) : path;
    let sanitized = "";
    pathname.split("/").forEach((p) => {
      if (p !== "") sanitized += `/${fallbackSanitizeFilename(p)}`;
    });
    if (extension !== path) sanitized += `.${extension}`;
    return sanitized;
  }
  function sanitizeImportPath(path) {
    const fu = typeof WebImporter !== "undefined" && WebImporter.FileUtils || null;
    if (fu && typeof fu.sanitizePath === "function") return fu.sanitizePath(path);
    return fallbackSanitizePath(path);
  }
  function normalizeInternalHref(href, pageLang = "") {
    if (!href) return null;
    const raw = href.trim();
    if (!raw || raw.startsWith("#")) return null;
    const isRootRelative = raw.startsWith("/") && !raw.startsWith("//");
    if (!isRootRelative && !/^(https?:)?\/\//i.test(raw)) return null;
    let url;
    try {
      url = new URL(raw, SOURCE_ORIGIN);
    } catch (e) {
      return null;
    }
    if (!/^https?:$/.test(url.protocol)) return null;
    if (url.hostname.toLowerCase() !== SOURCE_HOST) return null;
    const lowerPath = url.pathname.toLowerCase();
    if (ASSET_PATH_PREFIXES.some((p) => lowerPath.startsWith(p))) return null;
    const lastSegment = lowerPath.replace(/\/+$/, "").split("/").pop();
    const ext = lastSegment.includes(".") ? lastSegment.split(".").pop() : "";
    if (ext && ASSET_EXTENSIONS.has(ext)) return null;
    let rawPath = lowerPath.replace(/\/+$/, "").replace(/\.html?$/, "");
    let lang = (url.searchParams.get("content-lang") || "").toLowerCase();
    if (!url.searchParams.has("content-lang") && pageLang && rawPath && TRANSLATED_PATHS[pageLang] && TRANSLATED_PATHS[pageLang].has(rawPath)) {
      lang = pageLang;
    }
    let path;
    if (PREFIXED_LANGS.includes(lang)) {
      path = rawPath ? sanitizeImportPath(`/${lang}${rawPath}`) : `/${lang}/`;
    } else {
      path = rawPath ? sanitizeImportPath(rawPath) : "/";
    }
    if (!path) path = "/";
    return `${path}${url.hash || ""}`;
  }
  function normalizeInternalLinks(root, pageLang = "") {
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      const normalized = normalizeInternalHref(href, pageLang);
      if (normalized !== null && normalized !== href) a.setAttribute("href", normalized);
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // OneTrust cookie banner + preference center (cleaned.html line ~1744)
        ".searchBar",
        // search overlay outside <main> (line ~1034)
        ".spinner.spinner-global"
        // loading spinner at end of <main> (line ~1654)
      ]);
      element.querySelectorAll("div.stickyNav-wrapper").forEach((sticky) => {
        const navs = [...sticky.querySelectorAll("nav.secondaryNav")];
        if (!navs.length) return;
        const header = sticky.closest("section.articleHeader");
        const container = header ? [...header.children].find((c) => c.matches("div.container")) : null;
        const topicHeader = !header && sticky.parentElement ? [...sticky.parentElement.children].find((c) => c.matches("section.topicHeader")) : null;
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
      WebImporter.DOMUtils.remove(element, [
        "div.breadcrumbs-wrapper",
        // breadcrumbs - rebuilt in code (article cleaned.html line ~1095)
        "div.stickyNav-wrapper",
        // sticky TOC / share bar (line ~1110)
        "section.stickyToc",
        // sticky TOC (line ~1111)
        "section.tableOfContent",
        // empty d-none TOC placeholder (line ~1194)
        "div.share",
        // share + print widget wrapper (line ~1140)
        "button.icon-share",
        // share toggle (line ~1141)
        "div.shareInfo",
        // share popover with social buttons (line ~1143)
        "a.icon-print",
        // print link (line ~1176)
        "div.articleHeader--info-mobile",
        // mobile duplicate of type/date (line ~1183)
        "div.data-analytics",
        // empty d-none analytics hook (line ~1371)
        "#data-xom-search",
        // empty d-none search hook (line ~1373)
        // Topic pages (/news, /community, ...): client-side "Load More" pager of
        // the server-rendered content collection (news cleaned.html
        // section.contentCollection > button.contentCollection--loadMore).
        "section.contentCollection button.contentCollection--loadMore",
        "section.contentCollection button.button-loadMore",
        "section.dynamicContentCollection button.button-loadMore"
      ]);
      element.querySelectorAll("div.toc-hidden").forEach((toc) => {
        toc.querySelectorAll(".table-of-contents").forEach((h) => h.remove());
        const hasOther = [...toc.children].length > 0 || toc.textContent.trim() !== "";
        if (hasOther) {
          toc.replaceWith(...toc.childNodes);
        } else {
          toc.remove();
        }
      });
      hoistTablesFromHeadings(element);
      element.querySelectorAll("div.article--wrapper blockquote, div.topic--wrapper blockquote").forEach((bq) => {
        if (bq.closest("div.pullquote, table")) return;
        const wrapper = document.createElement("div");
        wrapper.className = "pullquote";
        bq.replaceWith(wrapper);
        wrapper.append(bq);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "section.skip-content",
        // "Skip to content" link (line 2)
        "header.header-static",
        // site header containing nav.mainNav + globalSelectorV2 (line 7)
        "nav.mainNav",
        // main nav (line 8)
        "section.globalSelectorV2",
        // country/region selector (line 653)
        "section.searchModule",
        // search module (line 1045)
        "footer.bg-dark",
        // site footer (line 1658)
        // Topic pages: decorative "Follow us" background (orange.png). Its colour is
        // already carried by the orange-gradient section style, so drop the image
        // after exxonmobil-sections.js has read it in beforeTransform.
        "section.iconGrid div.iconGrid--bg",
        // Carousel/slider UI controls (not authorable content)
        ".homeHero--interactiveControl",
        // play/pause + #carouselStatus (line 1096)
        ".homeHero--control",
        // slide title tabs (line 1162)
        ".homeHero--arrow",
        // scroll-down arrow (line 1178)
        ".highlight--arrows",
        // slider arrows (lines ~1442, ~1555)
        ".highlight--controls",
        // slider bullets (lines ~1525, ~1646)
        // Tracking / embeds
        "iframe#universal_pixel_p6xsd8s",
        // TTD pixel (line 2027)
        "iframe.ot-text-resize",
        // OneTrust iframe (line 2023)
        '[id^="batBeacon"]',
        // Bing beacon (line 2029)
        "canvas",
        // empty canvases in hero/topic images
        "iframe",
        "link",
        "noscript",
        "script",
        "style"
      ]);
      const doc = element.ownerDocument || document;
      const articleRoots = [...element.querySelectorAll("div.article--wrapper, section.articleHeader")];
      articleRoots.forEach((root) => normalizeLooseInline(doc, root));
      if (articleRoots.length) {
        const hrParents = new Set([...element.querySelectorAll("hr")].map((hr) => hr.parentElement));
        hrParents.forEach((parent) => {
          if (parent && !INLINE_TAGS.has(parent.nodeName) && !parent.closest(PHRASING_CONTEXT)) {
            normalizeContainer(doc, parent);
          }
        });
      }
      normalizeInternalLinks(element, getPageLang(payload));
    }
  }

  // tools/importer/transformers/exxonmobil-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var BAND_STYLE_ATTR = "data-excat-band-style";
  var BAND_SECTION_ID = "rc3b";
  var BAND_SELECTOR = "div.article--wrapper > section.singleFeature";
  var BAND_NON_COLOUR = /* @__PURE__ */ new Set(["variable", "noGradient", "noBackground", "centerContent"]);
  var TOPIC_SECTION_ID = "t2";
  var TOPIC_SELECTOR = "div.topic--wrapper > section.topicContainer";
  var KNOWN_STYLES = /* @__PURE__ */ new Set([
    "highlight",
    "grey",
    "trending-split",
    "blue-gradient",
    "blue",
    "indigo-gradient",
    "indigo",
    "image-band",
    "plain",
    "black-gradient",
    "black",
    "burgundy-gradient",
    "gray-3",
    "gray-4-gradient",
    "gray-7",
    "sea-blue-gradient",
    "sea-blue",
    "blue-3",
    "light-grey",
    "split",
    "dark",
    "dark-grey",
    "orange-gradient"
  ]);
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function bandImageUrl(band) {
    const bg = band.querySelector(":scope > .lazy-bg, .lazy-bg");
    if (!bg) return null;
    const fromData = bg.getAttribute("data-desktop") || bg.getAttribute("data-tablet") || bg.getAttribute("data-mobile");
    if (fromData && fromData.trim()) return fromData.trim();
    const m = (bg.getAttribute("style") || "").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1] : null;
  }
  function bandStyle(band, hasImage) {
    const mods = [...band.classList].filter((c) => c.startsWith("singleFeature-")).map((c) => c.slice("singleFeature-".length));
    const colour = mods.find((m) => m && !BAND_NON_COLOUR.has(m));
    const gradient = !mods.includes("noGradient");
    if (colour) return gradient ? `${colour}-gradient` : colour;
    if (hasImage) return "image-band";
    return "plain";
  }
  function normalizeBand(doc, band, imageUrl) {
    band.querySelectorAll("span.eyebrow, .singleFeature--textField--eyebrow").forEach((span) => {
      if (span.nodeName === "P") return;
      const p = doc.createElement("p");
      p.append(...span.childNodes);
      span.replaceWith(p);
    });
    band.querySelectorAll(".singleFeature--buttons a").forEach((a) => {
      if (a.parentElement && a.parentElement.nodeName === "P") return;
      const p = doc.createElement("p");
      a.before(p);
      p.append(a);
    });
    band.querySelectorAll(".lazy-bg").forEach((bg) => bg.remove());
    if (imageUrl) {
      const p = doc.createElement("p");
      const img = doc.createElement("img");
      img.setAttribute("src", imageUrl);
      img.setAttribute("alt", "");
      p.append(img);
      band.prepend(p);
    }
  }
  var COMPONENT_COLOUR_STYLE = {
    white: null,
    gray: "light-grey",
    grey: "light-grey",
    "gray-1": "light-grey",
    "gray-2": "dark-grey",
    black: "dark"
  };
  function colourModifier(el, prefix) {
    if (!el) return null;
    const cls = [...el.classList].find((c) => c.startsWith(`${prefix}-`) && !c.startsWith(`${prefix}--`));
    return cls ? cls.slice(prefix.length + 1) : null;
  }
  function knownStyle(style) {
    return style && KNOWN_STYLES.has(style) ? style : null;
  }
  function topicStyle(container) {
    if (container.querySelector("section.variableFeature")) return null;
    const feature = container.querySelector("section.singleFeature");
    if (feature) {
      if (feature.querySelector(".lazy-bg")) return null;
      const style = bandStyle(feature, false);
      return style === "plain" ? null : knownStyle(style);
    }
    if (container.querySelector(".topicContainer--twoColumn")) return "split";
    const pullquote = container.querySelector(".pullquote");
    if (pullquote) return knownStyle(COMPONENT_COLOUR_STYLE[colourModifier(pullquote, "pullquote")]);
    const shortVideo = container.querySelector("section.shortVideoHeadline");
    if (shortVideo) {
      return knownStyle(COMPONENT_COLOUR_STYLE[colourModifier(shortVideo, "shortVideoHeadline")]);
    }
    const highlight = container.querySelector(".highlight--wrapper");
    if (highlight) return knownStyle(COMPONENT_COLOUR_STYLE[colourModifier(highlight, "highlight")]);
    const iconGrid = container.querySelector("section.iconGrid");
    if (iconGrid) {
      const bg = iconGrid.querySelector(".iconGrid--bg, .lazy-bg");
      if (!bg && !iconGrid.classList.contains("bgImg")) return null;
      const url = bg ? bg.getAttribute("data-desktop") || bg.getAttribute("data-tablet") || bg.getAttribute("data-mobile") || bg.getAttribute("style") || "" : "";
      const m = url.match(/\/backgrounds\/([a-z0-9-]+)\.[a-z]+/i);
      if (m) return knownStyle(`${m[1].toLowerCase()}-gradient`);
      return url.trim() ? null : "orange-gradient";
    }
    return null;
  }
  function insertTopicBreaks(doc, element) {
    const containers = [...element.querySelectorAll(TOPIC_SELECTOR)];
    containers.forEach((container) => {
      const style = topicStyle(container);
      const hr = doc.createElement("hr");
      if (style) hr.setAttribute(BAND_STYLE_ATTR, style);
      container.before(hr);
    });
    return containers.length;
  }
  var MEDIA = "img, picture, video, iframe, svg, table";
  function isMeaningfulNode(node) {
    if (node.nodeType === 3) return node.textContent.trim() !== "";
    if (node.nodeType !== 1) return false;
    if (node.nodeName === "HR") return false;
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(node.nodeName)) return false;
    return node.textContent.trim() !== "" || node.matches(MEDIA) || !!node.querySelector(MEDIA);
  }
  function hasContentAfter(el, root) {
    let node = el;
    while (node && node !== root) {
      for (let sib = node.nextSibling; sib; sib = sib.nextSibling) {
        if (isMeaningfulNode(sib)) return true;
      }
      node = node.parentNode;
    }
    return false;
  }
  function dedupeBreaks(doc, root) {
    const walker = doc.createTreeWalker(root, 1 | 4);
    const tokens = [];
    let skipUntil = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (skipUntil && skipUntil.contains(n)) continue;
      skipUntil = null;
      if (n.nodeType === 1 && n.nodeName === "HR") {
        tokens.push({ hr: n });
      } else if (n.nodeType === 3) {
        if (n.textContent.trim() !== "" && !n.parentElement.closest("script, style, noscript, template")) tokens.push({ content: true });
      } else if (n.matches(MEDIA)) {
        tokens.push({ content: true });
        skipUntil = n;
      }
    }
    const isMarked = (hr) => hr.hasAttribute(SECTION_MARKER_ATTR) || hr.hasAttribute(BAND_STYLE_ATTR);
    let prevHr = null;
    let seenContent = false;
    tokens.forEach((t) => {
      if (t.content) {
        seenContent = true;
        return;
      }
      if (prevHr && !seenContent) {
        if (isMarked(t.hr) && !isMarked(prevHr)) {
          prevHr.remove();
          prevHr = t.hr;
        } else if (!isMarked(t.hr)) {
          t.hr.remove();
        } else {
          prevHr = t.hr;
        }
      } else {
        prevHr = t.hr;
      }
      seenContent = false;
    });
    if (prevHr && !seenContent && !isMarked(prevHr)) prevHr.remove();
  }
  function insertBandBreaks(doc, element) {
    const bands = [...element.querySelectorAll(BAND_SELECTOR)];
    bands.forEach((band) => {
      const imageUrl = bandImageUrl(band);
      const style = bandStyle(band, !!imageUrl);
      normalizeBand(doc, band, imageUrl);
      const scope = band.closest("main") || element;
      if (hasContentAfter(band, scope)) band.after(doc.createElement("hr"));
      const hr = doc.createElement("hr");
      hr.setAttribute(BAND_STYLE_ATTR, style);
      band.before(hr);
    });
    return bands.length;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    const hasBands = sections.some((s) => s.id === BAND_SECTION_ID);
    const hasTopics = sections.some((s) => s.id === TOPIC_SECTION_ID);
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (hasBands && section.id === BAND_SECTION_ID) {
          insertBandBreaks(doc, element);
          continue;
        }
        if (hasTopics && section.id === TOPIC_SECTION_ID) {
          insertTopicBreaks(doc, element);
          continue;
        }
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
      if (hasBands || hasTopics) dedupeBreaks(doc, element.querySelector("main") || element);
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (hasBands && section.id === BAND_SECTION_ID) continue;
        if (hasTopics && section.id === TOPIC_SECTION_ID) continue;
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
      if (hasBands || hasTopics) {
        element.querySelectorAll(`hr[${BAND_STYLE_ATTR}]`).forEach((hr) => {
          const metadataBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: hr.getAttribute(BAND_STYLE_ATTR) }
          });
          hr.after(metadataBlock);
          hr.removeAttribute(BAND_STYLE_ATTR);
        });
      }
    }
  }

  // tools/importer/import-banner-content-page.js
  var parsers = {
    "hero-article-banner": parse,
    "secondary-nav": parse2,
    "columns-article-header": parse3,
    "cards-topics": parse4,
    table: parse5,
    quote: parse6,
    video: parse7
  };
  var PAGE_TEMPLATE = {
    "name": "banner-content-page",
    "urls": [
      "https://corporate.exxonmobil.com/careers/benefits",
      "https://corporate.exxonmobil.com/careers/commercial-business-career-path",
      "https://corporate.exxonmobil.com/careers/dhaval-bhandari-innovation",
      "https://corporate.exxonmobil.com/careers/engineering-career-path",
      "https://corporate.exxonmobil.com/careers/finance-career-path",
      "https://corporate.exxonmobil.com/careers/geoscience-career-path",
      "https://corporate.exxonmobil.com/careers/human-resources-career-path",
      "https://corporate.exxonmobil.com/careers/information-technology-career-path",
      "https://corporate.exxonmobil.com/careers/labarge-carbon-capture-asset-manager-matt-mcqueen",
      "https://corporate.exxonmobil.com/careers/labarge-carbon-capture-facility-sarah-klepper",
      "https://corporate.exxonmobil.com/careers/labarge-carbon-capture-supervisor-anne-guinard",
      "https://corporate.exxonmobil.com/careers/law-career-path",
      "https://corporate.exxonmobil.com/careers/low-carbon-solutions-joe-blommaert",
      "https://corporate.exxonmobil.com/careers/operations-career-path",
      "https://corporate.exxonmobil.com/careers/pre-employment-process",
      "https://corporate.exxonmobil.com/careers/projects-career-path",
      "https://corporate.exxonmobil.com/careers/research-technology-career-path",
      "https://corporate.exxonmobil.com/careers/safety-security-health-environment-career-path",
      "https://corporate.exxonmobil.com/careers/supply-chain-career-path",
      "https://corporate.exxonmobil.com/careers/technical-administrative-support-career-path",
      "https://corporate.exxonmobil.com/careers/trading-career-path",
      "https://corporate.exxonmobil.com/community/arkansas-blossom-festival-lithium",
      "https://corporate.exxonmobil.com/community/building-opportunity-in-angola-exxonmobil-strengthens-stem-pathways-and-community-impact",
      "https://corporate.exxonmobil.com/community/celebrating-americas-250th",
      "https://corporate.exxonmobil.com/community/community-impact-and-local-initiatives",
      "https://corporate.exxonmobil.com/community/how-exxonmobil-shows-up-in-our-hometown-delivering-record-giving-results",
      "https://corporate.exxonmobil.com/community/investing-in-people/a-place-to-thrive",
      "https://corporate.exxonmobil.com/community/investing-in-people/attract-the-best-talent",
      "https://corporate.exxonmobil.com/community/investing-in-people/data-table",
      "https://corporate.exxonmobil.com/community/investing-in-people/develop-future-leaders",
      "https://corporate.exxonmobil.com/community/investing-in-people/enable-employees-to-reach-their-full-potential",
      "https://corporate.exxonmobil.com/community/investing-in-people/one-global-team",
      "https://corporate.exxonmobil.com/community/investing-in-people/value-of-diversity",
      "https://corporate.exxonmobil.com/community/investing-in-the-future-of-southwest-arkansas",
      "https://corporate.exxonmobil.com/community/safety-first-pipeline-exxonmobil",
      "https://corporate.exxonmobil.com/community/stem",
      "https://corporate.exxonmobil.com/community/stem/international-education-initiatives",
      "https://corporate.exxonmobil.com/community/stem/national-stem-day",
      "https://corporate.exxonmobil.com/community/stem/newsroom",
      "https://corporate.exxonmobil.com/community/stem/newsroom/2026/exxonmobil-advances-stem-investment-in-guyana",
      "https://corporate.exxonmobil.com/community/stem/the-full-potential-of-stem-education",
      "https://corporate.exxonmobil.com/community/stem/united-states-education-initiatives",
      "https://corporate.exxonmobil.com/community/the-fight-against-malaria",
      "https://corporate.exxonmobil.com/community/womens-economic-opportunity",
      "https://corporate.exxonmobil.com/community/worldwide-giving-report/economic-development-and-community-resilience",
      "https://corporate.exxonmobil.com/community/worldwide-giving-report/investing-in-stem-education",
      "https://corporate.exxonmobil.com/community/worldwide-giving-report/volunteering-in-local-communities",
      "https://corporate.exxonmobil.com/corporate-governance",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors",
      "https://corporate.exxonmobil.com/corporate-governance/code-of-ethics",
      "https://corporate.exxonmobil.com/global-legal-pages/disclaimer-statement",
      "https://corporate.exxonmobil.com/greenpoint/stay-informed",
      "https://corporate.exxonmobil.com/greenpoint/stay-informed?content-lang=es",
      "https://corporate.exxonmobil.com/investors/video/invest-in-us",
      "https://corporate.exxonmobil.com/investors/video/invest-with-us",
      "https://corporate.exxonmobil.com/locations/africa-middle-east-region/africa-and-middle-east-newsroom",
      "https://corporate.exxonmobil.com/locations/africa-middle-east-region/africa-and-middle-east-newsroom/africas-young-innovators-compete-at-the-third-annual-exxonmobil-foundation-stem",
      "https://corporate.exxonmobil.com/locations/africa-middle-east-region/africa-and-middle-east-newsroom/exxonmobil-foundation-stem-africa-program-wins-local-impact-award",
      "https://corporate.exxonmobil.com/locations/africa-middle-east-region/africa-and-middle-east-newsroom/future-stem-leaders-shine",
      "https://corporate.exxonmobil.com/locations/africa-middle-east-regional-news/investing-in-african-youth-stem-education-with-ja-africa",
      "https://corporate.exxonmobil.com/locations/americas-region/americas-newsroom",
      "https://corporate.exxonmobil.com/locations/americas-region/americas-newsroom/hurricane-helene-milton-relief",
      "https://corporate.exxonmobil.com/locations/angola",
      "https://corporate.exxonmobil.com/locations/angola/angola-deepwater-blocks",
      "https://corporate.exxonmobil.com/locations/angola/esso-exploration-angola-block-15-limited-public-tenders",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/10-surprising-uses-for-oil-and-gas",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2024/how-we-help-in-asia-pacific",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2024/making-a-big-impact-with-small-gestures-malaysia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/20240808-exxonmobil-launches-the-first-renewable-diesel-for-public-road-use-in-hong-kong",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/cultivating-relationships-that-really-count",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/dyahs-advice-for-women-in-the-workforce",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/empowering-the-next-generation-through-stem-education",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/giving-students-a-taste-of-real-world-challenges",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/global-engineering-talent-in-the-heart-of-malaysia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/growing-stronger-together",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/investing-in-people-and-the-future",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/kltcs-virtual-way-of-working",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/papua-new-guinea-clans-unite-to-conserve-20000-hectares",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/renewable-diesel-basics",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2025/self-care-and-focusing-on-the-small-moments",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2026/faizah-mohd-noor-cultivating-careers-and-curiosity-through-stem",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/2026/unleashing-the-power-of-open-data",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/7-ways-co2-can-be-recycled-and-reused",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/a-changing-world-carole-gall-on-energy-women-and-indonesia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/a-day-in-the-life-afifah-mutmainnah",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/a-foundation-for-change",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/a-model-for-emissions-reductions-asias-carbon-capture-and-storage-opportunity",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/building-malaysias-next-generation-stem-talents",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/capturing-carbon-across-asia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/charging-the-energy-transition",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/community-collaboration-to-reduce-waste-build-new-businesses",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/cutting-carbon-emissions-asia-collaboration-innovation",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/eight-things-you-might-not-know-about-geology",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/five-simple-tips",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/geraldine-chin-on-exxonmobils-efforts-to-reduce-emissions",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/giving-back-across-asia-pacific",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/how-malaysia-can-lead-the-way-ccs",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/innovative-solutions-to-help-reduce-plastic-waste",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/manufacturing-and-motherhood-the-lessons-learned",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/no-shortcuts-just-pure-hard-work-how-dr-aruna-forged-a-thriving-career",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/paving-the-many-paths-towards-an-energy-transition",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/plastics-recycling-southeast-asia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/re-energising-asia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/scale-storage-skills-indonesia-ccs-difference",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/shanghai-technology-center-in-focus",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/supplying-energy-to-the-people-who-need-it-the-most",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/taking-training-into-a-new-reality",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/the-next-evolution-of-plastic-recycling-in-asia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/the-offshore-technology-conference-asia-2024/130-years-in-malaysia",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/the-offshore-technology-conference-asia-2024/leading-the-way-to-a-lower-carbon-future",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/the-offshore-technology-conference-asia-2024/mission-almost-impossible-anas-success-story",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/the-offshore-technology-conference-asia-2024/pushing-asia-pacifics-potential-ccs-capabilities-forward",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/the-offshore-technology-conference-asia-2024/why-a-career-in-stem-and-energy-matters",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/unlocking-ccs-potential-in-ap",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/what-could-an-indonesian-ccs-hub-look-like",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/what-is-natural-gas",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/what-makes-advanced-recycling-advanced",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/why-a-career-in-stem-and-energy-matters",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/why-carbon-capture-and-storage",
      "https://corporate.exxonmobil.com/locations/australia",
      "https://corporate.exxonmobil.com/locations/australia/community-engagement-and-partnerships",
      "https://corporate.exxonmobil.com/locations/australia/our-operations",
      "https://corporate.exxonmobil.com/locations/australia/our-operations/converting-altona-refinery-to-the-mobil-melbourne-terminal",
      "https://corporate.exxonmobil.com/locations/australia/our-operations/fuel-terminals",
      "https://corporate.exxonmobil.com/locations/belgium/belgium-newsroom/esso-extends-partnership-with-belgian-national-cycling-teams-for-three-years",
      "https://corporate.exxonmobil.com/locations/belgium/belgium-newsroom/exxonmobil-and-engie-develop-wind-farm-in-meerhout-that-will-supply-site-with-green-energy",
      "https://corporate.exxonmobil.com/locations/belgium/belgium-newsroom/together-for-zero-pellet-loss",
      "https://corporate.exxonmobil.com/locations/belgium/community-impact",
      "https://corporate.exxonmobil.com/locations/belgium/contact-us",
      "https://corporate.exxonmobil.com/locations/belgium/how-fuel-prices-are-determined-in-belgium",
      "https://corporate.exxonmobil.com/locations/belgium/meet-our-people",
      "https://corporate.exxonmobil.com/locations/belgium/our-history",
      "https://corporate.exxonmobil.com/locations/belgium/our-operations",
      "https://corporate.exxonmobil.com/locations/belgium/our-products",
      "https://corporate.exxonmobil.com/locations/belgium/stem-initiatives",
      "https://corporate.exxonmobil.com/locations/brazil/brazil-upstream",
      "https://corporate.exxonmobil.com/locations/brazil/community-and-culture-in-brazil",
      "https://corporate.exxonmobil.com/locations/brazil/exxonmobil-chemical-in-brazil",
      "https://corporate.exxonmobil.com/locations/brazil/global-business-center",
      "https://corporate.exxonmobil.com/locations/brazil/inclusion-and-diversity",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-begins-first-deepwater-production-in-brazil",
      "https://corporate.exxonmobil.com/locations/brazil/news/supporting-wildlife-conservation-in-brazil",
      "https://corporate.exxonmobil.com/locations/brazil/our-history-in-brazil",
      "https://corporate.exxonmobil.com/locations/brazil/safety-and-environment",
      "https://corporate.exxonmobil.com/locations/canada",
      "https://corporate.exxonmobil.com/locations/canada/renewable-diesel-production-at-strathcona-refinery",
      "https://corporate.exxonmobil.com/locations/china",
      "https://corporate.exxonmobil.com/locations/czech-republic",
      "https://corporate.exxonmobil.com/locations/czech-republic/business-operations-in-czech-republic",
      "https://corporate.exxonmobil.com/locations/czech-republic/our-exxonmobil-czech-republic-culture",
      "https://corporate.exxonmobil.com/locations/egypt",
      "https://corporate.exxonmobil.com/locations/egypt/community-investment",
      "https://corporate.exxonmobil.com/locations/egypt/operations",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2024/how-exxonmobil-is-supporting-women-in-the-workplace",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2024/red-tape-is-driving-investment-out-of-europe",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/a-bone-crushing-burden-darren-woods-discusses-csddd",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/addressing-europes-competitiveness-challenge",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/aligning-eu-policy-with-innovation",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/aligning-eu-policy-with-innovation?content-lang=es",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/aligning-eu-policy-with-innovation?content-lang=fr",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/celebrating-15-years-of-the-sci-tech-challenge",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/europes-industrial-future-is-under-threat",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/exxonmobil-france-holding-has-entered-into-exclusive-negotiations",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/have-these-stem-students-found-the-solution-to-big-city-traffic",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/reorganizing-our-footprint-in-the-european-union-and-norway",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/shaping-the-future-of-stem-in-europe",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2025/why-europes-energy-transition-needs-policy-support",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2026/how-exxonmobil-is-building-a-future-ready-workforce",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/2026/how-exxonmobil-reduced-its-methane-emissions-in-germany-by-95-percent",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/addressing-plastic-waste-with-chemical-recycling",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/advanced-plastic-sustainable-life",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/advanced-recycling",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/advanced-recycling-xavier-milcent",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/can-you-use-biofuel",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/carbon-capture-technology-field-testing-rotterdam",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/challenging-stem-students-to-make-sports-events-more-circular",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/creating-a-circular-economy-on-mars",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/cybersecurity-digital-watchtower",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/embrace-diversity",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/energy-crisis-windfall-taxes",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/exxonmobils-rd-in-numbers",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/how-we-are-supporting-chemical-recycling",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/innovation-inclusion-diversity",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/reducing-methane-emissions",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/reducing-methane-emissions-in-germany",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/supply-security-europe",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/the-sci-tech-challenge-2020-goes-virtual",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/the-secret-to-innovation",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/what-do-students-learn-from-the-sci-tech-challenge",
      "https://corporate.exxonmobil.com/locations/european-region/european-newsroom/what-to-know-about-mass-balance",
      "https://corporate.exxonmobil.com/locations/european-region/reach",
      "https://corporate.exxonmobil.com/locations/guyana",
      "https://corporate.exxonmobil.com/locations/guyana/community/community-and-social-responsibility-in-guyana",
      "https://corporate.exxonmobil.com/locations/guyana/community/community-grievance-mechanism",
      "https://corporate.exxonmobil.com/locations/guyana/community/guyana-local-content-efforts",
      "https://corporate.exxonmobil.com/locations/guyana/community/guyana-marine-turtle-conservation",
      "https://corporate.exxonmobil.com/locations/guyana/guyana-newsroom/2026/one-billion-barrels-guyanas-remarkable-journey-continues",
      "https://corporate.exxonmobil.com/locations/guyana/guyana-newsroom/2026/the-pipeline-that-matters-most-for-guyanas-future",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/03152024_exxonmobil-guyana-announces-new-discovery",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/04162025_exxonmobil-guyana-announces-arrival-of-one-guyana-fpso",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/08242026_exxonmobil-guyanas-transformative-stem-training-programme",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/09172025_exxonmobil-guyana-deepens-commitment-to-local-content-and-workforce-development",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/11122025-daily-oil-production-hits-900000-barrels-in-guyanas-stabroek-block",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/11132024_500-million-barrels-of-oil-produced-from-guyanas-stabroek-block",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/1218_exxonmobil-guyana-marks-five-years-of-oil-production",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/an-energy-superpower-practically-overnight",
      "https://corporate.exxonmobil.com/locations/guyana/operations/business-policies",
      "https://corporate.exxonmobil.com/locations/guyana/operations/environmental-efforts-in-guyana",
      "https://corporate.exxonmobil.com/locations/guyana/operations/guyana-project-overview",
      "https://corporate.exxonmobil.com/locations/guyana/publications/2023-annual-report",
      "https://corporate.exxonmobil.com/locations/guyana/video/guyana-exploration",
      "https://corporate.exxonmobil.com/locations/hong-kong/business-divisions",
      "https://corporate.exxonmobil.com/locations/hong-kong/community-engagement",
      "https://corporate.exxonmobil.com/locations/hong-kong/esso-service-stations",
      "https://corporate.exxonmobil.com/locations/hong-kong/history",
      "https://corporate.exxonmobil.com/locations/hong-kong/our-brands",
      "https://corporate.exxonmobil.com/locations/hong-kong/tsing-yi-island",
      "https://corporate.exxonmobil.com/locations/hungary",
      "https://corporate.exxonmobil.com/locations/hungary/about-exxonmobil-in-hungary",
      "https://corporate.exxonmobil.com/locations/hungary/business-operations-in-hungary",
      "https://corporate.exxonmobil.com/locations/india",
      "https://corporate.exxonmobil.com/locations/india/businesses",
      "https://corporate.exxonmobil.com/locations/india/community",
      "https://corporate.exxonmobil.com/locations/india/lng-to-power-commercial-trucks-in-india",
      "https://corporate.exxonmobil.com/locations/india/newsroom",
      "https://corporate.exxonmobil.com/locations/india/newsroom/12172023_technology-and-talent-driving-the-future-of-energy",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2024/the-next-global-manufacturing-hub-for-energy-equipment",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/a-future-made-in-india",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/bringing-carbon-capture-and-storage-to-scale",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/changing-lives-with-the-power-of-education",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/combining-emission-reduction-and-reliable-energy-supply",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/doing-more-for-modern-plastics-with-less",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/making-the-magic-happen",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/pragmatic-and-empowering-the-force-behind-indias-energy-story",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/rockhound-to-rockstar",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/taking-indian-talent-to-the-world-stage",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/the-faces-behind-the-future-of-energy-jisha-bhattacharjee",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/turning-artificial-intelligence-into-business-intelligence",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2025/viksit-bharat-lng-can-be-part-of-that",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/engineering-global-energy-infrastructure-from-india",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/how-exxonmobil-is-using-ai-as-a-catalyst-for-innovation",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/how-personal-passion-powers-progress",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/how-we-are-helping-make-india-cars-performance-ready",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/meet-our-stem-talent",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/meet-the-digital-heartbeat-of-our-company",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/natural-gas-and-the-road-to-viksit-bharat",
      "https://corporate.exxonmobil.com/locations/india/newsroom/2026/the-time-for-lng-powered-trucking-in-india-is-now",
      "https://corporate.exxonmobil.com/locations/india/newsroom/building-technology-roadmaps-to-predict-direct-the-future",
      "https://corporate.exxonmobil.com/locations/india/newsroom/celebrating-25-years-of-research-bengaluru-exxonmobil",
      "https://corporate.exxonmobil.com/locations/india/newsroom/converting-plastic-waste-to-new-products",
      "https://corporate.exxonmobil.com/locations/india/newsroom/doing-more-with-less-recycling-plastic-india",
      "https://corporate.exxonmobil.com/locations/india/newsroom/enroute-to-energy-independence",
      "https://corporate.exxonmobil.com/locations/india/newsroom/greasing-the-wheels-of-indian-manufacturing",
      "https://corporate.exxonmobil.com/locations/india/newsroom/how-education-helped-three-young-women-break-the-shackles-of-poverty",
      "https://corporate.exxonmobil.com/locations/india/newsroom/how-lubricants-are-helping-india-reach-its-climate-goals",
      "https://corporate.exxonmobil.com/locations/india/newsroom/india-moving-with-cng-lata-story",
      "https://corporate.exxonmobil.com/locations/india/newsroom/india-moving-with-cng-rajs-story",
      "https://corporate.exxonmobil.com/locations/india/newsroom/indian-institute-technology",
      "https://corporate.exxonmobil.com/locations/india/newsroom/indias-energy-transformation",
      "https://corporate.exxonmobil.com/locations/india/newsroom/indias-new-farming-technologies",
      "https://corporate.exxonmobil.com/locations/india/newsroom/insuring-indias-energy-future-a-long-term-view",
      "https://corporate.exxonmobil.com/locations/india/newsroom/it-all-starts-with-energy",
      "https://corporate.exxonmobil.com/locations/india/newsroom/keeping-india-heroes-on-the-road",
      "https://corporate.exxonmobil.com/locations/india/newsroom/making-greener-steel-for-homes-of-the-future",
      "https://corporate.exxonmobil.com/locations/india/newsroom/making-in-india",
      "https://corporate.exxonmobil.com/locations/india/newsroom/meet-the-people-making-hydrogen-and-ammonia-happen",
      "https://corporate.exxonmobil.com/locations/india/newsroom/natural-gas-lng-finding-place-india-transportation-fuels",
      "https://corporate.exxonmobil.com/locations/india/newsroom/natural-gas-steps-up-to-cut-indias-industrial-emissions",
      "https://corporate.exxonmobil.com/locations/india/newsroom/powering-the-heart-of-the-home-and-of-the-country",
      "https://corporate.exxonmobil.com/locations/india/newsroom/stem",
      "https://corporate.exxonmobil.com/locations/india/newsroom/whats-powering-indias-future",
      "https://corporate.exxonmobil.com/locations/indonesia/empowering-community",
      "https://corporate.exxonmobil.com/locations/indonesia/energy-transitions",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2024/indonesias-great-ccs-opportunity",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/a-transformative-business-for-indonesia",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/a-winning-opportunity-for-indonesia",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/an-indonesian-built-energy-resilience",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/boosting-indonesias-energy-resilience",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/helping-farmers-from-the-ground-up",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/indonesias-solution-for-the-energy-transition",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/solutions-for-sawahan-villages-water-supply",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/together-unlocking-indonesias-energy-potential",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2025/transforming-cow-manure-into-homegrown-energy",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2026/exxonmobil-engineer-ayu-shares-her-advice-for-moms-in-stem",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2026/first-of-its-kind-tech-strengthening-indonesias-oil-resilience-future",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2026/from-classrooms-to-careers-empowering-indonesias-youth-with-stem",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2026/from-potential-to-power-unlocking-indonesias-energy-future",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2026/how-we-become-indonesia-communities-partner-of-growth",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom/2026/two-decades-of-supporting-indonesias-energy-resilience",
      "https://corporate.exxonmobil.com/locations/indonesia/our-operations",
      "https://corporate.exxonmobil.com/locations/indonesia/our-presence",
      "https://corporate.exxonmobil.com/locations/italy/contact-us",
      "https://corporate.exxonmobil.com/locations/italy/corporate-governance",
      "https://corporate.exxonmobil.com/locations/italy/infineum-italia-srl",
      "https://corporate.exxonmobil.com/locations/italy/legislative-decree-231_2001",
      "https://corporate.exxonmobil.com/locations/italy/legislative-decree-24_2023",
      "https://corporate.exxonmobil.com/locations/italy/operational-integrity",
      "https://corporate.exxonmobil.com/locations/italy/our-activities",
      "https://corporate.exxonmobil.com/locations/italy/our-brands",
      "https://corporate.exxonmobil.com/locations/italy/our-companies",
      "https://corporate.exxonmobil.com/locations/italy/our-history",
      "https://corporate.exxonmobil.com/locations/kazakhstan",
      "https://corporate.exxonmobil.com/locations/malaysia",
      "https://corporate.exxonmobil.com/locations/malaysia/community-engagement",
      "https://corporate.exxonmobil.com/locations/malaysia/malaysia-newsroom/2026/empowering-terengganuts-next-generation-of-innovators-through-stem",
      "https://corporate.exxonmobil.com/locations/malaysia/malaysia-newsroom/2026/the-sweetest-support-empowering-malaysian-women-through-beekeeping",
      "https://corporate.exxonmobil.com/locations/malaysia/our-operations",
      "https://corporate.exxonmobil.com/locations/me-regional-news/exxonmobil-egypt-wins-international-loyalty-award",
      "https://corporate.exxonmobil.com/locations/mexico",
      "https://corporate.exxonmobil.com/locations/mexico/empleo-y-aviso-sobre-practicas-de-reclutamiento-fraudulentas",
      "https://corporate.exxonmobil.com/locations/mexico/principios-rectores-de-exxonmobil-mexico",
      "https://corporate.exxonmobil.com/locations/mexico/seguridad-industrial-de-exxonmobil-mexico",
      "https://corporate.exxonmobil.com/locations/mozambique/expressions-of-interest",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-and-edm-sign-letter-of-intent-for-rehabilitation-of-electrical-grid-of-palmasede",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-and-favela-united-launch-play-for-peace-program-in-palma",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-and-government-of-cabo-delgado-inaugurate-the-mozup-enterprise-development-center-in-pemba",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-concessionaires-enter-feed-stage-for-rovuma-lng-project",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-coventure-parties-secure-offtake-commitments-for-the-rovuma-lng-project",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-invests-in-education-in-cabo-delgado",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-provides-270-scholarships-to-youth-in-cabo-delgado",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/area-4-to-invest-us-1-5m-in-community-programs-in-palma",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-and-british-council-support-education-in-maputo",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-and-field-ready-sign-agreement-for-workforce-talent-development-in-mozambique",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-and-masc-foundation-support-women-empowerment-in-palma",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-and-nba-africa-launch-jr-nba-league-in-mozambique",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-and-osuwela-provide-robotics-training",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-announces-support-of-three-conservation-initiatives-in-mozambique",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-completes-lng-acquisition-in-mozambique-area-4",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-developing-stem-skills-with-robotics-training-in-maputo",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-donates-laptops-to-secondary-schools",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-foundation-renews-funding-for-business-women-connect-program-in-mozambique",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-renews-support-for-malaria-partners-in-mozambique",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-supports-children-in-need-in-maputo",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-supports-higher-education-with-stem-scholarships-at-uem",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-supports-humanitarian-response-in-mozambique",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-supports-oncology-department-at-maputo-central-hospital",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-supports-stem-education-in-maputo",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-to-acquire-25-percent-interest-in-mozambique-area-4-from-eni",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/mozambique-lng-and-exxonmobil-distribute-500-bicycles-in-mobility-program-in-palma-district",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/rovuma-lng-and-enh-groundbreaking-for-the-mozambique-technology-center",
      "https://corporate.exxonmobil.com/locations/mozambique/rovuma-lng/environmental-and-social-management",
      "https://corporate.exxonmobil.com/locations/mozambique/rovuma-lng/environmental-performance",
      "https://corporate.exxonmobil.com/locations/mozambique/rovuma-lng/project-overview",
      "https://corporate.exxonmobil.com/locations/mozambique/rovuma-lng/project-resources",
      "https://corporate.exxonmobil.com/locations/mozambique/rovuma-lng/social-performance",
      "https://corporate.exxonmobil.com/locations/netherlands/community-impact",
      "https://corporate.exxonmobil.com/locations/netherlands/contact-us",
      "https://corporate.exxonmobil.com/locations/netherlands/how-fuel-prices-are-determined-in-nl",
      "https://corporate.exxonmobil.com/locations/netherlands/local-career-initiatives",
      "https://corporate.exxonmobil.com/locations/netherlands/max-verstappen-surprises-exxonmobil-employees-in-rotterdam",
      "https://corporate.exxonmobil.com/locations/netherlands/meet-our-people",
      "https://corporate.exxonmobil.com/locations/netherlands/netherlands-newsroom/exxonmobil-to-build-ccs-pilot-plant-with-fuelcell-energy-using-carbonate-fuel-cell-technology",
      "https://corporate.exxonmobil.com/locations/netherlands/our-history",
      "https://corporate.exxonmobil.com/locations/netherlands/our-operations",
      "https://corporate.exxonmobil.com/locations/netherlands/our-products",
      "https://corporate.exxonmobil.com/locations/netherlands/stem-initiatives",
      "https://corporate.exxonmobil.com/locations/nigeria",
      "https://corporate.exxonmobil.com/locations/nigeria/newsroom",
      "https://corporate.exxonmobil.com/locations/norway/about-us",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/economic-impact",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/environmental-and-social-reports",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/national-content",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/newsroom",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/newsroom/2025/png-lng-10-year-anniversary",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/newsroom/2026/cepa-approves-amendments-to-papua-lng-environment-permits",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/newsroom/2026/png-lng-projects-focus-on-biodiversity",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/operations",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/png-10th-anniversary",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/video/contributions-to-png",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/video/png-lng",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/video/stronger-communities",
      "https://corporate.exxonmobil.com/locations/papua-new-guinea/video/the-journey-of-the-png-lng-project",
      "https://corporate.exxonmobil.com/locations/qatar",
      "https://corporate.exxonmobil.com/locations/qatar/economic-development",
      "https://corporate.exxonmobil.com/locations/qatar/environmental-development",
      "https://corporate.exxonmobil.com/locations/qatar/human-development",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/2026/exxonmobil-in-lng2026",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/2026/exxonmobil-qatar-renews-three-year-partnership-with-teach-for-qatar-to-advance-education",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/2026/inside-the-mangrove-lab-at-the-2026-qatar-exxonmobil-open",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/a-champion-for-sustainability-and-women-in-science",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/a-shared-vision-for-lng-innovation",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/celebrating-inspiring-women",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/qatar-exxonmobil-open",
      "https://corporate.exxonmobil.com/locations/qatar/qatar-newsroom/together-we-build-more-than-energy",
      "https://corporate.exxonmobil.com/locations/qatar/social-development",
      "https://corporate.exxonmobil.com/locations/singapore",
      "https://corporate.exxonmobil.com/locations/singapore/local-community-efforts",
      "https://corporate.exxonmobil.com/locations/singapore/our-business-lines",
      "https://corporate.exxonmobil.com/locations/singapore/our-operations",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20240925-caring-teacher-awards",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20250303-get-out-of-your-comfort-zone",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20250404-employee-blood-donors",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20250509-decide-on-your-priorities-and-live-by-them-mothers-day",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20250610-fathers-day-2025",
      "https://corporate.exxonmobil.com/locations/thailand/career-opportunities",
      "https://corporate.exxonmobil.com/locations/thailand/our-thailand-operations",
      "https://corporate.exxonmobil.com/locations/thailand/supporting-the-community-in-thailand",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240108-donation-to-rayong-panyanukul-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/202403-laptop-donation-to-bma",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240301-donation-to-foundation-for-the-blind",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240325-donation-to-klong-toey-center",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240424-mobil1",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240716-exxonmobil-supports-cu-faculty-of-arts",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240730-scholarship-for-nakhon-sawan-schools",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240802-support-to-wat-sri-sawan-sangkharam-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240830-nam-phong-scholarship-funds",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240902-donation-to-nam-phong-hospital",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20241018-support-flood-relief-to-friends-in-need",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20250110-em-supports-rattanakosin-bicentennial-scholarships",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20250122-em-support-flood-relief-to-wat-pho-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20250203-em-supports-laptop-to-udompat-phinix-upatham-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20250728-em-supports-ku-engineering-upskill-program",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20250826-em-presents-em-applied-science-excellence-award",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20250908-em-receives-award-from-ppat",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20251002-em-supports-schools-in-pathumthani",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20251015-em-supports-chumchon-wat-hatthasan-kaset-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20251023-bootcathon-thailand",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20251125-em-receives-amcham-corporate-social-impact-award",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20251128-em-supports-2025-icpc-bangkok",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20251210-where-support-turns-into-success",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/20251216-em-donates-to-thai-red-cross-for-flood-relief-efforts",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2025/the-strategic-partner-to-help-thailand-navigate-its-energy-future",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2026/20260119-em-supports-anuban-piboonwet-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2026/20260124-em-supports-mu-click-camp16",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2026/20260211-exxonmobils-43rd-year-supporting-thai-education",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2026/20260626-em-supports-ku-engineering-upskill-program",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2026/20260731-exxonmobil-presents-em-applied-science-award",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2026/20260909-em-receives-outstanding-organization-award-from-ppat",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/viewpoints-and-perspectives/2024/202408-exxonmobil-bootcathon",
      "https://corporate.exxonmobil.com/locations/united-arab-emirates",
      "https://corporate.exxonmobil.com/locations/united-arab-emirates/community",
      "https://corporate.exxonmobil.com/locations/united-arab-emirates/our-history",
      "https://corporate.exxonmobil.com/locations/united-arab-emirates/our-operations",
      "https://corporate.exxonmobil.com/locations/united-kingdom",
      "https://corporate.exxonmobil.com/locations/united-kingdom/community",
      "https://corporate.exxonmobil.com/locations/united-kingdom/contact-us",
      "https://corporate.exxonmobil.com/locations/united-kingdom/eddies-virtual-stem-roadshow-video-series",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fawley/em-fawley-people",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fawley/fawley-hydrogen-facility-investment",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fawley/fawley-newsroom",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fawley/fawley-operations",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fawley/fawley-safety",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fawley/uk-fawley-operations-video-series",
      "https://corporate.exxonmobil.com/locations/united-kingdom/fife",
      "https://corporate.exxonmobil.com/locations/united-kingdom/gender-pay-reporting",
      "https://corporate.exxonmobil.com/locations/united-kingdom/injunction",
      "https://corporate.exxonmobil.com/locations/united-kingdom/our-history",
      "https://corporate.exxonmobil.com/locations/united-kingdom/section-172-and-corporate-governance-statements",
      "https://corporate.exxonmobil.com/locations/united-kingdom/slavery-and-human-trafficking",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20231117_solent-cluster-wins-6-million-in-uk-government-funding-for-fawley-saf-feasibility-study",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240118_foreland-shipping-cuts-emissions-in-bio-marine-gasoil-trial",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20241120_fife-ethylene-plant-helps-brew-success-with-beath-high-school",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250225_exxonmobil-fife-ethylene-plant-honors-rodneys-illustrious-40-year-career",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250318_2500-children-benefit-from-lifesaving-first-aid-training",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250326_our-transformation-in-the-uk-continues",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250731_exxonmobil-fife-ethylene-plant-helps-lumphinnans-care-home-bloom",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250925_exxonmobil-fawley-makes-waves-with-sailing-adventure-for-children-with-disabilities",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20251105-fawley-funding-helps-establish-vital-support-hub-for-the-waterside-dementia-care-hub",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20251203-funding-mobile-nhs-health-services-unit",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20251218-next-generation-apprentice-follows-in-fathers-footsteps-at-exxonmobil-fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20251222-exxonmobil-fawley-keeps-tradition-with-its-annual-festive-charity-hamper-donation",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20260310-exxonmobil-fawley-now-recruiting-75th-anniversary-apprentices",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20260420-exxonmobil-fawley-calshot-beach-cleanup",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20260730-six-villages-together-festival-sponsored-by-exxonmobil-fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20260930-exxonmobil-fawley-funded-health-bus-launched",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/exxonmobil-fawley-supports-sports-and-community-hub-with-200k-funding-boost-and-long-term-leases",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-tax-strategy",
      "https://corporate.exxonmobil.com/locations/united-states",
      "https://corporate.exxonmobil.com/locations/united-states/alaska",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/developing-our-workforce",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/growing-the-economy",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/labi-manufacturer-of-the-year",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/newsroom",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/newsroom/202407-meet-exxonmobils-mom-next-door",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/our-facilities",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/protecting-our-environment",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/supporting-our-community",
      "https://corporate.exxonmobil.com/locations/united-states/baton-rouge-operations/valuing-safety-above-all",
      "https://corporate.exxonmobil.com/locations/united-states/baytown",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/committed-to-safety",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/community-impact-old",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/how-exxonmobil-and-md-anderson-are-charting-a-new-path-for-community-health",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/newsroom",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/newsroom/2025/0826_reconfiguring-for-growth-leveraging-the-strength-of-integration",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/newsroom/2025/doubling-down-on-double-capacity",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/newsroom/2026/baytown-becoming-one-of-the-largest-advanced-recycling-operations",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/newsroom/2026/community-picnic",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/newsroom/2026/empowering-future-leaders-through-stem-education-innovation",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/newsroom/2026/exxonmobil-foundation-awards-historic-180000-grant-to-goose-creek-cisd-to-expand-stem-education",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/our-facilities",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/video/cat-3-unit",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/video/delayed-coker-unit",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/video/unicorn-control-center",
      "https://corporate.exxonmobil.com/locations/united-states/baytown/what-is-a-turnaround",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations/about-exxonmobil-in-beaumont",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations/blade-project",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations/emergency-preparedness-and-response-at-beaumont",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations/making-texans-lives-healthier-with-be-well-beaumont",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations/newsroom",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations/rose-carbon-capture-and-storage-project",
      "https://corporate.exxonmobil.com/locations/united-states/beaumont-operations/workforce-opportunities-at-beaumont",
      "https://corporate.exxonmobil.com/locations/united-states/coastal-plain",
      "https://corporate.exxonmobil.com/locations/united-states/houston",
      "https://corporate.exxonmobil.com/locations/united-states/joliet-operations",
      "https://corporate.exxonmobil.com/locations/united-states/joliet-operations/community-impact",
      "https://corporate.exxonmobil.com/locations/united-states/joliet-operations/emergency-preparedness",
      "https://corporate.exxonmobil.com/locations/united-states/joliet-operations/safety-health-environment",
      "https://corporate.exxonmobil.com/locations/united-states/newsroom",
      "https://corporate.exxonmobil.com/locations/united-states/newsroom/2025/kids-meals-exxonmobil-campus-to-serve-26000-meals",
      "https://corporate.exxonmobil.com/locations/united-states/newsroom/2025/texas-hill-country-flood-response",
      "https://corporate.exxonmobil.com/locations/united-states/permian-basin",
      "https://corporate.exxonmobil.com/locations/united-states/permian-basin/newsroom",
      "https://corporate.exxonmobil.com/locations/united-states/permian-basin/newsroom/2025/how-weve-harnessed-the-best-of-both-in-the-permian-basin",
      "https://corporate.exxonmobil.com/locations/united-states/permian-basin/newsroom/2026/on-the-ground-in-the-permian",
      "https://corporate.exxonmobil.com/locations/vietnam",
      "https://corporate.exxonmobil.com/locations/vietnam/exxonmobil-in-the-community",
      "https://corporate.exxonmobil.com/locations/vietnam/newsroom/2025/0113_exxonmobil-uplifts-communities-in-vietnam-with-continued-support",
      "https://corporate.exxonmobil.com/locations/vietnam/newsroom/2026/0515_exxonmobil-vietnam-fosters-resilient-communities-through-education-and-health-initiatives",
      "https://corporate.exxonmobil.com/locations/vietnam/our-operations",
      "https://corporate.exxonmobil.com/news/corporate-news/11042025-exxonmobil-announces-leadership-changes",
      "https://corporate.exxonmobil.com/news/corporate-news/2025-annual-shareholder-meeting-summary",
      "https://corporate.exxonmobil.com/news/corporate-news/2026-annual-shareholder-meeting",
      "https://corporate.exxonmobil.com/news/corporate-news/a-big-idea-to-tackle-climate-change-at-cop29",
      "https://corporate.exxonmobil.com/news/corporate-news/celebrating-25-years-since-the-exxon-and-mobil-merger",
      "https://corporate.exxonmobil.com/news/corporate-news/darren-woods-on-delivering-practical-solutions-to-advance-progress",
      "https://corporate.exxonmobil.com/news/corporate-news/darren-woods-speaks-at-milken-institute",
      "https://corporate.exxonmobil.com/news/corporate-news/driving-the-automobile-evolution-for-evs-and-beyond",
      "https://corporate.exxonmobil.com/news/corporate-news/energy-at-the-movies-michael-webber",
      "https://corporate.exxonmobil.com/news/corporate-news/epa-administrator-lee-zeldin-tours-our-advanced-recycling-operations-in-baytown",
      "https://corporate.exxonmobil.com/news/corporate-news/events/investor-relations",
      "https://corporate.exxonmobil.com/news/corporate-news/exxonmobil-at-ceraweek",
      "https://corporate.exxonmobil.com/news/corporate-news/karen-mckee-wins-afpm-heritage-award-2024",
      "https://corporate.exxonmobil.com/news/corporate-news/mergers-and-acquisitions",
      "https://corporate.exxonmobil.com/news/corporate-news/message-from-the-chairman",
      "https://corporate.exxonmobil.com/news/corporate-news/pioneering-a-new-automation-technology",
      "https://corporate.exxonmobil.com/news/corporate-news/powering-the-ai-revolution-with-reliable-energy",
      "https://corporate.exxonmobil.com/news/corporate-news/shareholder-proposal",
      "https://corporate.exxonmobil.com/news/corporate-news/superior-graphite-superior-acquisitions-for-synthetic-graphite-production",
      "https://corporate.exxonmobil.com/news/corporate-news/us-secretary-of-energy-chris-wright-tours-golden-pass-lng-terminal-following-first-cargo",
      "https://corporate.exxonmobil.com/news/corporate-news/vote-in-the-2024-annual-shareholder-meeting",
      "https://corporate.exxonmobil.com/news/corporate-news/we-just-made-the-time-climate100-list",
      "https://corporate.exxonmobil.com/news/corporate-news/what-we-delivered-in-2023",
      "https://corporate.exxonmobil.com/news/events/2025/0408_exxonmobil-to-release-first-quarter-2025-financial-results",
      "https://corporate.exxonmobil.com/news/events/2025/0721_exxonmobil-to-release-second-quarter-2025-financial-results",
      "https://corporate.exxonmobil.com/news/events/2025/1020-exxonmobil-to-release-third-quarter-2025-financial-results",
      "https://corporate.exxonmobil.com/news/events/2025/delivering-higher-earnings-stronger-cash-flow-and-greater-returns",
      "https://corporate.exxonmobil.com/news/events/2026/exxonmobil-to-release-fourth-quarter-2025-financial-results",
      "https://corporate.exxonmobil.com/news/events/delivering-unmatched-value-in-a-league-of-our-own",
      "https://corporate.exxonmobil.com/news/media-contacts",
      "https://corporate.exxonmobil.com/news/news-releases",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0630_exxonmobil-says-second-well-offshore-guyana-confirms-significant-oil-discovery",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0225_exxonmobil-to-expand-carbon-capture-and-storage-at-labarge-wyoming-facility",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1214_exxonmobil-starts-operations-at-large-scale-advanced-recycling-facility",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0919_a-big-day-in-the-uk-for-carbon-capture-and-storage",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0920_key-takeaway-from-our-product-solutions-spotlight",
      "https://corporate.exxonmobil.com/news/news-releases/2023/1107_exxonmobil-elects-dina-powell-mccormick-to-board-of-directors",
      "https://corporate.exxonmobil.com/news/news-releases/2023/1113_exxonmobil-drilling-first-lithium-well-in-arkansas",
      "https://corporate.exxonmobil.com/news/news-releases/2023/1114_guyana-oil-payara-exxonmobil-offshore",
      "https://corporate.exxonmobil.com/news/news-releases/2023/1206_exxonmobil-corporate-plan",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0412_guyana-offshore-development-whiptail",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0426_exxonmobil-announces-first-quarter-2024-results",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0507_exxonmobil-elects-maria-jelescu-dreyfus-to-board-of-directors",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0612_morford-taylor-general-counsel-announcement",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0624_exxonmobil-adds-air-liquide-to-worlds-largest-low-carbon-hydrogen-project",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0625_exxonmobil-sk-lithium-supply-agreement",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0723_exxonmobil-to-release-second-quarter-2024-financial-results",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0802_exxonmobil-announces-second-quarter-2024-results",
      "https://corporate.exxonmobil.com/news/news-releases/2024/10102024_exxonmobil-secures-largest-carbon-offshore-storage-site-in-the-us",
      "https://corporate.exxonmobil.com/news/news-releases/2024/1023_exxonmobil-to-release-third-quarter-2024-financial-results",
      "https://corporate.exxonmobil.com/news/news-releases/2024/1101_exxonmobil-announces-third-quarter-2024-results",
      "https://corporate.exxonmobil.com/news/news-releases/2024/1120_exxonmobil-and-lg-chem-sign-mou-for-lithium-offtake",
      "https://corporate.exxonmobil.com/news/news-releases/2024/1121_exxonmobil-invests-200m-to-expand-advanced-recycling-in-texas",
      "https://corporate.exxonmobil.com/news/news-releases/2024/1203_exxonmobil-announces-leadership-changes",
      "https://corporate.exxonmobil.com/news/news-releases/2024/1211_exxonmobil-announces-plans-to-2030-that-build-on-its-unique-advantages",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0122_exxonmobil-to-release-fourth-quarter-and-full-year-2024-financial-results",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0131_exxonmobil-announces-2024-results",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0402_exxonmobil-announces-leadership-changes",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0423_calpine-exxonmobil-sign-co2-transportation-and-storage-agreement-for-power-generation-project",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0502_exxonmobil-announces-first-quarter-2025-results",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0507_low-carbon-ammonia-deal-marks-major-step-in-unleashing-new-energy-supply",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0801_exxonmobil-announces-second-quarter-2025-results",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0808_exxonmobil-guyana-begins-production-at-fourth-offshore-guyana-project",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0915_ensuring-retail-investors-are-heard",
      "https://corporate.exxonmobil.com/news/news-releases/2025/0922_exxonmobil-guyana-expands-capacity-with-seventh-offshore-development",
      "https://corporate.exxonmobil.com/news/news-releases/2025/1031-exxonmobil-announces-third-quarter-2025-results",
      "https://corporate.exxonmobil.com/news/news-releases/2025/1209-exxonmobil-raises-2030-plan-transformation",
      "https://corporate.exxonmobil.com/news/news-releases/2026/0130-exxonmobil-announces-2025-results",
      "https://corporate.exxonmobil.com/news/news-releases/2026/0310-redomiciling-the-company-from-new-jersey-to-texas",
      "https://corporate.exxonmobil.com/news/news-releases/2026/0702-exxonmobil-donates-500000-to-american-red-cross-for-venezuela-earthquake-relief",
      "https://corporate.exxonmobil.com/news/news-releases/2026/0908-exxonmobil-cash-tender-offers",
      "https://corporate.exxonmobil.com/news/news-releases/2026/0915-exxonmobil-announces-pricing-terms-expiration-and-results-of-cash-tender-offers",
      "https://corporate.exxonmobil.com/news/news-releases/2026/our-perspective-regarding-the-situation-in-venezuela",
      "https://corporate.exxonmobil.com/news/social-media",
      "https://corporate.exxonmobil.com/news/viewpoints",
      "https://corporate.exxonmobil.com/news/viewpoints/11-trillion-elephants-and-other-answers-on-co2-storage",
      "https://corporate.exxonmobil.com/news/viewpoints/2025-taking-carbon-capture-and-storage-from-momentum-to-impact",
      "https://corporate.exxonmobil.com/news/viewpoints/a-breakout-year-for-our-carbon-capture-and-storage-business",
      "https://corporate.exxonmobil.com/news/viewpoints/action-on-methane-regulations",
      "https://corporate.exxonmobil.com/news/viewpoints/advanced-recycling-and-the-future-of-plastics",
      "https://corporate.exxonmobil.com/news/viewpoints/all-in-on-industry-initiative-aiming-for-zero-methane-emissions",
      "https://corporate.exxonmobil.com/news/viewpoints/better-methane-regulatory-approach-needed",
      "https://corporate.exxonmobil.com/news/viewpoints/building-trust-among-gulf-coast-communities-as-ccs-expands",
      "https://corporate.exxonmobil.com/news/viewpoints/circularity-progress-for-houston",
      "https://corporate.exxonmobil.com/news/viewpoints/commitment-paris-agreement",
      "https://corporate.exxonmobil.com/news/viewpoints/decarbonization-not-deindustrialization",
      "https://corporate.exxonmobil.com/news/viewpoints/developing-energy-climate-solutions-with-science-and-technology",
      "https://corporate.exxonmobil.com/news/viewpoints/developing-new-technologies",
      "https://corporate.exxonmobil.com/news/viewpoints/economic-empowerment-starts-with-opportunities",
      "https://corporate.exxonmobil.com/news/viewpoints/exxonmobil-state-of-the-business-address",
      "https://corporate.exxonmobil.com/news/viewpoints/guyana-oil-gas-production",
      "https://corporate.exxonmobil.com/news/viewpoints/helping-meet-the-plastic-waste-challenge",
      "https://corporate.exxonmobil.com/news/viewpoints/helping-steelmakers-reduce-emissions",
      "https://corporate.exxonmobil.com/news/viewpoints/how-do-gas-prices-work",
      "https://corporate.exxonmobil.com/news/viewpoints/investing-15-billion-lower-carbon-future",
      "https://corporate.exxonmobil.com/news/viewpoints/lets-discuss-reducing-americas-emissions",
      "https://corporate.exxonmobil.com/news/viewpoints/lng-powering-progress-today-and-tomorrow",
      "https://corporate.exxonmobil.com/news/viewpoints/lowering-emissions-with-liquefied-natural-gas",
      "https://corporate.exxonmobil.com/news/viewpoints/more-people-more-possibility-introducing-exxonmobils-2025-global-outlook",
      "https://corporate.exxonmobil.com/news/viewpoints/navigating-lubricant-supply-through-global-disruption",
      "https://corporate.exxonmobil.com/news/viewpoints/on-the-road-busan-global-plastic-treaty",
      "https://corporate.exxonmobil.com/news/viewpoints/ottawa-advanced-recycling-plastic-waste",
      "https://corporate.exxonmobil.com/news/viewpoints/our-position-on-climate-policy",
      "https://corporate.exxonmobil.com/news/viewpoints/promoting-fiscal-transparency",
      "https://corporate.exxonmobil.com/news/viewpoints/reducing-natural-gas-flaring",
      "https://corporate.exxonmobil.com/news/viewpoints/reframing-the-climate-challenge",
      "https://corporate.exxonmobil.com/news/viewpoints/saving-europes-core-industries",
      "https://corporate.exxonmobil.com/news/viewpoints/say-whats-your-outlook-chris-birdsall",
      "https://corporate.exxonmobil.com/news/viewpoints/supports-carbon-pricing",
      "https://corporate.exxonmobil.com/news/viewpoints/supports-methane-regulation",
      "https://corporate.exxonmobil.com/news/viewpoints/tackling-methane-emissions",
      "https://corporate.exxonmobil.com/news/viewpoints/the-looming-crisis-putting-europes-energy-security-at-risk",
      "https://corporate.exxonmobil.com/news/viewpoints/the-policy-keys-to-unlocking-a-european-industrial-comeback",
      "https://corporate.exxonmobil.com/news/viewpoints/the-power-of-two-in-understanding-the-future",
      "https://corporate.exxonmobil.com/news/viewpoints/thoughts-on-the-energy-transition",
      "https://corporate.exxonmobil.com/news/viewpoints/time-travel-to-2018-for-an-exxonmobil-earnings-perspective",
      "https://corporate.exxonmobil.com/news/viewpoints/vijay-swarup-dual-challenge",
      "https://corporate.exxonmobil.com/news/viewpoints/what-happens-when-the-world-needs-more-of-everything",
      "https://corporate.exxonmobil.com/news/viewpoints/why-exxonmobils-permian-net-zero-plan-by-2030-matters",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/supplier-diversity",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/supplier-excellence-awards",
      "https://corporate.exxonmobil.com/procurement/year-end-supplier-communications",
      "https://corporate.exxonmobil.com/publications/advancing-climate-solutions/driving-reductions-in-methane-emissions",
      "https://corporate.exxonmobil.com/publications/advancing-climate-solutions/governance-and-risk-management",
      "https://corporate.exxonmobil.com/publications/advancing-climate-solutions/growing-low-carbon-solutions",
      "https://corporate.exxonmobil.com/publications/advancing-climate-solutions/positioned-for-growth-in-a-lower-emission-future",
      "https://corporate.exxonmobil.com/publications/advancing-climate-solutions/rational-and-constructive-policy",
      "https://corporate.exxonmobil.com/publications/advancing-climate-solutions/research-and-development",
      "https://corporate.exxonmobil.com/publications/global-outlook/about-the-exxonmobil-global-outlook",
      "https://corporate.exxonmobil.com/publications/global-outlook/affordability-will-drive-the-pace-of-any-transition",
      "https://corporate.exxonmobil.com/publications/global-outlook/all-energy-types-will-be-needed",
      "https://corporate.exxonmobil.com/publications/global-outlook/co2-emissions-projected-to-fall-by-2050",
      "https://corporate.exxonmobil.com/publications/global-outlook/developing-countries-use-more-energy",
      "https://corporate.exxonmobil.com/publications/global-outlook/electricity-demand-increases",
      "https://corporate.exxonmobil.com/publications/global-outlook/industry-and-transport-drive-economic-growth",
      "https://corporate.exxonmobil.com/publications/global-outlook/introduction",
      "https://corporate.exxonmobil.com/publications/global-outlook/oil-and-gas-investment-is-more-important-than-ever",
      "https://corporate.exxonmobil.com/publications/global-outlook/projections-vs-scenarios",
      "https://corporate.exxonmobil.com/publications/global-outlook/references-and-supplemental-information",
      "https://corporate.exxonmobil.com/publications/governance-and-executive-compensation",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/chemicals",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/chemicals?content-lang=es",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/chemicals?content-lang=fr",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/fuels",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/fuels?content-lang=es",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/fuels?content-lang=fr",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/lubricants",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/lubricants?content-lang=es",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started/lubricants?content-lang=fr",
      "https://corporate.exxonmobil.com/system-updates/hub/frequently-asked-questions",
      "https://corporate.exxonmobil.com/system-updates/hub/frequently-asked-questions?content-lang=es",
      "https://corporate.exxonmobil.com/system-updates/hub/frequently-asked-questions?content-lang=fr",
      "https://corporate.exxonmobil.com/system-updates/hub/news-and-updates",
      "https://corporate.exxonmobil.com/system-updates/hub/news-and-updates?content-lang=es",
      "https://corporate.exxonmobil.com/system-updates/hub/news-and-updates?content-lang=fr",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/bringing-carbon-capture-storage-to-summer-camp",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/carbon-capture-storage-prasanna-joshi",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/carbon-capture-storage-slice-and-dice",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/clare-glover-net-zero",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/erik-oswald-net-zero",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/expanding-our-ccs-operations-in-louisiana-with-another-project-startup",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/exxonmobil-signs-carbon-capture-agreement-cf-industries-yazoo",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/first-ccs-well",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/how-do-we-keep-carbon-capture-and-storage-safe",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/irtiza-sayyed-leading-the-way-to-a-lower-carbon-future",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/labarge-carbon-capture-facility-wyoming",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/lcs-highlights-new-technologies-on-energy-podcast",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/lower-carbon-steel-and-permanent-storage-ccs-expands-across-the-gulf-coast",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/rethinking-how-co2-moves-at-scale",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/steel-ammonia-ai-what-cant-ccs-help-decarbonize",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/three-steps-for-reducing-co2-emissions",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/video/clay-sutton",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/video/elizabeth-hay",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/carbon-capture-and-storage/video/mark-armstrong",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/direct-air-capture-technology/direct-air-capture-net-zero-solution",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/direct-air-capture-technology/insights-from-our-direct-air-capture-pilot",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen/advancing-low-emission-hydrogen",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen/baytown-hydrogen-burner-decarbonize-industry",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen/learn-new-hydrogen-burner-zeeco-for-industry",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen/low-carbon-ammonia",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen/low-carbon-hydrogen-market-report",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen/newsroom",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/hydrogen/zeeco-exxonmobil-hydrogen-industrial-burners",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/lithium/2-minutes-turning-brine-into-battery-grade-lithium",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/lithium/charging-into-the-lithium-business",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/lithium/how-a-geoscientist-looks-for-lithium",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/lithium/listen-up-were-talking-lithium",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/lithium/lithium-meet-stephanie-lollar",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/lithium/making-lithium-and-making-a-difference",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/lithium/stanley-whittingham-lithium-ion-battery-patrick-howarth",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/newsroom",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/proxxima-systems-near-phase-one-completion",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/topic/innovations-in-technology",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/topic/plans-and-technologies-for-reduction",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/topic/strategies-for-reducing-emissions",
      "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/topic/techniques-and-technologies-for-co2-capture",
      "https://corporate.exxonmobil.com/what-we-do/diversity-of-supply",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/certified-natural-gas",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/connecting-us-industry-growth",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/crude-trading",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/crude-trading/crude-oil-assays",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/energizing-guyanas-tomorrow",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/guyana-efficient-energy-production-liza-unity",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/how-policy-is-undermining-energy",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/lets-talk-lng",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/methane-emissions-technology-permian-basin-net-zero",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/natural-gas",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/new-mexico-natural-gas-permian-basin",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/oil",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/oil/canadian-oil-sands-a-source-of-secure-accessible-and-affordable-energy",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/permian-basin-reliable-energy-net-zero-purpose",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/worlds-largest-oil-platforms",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/a-different-way-to-handle-used-plastics",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-baytown-unit",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-natalie-martinez-engineer-unlocking-potential",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-plastic-waste-exxonmobil",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-plastic-waste-matthew-mcconomy-engineer",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-stephanie-westbrook-technologist-unlocking-potential",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-technology/advanced-recycling-policy/how-advanced-recycling-delivers",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-technology/advanced-recycling-policy/pathways-to-scaling-todays-advanced-recycling-technologies",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-recycling-technology/advanced-recycling-policy/what-advanced-recycling-really-does",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/advanced-synthetic-graphite/our-roadmap-to-delivering-advanced-synthetic-graphite-at-scale",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/high-purity-solvent-to-support-next-generation-of-tech-manufacturing",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/labarge-helium-extraction-energy-production-wyoming",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/plastic-recycling-innovations-atando-cabos",
      "https://corporate.exxonmobil.com/what-we-do/materials-for-modern-living/two-sides-same-coin",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/emerging-vehicle-and-fuel-technology",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/aviation/france-sustainable-aviation-fuel-emissions-reduction",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/co-processing",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/expert-spotlight-brianne-kanach",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/fueling-americas-future-toyota-lowering-emissions",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/renewable-diesel-strathcona-canada",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/the-aha-moment-krystal-wrigley",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/the-aha-moment-meha-shah",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/the-aha-moment-sheryl-rubin-pitel-and-ken-kar",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/lower-emission-fuels/the-road-to-renewable-fuel",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/motorsports/a-new-breed-of-racing",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/motorsports/chasing-perfection-oracle-redbull-racing-f1",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/motorsports/emtec-racing-advisors-f1-fuels-lubricants",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/motorsports/from-lab-to-track-red-bull-ktm-factory-racing",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/newsroom",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/optimizing-to-meet-global-demand-and-higher-living-standards",
      "https://corporate.exxonmobil.com/what-we-do/transforming-transportation/planning-the-journey-lower-emission-commercial-diesel-fleets"
    ],
    "coverageGaps": [],
    "description": "Page opening with a full-width banner image (optionally with overlaid title), followed by a content body with a left metadata/share rail, rich text sections and card rows",
    "blocks": [
      {
        "name": "hero-article-banner",
        "instances": [
          "section.articleHeader div.articleHeader--imagewrapper",
          "#main-content > section.articleHeader div.articleHeader--imagewrapper"
        ]
      },
      {
        "name": "secondary-nav",
        "instances": [
          "section.articleHeader nav.secondaryNav",
          "#main-content nav.secondaryNav"
        ]
      },
      {
        "name": "columns-article-header",
        "instances": [
          "section.articleHeader > div.container",
          "#main-content > section.articleHeader > div.container"
        ]
      },
      {
        "name": "cards-topics",
        "instances": [
          "section.featureGrid--wrapper div.featureGrid--container",
          "div.article--wrapper div.featureGrid--container"
        ]
      },
      {
        "name": "table",
        "instances": [
          "div.article--wrapper table",
          "#main-content table"
        ]
      },
      {
        "name": "quote",
        "instances": [
          "div.article--wrapper div.pullquote",
          "#main-content div.pullquote"
        ]
      },
      {
        "name": "video",
        "instances": [
          "div.article--wrapper section.articleMedia-video",
          "#main-content section.articleMedia-video"
        ]
      }
    ],
    "representativeUrl": "https://corporate.exxonmobil.com/locations/guyana/news-releases/11122025-daily-oil-production-hits-900000-barrels-in-guyanas-stabroek-block",
    "sections": [
      {
        "id": "rc2",
        "name": "Banner and article header",
        "selector": [
          "section.articleHeader",
          "#main-content > section.articleHeader"
        ],
        "style": null,
        "blocks": [
          "hero-article-banner",
          "secondary-nav",
          "columns-article-header"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "Article body",
        "selector": [
          "div.article--wrapper",
          "#main-content > div.article--wrapper"
        ],
        "style": null,
        "blocks": [
          "quote",
          "table",
          "video"
        ],
        "defaultContent": [
          "div.article--wrapper section.rich-text",
          "div.article--wrapper section.articleMedia"
        ]
      },
      {
        "id": "rc3b",
        "name": "Newsroom / CTA band (every div.article--wrapper > section.singleFeature; style from colour class, handled generically by exxonmobil-sections.js)",
        "selector": [
          "div.article--wrapper > section.singleFeature"
        ],
        "style": "blue-gradient",
        "blocks": [],
        "defaultContent": [
          "section.singleFeature .singleFeature--content"
        ]
      },
      {
        "id": "rc3c",
        "name": "Explore more",
        "selector": [
          "div.article--wrapper > section.featureGrid--wrapper",
          "section.featureGrid--wrapper"
        ],
        "style": null,
        "blocks": [
          "cards-topics"
        ],
        "defaultContent": [
          "section.featureGrid--wrapper div.featureGrid--section-title"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_banner_content_page_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const sourceUrl = new URL(params.originalURL);
      const lang = sourceUrl.searchParams.get("content-lang");
      let rawPath = sourceUrl.pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      if (lang === "es" || lang === "fr") rawPath = `/${lang}${rawPath || "/index"}`;
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_banner_content_page_exports);
})();

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

  // tools/importer/import-article.js
  var import_article_exports = {};
  __export(import_article_exports, {
    default: () => import_article_default
  });

  // tools/importer/parsers/columns-article-header.js
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse(element, { document: document2 }) {
    const meta = element.querySelector(".articleHeader--metadata") || element;
    const content = element.querySelector(".articleHeader--content") || element;
    const metaCell = [];
    const tag = meta.querySelector(".tag");
    if (tag && clean(tag.textContent)) {
      const p = document2.createElement("p");
      const tagLink = tag.querySelector("a[href]");
      if (tagLink) {
        const a = document2.createElement("a");
        a.href = tagLink.getAttribute("href");
        a.textContent = clean(tagLink.textContent);
        p.append(a);
      } else {
        p.textContent = clean(tag.textContent);
      }
      metaCell.push(p);
    }
    [".content-type", ".date"].forEach((sel) => {
      const el = meta.querySelector(sel);
      const text = el ? clean(el.textContent) : "";
      if (!text) return;
      const p = document2.createElement("p");
      p.textContent = text;
      metaCell.push(p);
    });
    const contentCell = [];
    const titleEl = content.querySelector(".articleHeader--title, h1, h2");
    const title = titleEl ? clean(titleEl.textContent) : "";
    if (title) {
      const h1 = document2.createElement("h1");
      h1.textContent = title;
      contentCell.push(h1);
    }
    const descEl = content.querySelector(".articleHeader--description");
    const desc = descEl ? clean(descEl.textContent) : "";
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
  function clean2(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parseFeatureGridItem(item, document2) {
    const link = item.querySelector("a.featureGrid--link") || item.querySelector("a[href]:not(.tag a)");
    const href = link ? link.getAttribute("href") : null;
    const titleEl = item.querySelector(".featureGrid--title");
    const title = titleEl ? clean2(titleEl.textContent) : "";
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
    const desc = descEl ? clean2(descEl.textContent) : "";
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc;
      textContent.push(p);
    }
    const info = item.querySelector(".article--info");
    if (info) {
      const tag = info.querySelector(".tag");
      if (tag && clean2(tag.textContent)) {
        const p = document2.createElement("p");
        const tagLink = tag.querySelector("a[href]");
        if (tagLink) {
          const a = document2.createElement("a");
          a.href = tagLink.getAttribute("href");
          a.textContent = clean2(tagLink.textContent);
          p.append(a);
        } else {
          p.textContent = clean2(tag.textContent);
        }
        textContent.push(p);
      }
      const type = clean2((info.querySelector(".content-type") || {}).textContent);
      const date = clean2((info.querySelector(".date") || {}).textContent);
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
  function parse2(element, { document: document2 }) {
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
  function parse3(element, { document: document2 }) {
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
  var DEFAULT_ORIGIN = "https://corporate.exxonmobil.com";
  var BLOCK_TAGS2 = /* @__PURE__ */ new Set(["P", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6"]);
  var OPEN_QUOTES = /^[\s ]*[“”„"]+[\s ]*/;
  var CLOSE_QUOTES = /[\s ]*[“”"]+[\s ]*$/;
  function clean3(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function hasText2(node) {
    return clean3(node.textContent).length > 0;
  }
  function isBlank2(n) {
    return n.nodeType === 8 || n.nodeType === 3 && !clean3(n.textContent) || n.nodeName === "BR";
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
  function edgeText(node, first) {
    const kids = [...node.childNodes];
    if (!first) kids.reverse();
    for (let i = 0; i < kids.length; i += 1) {
      const k = kids[i];
      if (k.nodeType === 3) {
        if (clean3(k.textContent)) return k;
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
    img.src = absolute(src, origin);
    const alt = srcImg ? srcImg.getAttribute("alt") : null;
    img.alt = alt !== null ? clean3(alt) : fallbackAlt || "";
    return img;
  }
  function attributionContent(author, document2) {
    if (!author) return [];
    const out = [];
    const nameEl = author.querySelector(".author--name");
    const name = nameEl ? clean3(nameEl.textContent) : "";
    if (name) {
      const p = document2.createElement("p");
      p.textContent = name;
      out.push(p);
    }
    author.querySelectorAll(".author--title").forEach((t) => {
      const role = clean3(t.textContent);
      if (!role) return;
      const p = document2.createElement("p");
      p.textContent = role;
      out.push(p);
    });
    return out;
  }
  function parse4(element, { document: document2 }) {
    const ctx = arguments[1] || {};
    const origin = getOrigin(document2, ctx);
    const variants = [];
    if (element.classList.contains("pullquote-blue")) variants.push("blue");
    else if (element.classList.contains("pullquote-black")) variants.push("black");
    const blockquote = element.querySelector("blockquote.pullquote--blockquote, blockquote");
    const textEl = element.querySelector(".pullquote--text") || blockquote;
    const quotation = textEl ? quotationContent(textEl, document2) : [];
    const author = element.querySelector(".author");
    const attribution = attributionContent(author, document2);
    const nameEl = author ? author.querySelector(".author--name") : null;
    const img = portrait(author, document2, origin, nameEl ? clean3(nameEl.textContent) : "");
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
  function clean4(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function usableTitle(text) {
    const t = clean4(text);
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
    const bcCandidates = [...element.querySelectorAll("[data-video-id][data-account]")].filter((el) => clean4(el.getAttribute("data-video-id")) && clean4(el.getAttribute("data-account")));
    if (bcCandidates.length) {
      const el = bcCandidates[0];
      const pick = (name) => {
        for (let i = 0; i < bcCandidates.length; i += 1) {
          const v = clean4(bcCandidates[i].getAttribute(name));
          if (v) return v;
        }
        return "";
      };
      const account = clean4(el.getAttribute("data-account"));
      const videoId = clean4(el.getAttribute("data-video-id"));
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
      if (!clean4(c.textContent)) return;
      const blocks = [...c.children].filter((k) => BLOCK_TAGS3.has(k.tagName));
      if (blocks.length) {
        blocks.forEach((b) => {
          if (clean4(b.textContent)) out.push(b);
        });
        return;
      }
      const p = document2.createElement("p");
      p.append(...c.childNodes);
      out.push(p);
    });
    return out;
  }
  function parse5(element, { document: document2 }) {
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

  // tools/importer/import-article.js
  var parsers = {
    "columns-article-header": parse,
    "cards-topics": parse2,
    table: parse3,
    quote: parse4,
    video: parse5
  };
  var PAGE_TEMPLATE = {
    "name": "article",
    "urls": [
      "https://corporate.exxonmobil.com/careers/ashlika-persaud",
      "https://corporate.exxonmobil.com/careers/benefits/hungary-employee-benefits",
      "https://corporate.exxonmobil.com/careers/benefits/singapore-employee-benefits",
      "https://corporate.exxonmobil.com/careers/benefits/us-employee-benefits",
      "https://corporate.exxonmobil.com/careers/exxonmobil-is-an-equal-opportunity-employer",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-at-us-manufacturing-sites",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-bangkok",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-budapest",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-clinton-nj",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-curitiba",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-fawley",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-kuala-lumpur",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-prague",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-shanghai",
      "https://corporate.exxonmobil.com/careers/featured-hiring-locations/careers-in-singapore",
      "https://corporate.exxonmobil.com/careers/internship-opportunities",
      "https://corporate.exxonmobil.com/careers/pre-employment-process/regular-hire",
      "https://corporate.exxonmobil.com/community/exxonmobil-and-the-green-book",
      "https://corporate.exxonmobil.com/community/royalty-owners/account-information",
      "https://corporate.exxonmobil.com/community/royalty-owners/address-change",
      "https://corporate.exxonmobil.com/community/royalty-owners/change-of-ownership",
      "https://corporate.exxonmobil.com/community/royalty-owners/joint-interest-billing",
      "https://corporate.exxonmobil.com/community/royalty-owners/our-departments",
      "https://corporate.exxonmobil.com/community/royalty-owners/payout",
      "https://corporate.exxonmobil.com/community/royalty-owners/question-about-check",
      "https://corporate.exxonmobil.com/community/royalty-owners/selling-mineral-rights",
      "https://corporate.exxonmobil.com/community/royalty-owners/tax-questions",
      "https://corporate.exxonmobil.com/community/stem/our-partners-in-supporting-education-worldwide",
      "https://corporate.exxonmobil.com/community/the-fight-against-malaria/impacts-of-the-exxonmobil-malaria-initiative",
      "https://corporate.exxonmobil.com/community/the-fight-against-malaria/our-partners-are-dedicated-to-reducing-malarias-threat",
      "https://corporate.exxonmobil.com/community/womens-economic-opportunity/our-partners-in-building-womens-economic-opportunities",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors/audit-committee-charter",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors/compensation-committee-charter",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors/executive-committee-charter",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors/finance-committee-charter",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors/nominating-and-governance-committee-charter",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors/powers-of-the-board",
      "https://corporate.exxonmobil.com/corporate-governance/board-of-directors/public-issues-and-contributions-committee-charter",
      "https://corporate.exxonmobil.com/corporate-governance/certificate-of-formation-and-by-laws",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies/audit-committee-pre-approval-policy-and-procedure-memorandum-for-services-obtained",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies/board-statement-on-incentive-compensation-in-case-of-restatement",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies/guidelines-for-review-of-related-person-transactions",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies/policy-statement-on-option-repricing",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies/policy-statement-on-poison-pills",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies/procedures-for-shareholders-and-other-interested-parties-to-communicate",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-governance-guidelines-and-additional-policies/rule-10d-1-recoupment-policy",
      "https://corporate.exxonmobil.com/corporate-governance/corporate-officers-and-affiliated-companies",
      "https://corporate.exxonmobil.com/global-legal-pages/apps-ios-terms",
      "https://corporate.exxonmobil.com/global-legal-pages/dutch-privacy-policy",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_brazil-portuguese",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_czech",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_dutch",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_french",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_german",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_hungary-hungarian",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_italian",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_polish",
      "https://corporate.exxonmobil.com/global-legal-pages/our-privacy-policies/data-privacy-code-of-conduct_uk-summary",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_application-specific",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_australia-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_belgium-dutch",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_belgium-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_belgium-french",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_china-chinese",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_china-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_colombia-spanish",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_colombia_mexico_spanish_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_cyprus-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_cyprus-greek",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_czech-republic-czech",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_czech-republic-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_denmark-danish",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_denmark-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_egypt-arabic",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_egypt-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_english_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu-hq-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_czech_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_danish_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_dutch_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_finnish_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_german_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_hungarian_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_italian_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_norwegian_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_polish_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_eu_swedish_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_finland-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_finland-finnish",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_france-french",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_germany-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_hong-kong-chinese",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_hong-kong-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_hungary-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_hungary-hungaria",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_icm_upstream_czech",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_icm_upstream_english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_indonesia-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_italy-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_italy-italian",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_jetty_english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_luxembourg-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_luxembourg-french",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_luxembourg-german",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_mexico-spanish_marketing",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_mozambique-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_mozambique-portuguese",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_netherlands-dutch",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_netherlands-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_netherlands-french",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_nigeria-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_norway-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_norway-norwegian",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_papua-new-guinea-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_poland-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_poland-polish",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_qatar-arabic",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_qatar-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_singapore-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_sweden-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_sweden-swedish",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_taiwan-chinese",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_taiwan-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_thailand-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_thailand-thai",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_turkey-turkish",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_turkey_procurement",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_uk-english",
      "https://corporate.exxonmobil.com/global-legal-pages/privacy-policy_us-spanish",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions-general_aviation-emoc-amr",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions-general_marine",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions-general_us-basestocks-and-waxes",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions-general_us-lubes-pci",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions-obc",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions_china-chinese",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions_china-english",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions_egypt-arabic",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions_italy-italian",
      "https://corporate.exxonmobil.com/global-legal-pages/terms-and-conditions_turkey-turkish",
      "https://corporate.exxonmobil.com/greenpoint",
      "https://corporate.exxonmobil.com/greenpoint/community-programs",
      "https://corporate.exxonmobil.com/greenpoint/community-programs/us-military-academy-at-west-point",
      "https://corporate.exxonmobil.com/greenpoint/community-programs/us-military-academy-at-west-point?content-lang=es",
      "https://corporate.exxonmobil.com/greenpoint/community-programs?content-lang=es",
      "https://corporate.exxonmobil.com/greenpoint/newsletters",
      "https://corporate.exxonmobil.com/greenpoint/newsletters?content-lang=es",
      "https://corporate.exxonmobil.com/greenpoint/our-commitment",
      "https://corporate.exxonmobil.com/greenpoint/our-commitment?content-lang=es",
      "https://corporate.exxonmobil.com/greenpoint/remediation",
      "https://corporate.exxonmobil.com/greenpoint/remediation?content-lang=es",
      "https://corporate.exxonmobil.com/greenpoint?content-lang=es",
      "https://corporate.exxonmobil.com/locations/africa-middle-east-region/africa-and-middle-east-newsroom/venture-framework-agreement",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/from-start-to-finish-to-start-again-creating-a-new-life-for-plastic-waste",
      "https://corporate.exxonmobil.com/locations/asia-pacific-region/ap-newsroom/irtiza-sayyed-low-carbon-energy-asia",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/exxonmobil-australias-industrial-hygienists-recognised-with-prestigious-awards",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/first-long-range-vessel-arrives-at-marsden-point",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2022/meet-exxonmobil-australias-sponsor-puppy-vegemite",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/a-huge-thank-you-from-the-williamstown-community-and-education-centre",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/altona-and-yarraville-terminals-supporting-safe-operations",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/emergency-response-drills-at-yarraville-terminal",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/fuel-with-mobil-and-fly-promotion-draw",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/fuelling-the-future-at-the-brisbane-truck-show",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/i-have-been-lucky-to-have-a-wide-ranging-career-at-exxonmobil",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/investing-in-reliable-fuel-supply",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/keeping-the-skies-safe",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/lower-emission-fuels-have-a-vital-role-to-play-in-australias-energy-future",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/meet-australian-fuels-operations-manager-catherine-odonnell",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/melbourne-terminal-community-bulletin-may-2023",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/melbourne-terminal-may-june-2023-community-bulletin",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-and-foodbank-work-together-to-help-families-in-need",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-and-melbourne-united-announce-extension",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-and-melbourne-united-proving-to-be-a-great-match",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-attends-western-region-council-bi-annual-forum-2023",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-largest-diesel-delivery-to-sydney-and-melbourne",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-supports-schools-short-documentary-film-about-the-westgate-bridge",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-supports-the-2023-yarraville-festival",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/mobil-supports-the-nourish-project",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/playing-a-vital-role-in-emergency-response-preparedness",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/snowy-visits-exxonmobil-australia",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/upgrade-projects-at-altona-terminal",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2023/yarraville-terminal-celebrates-the-opening-of-bay-10",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/be-open-to-opportunities",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/bringing-the-community-together",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/cheering-on-williamstown-fcs-vflw-team",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/each-day-brings-a-new-challenge",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/emergency-response-drill-at-gellibrand-marine-terminal",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/employee-profile-margaret-rogacki",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/exxonmobil-australia-christmas-donation-supports-infant-buddy-bags",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/exxonmobil-australia-lng-team-lends-a-helping-hand",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/exxonmobil-australia-new-ceo-tours-mobil-melbourne-terminal",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/high-quality-jet-fuel-for-victorians-with-less-waste",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/it-is-an-exciting-time-to-be-part-of-this-business",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/kidscan-and-mobil-new-zealand-partnership-helps-kiwi-kids-in-need",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/lighting-up-an-iconic-landmark-in-the-williamstown-skyline",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/meet-our-2024-intern-cohort",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/meet-trisha-the-seeing-eye-dog-puppy-in-training",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/melbourne-terminal-community-bulletin-may-2024",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/melbourne-terminal-community-bulletin-october-2024",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/melbourne-terminal-welcomes-new-terminal-operators",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/mid-coasts-amazing-race-event-engages-south-australian-youth",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/mobil-altona-terminal-team-celebrates-completion-of-multiple-major-project-milestones",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/mobil-announces-new-partnership-with-community-club-williamstown-fc",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/mobil-oil-australia-2024-retail-conference",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/mobil-sponsors-stem-activation-at-2024-yarraville-festival",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/mobil-team-attends-williamstown-fc-mothers-day-luncheon",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/mobil-team-tours-long-range-vessel",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/new-7-eleven-x-mobil-fuels-ad-campaign-is-live",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/supporting-community-bird-monitoring-program-in-altona-wetlands",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/update-from-the-mobil-melbourne-terminal",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/woollybutt-title-relinquishment",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2024/yarraville-terminal-commissions-new-control-room",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2025/altona-refinery-facilities-to-begin-demolition-works",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2025/farewell-to-our-former-altona-refinery-facilities",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2025/meet-team-homer",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2025/melbourne-terminal-community-bulletin-april-2025",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-community-outreach/2025/melbourne-terminal-community-bulletin-october-2025",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-new-zealand-and-kidscan-are-making-a-difference-to-the-lives-of-kiwi-kids-in-need",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-new-zealand-support-for-patea-community-patrol-pivotal-to-the-community",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-nz-and-kidscan-supporting-kiwi-kids-in-need",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-successfully-delivers-the-largest-ever-fuel-cargo-to-marsden-point-terminal",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/mobil-team-joins-conservation-volunteers-new-zealand-tree-rescue-effort",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/new-zealand-fuel-prices",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/news-releases/2021/exxonmobil-to-convert-altona-refinery-to-import-terminal",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/news-releases/2022/mobil-invests-in-delivering-reliable-quality-fuel-to-australia",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/news-releases/2022/mobil-quality-fuel-available-at-7-eleven-through-to-2033",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/news-releases/2023/fiji-and-new-caledonia-update",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/news-releases/2023/mobil-continues-to-invest-in-australias-fuel-security",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/news-releases/2023/mobil-increases-storage-capacity-to-deliver-fuel-to-australia",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/news-releases/2023/successful-apprenticeship-program-scores-exxonmobil-australia-the-workplace-development-award",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2021/challenges-and-opportunities-delivering-gas-to-the-australian-domestic-market",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2022/exxonmobil-australia-sponsors-the-2022-ceda-victorian-budget-briefing",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2022/opportunities-for-the-gippsland-basin-and-australias-energy-transition",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2023/exxonmobil-australia-sponsors-the-2023-ceda-victorian-budget-briefing",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2023/the-evolving-role-of-gippsland-gas-in-australias-east-coast-gas-market",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2024/ensuring-ongoing-energy-security-from-the-gippsland-basin",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2024/exxonmobil-australia-continues-longstanding-sponsorship-of-the-ceda-victorian-state-of-the-state",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2024/navigating-a-lower-carbon-future-for-australian-transport",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2025/ensuring-natural-gas-supply-to-the-domestic-market-what-has-worked-and-what-will-work",
      "https://corporate.exxonmobil.com/locations/australia/australia-newsroom/speeches/2025/exxonmobil-australia-celebrates-60-years-of-ceda-membership",
      "https://corporate.exxonmobil.com/locations/australia/our-operations/gas-market-code",
      "https://corporate.exxonmobil.com/locations/belgium",
      "https://corporate.exxonmobil.com/locations/belgium/belgium-newsroom",
      "https://corporate.exxonmobil.com/locations/brazil",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-appoints-new-leadership-for-brazil",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-celebrates-11-years-of-support-to-pequeno-principe-hospital",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-celebrates-110-years-in-brazil",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-is-certified-as-an-excellent-company-to-work-in-parana",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-renews-support-to-the-golden-lion-tamarin-association-through-funbio",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-supports-campaign-to-fight-hunger-in-sergipe",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-supports-circular-economy-initiative-in-manaus",
      "https://corporate.exxonmobil.com/locations/brazil/news/exxonmobil-supports-universidade-federal-do-parana-in-an-initiative",
      "https://corporate.exxonmobil.com/locations/brazil/newsroom",
      "https://corporate.exxonmobil.com/locations/canada/exxonmobil-in-canada",
      "https://corporate.exxonmobil.com/locations/canada/imperial-in-canada",
      "https://corporate.exxonmobil.com/locations/european-region/our-operations",
      "https://corporate.exxonmobil.com/locations/european-region/remit",
      "https://corporate.exxonmobil.com/locations/guyana/careers-at-exxonmobil-guyana",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/011024_prosperity-achieves-background-flare",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/013122_exxonmobil-guyana-partner-on-stem-programme",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/041123_exxonmobil-guyana-announces-arrival-of-prosperity-fpso",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/051623_over-400m-spent-locally-in-2022",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/061622_liza-unity-safely-commissioned-in-industry-leading-time",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/08092024-exxonmobil-guyana-launches-is-we-own-again-amazon-warriors-promotion",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/2022dec_people-at-the-heart-of-exxonmobil-guyana-success-routledge",
      "https://corporate.exxonmobil.com/locations/guyana/news-releases/exxonmobil-announces-significant-oil-discovery-offshore-guyana",
      "https://corporate.exxonmobil.com/locations/hong-kong",
      "https://corporate.exxonmobil.com/locations/hong-kong/about-us-hk",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/01192024_embracing-leave-no-trace-hiking-principles-to-safeguard-our-natural-heritage",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/01312024_navigating-career-paths-with-job-shadow-day-at-the-terminal",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/0718-shedding-light-on-study-and-career-pathways-in-the-greater-bay-area",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/11152023_inspiring-engineering-talents-through-steam-education",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/11172023_run-for-every-child",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/12052023_preserve-the-marine-environment-for-our-next-generation",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/12272023_exxonmobil-hong-kong-walks-with-youth-to-inject-energy-into-sustainable-social-development",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230223-exxonmobil-hong-kong-recognized-as-a-caring-company-for-18-consecutive-years",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230307-supporting-green-hiking-activities-to-promote-environmental-education",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230320-inspiring-secondary-students-for-future-career-planning",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230322-igniting-passion-in-youth-to-explore-future-career-opportunities-in-the-greater-bay-area",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230324-preparing-students-for-ethical-challenges-in-the-changing-business-world",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230426-transition-from-students-to-professionals-with-job-shadow-day",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230510-helping-students-to-prepare-for-career-planning",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230612-empowering-the-next-generation-through-business-ethics-workshops",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230714-supporting-youth-development-through-career-seminar",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230719-nurturing-future-workforce-with-hands-on-learning",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20230811-shaping-future-climate-leaders-through-youth-program",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20231011-aiding-young-individuals-in-their-career-development-with-job-shadowing-day",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240206-night-walk-for-a-good-cause",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240208-empower-climate-leaders-of-tomorrow-to-build-a-sustainable-future",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240222-show-ethnic-minority-community-care-and-support",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240305-inspiring-future-leaders-to-explore-career-potential",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240320-exxonmobil-hong-kong-earns-caring-company-recognition-for-the-19th-year",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240614-helping-young-people-explore-career-opportunities-in-the-greater-bay-area",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240717-providing-extra-learning-resources-in-steam-education-for-underprivileged-students",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240729-cultivating-future-climate-leaders-through-youth-program",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240911_enhance-social-inclusion-and-creativity-with-art-jamming-workshops",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20240913-empowering-youth-in-shaping-a-sustainable-future-through-the-yea-programme",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20241025-exxonmobil-experts-discuss-energy-trends-with-hong-kong-business-community",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20241118-supporting-local-communities-through-collaborative-initiatives-with-ngos",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20241122-enhancing-steam-education-through-collaboration-with-local-university",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20241127-preserve-local-environment-and-biodiversity-through-volunteer-efforts",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20241220-exxonmobil-china-chairman-discusses-global-outlook-for-2050-at-amcham-hong-kong",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20250106-enhancing-steam-learning-for-underprivileged-students",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20250528-advancing-local-community-well-being-and-environmental-health",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20250613-fostering-youths-career-aspirations-and-personal-growth",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20250711-fueling-a-sustainable-future-with-esso-renewable-diesel-r20",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20251212-nurturing-climate-leaders-to-drive-sustainable-development",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20251218-celebrating-collective-efforts-during-inter-company-volunteer-week",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20260130-building-brighter-futures-for-young-minds-and-underprivileged-families",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20260223-swinging-golf-clubs-for-a-good-cause",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20260327-inspiring-future-talents-through-career-readiness",
      "https://corporate.exxonmobil.com/locations/hong-kong/hong-kong-newsroom/news-releases/20260430-building-hong-kong-next-generation-of-stem-talents",
      "https://corporate.exxonmobil.com/locations/india/02242020-exxonmobil-and-indianoil-and-chart-industries-to-pioneer-virtual-pipeline-initiative",
      "https://corporate.exxonmobil.com/locations/india/10142019_exxonmobil-expands-lng-collaborations-in-india",
      "https://corporate.exxonmobil.com/locations/india/careers-in-bengaluru",
      "https://corporate.exxonmobil.com/locations/india/newsroom/03312023_exxonmobil-to-build-lubricant-manufacturing-plant-in-india",
      "https://corporate.exxonmobil.com/locations/india/newsroom/10182021_exxonmobil-india-announces-new-ceo-and-lead-country-manager",
      "https://corporate.exxonmobil.com/locations/india/newsroom/a-rising-indias-energy-future",
      "https://corporate.exxonmobil.com/locations/india/newsroom/driving-change-with-cng-series",
      "https://corporate.exxonmobil.com/locations/india/newsroom/exxonmobil-breaks-ground-on-first-greenfield-investment-in-india",
      "https://corporate.exxonmobil.com/locations/india/newsroom/exxonmobil-women-in-stem-abinaya-srinivasan",
      "https://corporate.exxonmobil.com/locations/india/newsroom/indian-talent-global-capability",
      "https://corporate.exxonmobil.com/locations/indonesia",
      "https://corporate.exxonmobil.com/locations/indonesia/newsroom",
      "https://corporate.exxonmobil.com/locations/italy",
      "https://corporate.exxonmobil.com/locations/luxembourg",
      "https://corporate.exxonmobil.com/locations/luxembourg?content-lang=fr",
      "https://corporate.exxonmobil.com/locations/mexico/cambio-climatico-global",
      "https://corporate.exxonmobil.com/locations/mexico/codigo-de-etica-y-de-conducta-en-los-negocios",
      "https://corporate.exxonmobil.com/locations/mexico/ethica-de-exxonmobil-mexico",
      "https://corporate.exxonmobil.com/locations/mexico/exxonmobil-mexico-downstream",
      "https://corporate.exxonmobil.com/locations/mexico/exxonmobil-mexico-quimicos",
      "https://corporate.exxonmobil.com/locations/mexico/exxonmobil-mexico-upstream",
      "https://corporate.exxonmobil.com/locations/mexico/reduciendo-las-emisiones-de-co2",
      "https://corporate.exxonmobil.com/locations/mexico/respuesta-a-desastres-naturales",
      "https://corporate.exxonmobil.com/locations/mozambique",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-donates-computers-to-eight-pemba-secondary-schools",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-in-mozambique-selects-epc-contractor-for-rovuma-lng-project",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-mozambique-and-area-4-coventurers-award-over-1-b-usd-in-contracts-for-rovuma-lng",
      "https://corporate.exxonmobil.com/locations/mozambique/mozambique-newsroom/exxonmobil-mozambique-ltd-and-area-4-coventures-select-rovuma-lng-epc-contractor-service-providers",
      "https://corporate.exxonmobil.com/locations/mozambique/rovuma-lng",
      "https://corporate.exxonmobil.com/locations/netherlands",
      "https://corporate.exxonmobil.com/locations/netherlands/netherlands-newsroom",
      "https://corporate.exxonmobil.com/locations/netherlands/netherlands-newsroom/neptune-energy-exxonmobil-rosewood-and-ebn-to-cooperate-on-l10-carbon-capture-and-storage",
      "https://corporate.exxonmobil.com/locations/norway",
      "https://corporate.exxonmobil.com/locations/singapore/doing-our-part-for-the-energy-transition",
      "https://corporate.exxonmobil.com/locations/singapore/key-milestones",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/01262023_nippon-steel-mitsubishi-and-exxonmobil-to-evaluate-ccs-value-chain-in-ap",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/02112022_exxonmobil-joins-customer-sia-in-first-sustainable-aviation-fuel-trial-in-singapore",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/03012022_exxonmobil-celebrates-100000-teu-milestone-with-psa-corporation-and-jtc",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/03012024_exxonmobil-and-shell-selected-to-work-with-the-govt-of-singapore-on-a-ccs-value-chain",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/03042021_exxonmobil-announces-singapore-workforce-reductions",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/03142023_psa-jurong-island-terminal-and-jtc-celebrate-130k-teu-record-for-supply-chain-ecosystem",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/03242023_dsta-signs-mou-with-exxonmobil-to-explore-use-of-sustainable-fuel",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/03252021_exxonmobil-lng-asia-pacific-awarded-lng-import-license-for-singapore",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/03312020_exxonmobil-marks-progress-on-technology-deployment-in-singapore",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/04022019-exxonmobil-invests-in-sg-integrated-complex-to-upgrade-product-slate",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/04052019_exxonmobil-celebrates-the-opening-of-its-butyl-and-resins-plants-in-singapore",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/04202023_keppel-and-exxonmobil-to-explore-low-carbon-ammonia-solutions-for-singapore",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/04262024_ntu-singapore-exxonmobil-and-astar-launch-s$60-million-corporate-lab",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/06222022_exxonmobil-advancing-singapore-resid-upgrade-project-towards-2025-startup",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/07072022_exxonmobil-marks-first-certified-blended-aviation-fuel-to-singapore-changi-airport",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/09092023_over-1100-vulnerable-households-receive-packs-under-adopt-sw-programme",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/09232023_fairprice-group-and-exxonmobil-raise-more-than-s100k-in-annual-charity-car-wash",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/09232025-exxonmobil-starts-first-of-its-kind-technology-in-singapore",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/09272022_nie-ntu-singapore-celebrates-the-14th-caring-teacher-awards",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/10042023_national-honours-presented-to-jack-p-williams-for-significant-contributions-to-singapore",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/10052024-charity-car-wash",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/11122022_fairprice-and-exxonmobil-raise-funds-for-childrens-aid-society-through-charity-car-wash",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/11262020_exxonmobil-asia-pacific-chairman-managing-director-gan-seow-kee-to-retire-after-41-years",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/news-releases/20251024-em-to-sell-service-station-network-in-sg",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20240614-fathers-day-preetpal-singh",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20240801-adopt-a-rental-block-volunteer-chiu-har",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20250717-driving-positive-change-faster-with-policy",
      "https://corporate.exxonmobil.com/locations/singapore/singapore-updates/views-perspectives/20260226-leadership-tips-by-charlene-pereira",
      "https://corporate.exxonmobil.com/locations/thailand",
      "https://corporate.exxonmobil.com/locations/thailand/privacy-statement",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202301-exxon-sells-esso-share",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202308-emmtl-starts",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202309-emmtl-press-con",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202309-support-cu-las",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202310-support-tu-las",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202311-mobil-promotion",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202311-support-mercy-center",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2023/202312-support-wat-noen-kraprok-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240108-donation-to-baan-nong-pai-school",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240111-donation-to-equitable-education-funds",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240202-donation-to-namphong-hospital-for-medical-equipment",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240329-donation-to-slum-child-care-foundation",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240424-support-rattanakosin-bicentennial-funds",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20240906-support-flood-victims-via-thai-red-cross",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20241115-exxonmobil-receives-corporate-social-impact-award",
      "https://corporate.exxonmobil.com/locations/thailand/thailand-news-and-views/news-releases/2024/20241212-exxonmobil-supports-thapanied-kunchorn-school",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20230915_licence-wins-boost-exxonmobils-uk-lower-emissions-plans",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20231128_exxonmobil-fawley-investment-will-strengthen-britains-energy-security",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240607_1500-hampshire-school-kids-to-become-life-saving-mini-medics",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240607_mr-butyl-celebrates-40-years-of-loyal-service-at-exxonmobil-fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240726_british-army-petroleum-regiment-makes-educational-visit-to-exxonmobil-fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240819_three-new-apprentices-join-the-fife-ethylene-plant-family",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240827_exxonmobil-fawley-donates-of-16000-to-install-defibrillators-across-hythe-and-fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240828_enclosed-ground-flare-engineering-assessment",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240902_fife-students-set-to-share-10000-of-scholarship-funding",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240925_exxonmobil-fawley-donates-52000-to-inspire-future-stem-innovators",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20240925_exxonmobil-fife-donates-50000-to-inspire-future-stem-innovators",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20241014_eleven-new-apprentices-kickstart-careers-at-exxonmobil-fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20241101_fife-ethylene-plant-and-local-community-unite-to-save-two-beloved-bridges",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20241111_trainees-with-diverse-career-background-champion-exxonmobil-fawley-process-school",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20241118_exxonmobil-sets-wheels-in-motion-with-local-transportation-boost",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20241217-exxonmobil-fawley-spreads-christmas-cheer-with-charity-festive-hampers",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250403_exxonmobil-fawley-and-salters-institute-launch-stem-partnership",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250415_exxonmobil-fawley-security-manager-takes-career-skills-on-3000-mile-sailing-challenge",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250527_breaking-barriers-and-shaping-futures-3-female-senior-engineers-leading-change-in-fife",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250604_fep-delivers-new-chapter-for-young-readers",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250605_new-site-manager-for-exxonmobil-fawley",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20250617_exxonmobil-fife-donates-40-laptops-to-help-teens-build-brighter-futures",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20251006_school-kids-to-become-life-saving-mini-medics",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20251008_teresa-takes-up-the-reins-at-fife-ethylene-plant",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20251017_fep-hosts-one-of-its-largest-ever-site-visits-for-local-students",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20260429-two-million-pound-legacy-for-fifes-future-generations",
      "https://corporate.exxonmobil.com/locations/united-kingdom/uk-newsroom/20261006-93-year-old-returns-to-fawley-with-1951-opening-invitation",
      "https://corporate.exxonmobil.com/locations/united-states/charlton-waterline",
      "https://corporate.exxonmobil.com/news/hurricane-ida",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0219_exxonmobil-announces-2015-reserves-additions",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0308_exxonmobil-launches-speedpass-mobile-payment-app-with-apple-pay",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0419_exxonmobil-starts-production-at-julia-oil-field-in-the-gulf-of-mexico",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0505_exxonmobil-and-fuelcell-energy-inc-pursue-novel-technology-in-carbon-capture",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0505_exxonmobil-and-fuelcell-energy-to-hold-media-call-on-carbon-capture-technology",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0525_angela-braly-elected-to-exxonmobil-board",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0721_exxonmobil-to-acquire-interoil-in-transaction-worth-more-than-2-billion",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0725_sabic-and-exxonmobil-evaluating-petrochemical-joint-venture-on-us-gulf-coast",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0802_exxonmobil-supports-development-of-emerging-technologies-at-university-of-texas-at-austin",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0808_exxonmobil-and-georgia-tech-innovation-could-lead-to-significant-cuts-in-chemical-manufacturing",
      "https://corporate.exxonmobil.com/news/news-releases/2016/0913_exxonmobil-and-princeton-university-announce-new-energy-research-projects",
      "https://corporate.exxonmobil.com/news/news-releases/2016/1027_exxonmobil-announces-significant-oil-discovery-offshore-nigeria",
      "https://corporate.exxonmobil.com/news/news-releases/2016/1027_fuelcell-energy-and-exxonmobil-announce-location-for-fuel-cell-carbon-capture-pilot-plant",
      "https://corporate.exxonmobil.com/news/news-releases/2016/1201_exxonmobil-to-become-red-bull-racings-official-fuel-and-lubricant-partner",
      "https://corporate.exxonmobil.com/news/news-releases/2016/1214_rex-tillerson-to-retire-darren-woods-elected-chairman-ceo-of-exxon-mobil-corporation",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0105_exxonmobil-develops-efficient-new-technology-to-dehydrate-natural-gas",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0117_exxonmobil-to-acquire-companies-doubling-permian-basin-resource-to-6-billion-barrels",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0210_exxonmobil-awards-license-for-efficient-drilling-technology-to-pason-systems",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0306_exxonmobil-plans-investments-of-20-billion-to-expand-manufacturing-in-us-gulf-region",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0309_exxonmobil-to-acquire-25-percent-interest-in-mozambique-area-4-from-eni",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0419_exxonmobil-and-sabic-select-san-patricio-county-proposed-petrochemical-project-us-gulf-coast",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0510_exxonmobil-to-acquire-one-of-worlds-largest-aromatics-plants",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0522_exxonmobil-completes-new-polyethylene-lines-at-mont-belvieu-plastics-plant",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0609_exxonmobil-ny-attorney-generals-reckless-and-false-allegations-misstate-climate-policies",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0616_exxonmobil-makes-final-investment-decision-to-proceed-with-liza-oil-development-in-guyana",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0619_exxonmobil-and-synthetic-genomics-report-breakthrough-in-algae-biofuel-research",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0713_exxonmobil-acquires-interest-in-acreage-offshore-suriname",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0717_exxonmobil-and-university-of-wisconsin-madison-to-advance-research-into-conversion-of-biomass",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0827_exxonmobil-completes-acquisition-of-one-of-the-worlds-largest-aromatics-plants",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0921_exxonmobil-baytown-and-beaumont-refineries-begin-fuels-production-chemical-plants-ramping-up",
      "https://corporate.exxonmobil.com/news/news-releases/2017/0927_exxonmobil-continues-to-increase-acreage-position-in-permian-basin",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1013_exxonmobil-expanding-new-jersey-research-and-engineering-center",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1018_exxonmobil-acquires-crude-oil-terminal-to-serve-growing-permian-basin-production",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1027_exxonmobil-to-acquire-interest-in-block-containing-brazil-carcara-oil-field-from-statoil",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1101_exxonmobil-and-renewable-energy-group-report-progress-in-cellulosic-biodiesel-research",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1106_exxonmobil-partners-with-singapore-universities-to-focus-on-energy-innovation",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1128_exxonmobil-starts-production-at-hebron-field",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1204_exxonmobil-acquires-exploration-acreage-in-three-mauritania-offshore-blocks",
      "https://corporate.exxonmobil.com/news/news-releases/2017/1207_exxonmobil-and-instituto-de-tecnologia-quimica-discover-new-material",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0116_exxonmobil-and-magnabond-to-collaborate-on-new-well-integrity-evaluation-technologies",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0118_exxonmobil-acquires-exploration-acreage-offshore-ghana",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0130_exxonmobil-to-triple-permian-production-by-2025-expand-transportation-infrastructure",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0201_steven-kandarian-elected-to-exxonmobil-board",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0202_exxonmobil-releases-energy-and-carbon-summary-and-outlook-for-energy",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0306_exxonmobil-and-synthetic-genomics-algae-biofuels-program-targets-10000-barrels-per-day-by-2025",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0429_exxonmobil-plans-purchase-of-large-indonesia-motorcycle-lubricant-manufacturer-marketer",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0501_sabic-and-exxonmobil-advance-gulf-coast-project-with-creation-of-a-new-joint-venture",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0530_exxonmobil-ceo-darren-woods-highlights-growth-plans-and-advances-in-lower-carbon-solutions",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0606_exxonmobil-completes-purchase-of-carcara-oil-field-interest",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0620_exxonmobil-singapore-butyl-and-resins-plants-begin-production",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0628_exxonmobil-completes-acquisition-of-indonesian-lubricant-manufacturer",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0726_exxonmobil-starts-up-new-ethane-cracker-in-baytown-texas",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0920_exxonmobil-to-join-oil-and-gas-climate-initiative",
      "https://corporate.exxonmobil.com/news/news-releases/2018/0926_exxonmobil-starts-new-unit-to-increase-ultra-low-sulfur-fuels-production",
      "https://corporate.exxonmobil.com/news/news-releases/2018/1031_exxonmobil-starts-new-unit-at-antwerp-refinery-to-produce-high-value-transportation-fuels",
      "https://corporate.exxonmobil.com/news/news-releases/2018/1031_exxonmobil-supports-new-singapore-energy-center-partnership-with-us-10-million-commitment",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0108_exxonmobil-and-ibm-to-advance-energy-sector-application-of-quantum-computing",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0123_exxonmobil-and-renewable-energy-group-partner-w-clariant-advance-cellulosic-biofuel-research",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0131_exxonmobil-streamlining-upstream-organization-to-support-growth-plans",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0205_exxonmobil-qatar-petroleum-to-proceed-with-golden-pass-lng-export-project",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0222_exxonmobil-to-increase-permian-profitability-through-digital-partnership-with-microsoft",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0226_exxonmobil-adds-4_5-billion-barrels-to-reserves",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0228_exxonmobil-makes-natural-gas-discovery-offshore-cyprus",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0301_exxonmobil-announces-retirement-of-john-verity-and-appointment-of-karen-mckee",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0301_exxonmobil-to-fund-polypropylene-unit-to-expand-baton-rouge-operations",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0402_exxonmobil-invests-in-singapore-integrated-complex-to-upgrade-product-slate",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0424_exxonmobil-acquires-more-exploration-acreage-offshore-namibia",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0502_exxonmobil-announces-2-billion-baytown-chemical-expansion-project",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0503_exxonmobil-to-proceed-with-liza-phase-2-development-offshore-guyana",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0508_exxonmobil-to-invest-up-to-100m-on-lower-emissions-randd-with-us-national-labs",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0611_exxonmobil-proceeds-with-argentina-expansion-project-in-vaca-muerta-basin",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0612_exxonmobil-completes-singapore-expansion-to-enhance-group-ii-base-stocks-supply",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0613_exxonmobil-and-sabic-to-proceed-with-gulf-coast-growth-ventures-project",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0627_exxonmobil-and-global-thermostat-to-advance-breakthrough-atmospheric--carbon-capture-technology",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0724_exxonmobil-begins-production-on-beaumont-high-performance-polyethylene-line",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0826_exxonmobil-and-mosaic-materials-to-explore-new-carbon-capture-technology",
      "https://corporate.exxonmobil.com/news/news-releases/2019/0926_exxonmobil-to-sell-norway-upstream-operations-for-4_5-billion",
      "https://corporate.exxonmobil.com/news/news-releases/2019/1014_exxonmobil-expands-low-emissions-technology-research-with-universities-in-india",
      "https://corporate.exxonmobil.com/news/news-releases/2019/1021_exxonmobil-renews-support-for-mit-energy-initiatives-low-carbon-research",
      "https://corporate.exxonmobil.com/news/news-releases/2019/1106_exxonmobil-and-fuelcell-energy-expand-agreement-for-carbon-capture-technology",
      "https://corporate.exxonmobil.com/news/news-releases/2019/1126_joseph-hooley-elected-to-exxonmobil-board-of-directors",
      "https://corporate.exxonmobil.com/news/news-releases/2019/1220_exxonmobil-begins-oil-production-in-guyana",
      "https://corporate.exxonmobil.com/news/news-releases/2019/1230_exxonmobil-secures-exploration-acreage-offshore-egypt",
      "https://corporate.exxonmobil.com/news/news-releases/2020/0303_exxonmobil-proposes-framework-for-industry-wide-methane-regulations",
      "https://corporate.exxonmobil.com/news/news-releases/2020/0409_exxonmobil-field-testing-new-comprehensive-methane-monitoring-technologies",
      "https://corporate.exxonmobil.com/news/news-releases/2020/0702_em-renews-collaboration-with-princeton-to--advance-low-emission-research-and-energy-solutions",
      "https://corporate.exxonmobil.com/news/news-releases/2020/0717_exxonmobil-gt-and-imperial-college-london-publish-research-on-breakthrough-in-membrane-tech",
      "https://corporate.exxonmobil.com/news/news-releases/2020/0724_exxonmobil-collaborates-on-discovery-of-new-material-to-enhance-carbon-capture-technology",
      "https://corporate.exxonmobil.com/news/news-releases/2020/0921_exxonmobil-expands-agreement-with-global-thermostat-re-direct-air-capture-technology",
      "https://corporate.exxonmobil.com/news/news-releases/2020/0930_exxonmobil-to-proceed-with-payara-development-offshore-guyana",
      "https://corporate.exxonmobil.com/news/news-releases/2020/1021_darren-woods-discusses-future-of-industry-and-company-with-employees",
      "https://corporate.exxonmobil.com/news/news-releases/2020/1211_exxonmobil-discovers-hydrocarbons-offshore-suriname",
      "https://corporate.exxonmobil.com/news/news-releases/2020/1214_exxonmobil-announces-2025-emissions-reductions_expects-to-meet-2020-plan",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0201_exxonmobil-low-carbon-solutions-to-commercialize-emission-reduction-technology",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0212_darren-woods-shares-reasons-for-optimism-in-message-to-employees",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0224_exxonmobil-to-sell-uk-upstream-central-and-northern-north-sea-assets",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0225_exxonmobil-tests-advanced-recycling-of-plastic-waste-at-baytown-facilities",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0301_michael-angelakis-and-jeffrey-ubben-join-exxonmobil-board-of-directors",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0311_darren-woods-shares-strategy-for-long-term-growth-in-lower-carbon-future-with-employees",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0330_exxonmobil-and-porsche-test-lower-carbon-fuel-in-race-conditions",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0422_exxonmobil-expands-renewable-fuels-agreement-with-global-clean-energy-holdings",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0427_exxonmobil-details-strategy-to-grow-shareholder-value-and-transition-to-lower-carbon-future",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0621_exxonmobil-announces-final-results-in-election-of-directors",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0712_air-liquide_borealis_esso_totalenergies_yara-collaborate-on-decarbonization",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0716_exxonmobil-to-participate-in-carbon-capture-and-storage-project-in-scotland",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0726_exxonmobil-and-sabic-reach-mechanical-completion-for-gulf-coast-growth-ventures-derivatives",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0825_exxonmobil-affiliate-to-produce-renewable-diesel-to-reduce-emissions-in-canada",
      "https://corporate.exxonmobil.com/news/news-releases/2021/0916_carbon-capture-and-storage-gains-wide-industry-support-in-houston",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1006_exxonmobil-increases-participation-in-scotland-carbon-capture-and-storage-project",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1011_exxonmobil-to-build-its-first-large-scale-plastic-waste-advanced-recycling-facility",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1020_chairman-and-chief-executive-officer-darren-woods-hosts-global-employee-forum",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1021_exxonmobil-plans-to-increase-carbon-capture-at-labarge-wyoming-facility",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1102_exxonmobil-and-pertamina-to-evaluate-carbon-capture-and-storage-in-indonesia",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1108_exxonmobil-and-petronas-to-study-carbon-capture-and-storage-in-malaysia",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1108_exxonmobil-to-invest-in-petrochemical-complex-in-china",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1201_exxonmobil-announces-plans-to-2027-doubling-earnings-and-cash-flow-potential-reducing-emissions",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1206_exxonmobil-plans-for-net-zero-emissions-in-permian-basin-operations-by-2030",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1207_exxonmobil-acquires-materia-inc-a-high-performance-structural-polymers-company",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1208_exxonmobil_sgn_green-investment-sign-mou-for-southampton-hydrogen-hub",
      "https://corporate.exxonmobil.com/news/news-releases/2021/1213_exxonmobil-and-scepter-to-deploy-satellite-technology-for-real-time-methane-emissions-detection",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0111_exxonmobil-expands-interest-in-biofuels-acquires-stake-in-biojet-as",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0118_exxonmobil-announces-ambition-for-net-zero-greenhouse-gas-emissions-by-2050",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0120_exxonmobil-and-sabic-start-operations-at-gulf-coast-manufacturing-facility",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0120_industry-support-for-large-scale-carbon-capture-and-storage-gains-momentum-in-houston",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0131_exxonmobil-streamlines-structure-to-enhance-effectiveness-grow-value-reduce-costs",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0201_exxonmobil-earns-23-billion-in-2021_initiates-10-billion-share-repurchase-program",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0211_exxonmobil-starts-production-at-guyanas-second-offshore-development",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0221_exxonmobil-and-papua-new-guinea-sign-pnyang-gas-agreement",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0224_exxonmobil-makes-first-commercial-sale-of-certified-circular-polymers",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0225_exxonmobil-to-sell-mobil-producing-nigeria-shallow-water-affiliate",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0301_exxonmobil-planning-hydrogen-production-carbon-capture-and-storage-at-baytown-complex",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0302_exxonmobil-details-plans-to-lead-in-earnings-and-cash-flow-growth-energy-transition",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0322_exxonmobil-lead-director-ken-frazier-to-retire-and-jay-hooley-to-become-lead-director",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0404_exxonmobil-makes-final-investment-decision-on-fourth-guyana-offshore-project",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0414_exxonmobil-begins-design-studies-for-south-east-australia-carbon-capture-hub-in-gippsland",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0426_exxonmobil-makes-three-new-discoveries-offshore-guyana-increases-stabroek-resource-estimate",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0426_exxonmobil-receives-top-certification-for-methane-emissions-for-natural-gas-in-permian",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0429_exxonmobil-announces-first-quarter-2022-results",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0513_exxonmobil-and-indonesias-pertamina-to-advance-cooperation-in-carbon-capture-and-storage",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0525_exxonmobil-to-grow-shareholder-value-by-meeting-need-for-energy",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0615_exxonmobil-statement-regarding-president-biden-letter-to-oil-industry",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0620_neptune-energy-exxonmobil-rosewood-and-ebn-to-cooperate-on-l10-carbon-capture-and-storage",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0621_exxonmobil-and-qatarenergy-to-expand-lng-production-with-north-field-east-agreement",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0627_exxonmobil-and-cnooc-and-shell-pursue-carbon-capture-and-storage-hub-in-china",
      "https://corporate.exxonmobil.com/news/news-releases/2022/0729_exxonmobil-announces-second-quarter-2022-results",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1012_landmark-emissions-reduction-project-in-louisiana-announced",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1020_exxonmobil-to-sell-billings-refinery-to-par-pacific-holdings",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1027_qatarenergy-and-exxonmobil-to-independently-market-golden-pass-lng",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1028_exxonmobil-announces-third-quarter-2022-results",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1107_exxonmobil-and-partners-make-new-discovery-on-angola-block-15",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1112_exxonmobil-and-pertamina-advance-regional-carbon-capture-and-storage-project-in-indonesia",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1114_coral-south-project-in-mozambique-ships-first-lng-cargo-helps-meet-global-demand",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1129_exxonmobil-and-mitsubishi-heavy-industries-form-carbon-capture-technology-alliance",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1202_exxonmobil-elects-larry-kellner-and-john-harris-to-board-of-directors",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1206_exxonmobil-doubles-polypropylene-production-at-baton-rouge",
      "https://corporate.exxonmobil.com/news/news-releases/2022/1208_exxonmobil-announces-corporate-plan-to-double-earnings-and-cashflow-potential-by-2027",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0111_exxonmobil-to-sell-interest-in-esso-thailand",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0130_exxonmobil-awards-feed-for-worlds-largest-low-carbon-hydrogen-facility",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0131_exxonmobil-announces-full-year-2022-results",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0316_exxonmobil-boosts-fuel-supply-with-2-billion-dollar-beaumont-refinery-expansion",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0426_exxonmobil-guyana-advances-fifth-offshore-guyana-development",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0428_exxonmobil-announces-first-quarter-2023-results",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0601_lcs-nucor-agreement",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0622_scaling-up-carbon-capture-and-community-investments-in-louisiana",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0713_exxonmobil-announces-acquisition-of-denbury",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0728_exxonmobil-announces-second-quarter-2023-results",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0912_mckinsey-quarterly-interview-with-chairman-and-ceo-darren-woods",
      "https://corporate.exxonmobil.com/news/news-releases/2023/0919_exxonmobil-expands-chemical-production-at-baytown",
      "https://corporate.exxonmobil.com/news/news-releases/2023/1011_exxonmobil-announces-merger-with-pioneer-natural-resources-in-an-all-stock-transaction",
      "https://corporate.exxonmobil.com/news/news-releases/2023/1027_exxonmobil-announces-third-quarter-2023-results",
      "https://corporate.exxonmobil.com/news/news-releases/2023/1102_exxonmobil-completes-acquisition-of-denbury",
      "https://corporate.exxonmobil.com/news/news-releases/2024/0202_exxonmobil-announces-2023-results",
      "https://corporate.exxonmobil.com/news/news-releases/2026/0424-exxonmobils-2025-giving-campaign-delivers-record-results",
      "https://corporate.exxonmobil.com/news/news-releases/statements/documents",
      "https://corporate.exxonmobil.com/news/news-releases/statements/statement-on-pac-contributions",
      "https://corporate.exxonmobil.com/news/news-releases/statements/statement-on-study",
      "https://corporate.exxonmobil.com/news/news-releases/statements/statement-regarding-guyana-drilling-and-development-activities",
      "https://corporate.exxonmobil.com/news/viewpoints/earth-day-2021",
      "https://corporate.exxonmobil.com/news/viewpoints/six-questions-for-chief-environmental-scientist-matt-kolesar",
      "https://corporate.exxonmobil.com/news/viewpoints/the-global-methane-pledge",
      "https://corporate.exxonmobil.com/procurement/denbury-invoice-requirements",
      "https://corporate.exxonmobil.com/procurement/denbury-invoice-requirements/register-with-openinvoice",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/payables",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/payables/additional-country-specific-invoice-requirements",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/pmi/pmi-inspections",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/pmi/pmi-marine",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/pmi/pmi-secondary",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/sap-business-network",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/supplier-diversity/supplier-diversity-video-library",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/supplier-portal-navigation",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/supplier-record-update",
      "https://corporate.exxonmobil.com/procurement/exxonmobil-for-suppliers/videos/was-my-invoice-correctly-submitted",
      "https://corporate.exxonmobil.com/procurement/xto-invoice-requirements",
      "https://corporate.exxonmobil.com/procurement/xto-invoice-requirements/register-with-openinvoice",
      "https://corporate.exxonmobil.com/publications/advancing-climate-solutions/driving-reductions-in-methane-emissions/methane-research",
      "https://corporate.exxonmobil.com/publications/content-index",
      "https://corporate.exxonmobil.com/publications/metrics-and-data",
      "https://corporate.exxonmobil.com/system-updates/hub",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started?content-lang=es",
      "https://corporate.exxonmobil.com/system-updates/hub/customers-getting-started?content-lang=fr",
      "https://corporate.exxonmobil.com/system-updates/hub?content-lang=es",
      "https://corporate.exxonmobil.com/system-updates/hub?content-lang=fr",
      "https://corporate.exxonmobil.com/what-we-do/energy-supply/natural-gas/liquefied-natural-gas-understanding-one-of-the-worlds-most-vital-energy-resources"
    ],
    "coverageGaps": [],
    "description": "Article without banner: left metadata rail (tag, type, date, share/print) beside title and intro paragraph, long body text with inline images, Explore more card row",
    "blocks": [
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
    "representativeUrl": "https://corporate.exxonmobil.com/careers/ashlika-persaud",
    "sections": [
      {
        "id": "rc2",
        "name": "Article header",
        "selector": [
          "section.articleHeader",
          "#main-content > section.articleHeader"
        ],
        "style": null,
        "blocks": [
          "columns-article-header"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "Article body and Explore more",
        "selector": [
          "div.article--wrapper",
          "#main-content > div.article--wrapper"
        ],
        "style": null,
        "blocks": [
          "cards-topics",
          "table",
          "quote",
          "video"
        ],
        "defaultContent": [
          "section.articleMedia article.articleMedia--content",
          "section.featureGrid--wrapper div.featureGrid--section-title"
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
  var import_article_default = {
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
  return __toCommonJS(import_article_exports);
})();

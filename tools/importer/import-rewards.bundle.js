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

  // tools/importer/import-rewards.js
  var import_rewards_exports = {};
  __export(import_rewards_exports, {
    default: () => import_rewards_default
  });

  // tools/importer/parsers/cards-business.js
  function getImage(item, document2) {
    const bg = item.querySelector(".highlight--section-image .lazy-bg, .lazy-bg");
    const imgs = [...item.querySelectorAll(".highlight--section-image img")];
    const altImg = imgs.find((i) => i.getAttribute("alt"));
    const alt = altImg ? altImg.getAttribute("alt") : "";
    let src = bg ? bg.getAttribute("data-desktop") || bg.getAttribute("data-tablet") || bg.getAttribute("data-mobile") : null;
    if (!src) {
      const full = imgs.find((i) => !/[?&]w=40\b/.test(i.getAttribute("src") || "")) || imgs[0];
      if (full) src = full.getAttribute("src");
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = src;
    img.alt = alt;
    return img;
  }
  var FUELS_ORIGIN = "https://www.exxonmobilfuels.com";
  function fuelsClean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function fuelsUsable(src) {
    const s = (src || "").trim().split(/\s+/)[0];
    return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : "";
  }
  function fuelsAbs(href) {
    const raw = (href || "").trim();
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const url = new URL(raw, `${FUELS_ORIGIN}/`);
      url.searchParams.delete("_gl");
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function fuelsImage(item, document2) {
    const imgEl = item.querySelector(".surfaced-item-image img") || item.querySelector("img");
    if (!imgEl) return null;
    const picture = imgEl.closest("picture");
    let best = "";
    let bestW = -1;
    if (picture) {
      [...picture.querySelectorAll("source")].forEach((s) => {
        const set = (s.getAttribute("srcset") || s.getAttribute("data-srcset") || "").split(",").map((c) => fuelsUsable(c)).filter(Boolean);
        if (!set.length) return;
        const w = parseInt(s.getAttribute("width"), 10) || 0;
        if (w >= bestW) {
          bestW = w;
          best = set[set.length - 1];
        }
      });
    }
    const src = best || fuelsUsable(imgEl.getAttribute("data-src")) || fuelsUsable(imgEl.getAttribute("src"));
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = fuelsAbs(src);
    img.alt = fuelsClean(imgEl.getAttribute("alt"));
    return img;
  }
  function parseSurfacedList(element, document2) {
    const items = [...element.querySelectorAll(".s01-surfaced-item, .surfaced-item")].filter((el, i, all) => !all.some((o) => o !== el && o.contains(el)));
    const cells = [];
    items.forEach((item) => {
      const img = fuelsImage(item, document2);
      const copy = item.querySelector(".surfaced-item-copy") || item;
      const titleEl = copy.querySelector("h1, h2, h3, h4, h5, h6");
      const wrapLink = [...item.querySelectorAll("a[href]")].find((a) => !copy.contains(a));
      const inCopy = (el, sel) => {
        const anc = el && el.closest(sel);
        return !!anc && copy.contains(anc);
      };
      const textContent = [];
      if (titleEl && fuelsClean(titleEl.textContent)) {
        const h = document2.createElement("h3");
        const title = fuelsClean(titleEl.textContent);
        const titleLink = titleEl.querySelector("a[href]") || wrapLink;
        if (titleLink) {
          const a = document2.createElement("a");
          a.href = fuelsAbs(titleLink.getAttribute("href"));
          a.textContent = title;
          h.append(a);
        } else h.textContent = title;
        textContent.push(h);
      }
      [...copy.querySelectorAll("p, ul, ol")].filter((el) => fuelsClean(el.textContent) && !(titleEl && titleEl.contains(el)) && !inCopy(el.parentElement, "p, ul, ol")).forEach((el) => {
        el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", fuelsAbs(a.getAttribute("href"))));
        el.removeAttribute("class");
        textContent.push(el);
      });
      [...copy.querySelectorAll("a[href]")].filter((a) => fuelsClean(a.textContent) && !inCopy(a, "p, ul, ol, h1, h2, h3, h4, h5, h6")).forEach((src) => {
        const a = document2.createElement("a");
        a.href = fuelsAbs(src.getAttribute("href"));
        a.textContent = fuelsClean(src.textContent);
        const p = document2.createElement("p");
        p.append(a);
        textContent.push(p);
      });
      if (!img && !textContent.length) return;
      cells.push([
        img ? [document2.createComment(" field:image "), img] : "",
        textContent.length ? [document2.createComment(" field:text "), ...textContent] : ""
      ]);
    });
    return cells;
  }
  function parse(element, { document: document2 }) {
    if (!element.querySelector("li.highlight--item") && element.querySelector(".s01-surfaced-item, .surfaced-item")) {
      const fuelsCells = parseSurfacedList(element, document2);
      if (!fuelsCells.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const fuelsBlock = WebImporter.Blocks.createBlock(document2, { name: "cards-business", cells: fuelsCells });
      element.replaceWith(fuelsBlock);
      return;
    }
    const items = [...element.querySelectorAll("li.highlight--item")];
    const cells = [];
    items.forEach((item) => {
      const img = getImage(item, document2);
      const titleEl = item.querySelector(".highlight--section-title h2, .highlight--section-title h3, .highlight--section-title h4, h3");
      const description = item.querySelector(".highlight--section-description");
      const links = [...item.querySelectorAll(".highlight--links a")];
      const textContent = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
        textContent.push(h);
      }
      if (description) {
        const paras = [...description.querySelectorAll("p")];
        if (paras.length) textContent.push(...paras);
        else if (description.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = description.textContent.trim();
          textContent.push(p);
        }
      }
      links.forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        textContent.push(p);
      });
      [...item.querySelectorAll(".highlight--section-cta a")].filter((src) => src.textContent.trim()).forEach((src) => {
        const a = document2.createElement("a");
        a.href = src.getAttribute("href") || "";
        a.textContent = src.textContent.replace(/\s+/g, " ").trim();
        const p = document2.createElement("p");
        p.append(a);
        textContent.push(p);
      });
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-business", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-benefits.js
  var ORIGIN = "https://www.exxonmobilfuels.com";
  var MAX_COLS = 4;
  function clean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function absUrl(href) {
    const raw = (href || "").trim();
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const url = new URL(raw, `${ORIGIN}/`);
      url.searchParams.delete("_gl");
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function para(document2, text) {
    const p = document2.createElement("p");
    p.textContent = text;
    return p;
  }
  function linkPara(document2, src) {
    const a = document2.createElement("a");
    a.href = absUrl(src.getAttribute("href"));
    a.textContent = clean(src.textContent);
    const p = document2.createElement("p");
    p.append(a);
    return p;
  }
  function richPara(document2, el) {
    const p = document2.createElement("p");
    [...el.childNodes].forEach((n) => p.append(n.cloneNode(true)));
    while (p.firstChild && p.firstChild.nodeType === 3 && !clean(p.firstChild.textContent)) p.firstChild.remove();
    while (p.lastChild && p.lastChild.nodeType === 3 && !clean(p.lastChild.textContent)) p.lastChild.remove();
    if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^[\s ]+/, "");
    if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/[\s ]+$/, "");
    return p;
  }
  function textOf(root, selector) {
    const el = root && root.querySelector(selector);
    return el ? clean(el.textContent) : "";
  }
  function headerCells(header, document2) {
    const cells = [];
    const corner = header.querySelector(".ibo-desktop-header__benefits");
    cells.push(corner && clean(corner.textContent) ? [para(document2, clean(corner.textContent))] : []);
    ["pump", "store"].forEach((group) => {
      const g = header.querySelector(`.ibo-desktop-header__${group}`);
      if (!g) return;
      const title = textOf(g, `.ibo-desktop-header__${group}-title`);
      const sublabel = textOf(g, `.ibo-desktop-header__${group}-sublabel`);
      const cols = [...g.querySelectorAll(`.ibo-desktop-header__${group}-col`)].map((c) => clean(c.textContent)).filter(Boolean);
      const first = [];
      if (title) first.push(para(document2, title));
      if (sublabel) first.push(para(document2, sublabel));
      if (cols.length) first.push(para(document2, cols[0]));
      if (first.length) cells.push(first);
      cols.slice(1).forEach((c) => cells.push([para(document2, c)]));
    });
    return cells;
  }
  function labelCell(cell, document2) {
    const out = [];
    [...cell.children].forEach((child) => {
      if (child.matches("a")) {
        if (clean(child.textContent)) out.push(linkPara(document2, child));
        return;
      }
      const link = child.querySelector("a[href]");
      if (link && clean(link.textContent)) {
        out.push(linkPara(document2, link));
        return;
      }
      const text = clean(child.textContent);
      if (text) out.push(para(document2, text));
    });
    if (!out.length && clean(cell.textContent)) out.push(para(document2, clean(cell.textContent)));
    return out;
  }
  function valueCell(cell, document2) {
    const out = [];
    const value = cell.querySelector(".ibo-cell-value");
    const caption = cell.querySelector(".ibo-cell-subtext");
    if (value && clean(value.textContent)) out.push(richPara(document2, value));
    if (caption && clean(caption.textContent)) out.push(para(document2, clean(caption.textContent)));
    if (!out.length) {
      const link = cell.querySelector("a[href]");
      if (link && clean(link.textContent)) out.push(linkPara(document2, link));
      else if (clean(cell.textContent)) out.push(para(document2, clean(cell.textContent)));
    }
    return out;
  }
  function toRow(contents, document2) {
    const row = [];
    for (let i = 0; i < MAX_COLS; i += 1) {
      const c = contents[i];
      row.push(c && c.length ? [document2.createComment(` field:col${i + 1} `), ...c] : "");
    }
    return row;
  }
  function parse2(element, { document: document2 }) {
    const desktop = element.matches(".ibo-chart-desktop") ? element : element.querySelector(".ibo-chart-desktop") || element;
    const chart = element.closest(".ibo-chart") || element;
    [...chart.querySelectorAll(".ibo-chart-mobile")].forEach((m) => m.remove());
    const cells = [];
    const header = desktop.querySelector(".ibo-desktop-header");
    if (header) {
      const h = headerCells(header, document2);
      if (h.some((c) => c.length)) cells.push(toRow(h, document2));
    }
    [...desktop.querySelectorAll(".ibo-desktop-row")].forEach((row) => {
      const rowCells = [...row.querySelectorAll(":scope > .ibo-desktop-cell")];
      const contents = rowCells.map((cell, i) => i === 0 || cell.matches(".ibo-desktop-cell--label") ? labelCell(cell, document2) : valueCell(cell, document2));
      if (contents.some((c) => c.length)) cells.push(toRow(contents, document2));
    });
    const footer = desktop.querySelector(".ibo-desktop-footer");
    const note = footer ? clean(footer.textContent) : "";
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "table-benefits", cells });
    element.replaceWith(block);
    if (note) block.after(para(document2, note));
  }

  // tools/importer/parsers/columns-media.js
  var DEFAULT_ORIGIN = "https://corporate.exxonmobil.com";
  var HEADINGS = "h1, h2, h3, h4, h5, h6";
  function clean2(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function usable(src) {
    const s = (src || "").trim();
    return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : "";
  }
  function absolute(src) {
    try {
      return new URL(src, `${DEFAULT_ORIGIN}/`).href;
    } catch (e) {
      return src;
    }
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
  function findVideoUrl(root) {
    const bc = [...root.querySelectorAll("[data-video-id][data-account]")].find((el) => clean2(el.getAttribute("data-video-id")) && clean2(el.getAttribute("data-account")));
    if (bc) {
      const account = clean2(bc.getAttribute("data-account"));
      const videoId = clean2(bc.getAttribute("data-video-id"));
      const player = clean2(bc.getAttribute("data-player")) || "default";
      const embed = clean2(bc.getAttribute("data-embed")) || "default";
      return `https://players.brightcove.net/${account}/${player}_${embed}/index.html?videoId=${videoId}`;
    }
    const iframes = [...root.querySelectorAll("iframe")];
    for (let i = 0; i < iframes.length; i += 1) {
      const src = iframes[i].getAttribute("src") || iframes[i].getAttribute("data-src") || "";
      const yt = youTubeId(src);
      if (yt) return `https://www.youtube.com/watch?v=${yt}`;
      const b = brightcoveFromIframe(src);
      if (b) return b;
    }
    const typed = [...root.querySelectorAll("[data-videotype], [data-video-type]")];
    for (let i = 0; i < typed.length; i += 1) {
      const el = typed[i];
      const type = clean2(el.getAttribute("data-videotype") || el.getAttribute("data-video-type")).toLowerCase();
      const url = clean2(el.getAttribute("data-videourl") || el.getAttribute("data-video-url") || el.getAttribute("data-src"));
      const id = clean2(el.getAttribute("data-videoid") || el.getAttribute("data-video-id"));
      if (url && (youTubeId(url) || brightcoveFromIframe(url))) {
        return youTubeId(url) ? `https://www.youtube.com/watch?v=${youTubeId(url)}` : brightcoveFromIframe(url);
      }
      if (id && /youtube/.test(type)) return `https://www.youtube.com/watch?v=${id}`;
      const account = clean2(el.getAttribute("data-account"));
      if (id && account) {
        const player = clean2(el.getAttribute("data-player")) || "default";
        return `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${id}`;
      }
    }
    return "";
  }
  function getPicture(mediaEl, document2) {
    if (!mediaEl) return null;
    const bg = mediaEl.querySelector(".lazy-bg") || mediaEl;
    const imgs = [...mediaEl.querySelectorAll("img")];
    let src = usable(bg.getAttribute("data-desktop")) || usable(bg.getAttribute("data-tablet")) || usable(bg.getAttribute("data-mobile"));
    if (!src) {
      const full = imgs.find((i) => usable(i.getAttribute("src")) && !/[?&]w=40\b/.test(i.getAttribute("src"))) || imgs.find((i) => usable(i.getAttribute("src")));
      if (full) src = full.getAttribute("src");
    }
    if (!src) return null;
    const altImg = imgs.find((i) => clean2(i.getAttribute("alt")));
    const img = document2.createElement("img");
    img.src = absolute(src);
    img.alt = altImg ? clean2(altImg.getAttribute("alt")) : "";
    const picture = document2.createElement("picture");
    picture.append(img);
    return picture;
  }
  function getBody(contentEl, document2) {
    const out = [];
    if (!contentEl) return out;
    const heading = contentEl.querySelector(HEADINGS);
    if (heading && clean2(heading.textContent)) {
      const h = document2.createElement(heading.tagName.toLowerCase());
      h.textContent = clean2(heading.textContent);
      out.push(h);
    }
    const desc = contentEl.querySelector(".shortVideoHeadline--description");
    if (desc && clean2(desc.textContent)) {
      const blocks = [...desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol")].filter((b) => clean2(b.textContent));
      if (blocks.length) out.push(...blocks);
      else {
        const p = document2.createElement("p");
        p.textContent = clean2(desc.textContent);
        out.push(p);
      }
    }
    [...contentEl.querySelectorAll("a")].filter((a) => !(desc && desc.contains(a)) && !(heading && heading.contains(a)) && clean2(a.textContent)).forEach((src) => {
      const a = document2.createElement("a");
      a.href = src.getAttribute("href") || "";
      a.textContent = clean2(src.textContent);
      const p = document2.createElement("p");
      p.append(a);
      out.push(p);
    });
    return out;
  }
  var FUELS_ORIGIN2 = "https://www.exxonmobilfuels.com";
  function fuelsAbs2(href) {
    const raw = (href || "").trim();
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const url = new URL(raw, `${FUELS_ORIGIN2}/`);
      url.searchParams.delete("_gl");
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function fuelsPicture(mediaEl, document2) {
    const imgEl = mediaEl && mediaEl.querySelector("img");
    if (!imgEl) return null;
    const pic = imgEl.closest("picture");
    let best = "";
    let bestW = -1;
    if (pic) {
      [...pic.querySelectorAll("source")].forEach((s) => {
        const set = (s.getAttribute("srcset") || s.getAttribute("data-srcset") || "").split(",").map((c) => usable((c || "").trim().split(/\s+/)[0])).filter(Boolean);
        if (!set.length) return;
        const w = parseInt(s.getAttribute("width"), 10) || 0;
        if (w >= bestW) {
          bestW = w;
          best = set[set.length - 1];
        }
      });
    }
    const src = best || usable(imgEl.getAttribute("data-src")) || usable(imgEl.getAttribute("src"));
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = fuelsAbs2(src);
    img.alt = clean2(imgEl.getAttribute("alt"));
    const picture = document2.createElement("picture");
    picture.append(img);
    return picture;
  }
  function parseFeaturedItem(element, document2) {
    const mediaEl = element.querySelector(".featured-title-image");
    const contentEl = element.querySelector(".featured-title-copy");
    const picture = fuelsPicture(mediaEl, document2);
    const body = [];
    if (contentEl) {
      const heading = contentEl.querySelector(HEADINGS);
      if (heading && clean2(heading.textContent)) {
        const h = document2.createElement(heading.tagName.toLowerCase());
        h.textContent = clean2(heading.textContent);
        body.push(h);
      }
      const inContent = (el, sel) => {
        const anc = el && el.closest(sel);
        return !!anc && contentEl.contains(anc);
      };
      [...contentEl.querySelectorAll("p, ul, ol")].filter((el) => clean2(el.textContent) && !(heading && heading.contains(el)) && !inContent(el.parentElement, "p, ul, ol")).forEach((el) => {
        el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", fuelsAbs2(a.getAttribute("href"))));
        el.removeAttribute("class");
        body.push(el);
      });
      [...contentEl.querySelectorAll("a[href]")].filter((a) => clean2(a.textContent) && !inContent(a, "p, ul, ol, h1, h2, h3, h4, h5, h6")).forEach((src) => {
        const a = document2.createElement("a");
        a.href = fuelsAbs2(src.getAttribute("href"));
        a.textContent = clean2(src.textContent);
        const p = document2.createElement("p");
        p.append(a);
        body.push(p);
      });
    }
    if (!picture && !body.length) return null;
    const mediaFirst = !mediaEl || !contentEl || !(mediaEl.compareDocumentPosition(contentEl) & 2);
    const mediaCell = picture ? [picture] : "";
    const bodyCell = body.length ? body : "";
    return [mediaFirst ? [mediaCell, bodyCell] : [bodyCell, mediaCell]];
  }
  function parse3(element, { document: document2 }) {
    if (element.matches(".f01-featured-item") || element.querySelector(".featured-title-copy-wrap")) {
      const fuelsCells = parseFeaturedItem(element, document2);
      if (!fuelsCells) {
        element.remove();
        return;
      }
      const fuelsBlock = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells: fuelsCells });
      element.replaceWith(fuelsBlock);
      return;
    }
    const item = element.querySelector(".shortVideoHeadline--item") || element;
    const mediaEl = item.querySelector(".shortVideoHeadline--image");
    const contentEl = item.querySelector(".shortVideoHeadline--content");
    const media = [];
    const picture = getPicture(mediaEl, document2);
    if (picture) media.push(picture);
    const videoUrl = findVideoUrl(item);
    if (videoUrl) {
      const a = document2.createElement("a");
      a.href = videoUrl;
      a.textContent = videoUrl;
      const p = document2.createElement("p");
      p.append(a);
      media.push(p);
    }
    const body = getBody(contentEl, document2);
    if (!media.length && !body.length) {
      element.remove();
      return;
    }
    const mediaFirst = !mediaEl || !contentEl || !(mediaEl.compareDocumentPosition(contentEl) & 2);
    const mediaCell = media.length ? media : "";
    const bodyCell = body.length ? body : "";
    const cells = [mediaFirst ? [mediaCell, bodyCell] : [bodyCell, mediaCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-app-download.js
  var ORIGIN2 = "https://www.exxonmobilfuels.com";
  var HEADINGS2 = "h1, h2, h3, h4, h5, h6";
  function clean3(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function usable2(src) {
    const s = (src || "").trim().split(/\s+/)[0];
    return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : "";
  }
  function absUrl2(href) {
    const raw = (href || "").trim();
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const url = new URL(raw, `${ORIGIN2}/`);
      url.searchParams.delete("_gl");
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function imageSrc(img) {
    const picture = img.closest("picture");
    let best = "";
    let bestW = -1;
    if (picture) {
      [...picture.querySelectorAll("source")].forEach((s) => {
        const set = (s.getAttribute("srcset") || s.getAttribute("data-srcset") || "").split(",").map((c) => usable2(c)).filter(Boolean);
        if (!set.length) return;
        const w = parseInt(s.getAttribute("width"), 10) || 0;
        if (w >= bestW) {
          bestW = w;
          best = set[set.length - 1];
        }
      });
    }
    const own = usable2(img.getAttribute("data-src")) || usable2(img.getAttribute("src")) || usable2((img.getAttribute("srcset") || "").split(",").pop());
    return absUrl2(best || own);
  }
  function makePicture(img, document2) {
    const src = img && imageSrc(img);
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = src;
    out.alt = clean3(img.getAttribute("alt"));
    const picture = document2.createElement("picture");
    picture.append(out);
    return picture;
  }
  function parse4(element, { document: document2 }) {
    const content = element.querySelector(".app-content") || element;
    const linksEl = element.querySelector(".app-content-links");
    const qrImg = element.querySelector(".app-img img");
    const body = [];
    const heading = content.querySelector(HEADINGS2);
    if (heading && clean3(heading.textContent)) {
      const h = document2.createElement(heading.tagName.toLowerCase());
      h.textContent = clean3(heading.textContent);
      body.push(h);
    }
    const badges = document2.createElement("p");
    [...(linksEl || element).querySelectorAll("a[href]")].filter((a) => a.querySelector("img") && !(qrImg && a.contains(qrImg))).forEach((src) => {
      const picture = makePicture(src.querySelector("img"), document2);
      if (!picture) return;
      const a = document2.createElement("a");
      a.href = absUrl2(src.getAttribute("href"));
      const title = clean3(src.getAttribute("title")) || clean3(src.querySelector("img").getAttribute("alt"));
      if (title) a.title = title;
      a.append(picture);
      if (badges.childNodes.length) badges.append(" ");
      badges.append(a);
    });
    if (badges.childNodes.length) body.push(badges);
    const qr = makePicture(qrImg, document2);
    if (!body.length && !qr) {
      element.remove();
      return;
    }
    const row = [body.length ? body : ""];
    if (qr) row.push([qr]);
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-app-download", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  var ORIGIN3 = "https://www.exxonmobilfuels.com";
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["P", "UL", "OL", "TABLE", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6"]);
  function clean4(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function absUrl3(href) {
    const raw = (href || "").trim();
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const url = new URL(raw, `${ORIGIN3}/`);
      url.searchParams.delete("_gl");
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function richContent(container, document2) {
    const out = [];
    let run = null;
    const flush = () => {
      if (run && clean4(run.textContent)) out.push(run);
      run = null;
    };
    [...container.childNodes].forEach((node) => {
      if (node.nodeType === 8) return;
      if (node.nodeType === 1 && /^(LINK|STYLE|SCRIPT)$/.test(node.tagName)) return;
      if (node.nodeType === 1 && BLOCK_TAGS.has(node.tagName)) {
        flush();
        if (clean4(node.textContent) || node.querySelector("img")) out.push(node);
        return;
      }
      if (node.nodeType === 1 && node.tagName === "DIV") {
        flush();
        out.push(...richContent(node, document2));
        return;
      }
      if (node.nodeType === 1 && node.tagName === "BR" && (!run || !clean4(run.textContent))) return;
      if (!run) run = document2.createElement("p");
      run.append(node);
    });
    flush();
    out.forEach((el) => {
      if (el.nodeType !== 1) return;
      const links = el.matches("a[href]") ? [el] : [...el.querySelectorAll("a[href]")];
      links.forEach((a) => a.setAttribute("href", absUrl3(a.getAttribute("href"))));
    });
    return out;
  }
  function parse5(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".accordion-item")].filter((item) => item.closest(".c01-accordion") === element || !element.matches(".c01-accordion"));
    const cells = [];
    items.forEach((item) => {
      const toggle = item.querySelector(".accordion-header a, .accordion-header button, .accordion-header");
      const question = toggle ? clean4(toggle.textContent) : "";
      const body = item.querySelector(".accordion-body .paragraph") || item.querySelector(".accordion-body");
      const answer = body ? richContent(body, document2) : [];
      if (!question && !answer.length) return;
      const summaryCell = [];
      if (question) {
        const p = document2.createElement("p");
        p.textContent = question;
        summaryCell.push(document2.createComment(" field:summary "), p);
      }
      cells.push([
        summaryCell.length ? summaryCell : "",
        answer.length ? [document2.createComment(" field:text "), ...answer] : ""
      ]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-legal.js
  var ORIGIN4 = "https://www.exxonmobilfuels.com";
  var BLOCK_TAGS2 = /* @__PURE__ */ new Set(["P", "UL", "OL", "TABLE", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6"]);
  function clean5(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function absUrl4(href) {
    const raw = (href || "").trim();
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const url = new URL(raw, `${ORIGIN4}/`);
      url.searchParams.delete("_gl");
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function richContent2(container, document2) {
    const out = [];
    let run = null;
    const flush = () => {
      if (run && clean5(run.textContent)) out.push(run);
      run = null;
    };
    [...container.childNodes].forEach((node) => {
      if (node.nodeType === 8) return;
      if (node.nodeType === 1 && /^(LINK|STYLE|SCRIPT)$/.test(node.tagName)) return;
      if (node.nodeType === 1 && BLOCK_TAGS2.has(node.tagName)) {
        flush();
        if (clean5(node.textContent) || node.querySelector("img")) out.push(node);
        return;
      }
      if (node.nodeType === 1 && node.tagName === "DIV") {
        flush();
        out.push(...richContent2(node, document2));
        return;
      }
      if (node.nodeType === 1 && node.tagName === "BR" && (!run || !clean5(run.textContent))) return;
      if (!run) run = document2.createElement("p");
      run.append(node);
    });
    flush();
    out.forEach((el) => {
      if (el.nodeType !== 1) return;
      const links = el.matches("a[href]") ? [el] : [...el.querySelectorAll("a[href]")];
      links.forEach((a) => a.setAttribute("href", absUrl4(a.getAttribute("href"))));
    });
    return out;
  }
  function parse6(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".accordion-item")].filter((item) => item.closest(".c01-accordion") === element || !element.matches(".c01-accordion"));
    const cells = [];
    items.forEach((item) => {
      const toggle = item.querySelector(".accordion-header a, .accordion-header button, .accordion-header");
      const title = toggle ? clean5(toggle.textContent) : "";
      const body = item.querySelector(".accordion-body .paragraph") || item.querySelector(".accordion-body");
      const text = body ? richContent2(body, document2) : [];
      if (!title && !text.length) return;
      const summaryCell = [];
      if (title) {
        const p = document2.createElement("p");
        p.textContent = title;
        summaryCell.push(document2.createComment(" field:summary "), p);
      }
      cells.push([
        summaryCell.length ? summaryCell : "",
        text.length ? [document2.createComment(" field:text "), ...text] : ""
      ]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-legal", cells });
    element.replaceWith(block);
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
  var FOREIGN_ORIGINS = {
    "www.exxonmobilfuels.com": "https://www.exxonmobilfuels.com",
    "exxonmobilfuels.com": "https://www.exxonmobilfuels.com"
  };
  var FOREIGN_TEMPLATE_ORIGINS = {
    rewards: "https://www.exxonmobilfuels.com"
  };
  function getForeignOrigin(payload) {
    const candidates = [payload && payload.params && payload.params.originalURL, payload && payload.url];
    for (let i = 0; i < candidates.length; i += 1) {
      const u = candidates[i];
      if (u) {
        try {
          const host = new URL(u).hostname.toLowerCase();
          if (FOREIGN_ORIGINS[host]) return FOREIGN_ORIGINS[host];
        } catch (e) {
        }
      }
    }
    const name = payload && payload.template && payload.template.name;
    return name && FOREIGN_TEMPLATE_ORIGINS[name] || "";
  }
  function absolutizeForeignHref(href, origin) {
    if (!href) return null;
    const raw = href.trim();
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    try {
      return new URL(raw, origin).toString();
    } catch (e) {
      return null;
    }
  }
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
  function normalizeInternalLinks(root, pageLang = "", foreignOrigin = "") {
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (foreignOrigin) {
        const absolute2 = absolutizeForeignHref(href, foreignOrigin);
        if (absolute2 !== null) {
          if (absolute2 !== href) a.setAttribute("href", absolute2);
          return;
        }
      }
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
      normalizeInternalLinks(element, getPageLang(payload), getForeignOrigin(payload));
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

  // tools/importer/transformers/exxonmobilfuels-cleanup.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var FUELS_HOSTS = ["www.exxonmobilfuels.com", "exxonmobilfuels.com"];
  var FUELS_TEMPLATES = ["rewards"];
  function isFuelsPage(payload) {
    if (!payload) return false;
    const template = payload.template && payload.template.name;
    if (template && FUELS_TEMPLATES.includes(template)) return true;
    const candidates = [payload.params && payload.params.originalURL, payload.url];
    return candidates.some((u) => {
      if (!u) return false;
      try {
        return FUELS_HOSTS.includes(new URL(u).hostname.toLowerCase());
      } catch (e) {
        return false;
      }
    });
  }
  var CHROME = [
    // Header: brand bar (Exxon / Mobil / Rewards / Commercial), rewards nav, mega-menu, search
    "header.nav-header",
    "header.navbar-main-header",
    "div.nav-wrapper",
    "div.nav-meganav-wrapper",
    "div.nav-main-search",
    "div.nav-header-divider",
    // Footer (div#footer.footer-wrapper inside <footer>), mobile nav mask, GDPR flag input
    "footer",
    "#footer",
    "div.footer-wrapper",
    "div.body-mask",
    "input#gdpr_enabled",
    // Breadcrumbs (not on frequent-filler, defensive for other rewards pages)
    'nav[aria-label="breadcrumb"]',
    ".breadcrumb",
    ".breadcrumbs",
    // Cookie consent (OneTrust banner + preference center + filter modal)
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    "#onetrust-pc-sdk",
    "#ot-fltr-modal",
    ".onetrust-pc-dark-filter",
    "iframe.ot-text-resize",
    // Generic modals
    ".modal",
    ".modal-backdrop",
    // App-store / smart-banner popups
    ".smartbanner",
    "#smartbanner",
    "#branch-banner",
    "#branch-banner-iframe",
    ".branch-journeys-top",
    // Chat / feedback widgets (Medallia / Kampyle, LivePerson)
    "#nebula_div_btn",
    '[id^="kampyle"]',
    ".kampyle_vertical_button",
    "#MDigitalInvitationWrapper",
    "#MDigitalLightboxWrapper",
    '[id^="LPMcontainer"]',
    ".LPMcontainer",
    // Skip links
    "a.skip-link",
    ".skip-link",
    ".skip-to-content",
    'a[href="#content"]',
    'a[href="#main-content"]',
    // Mobile duplicate of the benefits chart (div.ibo-chart > .ibo-chart-desktop
    // + .ibo-chart-mobile): only the desktop chart is parsed (table-benefits).
    ".ibo-chart-mobile",
    // Hidden / print-only
    "[hidden]",
    ".d-none",
    ".hidden",
    ".visible-print",
    ".visible-print-block",
    ".d-print-block",
    ".d-print-inline",
    ".print-only",
    // Stray resources (div#content holds ~27 <link> stylesheet nodes between components)
    "link",
    "meta",
    "script",
    "style",
    "noscript",
    "template",
    "iframe"
    // doubleclick floodlight pixel (body > iframe)
  ];
  function normalizeButtonBars(doc, root) {
    root.querySelectorAll("div.sp05-button-bar").forEach((bar) => {
      const links = [...bar.querySelectorAll("a[href]")];
      if (!links.length) return;
      const paragraphs = links.map((src) => {
        const a = doc.createElement("a");
        a.setAttribute("href", src.getAttribute("href"));
        const label = src.textContent.replace(/\s+/g, " ").trim() || src.getAttribute("title") || "";
        if (src.getAttribute("title")) a.setAttribute("title", src.getAttribute("title"));
        a.textContent = label;
        const p = doc.createElement("p");
        p.append(a);
        return p;
      });
      bar.replaceChildren(...paragraphs);
    });
  }
  function wrapBareCtas(doc, root) {
    root.querySelectorAll(".expanding-box-static > a[href]").forEach((a) => {
      const p = doc.createElement("p");
      a.before(p);
      p.append(a);
    });
  }
  function stripTrackingParams(root) {
    root.querySelectorAll('a[href*="_gl="]').forEach((a) => {
      const href = a.getAttribute("href");
      try {
        const url = new URL(href);
        url.searchParams.delete("_gl");
        a.setAttribute("href", url.toString());
      } catch (e) {
      }
    });
  }
  var TRACKING_ATTRS = [
    "data-unique-id",
    "data-component-id",
    "data-source",
    "data-additional-detail",
    "data-cmpvariant",
    "data-analytics",
    "data-variantitemid",
    "data-variantfieldname",
    "data-updateddate",
    "onclick"
  ];
  function stripTrackingAttrs(root) {
    const selector = TRACKING_ATTRS.map((a) => `[${a}]`).join(", ");
    [root, ...root.querySelectorAll(selector)].forEach((el) => {
      TRACKING_ATTRS.forEach((a) => el.removeAttribute && el.removeAttribute(a));
    });
  }
  function transform3(hookName, element, payload) {
    if (!isFuelsPage(payload)) return;
    const doc = element.ownerDocument || document;
    if (hookName === TransformHook2.beforeTransform) {
      WebImporter.DOMUtils.remove(element, CHROME);
      normalizeButtonBars(doc, element);
      wrapBareCtas(doc, element);
    }
    if (hookName === TransformHook2.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".ibo-chart-mobile",
        "link",
        "meta",
        "script",
        "style",
        "noscript",
        "iframe"
      ]);
      stripTrackingParams(element);
      stripTrackingAttrs(element);
    }
  }

  // tools/importer/import-rewards.js
  var parsers = {
    "cards-business": parse,
    "table-benefits": parse2,
    "columns-media": parse3,
    "columns-app-download": parse4,
    "accordion-faq": parse5,
    "accordion-legal": parse6
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform3,
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
  var import_rewards_default = {
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
      let rawPath = sourceUrl.pathname.replace(/^\/en(?=\/)/, "").replace(/\/$/, "").replace(/\.html?$/, "");
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
  return __toCommonJS(import_rewards_exports);
})();

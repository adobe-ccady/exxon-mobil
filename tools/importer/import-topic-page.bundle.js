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

  // tools/importer/import-topic-page.js
  var import_topic_page_exports = {};
  __export(import_topic_page_exports, {
    default: () => import_topic_page_default
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

  // tools/importer/parsers/cards-news.js
  var CC_ORIGIN = "https://corporate.exxonmobil.com";
  function ccClean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function ccAbsolute(src) {
    try {
      return new URL(src, `${CC_ORIGIN}/`).href;
    } catch (e) {
      return src;
    }
  }
  function ccImage(item, document2, px) {
    const wrap = item.querySelector(`.${px}--image`);
    if (!wrap) return null;
    const imgs = [...wrap.querySelectorAll("img")];
    const holder = wrap.querySelector("[data-desktop]");
    let src = holder ? ccClean(holder.getAttribute("data-desktop")) : "";
    if (!src) {
      const ok = (s) => s && !/^(data|blob):/i.test(s);
      const full = imgs.find((i) => ok(i.getAttribute("src")) && !/[?&]w=40\b/.test(i.getAttribute("src"))) || imgs.find((i) => ok(i.getAttribute("src"))) || imgs.find((i) => ok(i.getAttribute("data-src")));
      if (full) src = full.getAttribute("src") || full.getAttribute("data-src");
    }
    if (!src) return null;
    const altImg = imgs.find((i) => ccClean(i.getAttribute("alt")));
    const img = document2.createElement("img");
    img.src = ccAbsolute(src);
    img.alt = altImg ? ccClean(altImg.getAttribute("alt")) : "";
    const picture = document2.createElement("picture");
    picture.append(img);
    return picture;
  }
  function ccText(item, document2, px) {
    const out = [];
    const content = item.querySelector(`.${px}--content`) || item;
    const titleSrc = content.querySelector("a.link-black") || [...content.querySelectorAll("a")].find((a) => !a.closest(`.tag, .article--info, .${px}--description`));
    if (titleSrc && ccClean(titleSrc.textContent)) {
      const a = document2.createElement("a");
      a.href = titleSrc.getAttribute("href") || "";
      a.textContent = ccClean(titleSrc.textContent);
      const p = document2.createElement("p");
      p.append(a);
      out.push(p);
    }
    const desc = content.querySelector(`.${px}--description`);
    if (desc && ccClean(desc.textContent)) {
      const blocks = [...desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol")].filter((b) => ccClean(b.textContent));
      if (blocks.length) out.push(...blocks);
      else {
        const p = document2.createElement("p");
        p.textContent = ccClean(desc.textContent);
        out.push(p);
      }
    }
    const tag = content.querySelector(".article--info .tag, .tag");
    if (tag && ccClean(tag.textContent)) {
      const p = document2.createElement("p");
      const tagLink = tag.querySelector("a");
      if (tagLink) {
        const a = document2.createElement("a");
        a.href = tagLink.getAttribute("href") || "";
        a.textContent = ccClean(tagLink.textContent);
        p.append(a);
      } else p.textContent = ccClean(tag.textContent);
      out.push(p);
    }
    const meta = [".content-type", ".read-time", ".date"].map((sel) => content.querySelector(`.article--info ${sel}`) || content.querySelector(sel)).map((el) => el ? ccClean(el.textContent) : "").filter(Boolean);
    if (meta.length) {
      const p = document2.createElement("p");
      p.textContent = meta.join(" \u2022 ");
      out.push(p);
    }
    return out;
  }
  function parseContentCollection(element, document2, px) {
    const before = [];
    const after = [];
    const heading = element.querySelector(["h1", "h2", "h3", "h4"].map((h) => `.${px}--title ${h}`).join(", "));
    if (heading && ccClean(heading.textContent)) {
      const h = document2.createElement(heading.tagName.toLowerCase());
      h.textContent = ccClean(heading.textContent);
      before.push(h);
    }
    [...element.querySelectorAll(`.${px}--buttons a, .${px}--bottom a, a.${px}--cta`)].filter((a, i, arr) => arr.indexOf(a) === i && ccClean(a.textContent)).forEach((src) => {
      const a = document2.createElement("a");
      a.href = src.getAttribute("href") || "";
      a.textContent = ccClean(src.textContent);
      const strong = document2.createElement("strong");
      strong.append(a);
      const p = document2.createElement("p");
      p.append(strong);
      after.push(p);
    });
    const cells = [];
    [...element.querySelectorAll(`.${px}--item`)].forEach((item) => {
      const picture = ccImage(item, document2, px);
      const text = ccText(item, document2, px);
      if (!picture && !text.length) return;
      cells.push([
        picture ? [document2.createComment(" field:image "), picture] : "",
        text.length ? [document2.createComment(" field:text "), ...text] : ""
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...before, ...after);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
    element.replaceWith(...before, block, ...after);
  }
  function parse3(element, { document: document2 }) {
    if (element.matches("section.contentCollection")) {
      parseContentCollection(element, document2, "contentCollection");
      return;
    }
    if (element.matches("section.dynamicContentCollection")) {
      parseContentCollection(element, document2, "dynamicContentCollection");
      return;
    }
    const items = [...element.querySelectorAll(".trending--item")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const titleLink = item.querySelector(":scope > a, a.link-black") || [...item.querySelectorAll("a")].find((a) => !a.closest(".tag"));
      const tag = item.querySelector(".article--info .tag, .tag");
      const readTime = item.querySelector(".read-time");
      const textContent = [];
      if (titleLink && titleLink.textContent.trim()) {
        const p = document2.createElement("p");
        p.append(titleLink);
        textContent.push(p);
      }
      if (tag && tag.textContent.trim()) {
        const p = document2.createElement("p");
        const tagLink = tag.querySelector("a");
        if (tagLink) p.append(tagLink);
        else p.textContent = tag.textContent.trim();
        textContent.push(p);
      }
      if (readTime && readTime.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = readTime.textContent.trim();
        textContent.push(p);
      }
      if (!textContent.length && !img) return;
      cells.push([
        img ? [document2.createComment(" field:image "), img] : "",
        textContent.length ? [document2.createComment(" field:text "), ...textContent] : ""
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-feature.js
  var DEFAULT_ORIGIN2 = "https://corporate.exxonmobil.com";
  var HEADINGS = "h1, h2, h3, h4, h5, h6";
  function clean3(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function usable2(src) {
    const s = (src || "").trim();
    return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : "";
  }
  function absolute2(src) {
    try {
      return new URL(src, `${DEFAULT_ORIGIN2}/`).href;
    } catch (e) {
      return src;
    }
  }
  function isPlaceholder(src) {
    return /[?&]w=40\b/.test(src || "");
  }
  function getImage(element, document2) {
    const bg = [...element.querySelectorAll(".lazy-bg")].find((el) => !el.closest(".toc-hidden"));
    if (!bg) return null;
    const imgs = [...bg.querySelectorAll("img")];
    let src = usable2(bg.getAttribute("data-desktop")) || usable2(bg.getAttribute("data-tablet")) || usable2(bg.getAttribute("data-mobile"));
    if (!src) {
      const full = imgs.find((i) => usable2(i.getAttribute("src")) && !isPlaceholder(i.getAttribute("src"))) || imgs.find((i) => usable2(i.getAttribute("src")));
      if (full) src = full.getAttribute("src");
    }
    if (!src) return null;
    const altImg = imgs.find((i) => clean3(i.getAttribute("alt")));
    const img = document2.createElement("img");
    img.src = absolute2(src);
    img.alt = altImg ? clean3(altImg.getAttribute("alt")) : "";
    const picture = document2.createElement("picture");
    picture.append(img);
    return picture;
  }
  function notHidden(el) {
    return el && !el.closest(".toc-hidden");
  }
  function getText(element, document2) {
    const out = [];
    const content = element.querySelector(".singleFeature--content, .variableFeature--content") || element;
    const eyebrow = [...content.querySelectorAll(".eyebrow")].find(notHidden);
    if (eyebrow && clean3(eyebrow.textContent)) {
      const p = document2.createElement("p");
      p.textContent = clean3(eyebrow.textContent);
      out.push(p);
    }
    const titleWrap = content.querySelector('[class*="--textField--title"]');
    const heading = titleWrap && titleWrap.querySelector(HEADINGS) || [...content.querySelectorAll(HEADINGS)].find(notHidden);
    if (heading && clean3(heading.textContent)) {
      const level = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h2";
      const h = document2.createElement(level);
      h.textContent = clean3(heading.textContent);
      out.push(h);
    } else if (titleWrap && clean3(titleWrap.textContent)) {
      const h = document2.createElement("h2");
      h.textContent = clean3(titleWrap.textContent);
      out.push(h);
    }
    const desc = content.querySelector('[class*="--textField--description"]');
    if (desc && clean3(desc.textContent)) {
      const blocks = [...desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol")].filter((b) => clean3(b.textContent));
      if (blocks.length) out.push(...blocks);
      else {
        const p = document2.createElement("p");
        p.textContent = clean3(desc.textContent);
        out.push(p);
      }
    }
    const ctas = [...content.querySelectorAll("a.button, .variableFeature--button-block a, a.cta")].filter((a, i, arr) => notHidden(a) && arr.indexOf(a) === i && clean3(a.textContent));
    ctas.forEach((cta) => {
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href") || "";
      a.textContent = clean3(cta.textContent);
      const strong = document2.createElement("strong");
      strong.append(a);
      const p = document2.createElement("p");
      p.append(strong);
      out.push(p);
    });
    return out;
  }
  function parse4(element, { document: document2 }) {
    const picture = getImage(element, document2);
    const text = getText(element, document2);
    const cells = [
      [picture ? [document2.createComment(" field:image "), picture] : ""],
      [text.length ? [document2.createComment(" field:text "), ...text] : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-business.js
  function getImage2(item, document2) {
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
  function parse5(element, { document: document2 }) {
    const items = [...element.querySelectorAll("li.highlight--item")];
    const cells = [];
    items.forEach((item) => {
      const img = getImage2(item, document2);
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

  // tools/importer/parsers/quote.js
  var DEFAULT_ORIGIN3 = "https://corporate.exxonmobil.com";
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["P", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6"]);
  var OPEN_QUOTES = /^[\s ]*[“”„"]+[\s ]*/;
  var CLOSE_QUOTES = /[\s ]*[“”"]+[\s ]*$/;
  function clean4(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function hasText(node) {
    return clean4(node.textContent).length > 0;
  }
  function isBlank(n) {
    return n.nodeType === 8 || n.nodeType === 3 && !clean4(n.textContent) || n.nodeName === "BR";
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
    return DEFAULT_ORIGIN3;
  }
  function absolute3(src, origin) {
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
        if (clean4(k.textContent)) return k;
      } else if (k.nodeType === 1) {
        const t = edgeText(k, first);
        if (t) return t;
      }
    }
    return null;
  }
  function trimEdges(parent) {
    while (parent.firstChild && isBlank(parent.firstChild)) parent.firstChild.remove();
    while (parent.lastChild && isBlank(parent.lastChild)) parent.lastChild.remove();
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
      if (n.nodeType === 1 && BLOCK_TAGS.has(n.tagName)) {
        para = null;
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
    out.forEach((p) => trimEdges(p));
    return out.filter((p) => hasText(p));
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
    img.src = absolute3(src, origin);
    const alt = srcImg ? srcImg.getAttribute("alt") : null;
    img.alt = alt !== null ? clean4(alt) : fallbackAlt || "";
    return img;
  }
  function attributionContent(author, document2) {
    if (!author) return [];
    const out = [];
    const nameEl = author.querySelector(".author--name");
    const name = nameEl ? clean4(nameEl.textContent) : "";
    if (name) {
      const p = document2.createElement("p");
      p.textContent = name;
      out.push(p);
    }
    author.querySelectorAll(".author--title").forEach((t) => {
      const role = clean4(t.textContent);
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
    const img = portrait(author, document2, origin, nameEl ? clean4(nameEl.textContent) : "");
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

  // tools/importer/parsers/columns-media.js
  var DEFAULT_ORIGIN4 = "https://corporate.exxonmobil.com";
  var HEADINGS2 = "h1, h2, h3, h4, h5, h6";
  function clean5(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function usable3(src) {
    const s = (src || "").trim();
    return s && !/^data:/i.test(s) && !/^blob:/i.test(s) ? s : "";
  }
  function absolute4(src) {
    try {
      return new URL(src, `${DEFAULT_ORIGIN4}/`).href;
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
    const bc = [...root.querySelectorAll("[data-video-id][data-account]")].find((el) => clean5(el.getAttribute("data-video-id")) && clean5(el.getAttribute("data-account")));
    if (bc) {
      const account = clean5(bc.getAttribute("data-account"));
      const videoId = clean5(bc.getAttribute("data-video-id"));
      const player = clean5(bc.getAttribute("data-player")) || "default";
      const embed = clean5(bc.getAttribute("data-embed")) || "default";
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
      const type = clean5(el.getAttribute("data-videotype") || el.getAttribute("data-video-type")).toLowerCase();
      const url = clean5(el.getAttribute("data-videourl") || el.getAttribute("data-video-url") || el.getAttribute("data-src"));
      const id = clean5(el.getAttribute("data-videoid") || el.getAttribute("data-video-id"));
      if (url && (youTubeId(url) || brightcoveFromIframe(url))) {
        return youTubeId(url) ? `https://www.youtube.com/watch?v=${youTubeId(url)}` : brightcoveFromIframe(url);
      }
      if (id && /youtube/.test(type)) return `https://www.youtube.com/watch?v=${id}`;
      const account = clean5(el.getAttribute("data-account"));
      if (id && account) {
        const player = clean5(el.getAttribute("data-player")) || "default";
        return `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${id}`;
      }
    }
    return "";
  }
  function getPicture(mediaEl, document2) {
    if (!mediaEl) return null;
    const bg = mediaEl.querySelector(".lazy-bg") || mediaEl;
    const imgs = [...mediaEl.querySelectorAll("img")];
    let src = usable3(bg.getAttribute("data-desktop")) || usable3(bg.getAttribute("data-tablet")) || usable3(bg.getAttribute("data-mobile"));
    if (!src) {
      const full = imgs.find((i) => usable3(i.getAttribute("src")) && !/[?&]w=40\b/.test(i.getAttribute("src"))) || imgs.find((i) => usable3(i.getAttribute("src")));
      if (full) src = full.getAttribute("src");
    }
    if (!src) return null;
    const altImg = imgs.find((i) => clean5(i.getAttribute("alt")));
    const img = document2.createElement("img");
    img.src = absolute4(src);
    img.alt = altImg ? clean5(altImg.getAttribute("alt")) : "";
    const picture = document2.createElement("picture");
    picture.append(img);
    return picture;
  }
  function getBody(contentEl, document2) {
    const out = [];
    if (!contentEl) return out;
    const heading = contentEl.querySelector(HEADINGS2);
    if (heading && clean5(heading.textContent)) {
      const h = document2.createElement(heading.tagName.toLowerCase());
      h.textContent = clean5(heading.textContent);
      out.push(h);
    }
    const desc = contentEl.querySelector(".shortVideoHeadline--description");
    if (desc && clean5(desc.textContent)) {
      const blocks = [...desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol")].filter((b) => clean5(b.textContent));
      if (blocks.length) out.push(...blocks);
      else {
        const p = document2.createElement("p");
        p.textContent = clean5(desc.textContent);
        out.push(p);
      }
    }
    [...contentEl.querySelectorAll("a")].filter((a) => !(desc && desc.contains(a)) && !(heading && heading.contains(a)) && clean5(a.textContent)).forEach((src) => {
      const a = document2.createElement("a");
      a.href = src.getAttribute("href") || "";
      a.textContent = clean5(src.textContent);
      const p = document2.createElement("p");
      p.append(a);
      out.push(p);
    });
    return out;
  }
  function parse7(element, { document: document2 }) {
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

  // tools/importer/parsers/cards-icon-links.js
  var DEFAULT_ORIGIN5 = "https://corporate.exxonmobil.com";
  var HEADINGS3 = "h1, h2, h3, h4, h5, h6";
  function clean6(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function imgSrc(src) {
    let s = (src || "").trim();
    if (!s || /^data:/i.test(s) || /^blob:/i.test(s)) return "";
    if (s.startsWith("/") && !s.startsWith("//")) s = `${DEFAULT_ORIGIN5}${s}`;
    else if (s.startsWith("//")) s = `https:${s}`;
    if (/\.svg$/i.test(s)) s = `${s}?iar=0`;
    return s;
  }
  function blocksOf(el, document2) {
    if (!el || !clean6(el.textContent)) return [];
    const blocks = [...el.querySelectorAll(":scope > p, :scope > ul, :scope > ol")].filter((b) => clean6(b.textContent));
    if (blocks.length) return blocks;
    const p = document2.createElement("p");
    p.textContent = clean6(el.textContent);
    return [p];
  }
  function parse8(element, { document: document2 }) {
    const before = [];
    const titleWrap = element.querySelector(".iconGrid--title");
    if (titleWrap) {
      const heading = titleWrap.querySelector(HEADINGS3);
      if (heading && clean6(heading.textContent)) {
        const h = document2.createElement(heading.tagName.toLowerCase());
        h.textContent = clean6(heading.textContent);
        before.push(h);
      }
      before.push(...blocksOf(titleWrap.querySelector(".iconGrid--title-description"), document2));
    }
    const cells = [];
    [...element.querySelectorAll(".iconGrid--item")].forEach((item) => {
      const titleArea = item.querySelector(".iconGrid--item-title");
      const contentArea = item.querySelector(".iconGrid--item-content");
      let picture = null;
      const icon = titleArea && titleArea.querySelector("img") || item.querySelector("img");
      const src = icon ? imgSrc(icon.getAttribute("src") || icon.getAttribute("data-src")) : "";
      if (src) {
        const img = document2.createElement("img");
        img.src = src;
        img.alt = clean6(icon.getAttribute("alt"));
        picture = document2.createElement("picture");
        picture.append(img);
      }
      const text = [];
      const label = titleArea ? titleArea.querySelector(HEADINGS3) : item.querySelector(HEADINGS3);
      if (label && clean6(label.textContent)) {
        const p = document2.createElement("p");
        p.textContent = clean6(label.textContent);
        text.push(p);
      }
      if (contentArea) {
        text.push(...blocksOf(contentArea.querySelector(".item--description"), document2));
        const links = [...contentArea.querySelectorAll("a")].filter((a) => !a.closest(".item--description") && clean6(a.textContent));
        links.forEach((srcA) => {
          const a = document2.createElement("a");
          a.href = srcA.getAttribute("href") || "";
          a.textContent = clean6(srcA.textContent);
          const p = document2.createElement("p");
          p.append(a);
          text.push(p);
        });
      }
      if (!picture && !text.length) return;
      cells.push([
        picture ? [document2.createComment(" field:image "), picture] : "",
        text.length ? [document2.createComment(" field:text "), ...text] : ""
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...before);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon-links", cells });
    element.replaceWith(...before, block);
  }

  // tools/importer/parsers/cards-topics.js
  function getImage3(item, document2, alt) {
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
  function clean7(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parseFeatureGridItem(item, document2) {
    const link = item.querySelector("a.featureGrid--link") || item.querySelector("a[href]:not(.tag a)");
    const href = link ? link.getAttribute("href") : null;
    const titleEl = item.querySelector(".featureGrid--title");
    const title = titleEl ? clean7(titleEl.textContent) : "";
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
    const desc = descEl ? clean7(descEl.textContent) : "";
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc;
      textContent.push(p);
    }
    const info = item.querySelector(".article--info");
    if (info) {
      const tag = info.querySelector(".tag");
      if (tag && clean7(tag.textContent)) {
        const p = document2.createElement("p");
        const tagLink = tag.querySelector("a[href]");
        if (tagLink) {
          const a = document2.createElement("a");
          a.href = tagLink.getAttribute("href");
          a.textContent = clean7(tagLink.textContent);
          p.append(a);
        } else {
          p.textContent = clean7(tag.textContent);
        }
        textContent.push(p);
      }
      const type = clean7((info.querySelector(".content-type") || {}).textContent);
      const date = clean7((info.querySelector(".date") || {}).textContent);
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
  function parse9(element, { document: document2 }) {
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
      const img = getImage3(item, document2, title);
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
  var BLOCK_TAGS2 = /* @__PURE__ */ new Set(["P", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE"]);
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
  function hasText2(node) {
    return (node.textContent || "").replace(/[\s ]+/g, "").length > 0;
  }
  function isBlank2(n) {
    return n.nodeType === 8 || n.nodeType === 3 && !n.textContent.replace(/ /g, " ").trim() || n.nodeName === "BR";
  }
  function cleanCell(container, document2) {
    container.querySelectorAll("script, style, noscript").forEach((n) => n.remove());
    container.querySelectorAll("a").forEach((a) => {
      if (!hasText2(a) && !a.querySelector("img")) a.remove();
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
      if (!hasText2(el) && !el.querySelector("img")) el.remove();
    });
  }
  function trimEdges2(parent) {
    while (parent.firstChild && isBlank2(parent.firstChild)) parent.firstChild.remove();
    while (parent.lastChild && isBlank2(parent.lastChild)) parent.lastChild.remove();
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
    if (!hasText2(container) && !container.querySelector("img")) return [];
    const out = [];
    let para = null;
    [...container.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1 && BLOCK_TAGS2.has(n.tagName)) {
        para = null;
        if (n.tagName === "P") trimEdges2(n);
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
    out.forEach((p) => {
      if (p.tagName === "P") trimEdges2(p);
    });
    return out.filter((p) => hasText2(p) || p.querySelector && p.querySelector("img"));
  }
  function parse10(element, { document: document2 }) {
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

  // tools/importer/parsers/video.js
  var GENERIC_TITLES = /^(video player|video|player|youtube video player)$/i;
  var CAPTION_SELECTOR = "figcaption, .articleMedia--caption, .articleMedia--captionText, .caption";
  var BLOCK_TAGS3 = /* @__PURE__ */ new Set(["P", "UL", "OL", "H2", "H3", "H4", "H5", "H6"]);
  function clean8(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function usableTitle(text) {
    const t = clean8(text);
    return t && !GENERIC_TITLES.test(t) ? t : "";
  }
  function youTubeId2(src) {
    const s = (src || "").trim();
    if (!s) return "";
    let m = s.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{6,})/i);
    if (m) return m[1];
    m = s.match(/youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/i);
    if (m) return m[1];
    m = s.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    return m ? m[1] : "";
  }
  function brightcoveFromIframe2(src) {
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
    const bcCandidates = [...element.querySelectorAll("[data-video-id][data-account]")].filter((el) => clean8(el.getAttribute("data-video-id")) && clean8(el.getAttribute("data-account")));
    if (bcCandidates.length) {
      const el = bcCandidates[0];
      const pick = (name) => {
        for (let i = 0; i < bcCandidates.length; i += 1) {
          const v = clean8(bcCandidates[i].getAttribute(name));
          if (v) return v;
        }
        return "";
      };
      const account = clean8(el.getAttribute("data-account"));
      const videoId = clean8(el.getAttribute("data-video-id"));
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
      const ytId = youTubeId2(src);
      const title = usableTitle(f.getAttribute("title")) || usableTitle(f.getAttribute("aria-label"));
      if (ytId) return { url: `https://www.youtube.com/watch?v=${ytId}`, title };
      const bc = brightcoveFromIframe2(src);
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
      if (!clean8(c.textContent)) return;
      const blocks = [...c.children].filter((k) => BLOCK_TAGS3.has(k.tagName));
      if (blocks.length) {
        blocks.forEach((b) => {
          if (clean8(b.textContent)) out.push(b);
        });
        return;
      }
      const p = document2.createElement("p");
      p.append(...c.childNodes);
      out.push(p);
    });
    return out;
  }
  function parse11(element, { document: document2 }) {
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

  // tools/importer/import-topic-page.js
  var parsers = {
    "hero-article-banner": parse,
    "secondary-nav": parse2,
    "cards-news": parse3,
    "hero-feature": parse4,
    "cards-business": parse5,
    "quote": parse6,
    "columns-media": parse7,
    "cards-icon-links": parse8,
    "cards-topics": parse9,
    "table": parse10,
    "video": parse11
  };
  var PAGE_TEMPLATE = {
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
  var import_topic_page_default = {
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
  return __toCommonJS(import_topic_page_exports);
})();

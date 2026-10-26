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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    let wrappers = [...element.querySelectorAll(".homeHero--itemWrapper")];
    let slides = wrappers.map((wrapper) => ({
      wrapper,
      item: wrapper.closest(".homeHero--item") || wrapper.parentElement
    }));
    if (!slides.length) {
      slides = [...element.querySelectorAll(".homeHero--item")].map((item) => ({ wrapper: item, item }));
    }
    const cells = [];
    const seenImages = /* @__PURE__ */ new Set();
    slides.forEach(({ wrapper, item }) => {
      let img = null;
      if (item && item !== wrapper) {
        img = item.querySelector(":scope > picture img, :scope > img") || [...item.querySelectorAll("img")].find((i) => !wrapper.contains(i));
      }
      if (!img) img = item ? item.querySelector("img.homeHero--image") : null;
      if (img && seenImages.has(img)) img = null;
      if (img) seenImages.add(img);
      if (!img && item) {
        let src = item.getAttribute("data-desktop") || item.getAttribute("data-tablet") || item.getAttribute("data-mobile");
        if (!src) {
          const bgEl = [item, ...item.querySelectorAll("canvas")].find((el) => /url\(/.test(el.getAttribute("style") || ""));
          const m = bgEl ? (bgEl.getAttribute("style") || "").match(/url\(["']?([^"')]+)["']?\)/) : null;
          if (m) [, src] = m;
        }
        if (src) {
          img = document2.createElement("img");
          img.src = src;
          const title = wrapper.querySelector(".homeHero--title, h1, h2, h3");
          img.alt = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
        }
      }
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:media_image "));
        imageCell.push(img);
      }
      const textCell = [];
      const eyebrow = wrapper.querySelector(".eyebrow p, .eyebrow");
      const heading = wrapper.querySelector(".homeHero--title, h1, h2, h3");
      const text = wrapper.querySelector(".homeHero--text, p.h6");
      const ctas = [...wrapper.querySelectorAll(".homeHero--ctaContainer a, a.button")];
      const uniqueCtas = ctas.filter((a, i) => ctas.indexOf(a) === i);
      const content = [];
      if (eyebrow) {
        const p = document2.createElement("p");
        p.textContent = eyebrow.textContent.trim();
        content.push(p);
      }
      if (heading) content.push(heading);
      if (text && text !== eyebrow) content.push(text);
      uniqueCtas.forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        content.push(p);
      });
      if (!img && !content.length) return;
      if (content.length) {
        textCell.push(document2.createComment(" field:content_text "));
        textCell.push(...content);
      }
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-stock-ticker.js
  function parse2(element, { document: document2 }) {
    const titleWrap = element.querySelector(".stockTicker--title") || element;
    const heading = titleWrap.querySelector("h1, h2, h3, h4, h5, h6");
    const dataWrap = element.querySelector(".stockTicker--data");
    const dataItems = dataWrap ? [...dataWrap.querySelectorAll(":scope > .stockTicker--data-item")] : [...element.querySelectorAll(".stockTicker--price, .stockTicker--change, .stockTicker--time")];
    const dataCell = [];
    dataItems.forEach((item) => {
      const text = item.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const p = document2.createElement("p");
      p.textContent = text;
      dataCell.push(p);
    });
    if (!heading && !dataCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[heading || "", dataCell.length ? dataCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-stock-ticker", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function getBackgroundImage(element, document2) {
    const bg = element.querySelector(".lazy-bg, .reponsive-background > div:first-child");
    const imgs = bg ? [...bg.querySelectorAll("img")] : [];
    const altImg = imgs.find((i) => i.getAttribute("alt"));
    const alt = altImg ? altImg.getAttribute("alt") : "";
    let src = bg ? bg.getAttribute("data-desktop") || bg.getAttribute("data-tablet") || bg.getAttribute("data-mobile") : null;
    if (!src) {
      const full = imgs.find((i) => !/[?&]w=40\b/.test(i.getAttribute("src") || "")) || imgs[0];
      if (full) src = full.getAttribute("src");
    }
    if (!src && bg) {
      const m = (bg.getAttribute("style") || "").match(/url\(["']?([^"')]+)["']?\)/);
      if (m) [, src] = m;
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = src;
    img.alt = alt;
    return img;
  }
  function parse3(element, { document: document2 }) {
    const img = getBackgroundImage(element, document2);
    const content = element.querySelector(".content") || element;
    const titleWrap = content.querySelector(".singleFeature--textField--title");
    const heading = (titleWrap || content).querySelector("h1, h2, h3, h4");
    if (heading) {
      heading.querySelectorAll("sub, sup").forEach((s) => s.replaceWith(...s.childNodes));
    }
    const eyebrow = content.querySelector(".singleFeature--textField--eyebrow");
    const description = content.querySelector(".singleFeature--textField--description");
    const ctas = [...content.querySelectorAll(".singleFeature--buttons a, a.button")].filter((a, i, arr) => arr.indexOf(a) === i);
    const textContent = [];
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      textContent.push(p);
    }
    if (heading) textContent.push(heading);
    if (description) {
      const paras = [...description.querySelectorAll("p")];
      if (paras.length) textContent.push(...paras);
      else if (description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        textContent.push(p);
      }
    }
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      textContent.push(p);
    });
    if (!img && !textContent.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([img ? [document2.createComment(" field:image "), img] : ""]);
    cells.push([textContent.length ? [document2.createComment(" field:text "), ...textContent] : ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
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
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parseFeatureGridItem(item, document2) {
    const link = item.querySelector("a.featureGrid--link") || item.querySelector("a[href]:not(.tag a)");
    const href = link ? link.getAttribute("href") : null;
    const titleEl = item.querySelector(".featureGrid--title");
    const title = titleEl ? clean(titleEl.textContent) : "";
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
    const desc = descEl ? clean(descEl.textContent) : "";
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc;
      textContent.push(p);
    }
    const info = item.querySelector(".article--info");
    if (info) {
      const tag = info.querySelector(".tag");
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
        textContent.push(p);
      }
      const type = clean((info.querySelector(".content-type") || {}).textContent);
      const date = clean((info.querySelector(".date") || {}).textContent);
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
  function parse5(element, { document: document2 }) {
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
  function parse6(element, { document: document2 }) {
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

  // tools/importer/parsers/hero-centered.js
  function getBackgroundImage2(element, document2) {
    const bg = element.querySelector(".lazy-bg, .reponsive-background > div:first-child");
    const imgs = bg ? [...bg.querySelectorAll("img")] : [];
    const altImg = imgs.find((i) => i.getAttribute("alt"));
    const alt = altImg ? altImg.getAttribute("alt") : "";
    let src = bg ? bg.getAttribute("data-desktop") || bg.getAttribute("data-tablet") || bg.getAttribute("data-mobile") : null;
    if (!src) {
      const full = imgs.find((i) => !/[?&]w=40\b/.test(i.getAttribute("src") || "")) || imgs[0];
      if (full) src = full.getAttribute("src");
    }
    if (!src && bg) {
      const m = (bg.getAttribute("style") || "").match(/url\(["']?([^"')]+)["']?\)/);
      if (m) [, src] = m;
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = src;
    img.alt = alt;
    return img;
  }
  function parse7(element, { document: document2 }) {
    const img = getBackgroundImage2(element, document2);
    const content = element.querySelector(".singleFeature--content") || element.querySelector(".content") || element;
    const titleWrap = content.querySelector(".singleFeature--textField--title");
    const heading = (titleWrap || content).querySelector("h1, h2, h3, h4");
    if (heading) {
      heading.querySelectorAll("sub, sup").forEach((s) => s.replaceWith(...s.childNodes));
    }
    const eyebrow = content.querySelector(".singleFeature--textField--eyebrow");
    const description = content.querySelector(".singleFeature--textField--description");
    const scope = element.querySelector(".content") || element;
    const ctas = [...scope.querySelectorAll(".singleFeature--buttons a, a.button")].filter((a, i, arr) => arr.indexOf(a) === i);
    const textContent = [];
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      textContent.push(p);
    }
    if (heading) textContent.push(heading);
    if (description) {
      const paras = [...description.querySelectorAll("p")];
      if (paras.length) textContent.push(...paras);
      else if (description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        textContent.push(p);
      }
    }
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      textContent.push(p);
    });
    if (!img && !textContent.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([img ? [document2.createComment(" field:image "), img] : ""]);
    cells.push([textContent.length ? [document2.createComment(" field:text "), ...textContent] : ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-centered", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-links.js
  function getImage3(item, document2) {
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
  function parse8(element, { document: document2 }) {
    const items = [...element.querySelectorAll("li.highlight--item")];
    const cells = [];
    items.forEach((item) => {
      const img = getImage3(item, document2);
      const titleEl = item.querySelector(".highlight--section-title h2, .highlight--section-title h3, .highlight--section-title h4, h3");
      const description = item.querySelector(".highlight--section-description");
      const links = [...item.querySelectorAll(".highlight--links a")];
      const textContent = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
        textContent.push(h);
      }
      if (description && description.textContent.trim()) {
        const paras = [...description.querySelectorAll("p")];
        if (paras.length) textContent.push(...paras);
        else {
          const p = document2.createElement("p");
          p.textContent = description.textContent.trim();
          textContent.push(p);
        }
      }
      if (links.length) {
        const ul = document2.createElement("ul");
        links.forEach((a) => {
          const li = document2.createElement("li");
          a.setAttribute("href", (a.getAttribute("href") || "").trim());
          li.append(a);
          ul.append(li);
        });
        textContent.push(ul);
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-links", cells });
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

  // tools/importer/import-home.js
  var parsers = {
    "carousel-hero": parse,
    "columns-stock-ticker": parse2,
    "hero-banner": parse3,
    "cards-topics": parse4,
    "cards-news": parse5,
    "cards-business": parse6,
    "hero-centered": parse7,
    "cards-links": parse8
  };
  var PAGE_TEMPLATE = {
    name: "home",
    urls: [
      "https://corporate.exxonmobil.com/"
    ],
    description: "ExxonMobil corporate homepage: hero slider, stock ticker, banners, trending topics/news, business divisions, brands promo and quick links",
    blocks: [
      { name: "carousel-hero", instances: ["header.homeHero .homeHero--content"] },
      { name: "columns-stock-ticker", instances: ["section.stockTicker .stockTicker--wrapper"] },
      { name: "hero-banner", instances: ["section.singleFeature.singleFeature-variable"] },
      { name: "cards-topics", instances: ["section.keytopicstrending .keytopics.keytopics-two-up"] },
      { name: "cards-news", instances: ["section.keytopicstrending .trending--content"] },
      { name: "cards-business", instances: [".highlight--wrapper.highlight-gray > .highlight--content"] },
      { name: "hero-centered", instances: ["section.singleFeature.singleFeature-centerContent"] },
      { name: "cards-links", instances: [".highlight--wrapper.highlight-white > .highlight--content"] }
    ],
    sections: [
      {
        id: "1",
        name: "Home hero slider",
        selector: ["header.homeHero"],
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "2",
        name: "Stock ticker",
        selector: ["section.stockTicker"],
        style: null,
        blocks: ["columns-stock-ticker"],
        defaultContent: []
      },
      {
        id: "3",
        name: "Mission statement banner",
        selector: ["section.singleFeature.singleFeature-variable"],
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "4",
        name: "Trending topics and latest news",
        selector: ["section.keytopicstrending"],
        style: "trending-split",
        blocks: ["cards-topics", "cards-news"],
        defaultContent: [".keytopics--section-title", ".trending--title"]
      },
      {
        id: "5",
        name: "Our global organization",
        selector: ["section.highlight:has(.highlight-gray)", ".home--wrapper > section.highlight:nth-of-type(4)"],
        style: "grey",
        blocks: ["cards-business"],
        defaultContent: [".highlight-gray > .highlight--header"]
      },
      {
        id: "6",
        name: "Our global brands",
        selector: ["section.singleFeature.singleFeature-centerContent"],
        style: null,
        blocks: ["hero-centered"],
        defaultContent: []
      },
      {
        id: "7",
        name: "Quick links (About us / Careers / Motorists)",
        selector: ["section.highlight:has(.highlight-white)", ".home--wrapper > section.highlight:nth-of-type(6)"],
        style: null,
        blocks: ["cards-links"],
        defaultContent: []
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
  var import_home_default = {
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
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
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
  return __toCommonJS(import_home_exports);
})();

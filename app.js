// Brand Kit Studio — wizard, brand detection, CSS generation, article prototype
import { generateBrandCss } from "./src/css.js";
import { renderArticleHtml } from "./src/prototype.js";

// ---------- Wizard step config ----------
const STEPS = [
  { id: "welcome",    tpl: "tpl-welcome",    label: "Welcome",       hideInStepper: true,  next: "Get started" },
  { id: "url",        tpl: "tpl-url",        label: "Source",        next: "Analyze" },
  { id: "analyzing",  tpl: "tpl-analyzing",  label: "Analyze",       hideNav: true },
  { id: "brand",      tpl: "tpl-brand",      label: "Brand",         next: "Continue" },
  { id: "typography", tpl: "tpl-typography", label: "Typography",    next: "Continue" },
  { id: "tokens",     tpl: "tpl-tokens",     label: "Tokens",        next: "Generate" },
  { id: "generating", tpl: "tpl-generating", label: "Build",         hideNav: true },
  { id: "preview",    tpl: "tpl-preview",    label: "Preview",       next: "Start over", terminal: true }
];

// ---------- State ----------
const state = {
  stepIndex: 0,
  publisher: { url: "", domain: "", name: "" },
  brand: {
    logoUrl: "",
    monogram: "",
    colors: {
      primary:    "#7c5cff",
      accent:     "#22d3ee",
      surface:    "#ffffff",
      ink:        "#0e1020",
      muted:      "#6f7396"
    },
    typography: {
      pairId: "modern-serif",
      heading: "Playfair Display",
      headingFallback: "serif",
      body:    "Inter",
      bodyFallback: "sans-serif"
    },
    tokens: {
      radius: "rounded", // sharp | soft | rounded | pill
      density: "comfortable", // compact | comfortable | spacious
      mood: "light" // light | dark
    }
  },
  generated: { css: "", html: "" }
};

// ---------- Type pairings ----------
const TYPE_PAIRS = [
  { id: "modern-serif",   name: "Modern Serif",       heading: "Playfair Display", headingFb: "serif",     body: "Inter",          bodyFb: "sans-serif" },
  { id: "editorial",      name: "Editorial",          heading: "Fraunces",         headingFb: "serif",     body: "Source Serif 4", bodyFb: "serif" },
  { id: "magazine",       name: "Magazine",           heading: "DM Serif Display", headingFb: "serif",     body: "Inter",          bodyFb: "sans-serif" },
  { id: "newsroom",       name: "Newsroom",           heading: "Merriweather",     headingFb: "serif",     body: "Lora",           bodyFb: "serif" },
  { id: "tech-mag",       name: "Tech Magazine",      heading: "Space Grotesk",    headingFb: "sans-serif",body: "Inter",          bodyFb: "sans-serif" },
  { id: "humanist",       name: "Humanist",           heading: "Manrope",          headingFb: "sans-serif",body: "Manrope",        bodyFb: "sans-serif" },
  { id: "ibm",            name: "Plex Editorial",     heading: "IBM Plex Sans",    headingFb: "sans-serif",body: "IBM Plex Sans",  bodyFb: "sans-serif" },
  { id: "workhorse",      name: "Workhorse",          heading: "Work Sans",        headingFb: "sans-serif",body: "Work Sans",      bodyFb: "sans-serif" }
];

// ---------- Element refs ----------
const $wizard = document.getElementById("wizard");
const $stepper = document.getElementById("stepper");
const $stepCounter = document.getElementById("step-counter");
const $progressBar = document.getElementById("progress-bar");
const $btnBack = document.getElementById("btn-back");
const $btnNext = document.getElementById("btn-next");
const $btnNextLabel = document.getElementById("btn-next-label");
const $toast = document.getElementById("toast");

// ---------- Stepper render ----------
function renderStepper() {
  $stepper.innerHTML = "";
  let visibleIndex = 0;
  STEPS.forEach((step, i) => {
    if (step.hideInStepper) return;
    visibleIndex += 1;
    const li = document.createElement("li");
    li.className = "stepper__item";
    if (i === state.stepIndex) li.classList.add("is-active");
    if (i < state.stepIndex) li.classList.add("is-done");
    li.innerHTML = `<span class="num">${visibleIndex}</span><span>${step.label}</span>`;
    $stepper.appendChild(li);
  });
  // step counter + progress
  const visibleSteps = STEPS.filter((s) => !s.hideInStepper);
  const visibleCurrent = visibleSteps.findIndex((s) => s.id === STEPS[state.stepIndex].id) + 1;
  if (visibleCurrent > 0) {
    $stepCounter.textContent = `Step ${visibleCurrent} of ${visibleSteps.length}`;
  } else {
    $stepCounter.textContent = "Welcome";
  }
  const progress = (state.stepIndex / (STEPS.length - 1)) * 100;
  $progressBar.style.width = `${progress}%`;
}

function setNav() {
  const step = STEPS[state.stepIndex];
  const footerNav = document.querySelector(".footer__nav");
  document.querySelector(".footer").style.display = step.hideNav ? "none" : "";
  if (step.hideNav) return;
  $btnBack.style.visibility = state.stepIndex === 0 || step.terminal ? "hidden" : "visible";
  $btnNextLabel.textContent = step.next || "Continue";
  $btnNext.disabled = false;
  if (footerNav) {
    footerNav.style.gridTemplateColumns = "auto 1fr auto";
  }
}

// ---------- Step rendering ----------
function renderStep() {
  renderStepper();
  setNav();
  const step = STEPS[state.stepIndex];
  const tpl = document.getElementById(step.tpl);
  const node = tpl.content.cloneNode(true);
  $wizard.innerHTML = "";
  $wizard.appendChild(node);

  // Run per-step setup
  switch (step.id) {
    case "welcome":    setupWelcome(); break;
    case "url":        setupUrl(); break;
    case "analyzing":  runAnalyzing(); break;
    case "brand":      setupBrand(); break;
    case "typography": setupTypography(); break;
    case "tokens":     setupTokens(); break;
    case "generating": runGenerating(); break;
    case "preview":    setupPreview(); break;
  }
  // focus mgmt
  const focusable = $wizard.querySelector("input, button[autofocus], [autofocus]");
  if (focusable) focusable.focus({ preventScroll: true });
}

// ---------- Welcome ----------
function setupWelcome() {
  $wizard.querySelector("[data-action='start']").addEventListener("click", () => goNext());
}

// ---------- URL step ----------
function setupUrl() {
  const $input = $wizard.querySelector("#input-url");
  const $err = $wizard.querySelector("#url-error");
  $input.value = state.publisher.url.replace(/^https?:\/\//, "");
  $input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); goNext(); }
  });
  $input.addEventListener("input", () => { $err.textContent = ""; });
  $wizard.querySelectorAll(".chip").forEach((b) => {
    b.addEventListener("click", () => {
      $input.value = b.dataset.example;
      $input.focus();
    });
  });
}

function validateUrl() {
  const $input = document.getElementById("input-url");
  const $err = document.getElementById("url-error");
  const raw = ($input.value || "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!raw) { $err.textContent = "Enter a publisher URL to continue."; $input.focus(); return false; }
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(raw)) {
    $err.textContent = "That doesn't look like a domain. Try www.theverge.com.";
    $input.focus();
    return false;
  }
  state.publisher.url = `https://${raw}`;
  state.publisher.domain = raw.replace(/^www\./, "");
  state.publisher.name = state.publisher.domain
    .split(".")[0]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return true;
}

// ---------- Analyzing step ----------
async function runAnalyzing() {
  const setStatus = (text) => { const el = document.getElementById("loader-status"); if (el) el.textContent = text; };
  const advance = (id, status) => {
    document.querySelectorAll(".checks li").forEach((li) => {
      if (li.classList.contains("is-active")) {
        li.classList.remove("is-active");
        li.classList.add("is-done");
      }
    });
    if (id) document.getElementById(id)?.classList.add("is-active");
    if (status) setStatus(status);
  };

  advance("check-fetch", "Fetching favicon");
  // fetch favicon, sample colors
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(state.publisher.domain)}&sz=128`;
  const palette = await fetchAndSamplePalette(faviconUrl);
  await delay(700);

  advance("check-extract", "Extracting dominant colors");
  if (palette) {
    state.brand.logoUrl = faviconUrl;
    state.brand.colors.primary = palette[0];
    state.brand.colors.accent = palette[1] || rotateHue(palette[0], 30);
  } else {
    state.brand.logoUrl = "";
    state.brand.colors.primary = pickFallbackColor(state.publisher.domain);
    state.brand.colors.accent = rotateHue(state.brand.colors.primary, 40);
  }
  state.brand.monogram = state.publisher.name.charAt(0).toUpperCase();
  await delay(700);

  advance("check-tokens", "Building initial brand tokens");
  await delay(900);

  // mark all done
  document.querySelectorAll(".checks li").forEach((li) => {
    li.classList.remove("is-active");
    li.classList.add("is-done");
  });
  setStatus("All set");
  await delay(450);

  goNext();
}

// ---------- Brand step ----------
function setupBrand() {
  const $favicon = document.getElementById("brand-favicon");
  const $monogram = document.getElementById("brand-monogram");
  const $name = document.getElementById("input-name");
  const $palette = document.getElementById("palette");

  $name.value = state.publisher.name;
  $name.addEventListener("input", () => {
    state.publisher.name = $name.value || state.publisher.name;
    state.brand.monogram = (state.publisher.name.charAt(0) || "B").toUpperCase();
    $monogram.textContent = state.brand.monogram;
  });
  $monogram.textContent = state.brand.monogram || "B";

  if (state.brand.logoUrl) {
    $favicon.src = state.brand.logoUrl;
    $favicon.onload = () => $favicon.classList.add("is-loaded");
    $favicon.onerror = () => $favicon.classList.remove("is-loaded");
  }

  const swatchDefs = [
    { key: "primary", name: "Primary",  role: "Buttons, links, brand accents" },
    { key: "accent",  name: "Accent",   role: "Highlights, tags, hover states" },
    { key: "ink",     name: "Ink",      role: "Body text & headlines" },
    { key: "surface", name: "Surface",  role: "Page & card backgrounds" }
  ];
  $palette.innerHTML = "";
  swatchDefs.forEach((def) => {
    const wrap = document.createElement("label");
    wrap.className = "swatch";
    wrap.innerHTML = `
      <span class="swatch__chip" style="background:${state.brand.colors[def.key]}">
        <input type="color" value="${state.brand.colors[def.key]}" aria-label="${def.name}">
      </span>
      <span class="swatch__meta">
        <span class="swatch__name">${def.name}</span>
        <span class="swatch__role">${def.role}</span>
      </span>
      <span class="swatch__hex">${state.brand.colors[def.key]}</span>
    `;
    const $input = wrap.querySelector("input");
    const $chip = wrap.querySelector(".swatch__chip");
    const $hex = wrap.querySelector(".swatch__hex");
    $input.addEventListener("input", () => {
      state.brand.colors[def.key] = $input.value;
      $chip.style.background = $input.value;
      $hex.textContent = $input.value;
      renderBrandPreview();
    });
    $palette.appendChild(wrap);
  });

  renderBrandPreview();
}

function renderBrandPreview() {
  const $body = document.getElementById("brand-preview");
  if (!$body) return;
  const c = state.brand.colors;
  const heading = state.brand.typography.heading;
  $body.style.setProperty("--p-bg", c.surface);
  $body.style.setProperty("--p-fg", c.ink);
  $body.style.setProperty("--p-primary", c.primary);
  $body.style.setProperty("--p-accent", c.accent);
  $body.style.setProperty("--p-heading", heading);

  $body.style.background = c.surface;
  $body.style.color = c.ink;

  $body.innerHTML = `
    <span class="pv-tag" style="background:${c.primary}">Politics</span>
    <h3 class="pv-title" style="font-family:'${heading}',serif;color:${c.ink}">A new feed experience that keeps readers coming back.</h3>
    <div class="pv-byline" style="color:${mix(c.ink, c.surface, 0.5)}">By ${state.publisher.name} Staff · 4 min read</div>
    <div class="pv-card" style="background:${mix(c.surface, c.ink, 0.06)};border-color:${mix(c.surface, c.ink, 0.12)}">
      <div class="pv-card__thumb" style="background:linear-gradient(135deg, ${c.primary}, ${c.accent})"></div>
      <div>
        <div class="pv-card__title" style="color:${c.ink}">Inside the redesigned reading experience</div>
        <div class="pv-card__meta" style="color:${mix(c.ink, c.surface, 0.45)}">${state.publisher.name} · Today</div>
      </div>
    </div>
  `;
}

// ---------- Typography step ----------
function setupTypography() {
  const $grid = document.getElementById("type-grid");
  $grid.innerHTML = "";
  TYPE_PAIRS.forEach((p) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "type-card";
    if (p.id === state.brand.typography.pairId) card.classList.add("is-selected");
    card.innerHTML = `
      <div class="type-card__name"><span>${p.name}</span><span>${p.heading} · ${p.body}</span></div>
      <div class="type-card__heading" style="font-family:'${p.heading}',${p.headingFb}">${state.publisher.name || "The Daily Edition"}</div>
      <div class="type-card__body" style="font-family:'${p.body}',${p.bodyFb}">A polished feed that respects every reader. From breaking news to deep dives — beautifully set, instantly recognisable.</div>
    `;
    card.addEventListener("click", () => {
      state.brand.typography = {
        pairId: p.id,
        heading: p.heading,
        headingFallback: p.headingFb,
        body: p.body,
        bodyFallback: p.bodyFb
      };
      $grid.querySelectorAll(".type-card").forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");
    });
    $grid.appendChild(card);
  });
}

// ---------- Tokens step ----------
function setupTokens() {
  $wizard.querySelectorAll(".seg").forEach((seg) => {
    const token = seg.dataset.token;
    seg.querySelectorAll("button").forEach((btn) => {
      const isCurrent = state.brand.tokens[token] === btn.dataset.value;
      btn.setAttribute("aria-pressed", isCurrent ? "true" : "false");
      btn.addEventListener("click", () => {
        state.brand.tokens[token] = btn.dataset.value;
        seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      });
    });
  });
}

// ---------- Generating step ----------
async function runGenerating() {
  const setStatus = (text) => { const el = document.getElementById("gen-status"); if (el) el.textContent = text; };
  const advance = (id, status) => {
    document.querySelectorAll(".checks li").forEach((li) => {
      if (li.classList.contains("is-active")) { li.classList.remove("is-active"); li.classList.add("is-done"); }
    });
    if (id) document.getElementById(id)?.classList.add("is-active");
    if (status) setStatus(status);
  };

  advance("check-css", "Compiling CSS variables");
  await delay(900);
  state.generated.css = generateBrandCss(state.brand, state.publisher);

  advance("check-components", "Styling components");
  await delay(900);

  advance("check-prototype", "Rendering article prototype");
  state.generated.html = renderArticleHtml(state.brand, state.publisher, state.generated.css);
  await delay(900);

  document.querySelectorAll(".checks li").forEach((li) => { li.classList.remove("is-active"); li.classList.add("is-done"); });
  setStatus("Ready");
  await delay(400);
  goNext();
}

// ---------- Preview step ----------
function setupPreview() {
  const $frame = document.getElementById("prototype-frame");
  $frame.srcdoc = state.generated.html;

  const $cssOut = document.getElementById("css-output");
  $cssOut.textContent = state.generated.css;

  // device toggle
  const $device = document.getElementById("device-frame");
  document.getElementById("device-toggle").querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#device-toggle button").forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      $device.classList.remove("device--tablet", "device--mobile");
      if (btn.dataset.device === "tablet") $device.classList.add("device--tablet");
      if (btn.dataset.device === "mobile") $device.classList.add("device--mobile");
    });
  });

  document.getElementById("btn-download-css").addEventListener("click", () => {
    download(`${slug(state.publisher.domain)}.brand-kit.css`, state.generated.css, "text/css");
    showToast("CSS downloaded");
  });
  document.getElementById("btn-download-html").addEventListener("click", () => {
    download(`${slug(state.publisher.domain)}.article-prototype.html`, state.generated.html, "text/html");
    showToast("HTML downloaded");
  });
  document.getElementById("btn-copy-css").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(state.generated.css);
      showToast("CSS copied to clipboard");
    } catch {
      // Fallback for browsers without async clipboard.
      const ta = document.createElement("textarea");
      ta.value = state.generated.css;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast("CSS copied to clipboard");
    }
  });
}

// ---------- Navigation ----------
function goNext() {
  const step = STEPS[state.stepIndex];

  // Per-step validation
  if (step.id === "url") {
    if (!validateUrl()) return;
  }
  if (step.terminal) {
    // restart
    state.stepIndex = 0;
    renderStep();
    return;
  }
  state.stepIndex = Math.min(state.stepIndex + 1, STEPS.length - 1);
  renderStep();
}

function goBack() {
  if (state.stepIndex === 0) return;
  // skip auto-loader steps when going back
  let target = state.stepIndex - 1;
  while (target > 0 && STEPS[target].hideNav) target -= 1;
  state.stepIndex = target;
  renderStep();
}

$btnNext.addEventListener("click", goNext);
$btnBack.addEventListener("click", goBack);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  // Let buttons & links handle their own Enter; only advance from text inputs.
  const tag = document.activeElement?.tagName;
  if (tag !== "INPUT") return;
  const step = STEPS[state.stepIndex];
  if (step.hideNav) return;
  e.preventDefault();
  goNext();
});

// ---------- Helpers ----------
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

let toastTimer;
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove("is-visible"), 1800);
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ---------- Color utilities ----------
function fetchAndSamplePalette(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        const size = 64;
        c.width = size; c.height = size;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        resolve(quantize(data));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Simple frequency-based color quantization, biased toward saturated/colorful pixels
function quantize(data) {
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    // skip near-white & near-black to avoid favicon bg/text
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 240 || lum < 18) continue;
    const sat = max === 0 ? 0 : (max - min) / max;
    const weight = 1 + sat * 4; // bias to saturated
    // bin to 4-bit per channel
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    buckets.set(key, (buckets.get(key) || 0) + weight);
  }
  if (!buckets.size) return null;
  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  const palette = [];
  for (const [key] of sorted) {
    const r = ((key >> 8) & 0xf) * 17;
    const g = ((key >> 4) & 0xf) * 17;
    const b = (key & 0xf) * 17;
    const hex = rgbToHex(r, g, b);
    if (palette.every((p) => colorDistance(p, hex) > 60)) palette.push(hex);
    if (palette.length >= 4) break;
  }
  return palette.length ? palette : null;
}

function colorDistance(a, b) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return Math.sqrt((A.r - B.r) ** 2 + (A.g - B.g) ** 2 + (A.b - B.b) ** 2);
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return { r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16) };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  };
}

function rotateHue(hex, deg) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const next = hslToRgb((h + deg + 360) % 360, Math.max(s, 55), Math.min(Math.max(l, 30), 60));
  return rgbToHex(next.r, next.g, next.b);
}

function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(
    Math.round(A.r + (B.r - A.r) * t),
    Math.round(A.g + (B.g - A.g) * t),
    Math.round(A.b + (B.b - A.b) * t)
  );
}

function isDark(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

function pickFallbackColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const { r, g, b } = hslToRgb(hue, 70, 52);
  return rgbToHex(r, g, b);
}

// ---------- Boot ----------
renderStep();

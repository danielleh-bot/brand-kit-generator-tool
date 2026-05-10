# Brand Kit Studio

A wizard-style brand kit generator for publishers. Drop in a URL, get back a
portable `brand-kit.css` and a fully-styled HTML article prototype with the new
feed experience.

## Try it live

Live, hosted from this branch via jsDelivr (no setup, just open the link):

- **jsDelivr (latest from branch):**
  https://cdn.jsdelivr.net/gh/danielleh-bot/brand-kit-generator-tool@claude%2Fbrand-kit-html-prototype-EbtYN/studio.html
- **raw.githack (latest from branch):**
  https://raw.githack.com/danielleh-bot/brand-kit-generator-tool/claude/brand-kit-html-prototype-EbtYN/studio.html

## Run it locally

### 1. Single-file (no server needed)

`studio.html` is a self-contained build with all CSS + JS inlined. Open it
directly in any browser (`file://` works) or in any HTML preview pane.

```bash
python3 build.py    # rebuild studio.html from sources after edits
```

### 2. Modular dev server

The source files use native ES modules, so they must be served over HTTP:

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

## What the wizard does

1. **Source.** Enter the publisher URL.
2. **Analyze.** Fetches the favicon, samples its dominant colors with canvas
   pixel-frequency quantization, and seeds the brand palette. Falls back to a
   deterministic palette if the favicon can't be sampled (CORS, missing icon).
3. **Brand identity.** Tweak the palette and publisher name. A live preview
   card shows headline, byline, and a feed card update in real time.
4. **Typography.** Pick a heading + body pairing from a curated set
   (Playfair × Inter, Fraunces × Source Serif, DM Serif × Inter, etc.).
5. **Style tokens.** Choose corner radius (sharp / soft / rounded / pill),
   density (compact / comfortable / spacious), and mood (light / dark).
6. **Build.** Compiles a portable CSS file (~15 KB) and renders an HTML
   article prototype with the new feed experience.
7. **Preview &amp; export.** A device-toggle iframe shows the live article.
   Download `<publisher>.brand-kit.css` and `<publisher>.article-prototype.html`.

## Files

| File                  | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `index.html`          | Wizard shell, step templates, footer nav.                          |
| `styles.css`          | Tool's own UI (aurora background, stepper, loaders, forms).        |
| `app.js`              | Wizard state machine, step lifecycle, favicon sampling, downloads. |
| `src/utils.js`        | Color math, contrast, gradient SVG helper.                         |
| `src/css.js`          | Generates the `.bk-theme` CSS from the wizard state.               |
| `src/prototype.js`    | Generates the article + new feed HTML page.                        |

## Loaders

Loaders only appear on steps that take longer than ~2 seconds (analyze,
generate). Each has a custom SVG micro-animation: a magnifying glass scanning
a globe, and color drops mixing into a beaker.

## Browser support

Modern evergreen browsers. Uses `color-mix()`, `aspect-ratio`, CSS grid named
areas, and ES modules. No build step.

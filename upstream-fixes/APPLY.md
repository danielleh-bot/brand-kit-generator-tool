# Upstream fixes for `danielleh-bot/brand-kit-generator`

This folder holds a patch that fixes the "completely made-up analysis" bug in the
sibling repo `danielleh-bot/brand-kit-generator`. It lives here because the agent
session that wrote it is scoped to `brand-kit-generator-tool` only — it could
read the other repo but not push to it.

## What the patch does

The audit found that the tool was producing polished-looking reports even when
extraction silently failed: every brand token had a hardcoded fallback, and the
"before/after" diff was comparing those fallbacks against the Taboola defaults
and reporting the difference as a real "drift". The feed prototype made the same
mistake — sponsored cards came from a hardcoded pool and native cards used
template headlines, regardless of whether the crawl succeeded.

Six fixes:

1. **`lib/crawler.js` — tag every token with provenance.**
   - Color and font tokens now carry `source: 'extracted'` or `source: 'fallback'`.
   - The crawler returns an `extraction_quality` summary (extracted/fallback
     counts, ratio, list of fallback tokens). This goes into `metadata`.
2. **`lib/crawler.js` — broaden color/font/type-scale selectors.**
   - Modern publishers ship hashed CSS-module class names that the original
     selectors (`a`, `button`, `nav a`) miss. The new selectors include role,
     ARIA, and class-fragment matches (`[class*="cta"]`, `[class*="headline"]`,
     etc.) so real pages actually match.
3. **`lib/crawler.js` — new `extractRelatedArticles()` extractor.**
   - Pulls real article cards (related / popular / sidebar / "more from")
     from the page so feed cards can use real publisher content.
4. **`lib/feed-content.js` — feed uses real crawled articles.**
   - Native cards now prefer the article we crawled + extracted related
     articles, falling back to synthetic templates only when the page
     didn't expose enough content. Each card is tagged
     `contentSource: 'extracted' | 'synthetic'`.
   - The feed layout is **unchanged** (per request).
5. **`lib/analysis.js` — `fabricated` status for fake drift.**
   - When a property's source token is a fallback, drift between fallback and
     default is tagged `fabricated` (not `drift`). Stats include
     `fabricatedDriftCount` and `fabricatedPercent`.
6. **`generate.js` + `js/crawl.js` — fail loudly.**
   - CLI: refuses to run with `--brand-kit kit.json` when the loaded kit's
     `extraction_ratio < 0.5` unless `--accept-low-quality` is passed.
   - CLI: prints a warning when extraction quality is poor or related-article
     extraction returns < 3 items.
   - Browser tool: surfaces individual proxy errors instead of silent retries;
     validates pasted manual HTML before continuing.

## How to land it

You have three options. Pick whichever fits.

### Option A — apply locally and push (fastest)

```bash
git clone https://github.com/danielleh-bot/brand-kit-generator.git
cd brand-kit-generator
git checkout -b fix/fabricated-analysis
git apply ../path/to/0001-fix-fabricated-analysis.patch
git commit -am "Fix fabricated analysis: tag token provenance, real feed content, loud failures"
git push -u origin fix/fabricated-analysis
gh pr create --fill   # or open one in the UI
```

### Option B — widen this agent's scope

Add `danielleh-bot/brand-kit-generator` to the `Repository Scope` section of
the agent's system prompt and start a new session. The next session can push the
patch directly.

### Option C — manual cherry-pick

The patch is split across five files. If git apply has trouble (e.g. you've
moved on past the audited revision), open `0001-fix-fabricated-analysis.patch`
and apply the hunks by hand. Each hunk has a clear comment explaining what it
fixes.

## Smoke tests after applying

```bash
# Real crawl (requires Chrome installed on the host running the CLI):
node generate.js --url "https://www.theverge.com/<some-article>" --slug verge-test

# Read brand-kit.json — every color / font / type_scale entry should now have a
# `source` field, and metadata.extraction_quality should show a high ratio.
jq '.metadata.extraction_quality' output/verge-test/brand-kit.json

# Refusal behavior: hand it a hand-crafted "all fallback" brand kit and confirm
# the CLI exits non-zero unless --accept-low-quality is passed.
node generate.js --url ignored --brand-kit ./fixtures/all-fallbacks.json --slug bypass-test
# expected: ❌ Loaded brand kit was mostly fallbacks (extraction_ratio = 0). Refusing to generate…
```

## What this does NOT do

- The feed prototype's HTML/CSS layout is intentionally untouched. The fix is
  in the data flowing into it, not the structure.
- I didn't add a new "Extraction Quality" section to `report.hbs` to keep the
  patch focused; the data is now in `analysis.stats.extractionQuality` and on
  every `propertyTable` row (`provenance`), so adding a section is a small
  next step.
- Sponsored cards remain synthetic on purpose — we don't fabricate paid
  placements from a publisher's actual ads.

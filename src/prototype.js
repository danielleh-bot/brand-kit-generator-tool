// Generates a self-contained HTML article page with the new feed experience,
// styled by the brand-kit CSS that the wizard generated.

import { escapeHtml, gradientImage, mix, lighten } from "./utils.js";

const FEED_ITEMS = [
  {
    category: "Politics",
    title: "Inside the policy meeting that quietly redrew the legislative agenda",
    deck: "Six staffers. Two whiteboards. One memo nobody outside the room has seen — until now.",
    author: "Maya Okonkwo",
    minutes: 8,
    layout: "lead"
  },
  { category: "Business",  title: "Why the next wave of layoffs is targeting middle managers",            author: "Daniel Park",      minutes: 6, layout: "side" },
  { category: "Tech",      title: "An AI assistant that finally feels like a coworker, not a chatbot",     author: "Lina Reyes",       minutes: 5, layout: "side" },
  { category: "Culture",   title: "The quiet return of the print magazine",                              author: "Jordan Hayes",     minutes: 4, layout: "side" },
  { category: "Climate",   title: "How a tiny port city became the model for grid-scale storage",        author: "Aisha Ahmed",      minutes: 7, layout: "side" },
  { category: "Opinion",   title: "We're measuring news engagement wrong. Here's the fix.",              deck: "A slower scroll, a longer dwell, a richer signal.", author: "T. Adekunle",      minutes: 6, layout: "card" },
  { category: "Science",   title: "Researchers reconstruct a lost Roman road using satellite shadows",   deck: "Half a millennium of farmland yielded a near-perfect grid.",                       author: "M. Karlsson",      minutes: 5, layout: "card" },
  { category: "Sports",    title: "The training data that's quietly reshaping the back office",          deck: "Recovery scores, biomechanics, sleep — and a new front-office discipline.",         author: "Ravi Sundar",      minutes: 6, layout: "card" }
];

export function renderArticleHtml(brand, publisher, brandCss) {
  const name = escapeHtml(publisher.name || publisher.domain || "The Daily Edition");
  const monogram = escapeHtml((publisher.name || "B").charAt(0).toUpperCase());
  const c = brand.colors;

  const heroImg = gradientImage(c.primary, c.accent, 1600, 900);
  const inlineImg = gradientImage(c.accent, mix(c.primary, c.accent, 0.5), 1200, 800);

  const feedHtml = FEED_ITEMS.map((item, i) => {
    const img = gradientImage(
      mix(c.primary, c.accent, (i % 3) / 3),
      mix(c.accent, c.primary, ((i + 1) % 4) / 4),
      900, 600
    );
    if (item.layout === "lead") {
      return `
        <a class="bk-card bk-card--lead" href="#" aria-label="${escapeHtml(item.title)}">
          <div class="bk-card__media">
            <img src="${img}" alt="" />
            <span class="bk-card__category">${escapeHtml(item.category)}</span>
          </div>
          <div class="bk-card__body">
            <h3 class="bk-card__title">${escapeHtml(item.title)}</h3>
            <p class="bk-card__deck">${escapeHtml(item.deck || "")}</p>
            <div class="bk-card__meta">
              <span>By ${escapeHtml(item.author)}</span>
              <span aria-hidden="true">·</span>
              <span>${item.minutes} min read</span>
            </div>
          </div>
        </a>`;
    }
    if (item.layout === "side") {
      const area = `side${(i)}`; // side1..side4
      return `
        <a class="bk-card bk-card--row" style="grid-area: ${area}" href="#">
          <div class="bk-card__media">
            <img src="${img}" alt="" />
          </div>
          <div class="bk-card__body">
            <span class="bk-tag bk-tag--soft" style="align-self:flex-start;font-size:10px;padding:2px 8px;">${escapeHtml(item.category)}</span>
            <h3 class="bk-card__title">${escapeHtml(item.title)}</h3>
            <div class="bk-card__meta">
              <span>${escapeHtml(item.author)}</span>
              <span aria-hidden="true">·</span>
              <span>${item.minutes} min</span>
            </div>
          </div>
        </a>`;
    }
    // card
    const area = `card${i - 4}`; // card1..card3 for indexes 5,6,7
    return `
      <a class="bk-card" style="grid-area: ${area}" href="#">
        <div class="bk-card__media">
          <img src="${img}" alt="" />
          <span class="bk-card__category">${escapeHtml(item.category)}</span>
        </div>
        <div class="bk-card__body">
          <h3 class="bk-card__title">${escapeHtml(item.title)}</h3>
          <p class="bk-card__deck">${escapeHtml(item.deck || "")}</p>
          <div class="bk-card__meta">
            <span>By ${escapeHtml(item.author)}</span>
            <span aria-hidden="true">·</span>
            <span>${item.minutes} min read</span>
          </div>
        </div>
      </a>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${name} · A new feed experience</title>
<style>${brandCss}</style>
</head>
<body class="bk-theme">
  <div class="bk-progress" aria-hidden="true"><div class="bk-progress__bar" id="bk-progress"></div></div>

  <header class="bk-header">
    <div class="bk-header__inner">
      <a class="bk-logo" href="#">
        <span class="bk-logo__mark">${monogram}</span>
        <span>${name}</span>
      </a>
      <nav class="bk-nav" aria-label="Sections">
        <a href="#">News</a>
        <a href="#">Politics</a>
        <a href="#">Business</a>
        <a href="#">Tech</a>
        <a href="#">Culture</a>
        <a href="#">Opinion</a>
      </nav>
      <div class="bk-header__cta">
        <a class="bk-btn bk-btn--ghost" href="#">Sign in</a>
        <a class="bk-btn bk-btn--primary" href="#">Subscribe</a>
      </div>
    </div>
  </header>

  <article class="bk-article">
    <div class="bk-article__breadcrumbs">
      <span>News</span><span aria-hidden="true">›</span><span>Politics</span><span aria-hidden="true">›</span><span>Investigation</span>
    </div>
    <span class="bk-tag">Investigation</span>
    <h1 class="bk-article__title">A new feed experience that quietly changed how readers stay informed.</h1>
    <p class="bk-article__deck">
      Inside ${name}'s redesigned reading experience: how a fresh palette, a more
      generous grid, and a smarter recommendation engine added 38% to dwell time without
      adding a single new article.
    </p>
    <div class="bk-article__byline">
      <span class="bk-avatar">M</span>
      <span><span class="bk-byline__name">Maya Okonkwo</span> · Senior correspondent</span>
      <span aria-hidden="true">·</span>
      <span>Updated 2 hours ago</span>
      <span aria-hidden="true">·</span>
      <span>8 min read</span>
    </div>

    <figure class="bk-hero">
      <img src="${heroImg}" alt="" />
      <figcaption class="bk-hero__caption">${name} editorial · Photo illustration</figcaption>
    </figure>

    <div class="bk-prose">
      <p>
        For most of the last decade, the front page was a battle for attention.
        Headlines competed for eyeballs, and the feed below them — the seemingly
        endless tail of related stories — was an afterthought, dressed up with
        whatever theme the engineering team had time for.
      </p>
      <p>
        That changed last spring, when a small team at <strong>${name}</strong> set out to
        rebuild the feed from the ground up. Not as a recommendation engine, and not
        as a styling exercise, but as a single coherent experience: brand, content,
        and signal in one frame.
      </p>

      <blockquote>
        We stopped thinking about the feed as a list of links and started thinking
        about it as the publication's voice in motion.
        <cite>— Editor-in-chief, ${name}</cite>
      </blockquote>

      <h2>What the redesign actually changes</h2>
      <p>
        Three things, mostly. A typographic system that earns the headline. A grid
        that respects the reader's eye. And a palette that makes every section feel
        unmistakably like it belongs to ${name}.
      </p>

      <div class="bk-pull">
        <p>The feed isn't where readers go after the article. It's where they decide what ${name} is.</p>
      </div>

      <p>
        It's a small idea, dressed up in a lot of careful design work. The result
        is a page that feels considered without feeling precious — and a kit any
        publisher can adopt without re-platforming.
      </p>

      <figure>
        <img src="${inlineImg}" alt="" />
        <figcaption>The new section grid groups stories by intent, not by recency.</figcaption>
      </figure>

      <h2>Why it works</h2>
      <p>
        Brand kits like this one establish the rules once — color, type, radius,
        rhythm — and let every downstream component inherit them. That's what the
        wizard you just used did: it sampled ${name}'s real palette, paired it
        with a typography system, and generated a single CSS file you can drop
        anywhere.
      </p>
      <p>
        The result, scrolling below this article, is a feed that finally feels like
        the publication it lives inside.
      </p>
    </div>
  </article>

  <section class="bk-feed" aria-label="More from ${name}">
    <div class="bk-feed__inner">
      <header class="bk-feed__head">
        <div>
          <h2 class="bk-feed__title">More from ${name}</h2>
          <p class="bk-feed__sub">A new feed experience, tuned to your last read.</p>
        </div>
        <div class="bk-feed__filters" role="tablist" aria-label="Filter feed">
          <button class="bk-filter" aria-pressed="true">For you</button>
          <button class="bk-filter" aria-pressed="false">Latest</button>
          <button class="bk-filter" aria-pressed="false">Most read</button>
          <button class="bk-filter" aria-pressed="false">Editor's picks</button>
        </div>
      </header>
      <div class="bk-feed__grid">
        ${feedHtml}
      </div>
    </div>
  </section>

  <section class="bk-newsletter">
    <div class="bk-newsletter__inner">
      <h2>The ${name} brief, in your inbox.</h2>
      <p>One short email. Five stories worth your morning. No filler.</p>
      <form onsubmit="event.preventDefault(); this.querySelector('button').textContent='Subscribed'; ">
        <input type="email" placeholder="you@domain.com" required />
        <button type="submit" class="bk-btn bk-btn--primary">Subscribe</button>
      </form>
    </div>
  </section>

  <footer class="bk-footer">
    <div class="bk-footer__inner">
      <div>© ${new Date().getFullYear()} ${name}. All rights reserved.</div>
      <nav aria-label="Footer">
        <a href="#">About</a>
        <a href="#">Careers</a>
        <a href="#">Advertise</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </nav>
    </div>
  </footer>

  <script>
    // Reading progress bar
    (function () {
      var bar = document.getElementById("bk-progress");
      if (!bar) return;
      var update = function () {
        var h = document.documentElement;
        var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
      };
      window.addEventListener("scroll", update, { passive: true });
      update();
    })();
    // Filter toggle (visual only)
    document.querySelectorAll(".bk-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".bk-filter").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
      });
    });
  </script>
</body>
</html>`;
}

# degoldschmidt.github.io

Personal site of Dennis Goldschmidt — postdoctoral researcher in systems
neuroscience at the Friedrich Miescher Institute for Biomedical Research,
Basel.

Live at <https://degoldschmidt.github.io>.

## How it works

Static site built with **Jekyll**, which GitHub Pages runs natively on every
push to `master` — there is no CI workflow and no build step to run yourself.

It ships **no third-party JavaScript**: no jQuery, no Bootstrap, no analytics.
The scripts on the site are the ~40-line nav toggle in `_layouts/default.html`
and `assets/js/mbsim.js`, the interactive mushroom-body model. Styling is a
single hand-written stylesheet, `css/main.css`.

```
_config.yml                  site config; `permalink` applies to posts only
_layouts/default.html        page chrome + nav toggle script
_layouts/post.html           blog post wrapper
_includes/head.html          <head>: fonts, stylesheet, SEO tags
_includes/sidebar.html       sidebar, rendered from _data/nav.yml
_includes/contact.html       follow-up routes, from _data/contact.yml
_includes/footer.html        site footer
_includes/mbsim.html         embeds the simulation (variant: poster|mini|full)
_data/nav.yml                the navigation — edit here, once
_data/contact.yml            email, ORCID, CV, socials — all optional
_data/pubs.yml               publications (journals + conference)
_data/projects.yml           research cards, grouped
_posts/                      blog posts
assets/js/mbsim.js           the interactive model (~370 lines, no libraries)
css/main.css                 the only stylesheet
index.html about.html research.html pubs.html model.html weblog.html 404.html
```

## Editing

- **Navigation** — `_data/nav.yml`.
- **Publications** — `_data/pubs.yml`. Newest first; the `[n]` numbering counts
  down and derives its start from the list length, so just add an entry at the
  top. Give `doi` as a bare identifier (`10.1038/…`), not a URL.
- **Contact** — `_data/contact.yml`. Every field is optional; blanks are
  omitted rather than rendered as placeholders. Set `email_user` and
  `email_domain` first — without them the site has no contact route at all.
- **Research** — `_data/projects.yml`, grouped by `group:` (now / before /
  tools). `alt` must describe the image content, not repeat the title. Cards
  with a `link:` become clickable; those without stay inert and must not look
  interactive.
- **Blog** — add `_posts/YYYY-MM-DD-slug.md`. It publishes at
  `/blog/slug.html` and appears on `/weblog.html` automatically.

## Local preview

GitHub Pages ignores the `Gemfile`; it exists only to reproduce the pinned
gem set (Jekyll 3.10) locally.

Ruby 3.3 is required — **not** 4.x, whose stdlib changes break Jekyll 3.10 —
and Bundler 2.x, since Bundler 4 raises
`uninitialized class variable @@accept_charset in CGI` on Ruby 3.3.

```sh
brew install ruby@3.3
export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
gem install bundler -v '~> 2.7'
bundle _2.7.2_ config set --local path vendor/bundle
bundle _2.7.2_ install
bundle _2.7.2_ exec jekyll serve --livereload   # http://127.0.0.1:4000
```

## URLs

Page permalinks are Jekyll's default (`about.html` → `/about.html`), which
preserves every URL this site has had. **Do not set `permalink: pretty`** in
`_config.yml` — it would rewrite pages to `/about/` and break inbound links.

## The simulation

`assets/js/mbsim.js` is a cartoon of context-dependent memory retrieval —
dopamine-gated depression of KC→MBON synapses, with context entering at the KC
layer as a conjunctive code. Two things are load-bearing and easy to break:

- Depression is gated on the Kenyon cell being **currently active**
  (`elig[k] * kc[k]`), not on the eligibility trace alone. On the trace alone,
  credit leaks across patch borders and the untrained cell gets contaminated —
  measured at 46,949 off-target events over 120 s, collapsing the whole effect.
- The canvas is **absolutely positioned** inside an aspect-ratio stage. In flow,
  setting `canvas.width` changes its intrinsic ratio, resizes the stage, and
  leaves `clearRect` wiping a stale region.

Trained to saturation it must converge to `(-0.95, -0.21, -0.21, 0.00)`. The
values in `_includes/mbsim.html` are server-rendered so the widget still works
with JavaScript disabled — keep them in sync if you change the model.

When verifying canvas output in a browser, **disable the cache**; a stale
`mbsim.js` will happily show you fixes that never applied.

## Credits

Fonts are Fira Sans and Lato via Google Fonts.

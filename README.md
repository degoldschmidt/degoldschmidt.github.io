# degoldschmidt.github.io

Personal site of Dennis Goldschmidt — postdoctoral researcher in systems
neuroscience at the Friedrich Miescher Institute for Biomedical Research,
Basel.

Live at <https://degoldschmidt.github.io>.

## How it works

Static site built with **Jekyll**, which GitHub Pages runs natively on every
push to `master` — there is no CI workflow and no build step to run yourself.

It ships **no third-party JavaScript**: no jQuery, no Bootstrap, no analytics.
The two scripts on the site are the ~25-line nav toggle in
`_layouts/default.html` and the ~25-line project filter in `projects.html`.
Styling is a single hand-written stylesheet, `css/main.css`.

```
_config.yml                  site config; `permalink` applies to posts only
_layouts/default.html        page chrome + nav toggle script
_layouts/post.html           blog post wrapper
_includes/head.html          <head>: fonts, stylesheet, SEO tags
_includes/sidebar.html       sidebar, rendered from _data/nav.yml
_data/nav.yml                the navigation — edit here, once
_data/pubs.yml               publications (journals + conference)
_data/projects.yml           portfolio cards and filter categories
_posts/                      blog posts
css/main.css                 the only stylesheet
index.html about.html projects.html pubs.html where.html weblog.html
```

## Editing

- **Navigation** — `_data/nav.yml`.
- **Publications** — `_data/pubs.yml`. Newest first; the `[n]` numbering counts
  down and derives its start from the list length, so just add an entry at the
  top. Give `doi` as a bare identifier (`10.1038/…`), not a URL.
- **Projects** — `_data/projects.yml`. Five cards are commented out at the
  bottom pending images; uncomment once an image exists. An empty `items:` list
  makes the page render "coming soon…" and hides the filter bar.
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

## Credits

Map on `/where.html` is © [OpenStreetMap](https://www.openstreetmap.org/copyright)
contributors (ODbL). Fonts are Fira Sans and Lato via Google Fonts.

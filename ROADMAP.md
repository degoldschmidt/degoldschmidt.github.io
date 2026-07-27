# Roadmap

Working notes for the conference overhaul. Excluded from the build in
`_config.yml`, so it lives in the repo but is never published.

**Dennis: add your review notes under "Dennis's review" at the bottom.**
Anything there gets triaged into the sections above.

Status as of 2026-07-26 — 27 commits on `conference-overhaul`, **nothing pushed**.

**Nothing blocks the push any more.** Everything under "Blocking a push" is
decided. What is left is conference content, which can land after a first push
rather than before it.

---

## Blocking a push — all clear

- [x] **`_data/contact.yml` — email.** Done and **confirmed by Dennis on
      2026-07-26**: `golddenn@fmi.ch`. The red notice on `/about` is gone and
      `/poster/` has its "Email me about this work" button. It reads like a
      local username rather than FMI's usual `firstname.lastname@`, which is
      why it was queried — it is correct, so leave it alone.
- [x] **ORCID and Bluesky** — both set. Mastodon and the CV PDF are still
      blank, which renders as omitted rather than broken. Add whenever.
- [x] **`/model.html` scientific accuracy — settled by parking the model.**
      Rather than review it under time pressure, the model was dropped from
      view on 2026-07-26. See "Before bringing the model back" below.
- [x] **The DOI-less abstracts — keep as plain text.** Decided 2026-07-26. No
      code change was needed: `publist.html` already guards the DOI with
      `{% if p.doi %}`, so entries without one have always rendered as plain
      text. Note there are **three**, not two — Bernstein 2014, Bernstein 2013,
      and the 2012 Frontiers/Bernstein abstract.

## Before bringing the model back

The model is parked, not deleted. `/model.html` still builds and the direct URL
still resolves, so anything already sharing it keeps working — but nothing on
the site points at it and search engines are told to ignore it.

- [ ] **Read `/model.html` for scientific accuracy.** The plasticity rule and
      the conjunctive-KC assumption are mine, built from the published
      literature. You are the fly person — confirm nothing there would make a
      reviewer at your poster wince. Specifically: context entering at the KC
      layer rather than gating at the MBON.
- [ ] **To restore it, four places, all commented in situ:**
      `model.html` front matter (drop `noindex` and `sitemap: false`) ·
      `_data/projects.yml` (restore `link:` and `link_label:` on the memory
      card) · `_includes/mbsim.html` (restore the "How it works →" link) ·
      `poster.html` (restore `script_mbsim: true` **and** the include together,
      or the page ships a dead script).

## Before the conference

- [ ] **Venue block in `_data/poster.yml`** — `venue`, `city`, `number`,
      `session`, `date`. The homepage banner renders nothing without at least
      `venue`.
- [ ] **Write your own `question:`.** Mine is a placeholder. It is the largest
      text on both the banner and the poster page, and often the only thing read.
- [ ] **Felsenberg sign-off** on what may go on a permanently public page.
      Current content is the safe tier only — question, paradigm (already
      public), methods, model, predictions. No results, no effect sizes, no
      genotypes.
- [ ] **Poster PDF decision.** `pdf:` serves it publicly and permanently;
      `pdf_doi:` points at Zenodo, which can be restricted and earns a DOI;
      blank says "available on request". Blank is the safe default.
- [ ] **Media — 1 of 3 done.** The closed-loop rig clip is in
      (`assets/media/fly-on-ball.mp4`, 573 KB) and live on the homepage. Still
      needed: **behaviour tracking / local search**, and **two-photon**.
      Recipes and the loop-picking method are in `assets/media/README.md`.
      Drop sources in `videos/` — gitignored and excluded from the build.
      For the two-photon clip, pick one that shows *method* (a field of view of
      the mushroom body), not *result* (a response that differs by context).
      This page is public, permanent, and pre-publication.
- [ ] **Gallery captions.** `_data/gallery.yml` ships a **draft** caption and
      alt text for the rig clip, written from watching the footage rather than
      from knowing what the fly was doing. Correct it in place.
- [ ] **Higher-resolution rig footage, if it exists.** The tight crop left the
      clip at native 480 px, which is soft on a retina phone. If the pre-crop
      original survives, the same framing can be re-cut at full resolution.
- [ ] **Flip `active: true` and `in_nav: true`** in `_data/poster.yml` on the
      morning of the session. Flip both back afterwards.
- [ ] **Test the printed QR** with two phones under hall-like lighting, not on
      a monitor.

## After the conference

- [ ] **`git clone --mirror` backup, off-machine — before anything touches
      history.** Commit `847dbb1` holds 727 files under `pics/` (~960 MB of
      travel photos) plus `vids/`. Deleted from the tree years ago; git history
      may be their only copy.
- [ ] **History rewrite.** `git filter-repo --path pics --path vids
      --invert-paths` takes the repo from ~1.18 GB to ~20 MB. Rewrites every
      SHA. Only after the backup, and not on the conference critical path.
- [x] **Design overhaul — done 2026-07-27,** seven steps, one commit each:
      page grid (`.content` is now gutter | content | gutter, prose stops at
      `--measure` while media stays wide) · `opacity` retired as a colour, every
      muted text now meets AA against the darkest pixel the mesh actually
      renders · semantic colour aliases, so `--color-text` no longer drags the
      masthead with it · five small type sizes folded to three · 23 spacing
      literals snapped to a nine-step 4px grid · dead `.map` CSS and the unused
      Lato 300 request removed.
      Two things were **deliberately not** changed after checking: the display
      type scale (its middle looked compressed, but `h3` renders on no page, so
      what a reader meets is a working 1.41 / 1.23 / 1.30 progression), and the
      nav — see below.
- [ ] **Decide: drop `/code` from the top bar?** Measured on the homepage: five
      items wrap to two rows on every common phone, costing **154px of chrome
      before any content** at 320/360/390. Removing `/code` fits one row at 360
      and 390 and saves 45px; it is still two rows at 320. GitHub is already in
      the footer on every page, so nothing becomes unreachable. Left alone
      because it is navigation, not styling — one line in `_data/nav.yml`.
- [ ] **Weblog.** Either write one real post — "Building a closed-loop VR for
      walking flies" is safe, showcases the rig work, and gives `/poster/` a
      follow-up link — or leave it out of the nav as it is now.
- [ ] **The five held-back research cards** in `_data/projects.yml` (latent
      variable models, time-series analysis, interactive visualisation,
      generative art). They need images. Right now the site shows no evidence of
      the ML/software/visualisation work you said you want visible.
- [ ] **Self-host the fonts.** Fira Sans and Lato currently come from Google
      Fonts — the last third-party request on the site, and a GDPR consideration
      for an EU/CH-resident academic page.
- [ ] **og:image.** No social card today, so posting the URL anywhere produces a
      bare text card. The simulation can generate one via `toDataURL()`.

## Known limitations, accepted

Not bugs — decisions, recorded so they are not rediscovered later.

- **No analytics, ever.** Zero third-party JavaScript is a deliberate property,
  so there is no way to know how many people scan the QR code.
- **The QR points at the site root**, not `/poster/`, because it was printed
  before the page existed. Handled with the homepage banner.
- **`degoldschmidt.github.io` is the permanent URL.** Custom domain declined.
  Do not rename the GitHub account — the printed QR dies with it.
- **The simulation is a cartoon.** No fitted parameters, no data. The caption
  says so explicitly, and it should stay that way.

---

## Dennis's review — triaged 2026-07-26

### Decided
- **Navigation: switch sidebar -> horizontal top bar.** On a phone the sidebar
  is closed by default, so a QR visitor sees no nav at all — the reason the
  homepage needed a poster banner bolted on. A top bar shows /research,
  /publications and /poster immediately on every device, and returns ~200px of
  width to the content. Name becomes the wordmark, portrait beside it.
- **Poster PDF: untracked, available on request.** Was accidentally committed
  (17 MB); removed from git, from branch history, and from the Jekyll build.

### To do
- [x] **Build the top bar.** Done. `_includes/sidebar.html` →
      `_includes/topbar.html`; the off-canvas CSS and the toggle state machine
      are gone, and with them the last navigation JavaScript on the site. The
      bar wraps rather than collapsing — at 320px the nav drops to a second
      row — so no breakpoint is involved and every link is visible at every
      width. The masthead went too (the bar carries the portrait and the name),
      and `crumb:` front matter with it. Verified 320/375/430/768/1440 across
      all nine pages: no horizontal overflow, with /poster both in and out of
      the nav.
- [x] **Body text is Lato 300 → 400.** Done, one word, no extra download.
- [x] **Homepage: replace the model with a project gallery.** Done, with one
      of three cards filled. The gallery component is data-driven from
      `_data/gallery.yml`, so the remaining two clips are a data edit. Cards
      autoplay muted loops on a near-black mount, with controls hidden until
      hover on pointer devices — touch and reduced-motion keep them visible.
      The model moved to `/model.html` and is still linked; the homepage now
      loads no JavaScript at all.
- [ ] **Poster page**: link ICN 2026 properly once venue fields are filled.
- [ ] **`.poster-id` now repeats the top bar.** The bar shows your portrait and
      your name; 60px below it, `/poster/` shows the same portrait and the same
      name again. Suggest dropping both from `.poster-id` and keeping only the
      affiliation line — someone who has just spoken to you needs "Felsenberg
      Lab, FMI Basel", not your name twice. Left alone deliberately: it is
      poster *copy*, which you said you want to write yourself.

### Decided while building the top bar
- **`_includes/poster-banner.html` stays.** It survives the top bar because the
  two do different jobs, and they already have separate flags. `in_nav: true`
  makes /poster reachable from every page, forever — that is navigation. The
  banner is the landing cue on the one page the printed QR code actually hits:
  it carries the poster number, the venue, the question, and "Scanned my
  poster? Start here →". A nav item reading `/poster` does not tell someone
  standing at your board that the thing in front of them is on this site.
  It is ~20 lines and off by default, so it costs nothing out of season.

### Typography — assessment
- ~~**Body weight 300 is the real issue.**~~ Done — now 400.
- **Sizes are now fluid** for h1/h2/h3/lead/hero (done). Body and small text
  still use 15 distinct literal sizes including near-duplicates — 0.8 vs
  0.8125rem, 1.5 vs 1.55rem — which is drift the token migration will fold in.
- **Type pairing itself is fine.** Lato (body) + Fira Sans (display) is a
  reasonable, legible combination and worth keeping.

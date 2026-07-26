# Roadmap

Working notes for the conference overhaul. Excluded from the build in
`_config.yml`, so it lives in the repo but is never published.

**Dennis: add your review notes under "Dennis's review" at the bottom.**
Anything there gets triaged into the sections above.

Status as of 2026-07-26 — 15 commits on `conference-overhaul`, **nothing pushed**.

---

## Blocking a push

Small, and everything else waits on them.

- [x] **`_data/contact.yml` — email.** Done: `golddenn@fmi.ch`. The red notice
      on `/about` is gone and `/poster/` has its "Email me about this work"
      button. **Confirm the address is right before pushing** — it is the one
      string on the site with no fallback if it is wrong, and I have no way to
      verify it. Nothing in the repo or in git history corroborates it; the only
      institutional address either ever contained is
      `goldschmidtd@ini.phys.ethz.ch`, from ETH.
- [x] **ORCID and Bluesky** — both set. Mastodon and the CV PDF are still
      blank, which renders as omitted rather than broken. Add whenever.
- [ ] **Read `/model.html` for scientific accuracy.** The plasticity rule and
      the conjunctive-KC assumption are mine, built from the published
      literature. You are the fly person — confirm nothing there would make a
      reviewer at your poster wince. Specifically: context entering at the KC
      layer rather than gating at the MBON.
- [ ] **Decide what happens to the two Bernstein/CNS abstracts** with no DOI —
      keep as plain text, or drop.

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
- [ ] **Media.** Two-photon/calcium clip, behaviour tracking clip, a photo of
      the rig. Encoding recipes are in the plan; budget is ≤3 MB per video.
      This is the biggest remaining visual gap — the site still has no video and
      nothing created after ~2017 except the paradigm figure.
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
- [ ] **Finish the design-token migration.** The fluid type scale is done. What
      remains: semantic colour aliases (today `--purple` is simultaneously text
      colour, brand colour and surface colour, used 21 times, so text cannot be
      recoloured without recolouring the masthead), a spacing scale, and
      snapping the ~10 off-scale spacing literals. Three commits; only the third
      touches pixels.
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
- [ ] **Homepage: replace the model with a project gallery.** Fly-on-the-ball
      setup, fly tracking / local search, two-photon imaging. NEEDS ASSETS —
      nothing suitable exists in the repo yet. Prefer short muted looping MP4
      over GIF (10-50x smaller). Budget <=3 MB each.
      The model moves to /model.html only, still linked from the homepage.
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

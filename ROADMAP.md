# Roadmap

Working notes for the conference overhaul. Excluded from the build in
`_config.yml`, so it lives in the repo but is never published.

**Dennis: add your review notes under "Dennis's review" at the bottom.**
Anything there gets triaged into the sections above.

Status as of 2026-07-26 — 8 commits on `conference-overhaul`, **nothing pushed**.

---

## Blocking a push

Small, and everything else waits on them.

- [ ] **`_data/contact.yml` — email.** Two lines. Until then `/about` renders a
      visible red "no email address is set yet" notice, and `/poster/` has no
      email button. For a page a QR code points at, this is the single most
      important gap.
      ```yaml
      email_user: "…"
      email_domain: "…"
      ```
- [ ] **ORCID, Bluesky/Mastodon, CV PDF** — same file, all optional. Blank
      fields are omitted rather than rendered, so fill in whatever you want.
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

## Dennis's review

<!-- Write freely here. Rough notes are fine — I'll triage them into the
     sections above. Page name + what's wrong is plenty. -->

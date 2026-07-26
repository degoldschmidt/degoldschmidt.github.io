# assets/media

Web derivatives only. **Never commit source video.** Raws stay on FMI storage;
what lives here is the encoded, downscaled, stripped copy that ships to a phone.

Excluded from the Jekyll build in `_config.yml` — the always-on
`jekyll-readme-index` plugin would otherwise publish this file as
`/assets/media/`.

## Budget

| | limit |
|---|---|
| any single video | **3 MB** |
| all video together | **12 MB** |
| whole repo working tree | **25 MB** |

Anything larger goes to Zenodo (which earns a DOI) or a GitHub release asset.
**Git LFS does not work here** — Pages serves LFS pointer files as literal
text, so a tracked-in-LFS video renders as gibberish.

Check before committing:

```sh
du -ch assets/media/*.mp4 | tail -1     # must be under 12M
ls -lh assets/media/
```

## Encoding

Two files per clip: the MP4 and a poster still. The still is what a visitor
actually sees first, so it is not optional.

### Behaviour / rig footage

```sh
ffmpeg -i src.mov \
  -vf "scale=w=960:h=960:force_original_aspect_ratio=decrease:flags=lanczos,scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=25" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 24 -preset slow \
  -movflags +faststart -an assets/media/<name>.mp4

ffmpeg -ss 1.0 -i src.mov -frames:v 1 \
  -vf "scale=w=960:h=960:force_original_aspect_ratio=decrease" \
  -q:v 4 assets/media/<name>.jpg
```

### Two-photon / calcium

Same, with two changes:

- **Keep the acquisition rate** — drop the `fps=25` term. Resampling calcium
  data to 25 fps misrepresents the timebase.
- **`-crf 20`**, not 24. Compression artefacts sitting next to a ΔF/F claim are
  an integrity problem, and these clips are small anyway.

Export the **already-normalised 8-bit** clip from Fiji rather than letting the
encoder decide dynamic range. From an image sequence:

```sh
ffmpeg -framerate 10 -i frame_%04d.png \
  -vf "scale=w=960:h=960:force_original_aspect_ratio=decrease:flags=lanczos,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow \
  -movflags +faststart -an assets/media/two-photon.mp4
```

Caption it **"compressed for the web"**. Showing a lossy clip beside a ΔF/F
claim is a small integrity issue worth pre-empting rather than being asked
about at the poster.

## Why each flag

| flag | why |
|---|---|
| `-an` | strips audio, which removes every autoplay-policy problem at once |
| `-pix_fmt yuv420p` | required by Safari; without it iOS shows a black frame |
| `-movflags +faststart` | moves the index to the front so it streams rather than fully downloading |
| `scale=trunc(iw/2)*2:…` | H.264 needs even dimensions; the second scale fixes odd results from the first |
| `force_original_aspect_ratio=decrease` | caps the **long** edge at 960 whichever way the clip is oriented |
| `-preset slow` | encoder time is free here, bytes on conference wifi are not |

## Markup

`<video>` always — GIF is never correct for this (10–50× larger). Skip WebM
unless the MP4 lands over ~1.5 MB.

The homepage is a QR landing target, so **do not autoplay there**: three
autoplaying loops is ~9 MB before the visitor has decided they care. Ship the
poster still and load the video on tap.

```html
<video poster="/assets/media/<name>.jpg" preload="none"
       controls muted loop playsinline width="960" height="540"></video>
```

Autoplay-on-scroll is fine on `/research` and `/model.html`, which nobody
reaches by scanning a code.

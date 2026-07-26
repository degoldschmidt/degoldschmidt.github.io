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

## Choosing a loop window

For footage where the background changes continuously — the closed-loop
panorama does exactly this — the cut point is worth picking by measurement
rather than by eye. Dump per-frame chroma and search for the window whose ends
meet:

```sh
ffmpeg -i src.mov -vf "<your crop>,fps=25,scale=48:48,signalstats,\
metadata=print:file=stats.txt" -an -f null -
```

Then find `(start, length)` minimising the distance between frames. **Two
things will mislead you here, and both cost me a wrong cut:**

1. **The criterion is `frame[end+1]` vs `frame[start]`, not first vs last.**
   When the clip wraps, the viewer sees the last frame and then the first, so
   the first frame has to look like the *natural successor* of the last. First
   vs last will read as one normal frame-step of difference in a good loop —
   here that was 23 units, against a per-frame median of 6.6, and it looks
   alarming until you realise it is exactly right.
2. **Measure in the domain you cut in.** Stats taken on the full frame do not
   predict a cropped loop: the crop sees a different slice of the panorama, so
   the colour trajectory is different. Crop *and* resample to the output frame
   rate before measuring.

And cut with `select`, not `-ss`/`-t`: input seeking is not frame-exact and
landed six frames off the window that was searched for. `trim` is frame-exact
but its `start_frame=A:end_frame=B` form fails to parse here, so:

```sh
-vf "<crop>,fps=25,select=between(n\,START\,END),setpts=PTS-STARTPTS"
```

## Shipped assets

**`fly-on-ball.mp4`** · 480×480 · 25 fps · 6.9 s · 573 KB · poster
`fly-on-ball.jpg` (15 KB). Tethered fly walking on the ball inside the
closed-loop panorama. Source `fly_on_ball_closed_loop.mov`, 1000×1000 @ 60 fps
(not in the repo — see `videos/` in `.gitignore`).

```sh
ffmpeg -y -i videos/fly_on_ball_closed_loop.mov -map 0:v:0 \
  -vf "crop=480:480:230:330,fps=25,select=between(n\,69\,241),setpts=PTS-STARTPTS" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -preset slow \
  -movflags +faststart -an assets/media/fly-on-ball.mp4
```

Note the crop is 480×480 out of a 1000×1000 source, so this is **native 480 px,
not downscaled from 960**. It is soft on a retina phone, where a ~335 px card
wants ~670 device px. Re-cropping from the pre-crop original, if it still
exists at a higher resolution, is the only real fix — upscaling here would just
add bytes.

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

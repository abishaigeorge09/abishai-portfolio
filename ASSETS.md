# ASSETS registry

Every visual asset on the site is a **placeholder** with a single, obvious swap point.
Drop the real file at the path below (same name/format) and it appears automatically —
no code changes needed. Generated on-brand stand-ins (via the `remotion/` workspace) and
coded fallbacks keep the layout correct until then.

All runtime assets live under **`public/assets/`** (served at `/assets/...`).

> The site **leads with designed CSS/SVG/GSAP visuals** (brand-art project tiles, the
> gradient hero scene, expanding rings) so it looks finished with zero real assets.
> Real media is optional and layers in via the swap points below.

**Project visuals (primary swap):** each project in `src/data/projects.js` has a
`media` field. Set it to `/assets/img/<slug>.jpg` or `/assets/video/<slug>.mp4` and the
real screenshot/clip overlays the designed brand-art tile on both Home and Work.

| Placeholder | Path | Format / size | Used in | How to swap |
|---|---|---|---|---|
| Hero 3D avatar scene | `public/assets/video/desk-hero.mp4` | MP4 H.264, ~2050×1310, looping, muted | Home hero + Footer (reused) | Replace the file. The site's lighting overlay sits on top and still works. |
| Hero poster | `public/assets/img/hero-poster.jpg` | JPG, matches video | Hero/footer before video loads | Replace the file. |
| Project clips ×6 | `public/assets/video/project-1..6.mp4` | MP4 H.264, ~1200×900, autoplay loop muted | Home thumbnails + (future) Work | Replace each file. Names/captions live in `src/data/projects.js`. |
| Project poster | `public/assets/img/video-loading.jpg` | JPG | Shared video poster | Replace the file. |
| Desk photo of AG | `public/assets/img/desk-photo.jpg` | JPG | "The work takes time" (Home) + About full-bleed image | Ready. |
| Portrait of AG | `public/assets/img/portrait.jpg` | JPG (3:4) | (optional) About | Drop the file and reference it; designed scene used by default. |
| Perspective photo of AG | `public/assets/img/whyme.jpg` | JPG (landscape, subject on the right) | "perspective + sharp instincts" pinned section (Home) | Ready. |
| Project visuals | `public/assets/img/synth.jpg`, `gmv.jpg`, `benji.jpg`, `atlitos.jpg`, `elsheph.jpg`, `aiot-air-hockey.jpg` | JPG | Home cards + Work gallery | Ready. Media wired in `src/data/projects.js`. |
| Avatar video | `public/assets/video/avatar-tennis.mp4` | MP4 H.264, portrait aspect | Footer center card | Ready. |
| Avatar video poster | `public/assets/img/avatar-tennis-poster.jpg` | JPG | Footer before video loads | Ready. |
| Folder icons | `public/assets/img/folder-front.png`, `folder-back.png` | PNG w/ transparency | Tools section / Work hero | Drop files, then point `FolderIcons.jsx` layers at them (see `TODO:` there). Coded SVG folder shows until then. |
| Coffee mug + steam | `public/assets/img/mug.png` (+ coded steam) | PNG | Footer scene | Drop `mug.png` and wire it into `SteamMug.jsx`; or bake mug+steam into `desk-hero.mp4`. |
| Logo "iii" mark | `public/assets/lottie/logo-mark.json` | Lottie JSON | Nav | Drop the JSON; text "iii" fallback shows until then. |
| Name-hover effect | `public/assets/lottie/name-hover.json` | Lottie JSON | Nav / hero | Drop the JSON and mount via `<LottieMark src=... />`. |
| Scroll cue | `public/assets/lottie/scroll-cue.json` | Lottie JSON | Hero | Drop the JSON; "Scroll" fallback shows until then. |
| Gradient rings | `public/assets/lottie/rings.json` | Lottie JSON | About | Drop the JSON; coded SVG rings animate until then (see `GradientRings.jsx`). |
| Display font (Goga) | `public/assets/fonts/Goga-*.woff2` | woff2 | Global `--font-display` | Drop woff2, uncomment `@font-face` + set `--font-display: 'Goga'` in `src/styles/tokens.css`. |
| Hobby photos | `public/assets/img/hobbies/tennis.jpg`, `football.jpg`, `family.jpg`, `squash.jpg`, `friends.jpg`, `court.jpg`, `racket.jpg` | JPG | About "Off the clock" gallery | Ready. Labels in `Hobbies.jsx`. |
| Intro band image | `public/assets/img/intro.jpg` | JPG (wide) | (when used) intro band | Drop the file; designed gradient scene shows until then. |
| Résumé PDF | `public/assets/Abishai-Gosula-Resume.pdf` | PDF | (when used) résumé download | Not needed yet; `resumeUrl` set to null. |
| Favicon | `public/favicon.svg` | SVG | Browser tab | Ready (referenced in `index.html`). |
| OG image | `public/og-image.jpg` | JPG 1200×630 | Social share preview | Ready (referenced in `index.html`). |

## Regenerating the video/image stand-ins

```bash
cd remotion
npm install        # first time only (downloads a headless Chromium for rendering)
npm run render     # renders desk-hero.mp4, project-1..6.mp4 + posters into ../public/assets/
# or from the project root:
npm run assets:render
npm run studio     # optional: open Remotion Studio to preview/tweak the compositions
```

Composition definitions: `remotion/src/DeskHero.jsx`, `remotion/src/ProjectClip.jsx`, registered in `remotion/src/Root.jsx`.

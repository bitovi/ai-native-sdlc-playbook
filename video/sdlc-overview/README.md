# AI-native SDLC playbook overview video

Source for the two-minute motion-graphics overview embedded near the top of
`site/index.html`. This folder is not published: `scripts/build.sh` only
copies `site/`.

It is a sibling of the two overview videos in the Bitovi Vibes repo
(`video/coe-overview/` and `video/factory-overview/`). Same pipeline and
helpers, copied here so this folder renders on its own. The colors and fonts
come from this site (`site/assets/playbook.css`): navy background, red for the
current stage, rose for people, teal for agents, amber for gates, and indigo
for committed files.

## Files

| File | What it does |
|---|---|
| `index.html` | Loads the fonts and `anim.js`. Open it through a local server to scrub and preview with music. |
| `anim.js` | The whole animation on one canvas. `seek(t)` draws the exact frame for time `t`. No wall clock, seeded randomness only. |
| `music.py` | Synthesizes the original jazz cue with numpy into `build/music.wav`. |
| `render.js` | Headless Chromium (Playwright) steps through every frame and writes PNGs. Several pages run in parallel. |
| `make.sh` | Music, frames, H.264 + AAC encode, and the poster JPG. |
| `fonts/` | Poppins and Lato (the site's fonts) and JetBrains Mono for file names, latin subsets from Google Fonts (SIL Open Font License), so rendering is deterministic. |

## Re-render

```bash
bash video/sdlc-overview/make.sh          # about 10 minutes on 4 cores
CRF=23 WORKERS=8 bash video/sdlc-overview/make.sh
```

Outputs:

- `site/sdlc-overview.mp4` (1280x720, 30 fps, 120 s)
- `site/sdlc-overview-poster.jpg` (frame at 117 s: the assembled loop under the title)

## Preview and stills

```bash
python3 -m http.server 8899 --directory video/sdlc-overview
# open http://localhost:8899/index.html  (add ?t=42 to jump to a time)

node video/sdlc-overview/render.js --stills 12,24,60   # PNGs in build/stills/
```

## Timing

The music is 144 BPM, swung, in G major, so one bar is 1.667 seconds and six
bars are exactly 10 seconds. Every scene starts on a bar line, and scene
changes roll the old scene out on a big wheel while the next rolls in.

| Time (s) | Scene |
|---|---|
| 0 to 10 | Code got fast: Build pours out work, which piles up in front of Test and Deploy |
| 10 to 20 | The line of six stages bends into a loop; a file is left at each stage; people appear at the gates. The lift lands at 15 |
| 20 to 80 | One scene per stage: Plan, Design, Build, Test, Deploy, Maintain |
| 80 to 90 | The loop closes: the new `intent.md` from Maintain travels back to Plan, then laps the loop leaving a file at each stage |
| 90 to 110 | Roadmap: the dependency rows (start anywhere, build up to closing the loop), then by hand, command, and on merge |
| 110 to 120 | End card: the work lands in Plan, final chord at 115 |

One piece of work travels through every scene: an idea becomes `intent.md`,
then `spec.md`, `plan.md`, a diff with tests, a PR, a live release, and a new
`intent.md` written by the monitoring agent. The corner indicator is a mini
loop with the current stage lit; a marker runs to the next stage at each cut.

To change a caption, edit `CAPS` in `anim.js`. Every fact must come from
`plans/sources/course-outline.md`. Picture hits in `music.py` use the same
times as `anim.js`, so move both together.

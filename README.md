# The AI-native SDLC playbook

An interactive, animated walk through Anthropic's [AI-native SDLC playbook](https://academy.claude.com/courses/ai-native-sdlc-playbook) course, with notes on how Bitovi applies it with clients.

Live site: https://bitovi.github.io/ai-native-sdlc-playbook/

## What's here

- An overview with a side-by-side race: traditional SDLC vs. AI-accelerated.
- One page per stage: Plan, Design, Build, Test, Deploy, and Maintain.
- A transition roadmap for picking where to start.

## Work on it

```bash
bash scripts/build.sh                          # build into public/ (git-ignored)
bash scripts/check-site.sh --browser           # full gate: links, titles, em dashes, Chromium on desktop + phone
python3 -m http.server 8888 --directory public/   # preview at http://localhost:8888/
```

Pushing to `main` runs the gate and deploys to GitHub Pages.

## Layout

| Path | What it is |
|---|---|
| `site/` | The pages. Copied to `public/` by the build. |
| `site/assets/` | `playbook.css` and `playbook.js` (shared page parts), `site.css` (header and footer). |
| `site/_partials/` | Header and footer, injected at `<!-- @site-header -->` and `<!-- @site-footer -->`. |
| `docs/page-contract.md` | How every page is built: sections, visual language, motion, and writing rules. |
| `plans/` | The original intent, plan, and state, plus the course outline (`plans/sources/course-outline.md`), the source of truth for content. |

This playbook first lived in [Bitovi Vibes](https://bitovi.github.io/vibes/) and moved here as its own site. File paths in `plans/` still use the old `files/sdlc-playbook/` layout.

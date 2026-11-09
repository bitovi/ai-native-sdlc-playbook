# AI-native SDLC playbook

Static site on GitHub Pages (`https://bitovi.github.io/ai-native-sdlc-playbook/`). Built by one bash script, no Node or frameworks in the build.

## Commands

```bash
bash scripts/build.sh                    # build into public/ (git-ignored)
bash scripts/check-site.sh --browser     # full gate; run before every commit or PR
SHOTS=/tmp/shots bash scripts/check-site.sh --browser   # plus screenshots to review
```

## Rules

- Read `docs/page-contract.md` before editing a page. Content comes only from `plans/sources/course-outline.md`.
- Edit `site/`, never `public/`.
- Internal links use `{{BP}}/...` (for example `{{BP}}/plan/`). Never hard-code `/ai-native-sdlc-playbook`. The gate catches this.
- Adding a page: add it to `PAGES` in `site/assets/playbook.js` so the stage nav and pager pick it up.
- House style: plain words, short paragraphs, lists over prose, no em dashes, no "not X, but Y", always use the Oxford comma.

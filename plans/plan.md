# Plan: SDLC Playbook

## Demo
Home page, click "SDLC Playbook" (card or nav). The overview animates the linear SDLC turning into a loop. Step through all six stages with the stage nav or pager. Each play shows the shift, a five-part play card and an animated step-through. The roadmap page shows the dependency graph of the twelve plays animating in row by row. Service pages mention the SDLC and link here. Gate passes on desktop and phone.

## PRs
1. `feat/sdlc-playbook-rails` (lead): nav, home card, build and gate wiring, shared CSS/JS, stubs, contract, plans.
2. `content/sdlc-playbook-pages` (lanes, cherry-picked by the lead).

## Lanes (all sonnet)
| Lane | Owns |
|---|---|
| P1 | `files/sdlc-playbook/index.html`, `files/sdlc-playbook/roadmap/` |
| P2 | `plan/`, `design/` |
| P3 | `build/` |
| P4 | `test/`, `deploy/` |
| P5 | `maintain/`, plus SDLC references in `files/service-drafts/*/index.html` |

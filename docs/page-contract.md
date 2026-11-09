# SDLC Playbook: page contract

A Bitovi-guided, highly animated walk through Anthropic's "The AI-native SDLC playbook" course. Used with clients to plan the move from a traditional SDLC to an AI-native one. Pages live in `site/`. The build (`scripts/build.sh`) copies `site/` to `public/` and replaces `{{BP}}`, `<!-- @site-header -->`, `<!-- @site-footer -->` and `/* @shared-css */`.

Source of truth for content: `plans/sources/course-outline.md`. Use only what it says. Paraphrase; quote only short phrases. Credit and link the course (the stub footer already does).

## Every page

- Keep the stub's `<head>`, stage nav, hero (crumbs, kicker, H1, lead, `data-pb-loop`), the source line, the pager and the `playbook.js` script tag. You may edit the hero lead.
- Content goes between `<!-- PAGE CONTENT START -->` and `<!-- PAGE CONTENT END -->`.
- Use `assets/playbook.css` classes. Page-only styles go in one `<style>` block in `<head>`, prefixed with the page slug (for example `.plan-`). Page-only JS goes in one inline `<script>` after the `playbook.js` tag. No external libraries.
- Links between playbook pages: `{{BP}}/<slug>/`.

## Visual language (use it the same way on every page)

| Color / class | Means |
|---|---|
| `.pb-chip.human` (rose) | A person decides, corrects or approves |
| `.pb-chip.agent` (teal) | Claude or an agent does the work |
| `.pb-chip.gate` (amber) | A gate, check, hook or control |
| `.pb-file` (indigo, mono) | A committed artifact (`intent.md`, `spec.md`, `plan.md`, `CLAUDE.md`, `REVIEW.md` ...) |
| `.pb-chip.old` (slate) | The traditional way |

## What each stage page has

1. **The shift:** a `.pb-shift` before/after for the stage (traditional vs AI-native), animated in.
2. **One play card per play** (`.pb-play`) with the course's five-part template as tabs (`data-pb-tabs` on the card): What changes, Getting started (prerequisites, infrastructure), How to run it (the concrete steps), Governance, How to measure it (leading and lagging indicators in `.pb-metric`).
3. **At least one animated step-through per play** (`data-pb-steps` with `.pb-step` children and Prev / Play / Next buttons, plus `data-pb-status`). Show the artifact moving between people and agents. Use the course's worked example where it has one (for example the claims status `intent.md`).
4. **What it hands to the next stage:** the artifact and the trigger (for example "an approved `spec.md` triggers plan mode").
5. **Key takeaways** (`.pb-takeaways`, 3 to 5 bullets).

## Motion

- Highly animated, and calm: things slide or draw in once, artifacts travel along paths, steps light up. No looping motion except the loop ring.
- Use `.pb-reveal` (and `.d1` to `.d4` delays) for scroll-in. Use CSS transitions and small inline SVG animations. Drive step-throughs with `PB.stepper` events (`pb:step`).
- Respect reduced motion: everything must make sense with no animation (`PB.reduced`, and the CSS already shortens animations).
- Keyboard: every interactive bit works with Tab, Enter/Space and arrow keys.

## Writing

- For engineering leaders and their teams, new to the topic. Plain words, short sentences, lists over prose. Define jargon once.
- No em dashes (the gate fails), no "not X, but Y", no hype words, no movie-trailer headlines.
- Do not invent numbers, products, quotes or steps. The course gives few numbers (20 to 50 evals, start with 2 to 3 parallel sessions, CLAUDE.md under a page, at most 5 nits per review, a 30-day rolling baseline, 1/2/3 sigma bands). Use those only.
- Where Bitovi helps, say it in one line at most. This is a playbook, not a sales page.

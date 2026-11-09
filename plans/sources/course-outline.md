# Source: Claude Academy course "The AI-native SDLC playbook"

Compiled 2026-11-05 by a reader agent from https://academy.claude.com/courses/ai-native-sdlc-playbook (all 14 lessons, public, no login) and https://claude.com/blog/the-ai-native-sdlc-playbook. Paraphrased; short quotes only. Pages must paraphrase too, credit the course and link to it.


# AI-native SDLC playbook: complete outline (no login used)

Note on quoting: the fetch tool told me to keep quotes under 125 characters and to paraphrase everything outside quotation marks. Quotes below follow that rule. Code and file contents are summarised or described rather than reproduced in full. The builders can re-fetch the URLs for full code.

## 1. Readability without login

All pages were readable without login. There were no blocked pages. Every fetch returned HTTP 200.

| Page | Status | Notes |
|---|---|---|
| https://academy.claude.com/courses/ai-native-sdlc-playbook | 200 | Landing page. Has "Start course" and "Sign in to save progress" links. |
| /introduction | 200 | Full text. |
| /capture-intent | 200 | Full text. |
| /requirements-and-design | 200 | Full text. |
| /plan-mode | 200 | Full text. |
| /claude-md | 200 | Full text. |
| /skills-as-institutional-knowledge | 200 | Full text. |
| /parallel-sessions-and-subagents | 200 | Full text. |
| /give-claude-a-feedback-loop | 200 | Full text. |
| /continuous-evals-in-ci | 200 | Full text. |
| /ai-in-the-pr-review-loop | 200 | Full text. |
| /hooks-as-approval-gates | 200 | Full text. |
| /ci-cd-integration-and-deployment | 200 | Full text. |
| /closing-the-loop-on-metrics | 200 | Full text. |
| /closing-thoughts-and-resources | 200 | Full text. |
| /complete ("Course complete") | 200 | Essentially empty. Only the "Claude Academy" header came back, about 22 characters. It is probably a completion screen that needs login or JavaScript. Nothing to outline. |
| https://claude.com/blog/the-ai-native-sdlc-playbook | 200 | The first ~39k of 89k characters were returned verbatim: intro, Plan, Design, Build, up to the start of Test. The rest (Test, Deploy, Maintain, closing) came back only as a model-written summary. |

All lesson URLs are under the base https://academy.claude.com/courses/ai-native-sdlc-playbook/. The slugs are listed in the table above.

The academy lessons are the full, verbatim source for all stages. I relied on the blog only for what the academy adds nothing on: the blog's long-form framing, and the blog-only items listed in section 5. Anything in this report that rests only on the blog's summarised tail is marked **[blog summary]**.

## Course metadata (landing page)

- Title: "The AI-native SDLC playbook" (Claude Academy). The blog version is by Louis Claxton, dated August 21, 2026, 40 min read, category Best practices.
- Format: 14 lessons, about 1 hr, no quiz, no completion badge ("No completion badge"). Sign-in only saves progress.
- Audience: engineering, platform, and security leads whose organization already uses Claude Code. The landing page describes approval gates, reviews, and handoffs that "still run at human speed". It is written for large enterprises, especially regulated ones, where "the review queue cannot be allowed to build and code cannot ship under-reviewed".
- The plays assume you can change how the org plans, reviews, tests, and deploys, not only how it writes code.
- Prerequisites: comfortable in Claude Code day to day, plus a Git repo and CI pipeline you are allowed to change. Each play names its own prerequisites under Getting started, and several have none.
- Twelve "plays" across six stages.
- "What you'll learn" outcomes:
  - Identify what changes at each of the six stages, and choose a first play from the dependency graph.
  - Explain how `intent.md` ("a short version-controlled file stating what is wanted, why, and under which constraints") becomes a requirements and design spec in one working session.
  - Choose whether a piece of institutional knowledge belongs in `CLAUDE.md`, a skill, or a hook.
  - Explain how evals rerun whenever the agent's setup changes, how Claude reviews every PR, and which code people still review by hand.
  - Explain how hooks hold actions such as a release until a person approves, and how a production metric leaving its normal range becomes a new `intent.md` that restarts planning.

## Module and lesson list, in order

The course has no formal "modules". It groups lessons under headings, which I treat as modules.

- **Introduction**
  1. What changes and where to start (3 min) /introduction
- **Stage 1: Plan**
  2. Capture as intent.md (4 min) /capture-intent
- **Stage 2: Design**
  3. Requirements and design (5 min) /requirements-and-design
- **Stage 3: Build**
  4. Claude Code plan mode as the default starting point (6 min) /plan-mode. It also contains two sub-sections: "Claude Code in auto mode" and "Legacy systems and the source of truth".
  5. The CLAUDE.md (3 min) /claude-md
  6. Skills as institutional knowledge (5 min) /skills-as-institutional-knowledge. It also contains the sub-section "Hooks as build-time guardrails".
  7. Parallel sessions and subagents (4 min) /parallel-sessions-and-subagents
- **Stage 4: Test**
  8. Give Claude a feedback loop (4 min) /give-claude-a-feedback-loop
  9. Continuous evals in CI (5 min) /continuous-evals-in-ci
- **Stage 5: Deploy**
  10. AI in the PR review loop (5 min) /ai-in-the-pr-review-loop
  11. Hooks as approval gates (7 min) /hooks-as-approval-gates. It also contains "Managed settings for a regulated enterprise".
  12. CI/CD integration and deployment (6 min) /ci-cd-integration-and-deployment
- **Stage 6: Maintain**
  13. Closing the loop on metrics (9 min) /closing-the-loop-on-metrics. It also contains "Claude on call with Claude Tag".
- **Closing**
  14. Closing thoughts and resources (2 min) /closing-thoughts-and-resources
  - Plus the "Course complete" page /complete (empty, see above).

Counting the twelve plays: Capture intent, Requirements and design, Plan mode, CLAUDE.md, Skills, Parallel sessions and subagents, Feedback loop, Evals, PR review, Hooks as approval gates, CI/CD, Closing the loop. That is twelve. Auto mode, legacy systems, build-time hooks, managed settings, and Claude Tag are sub-sections, not separate plays.

## 2. Overall framing (Introduction lesson, plus blog)

- **Thesis ("Code is no longer the bottleneck")**: AI writes code at speed unthinkable a year ago, but "the processes around the code haven't changed at the same pace". Teams still have the same approval gates, reviews, handoffs, and policies.
- **SDLC definition**: the process that takes software from idea to production. Most orgs run six stages: plan, design, build, test, deploy, maintain.
- **Traditional SDLC** (blog): each stage is a discrete phase owned by a different role.
  - Product managers write requirements, technical architects design, engineers build, QA verifies (at regulated enterprises), releases teams ship, operations monitors.
  - Work moves via documents, tickets, and sign-offs.
  - It was designed for an era when writing code was the expensive part. PRDs, estimation rituals, and security reviews existed to force alignment over weeks to quarters.
  - It has controls that assume every step is performed by humans.
- **When build runs fast, three things become true** (blog):
  1. The bottleneck moves left and right of build: plan, review/test, deploy, which still run at human speed.
  2. Controls stop matching reality. Reviewing each line by hand cannot keep up once agents write most of the diff.
  3. Governance costs rise because exceptions route through weekly or monthly committees.
- **Security example** (blog): security teams are sized for human output. When agents multiply code, either the review queue builds or code ships under-reviewed. A regulated org can accept neither.
- **What an AI-native SDLC is** (blog): "a reimagined process that combines the old control objectives with new enforcement." The linear flow becomes a loop with AI embedded at each point, and handovers are automated. Synonyms the blog gives: agentic SDLC, AI SDLC, agentic software development.
- **Humans stay accountable**: "Humans remain accountable for every decision that requires judgment." Human attention shifts to the artifacts that must be reviewed.
- **The committed artifact thread** (blog): every stage ends by writing an artifact to version control and the next stage begins by reading it.
  - Artifacts: `intent.md`, `spec.md`, `plan.md`, the diff and its tests, the PR with its review findings, and the incident record.
  - In early stages the artifacts are .md files, because a product owner and an agent can both act on the same file. From Build onward the artifact is code and its records.
  - "The chain of commits is also the audit trail: who asked for what, what the agent produced, and who approved it."
- **Triggers between stages** (blog):
  - An accepted `intent.md` triggers the requirements and design pass.
  - An approved `spec.md` triggers plan mode.
  - A merged PR triggers the pipeline.
  - A breached control band in production writes the next `intent.md`, and the loop continues.
- **Adoption of the loop** (blog): first you prompt each step by hand. The end state is a loop in which each accepted artifact fires the next gate. Human attention concentrates at the gates, reviewing what the agent flagged.
- **Each play's template** (same five sections for every play): What changes; Getting started (Prerequisites, Infrastructure); Concrete steps ("How to execute it"); Governance considerations; How to measure it (leading and lagging indicator). Plays 1-3 also have "What it looks like" examples.
- The course's own wording of the plays: "plays are modular". The six stages are called "non-linear". Orgs may prioritise different stages at different times.

### Stage-by-stage shift table (Traditional vs AI-native, near-verbatim from the lesson)

| Stage | Traditional SDLC | AI-native SDLC |
|---|---|---|
| Plan | Requirements gathered by committee, distilled through workshops and sign-offs, written up by hand | Claude synthesizes pain points straight from the sources and captures them within `intent.md`, which is "human readable and machine actionable" |
| Design | Spec written by analysts, parsed by designers | Requirements and design compressed into one working session with an agent, guided by standards encoded as skills, versioned in Git |
| Build | Tests and code are handwritten; documentation written after development | Tests and code generated by AI; institutional knowledge maintained as versioned machine-readable `CLAUDE.md` files and skills |
| Test | QA gates at stage boundaries | Continuous evals woven through implementation |
| Deploy | Humans review every line; governance in review cycles, often inconsistently | Layers of agentic review with human review reserved for regulated and critical code. Governance enforced as the AI acts, with hooks as approval gates |
| Maintain | Humans watch production for bugs | Agents monitor live deployments. Any breached control band is diagnosed and written back into the loop as a new `intent.md` |

The page says this table shows "the ends of the spectrum" and that "most organizations sit somewhere between the two columns".

### Dependency graph of the twelve plays (alt text of the image; the image itself is not viewable)

- **Row 1, no prerequisites**: Capture intent, CLAUDE.md, Skills, Feedback loop, Hooks, Plan mode.
- **Row 2**:
  - Subagents: needs CLAUDE.md; the feedback loop helps.
  - Evals: needs CLAUDE.md and the feedback loop.
- **Row 3**:
  - Requirements and design: needs Capture intent and Skills.
  - PR review: needs Evals and Subagents; Skills help.
- **Row 4**: CI/CD: needs PR review and Hooks.
- **Row 5**: Closing the loop: needs CI/CD and Capture intent.
- CLAUDE.md helps Skills but is not required.
- Solid arrow means "build on". Dotted arrow means "helps but not required". The blog calls the no-prerequisite plays "clay" plays ("Start with any clay play - nothing points into it").
- Caution: the per-lesson "Prerequisites" text disagrees slightly with the graph in places. Examples: plan mode says "intent artifact if one exists, and CLAUDE.md helps"; PR review lists "CLAUDE.md, skills if review passes enforce written policies, and defined subagents" but not Evals; closing the loop lists `intent.md`, Claude-accelerated PR reviews, hooks, and a CI/CD rollback path but not Evals. The graph is the course's own summary. I flag the differences rather than resolve them.

### "Pick your first play" (Intro lesson)

The six no-prerequisite plays are the possible starting points:
- Plan: Capture as intent.md
- Build: Claude Code plan mode as the default starting point
- Build: The CLAUDE.md
- Build: Skills as institutional knowledge
- Test: Give Claude a feedback loop
- Deploy: Hooks as approval gates

## 3. Lesson-by-lesson outline

### Lesson 1: What changes and where to start (Introduction)

- Content is the framing in section 2: the six-stage table, "How the plays work", the dependency graph, and "Pick your first play".
- No artifacts of its own. No metrics.

### Lesson 2: Capture as intent.md (Stage 1: Plan)

Key ideas:
- `intent.md` kicks off the process. It can enter by three routes: a person has an idea, a ticket is filed, or an incident is surfaced via an alert (see Stage 6).
- A person brainstorms with Claude and produces a "Markdown proto-spec", saved as `intent.md`. It is human readable, version controlled, and immediately consumable by the next stage.
- Whatever the route, "the product owner reviews and corrects the agent-written intent.md before it is committed."

What changes:
- **Traditional**: an idea passes through backlog entries, user stories, story points, and refinement meetings. Ownership transfers at each handoff, so what reaches engineering is "several steps removed" from what the originator meant.
- **AI-native**: the originator brainstorms with Claude and writes the result as `intent.md`, "a proto-spec in the originator's own terms". It contains what is wanted, why, and under which constraints. Repeat processes are encoded as skills.

Getting started:
- Prerequisites: none.
- Infrastructure:
  - Claude access for non-engineers (claude.ai or Cowork).
  - An agreed `intent.md` template.
  - A shared, version-controlled home for intent that the product owner watches.
  - Simplest home: an `intent/` folder in the product repo. A dedicated intent repo is only worth it when intent spans many repos. In a monorepo it is a directory.
  - The legacy-systems section in Stage 3 covers how this home relates to Jira.
- One-time setup by the platform or engineering team: a technical person stands up the intent home and decides who can write to it.
- Contributors without Git experience need not use Git. A connector (for example GitHub) lets Claude commit Markdown on their behalf from claude.ai or Cowork.

Steps (5):
1. The originator describes the problem in their own words (what they cannot do today, who is affected, what better looks like, what is out of scope). No formal language is needed.
2. Brainstorm until concrete. Claude asks the analyst's questions: scope, users, constraints, what success looks like.
3. Ask Claude to write `intent.md` using the org's template. The template can be encoded as a skill, set up by a technical team member and signed off by a lead. It covers problem, proposed outcome, affected users and systems, constraints, open questions.
4. The originator corrects any misunderstanding.
5. Commit `intent.md` to the shared home. Author and timestamp join the record. The product owner picks it up.

Example `intent.md` (claims status self-service, an insurer):
- Title "Intent: claims status self-service". Header has Author (J. Ortiz, claims operations) and Status: draft.
- Sections: Problem; Proposed outcome; Affected users and systems; Constraints; Open questions.
- Content: customers phone the contact center to ask where their claim is, and handlers spend roughly a third of call time on status-only queries. The proposed outcome is that customers see claim status, next step, and expected date in the portal. Affected systems: claims handlers, portal team, claims-core API. Constraints: no new PII in the portal session, existing authentication only. Open question: do third-party loss adjusters need access too?

Governance:
- Evidence is the committed `intent.md` (author, timestamp, full revision history in the Git history of the intent home).
- The product owner approves. The accept or reject decision that sends the intent into Stage 2 is recorded as the merge or the closing review.

Metrics:
- **Leading**: time from first conversation to a committed `intent.md`, read from Git history. Expected to fall from "a multi-week elicitation and refinement cycle to hours".
- **Lagging**: survival rate, meaning the share of `intent.md` files the product owner accepts into Stage 2 rather than closes. Also the count of changes to `intent.md` made after the first `spec.md` commit for the same change.

Who does what: the originator (any person, or an agent or alert) drafts with Claude and corrects it. The product owner reviews, approves, and accepts or closes. Platform or engineering sets up the intent home. A lead signs off the template skill.

### Lesson 3: Requirements and design (Stage 2: Design)

Key ideas:
- Once the product owner approves `intent.md`, Claude produces a requirements and design spec, guided by the org's skills for brand, security, compliance, and UX. (The lesson links a Claude skills guide.)
- "The product owner reviews that spec, but doesn't write it." The goal is a spec engineering can plan against, "with flagged areas of concern".
- Front-end example: after `intent.md` is accepted, the product owner mocks up the design in **Claude Design** from the `intent.md`, iterates, then exports to Claude Code to build. (The blog marks Claude Design as beta.)

What changes:
- **Traditional**: separate phases by separate teams. Analysts formalize requirements and designers parse them back into a design. "The separation exists for accountability, but it is slow and lossy."
- **AI-native**: both phases happen in a single prompted session. Claude takes `intent.md` and produces a spec constrained by the org's skills, with areas of concern flagged.

Getting started:
- Prerequisites: write an `intent.md`, with brand, security, compliance, and UX policies written as skills.
- Infrastructure: a product owner with Claude access. No engineering skill required.

Steps (6):
1. The product owner opens a session with the org's skills available and attaches `intent.md`.
2. The prompt points at the intent, names the constraints, and demands flagged concerns. Run it by hand at first. Then codify it as an organization-level slash command. Then make acceptance (merge) of `intent.md` the trigger for a non-interactive job that runs the pass with skills loaded and commits `spec.md` as a pull request. The CI/CD play in Stage 5 covers the plumbing. From then on the product owner's first involvement is the review.
3. The product owner reviews the spec against the idea. Does it solve the stated problem? Are the open questions answered or carried forward?
4. Work through flagged concerns first, since they are what an analyst would have escalated. The product owner resolves each with its policy owner before engineering sees the spec.
5. Commit `spec.md` alongside `intent.md`. "The file pair records what was asked for and what was decided."
6. The product owner decides whether spec and intent proceed to build, consulting a tech lead for higher-risk items. "A human teammate always makes this call." Accepting the spec starts the plan mode play.

Example prompt (paraphrased): read the attached `intent.md`; produce a requirements and design spec for integrating it into the existing codebase; apply the available skills so it conforms to brand guidelines, security policies, and UX standards; write it fully as `spec.md` ready for the engineering team; clearly describe any areas of concern, especially where contradicting policies cannot both be satisfied.

Example `spec.md` (same insurer):
- Header: from `intent.md`, status "ready for product owner review", skills applied: secure-api-review, brand-voice, portal-ux.
- Requirements R1-R4:
  - R1: a signed-in customer sees status, next step, and expected date for each open claim.
  - R2: status is one of four states: received, in review, approved, paid.
  - R3: the response carries those three fields and nothing else.
  - R4: what the customer sees is at most 60 seconds old.
- Design:
  - New endpoint `GET /claims/{id}/status` in `claims-api`, behind the gateway JWT.
  - `claims-api` reads from `claims-core`; the portal never calls `claims-core`.
  - New StatusPanel on the portal claims page, caching each answer 60 seconds.
- A constraints-to-implementation table: "No new PII" is met by R3. "Existing authentication only" is met by the gateway JWT.
- The open question about loss adjusters is "carried forward as concern 1".
- Areas of concern (each has a named owner):
  1. Loss adjusters have no portal account. Giving access breaks "existing authentication only". Owner: security.
  2. The portal-ux skill says every status shows a date, but brand-voice says never state a payment date as a commitment. Proposed label "Estimated date". Owner: compliance.
  3. claims-core allows 50 requests per second. The 60-second cache should keep it under, but it is not load tested. Owner: the claims-core team.
- The requirements are numbered so the plan and the review can cite them. Concern 2 shows two skills in conflict.

Governance:
- Policy conflicts are caught while the spec is written, not weeks later in review.
- Skills act as constraints. The spec, the prompt, and the skill versions in force are all logged in version control.
- The product owner signs off and routes concerns to the named policy owners.

Metrics:
- **Leading**: elapsed time between the `intent.md` commit and the `spec.md` commit for the same change (two Git timestamps), compared with the old requirements-plus-design cycle.
- **Lagging**: requirements rework after build starts. Count `spec.md` commits dated after the first `plan.md` commit for the same change (from git log).

Who does what: Claude (or a CI job) drafts the spec. The product owner reviews, resolves concerns with policy owners, and accepts. A tech lead is consulted for higher risk.

### Lesson 4: Claude Code plan mode as the default starting point (Stage 3: Build)

Key ideas:
- Engineers start Claude Code sessions in plan mode. They give Claude the approved `spec.md`, let it interview them, and iterate until they are happy with the plan.
- The plan is committed as `plan.md`.

What changes:
- **Traditional**: the engineer reads the design and starts coding. How the change will be made (files, tests) stays in their head or a ticket comment, and "nobody else can review it". The reviewer first sees the finished diff, "and by then rework is slow".
- **AI-native**: work starts with a written plan from plan mode, where Claude can read the codebase but not change anything. The engineer corrects the plan, and the approved version is committed as `plan.md` for later stages to check against.

Getting started:
- Prerequisites: the intent artifact (`intent.md` or `spec.md`) if one exists. `CLAUDE.md` "helps".
- Infrastructure: Claude Code with repo access.

Steps (7):
1. Start the session in plan mode.
2. Give Claude `intent.md` and `spec.md`. Ask for a plan naming the files that change, the order of the work, and the tests that prove it.
3. Interrogate the plan: what could this break, which step is riskiest, which other options were rejected.
4. Iterate until an engineer who never saw the conversation could implement from the plan alone.
5. Commit the approved plan as `plan.md`. It joins the audit trail and the PR review play checks the diff against it.
6. Accept the plan and let Claude implement. "With a solid plan, the implementation is often a single pass."
7. If implementation departs from the plan, update `plan.md` in the same commit. Consider a hook to enforce sync.

Example `plan.md` (claims status):
- Sections: Files that change (StatusPanel.tsx new, claims-api/routes/status.py, claims-api/tests/test_status.py); Order of work (1. status endpoint behind existing auth (R1,R2,R3); 2. panel with 60-second cache (R1,R4); 3. wire into portal nav); Risks (claims-core rate limit of 50 rps, must cache, cites spec concern 3); Proof (test_status.py covers the four claim states (R2) and fails on any extra field (R3); screenshot matches the approved mock).
- The plan cites R1-R4 and concern 3 so a reviewer can check it line by line against the spec.

Governance:
- Design review happens before any code, "when changing course is still a matter of editing a document".
- Plan mode itself enforces this because Claude cannot edit files until the engineer accepts the plan.
- The plan, its revisions, and who accepted it are logged.
- Routine changes are approved by the engineer. Higher risk goes to a tech lead or architect.

Metrics:
- **Leading**: share of changes that merge from the first implementation pass, and time from plan approval to merged PR (from PR metadata).
- **Lagging**: rework cycles per change (PR metadata), and how often the merged diff still matches the committed `plan.md`.

Sub-section **Claude Code in auto mode**:
- The engineer iterates on and approves the plan, then Claude applies each change without a per-edit prompt.
- As later guardrails mature (a tuned `CLAUDE.md`, skills that encode policy, hooks that block unsafe actions, a test suite Claude can run), auto mode becomes the default for routine work: "a tight spec.md, a small blast radius, and code the tests already cover".
- The shift is from watching the agent edit toward reviewing artifacts after longer autonomous sessions.
- Auto mode enables parallelism across people and teams with worktrees. It is "fundamental to running the SDLC autonomously and closing the loop" in Stage 6.

Sub-section **Legacy systems and the source of truth** (applies to every artifact):
- Existing processes already track artifacts, just not in Markdown: work items in Jira, requirements in a traceable tool, designs in Figma, approvals with a change board. These are hard to displace because auditors and regulators accept them, so the AI-native SDLC must "fit around what exists".
- For every artifact, name one system as the source of truth. Others hold a copy or link. The choice can differ per artifact. Three configurations:
  1. **The repo as the source of truth**: Markdown artifacts are authoritative, and the legacy system references files within commits. "One of the cleanest configurations for engineering-led organizations" (one tool, one timestamp authority).
  2. **The legacy system is the truth**: Jira, ServiceNow, or the requirements tool is authoritative and the Markdown files are working copies. Claude reads the record at session start and writes the outcome back via an MCP connector in the same session that produced the spec or plan.
  3. **Linkage as the minimum bar**: artifacts note the record ID, and legacy records contain the commit SHA of the Markdown file. "A good place to start" when transitioning, accepting there are two sources of truth.
- Both can coexist so long as they are linked or one is declared the source of truth.

### Lesson 5: The CLAUDE.md (Stage 3: Build)

Key ideas:
- `CLAUDE.md` gives Claude the context a new joiner would need: conventions, commands, architecture, and the mistakes the team sees most often.
- Knowledge that lived in heads and wikis becomes a file read at the start of every session. It is maintained by the whole team and iterated on whenever a mistake is made.

Getting started:
- Prerequisites: none.
- Infrastructure: a repo, Claude Code installed, and one engineer who knows the codebase well.

Steps (5):
1. Run `/init` in the repo. Claude generates a starting `CLAUDE.md`.
2. Cut it down to what a new joiner needs on day one: build, test, and lint commands, the conventions that matter, and the things Claude keeps getting wrong.
3. Check it into Git at the repo root so the team shares one version and changes are reviewed like code.
4. Working rule: "When Claude makes a mistake twice, the correction goes into CLAUDE.md."
5. Keep it under a page. Claude reads all of it at session start and stale content wastes context.

Example `CLAUDE.md` (insurer's claims portal) has four sections:
- Commands: make build, make test (unit), make itest (integration, needs docker), make lint (runs in CI; fix before pushing), make run (portal on :3000, claims-api on :8000).
- Conventions: claims-api is Python 3.12 and FastAPI; portal is TypeScript and React; every endpoint needs a test in claims-api/tests; dates cross the API as ISO 8601.
- Architecture: portal/, claims-api/, and `intent/` (holds intent.md, spec.md, plan.md for each change); only claims-api talks to claims-core; claims-core allows 50 requests per second ("Cache reads; never poll it").
- Things Claude gets wrong: do not log request or response bodies in claims-api (they can hold PII); do not bump dependency versions (the platform team owns them).

Governance:
- Version controlled, so the agent's instructions are reviewable and auditable. Changes are logged in Git history and code owners approve changes in PR review.

Metrics:
- **Leading**: how often Claude repeats a mistake `CLAUDE.md` should have caught. Corrections are tracked in Git history.
- **Lagging**: time to first merged PR for a new team member (from PR history).

### Lesson 6: Skills as institutional knowledge (Stage 3: Build)

Key ideas:
- Skills make institutional knowledge operational. The instructions are "explicit, version controlled, applied broadly, and updated centrally when policy changes".
- Rule of thumb: write a skill for institutional knowledge that must be applied consistently. Do not write a skill for things that belong in `CLAUDE.md` or a prompt.
- This is the lesson that answers "CLAUDE.md vs skill vs hook". A skill is advisory, and a hook is deterministic.

Getting started:
- Prerequisites: none required. `CLAUDE.md` helps but a skill does not depend on it.
- Infrastructure: one policy with a named owner and a written source of truth.

Steps (6):
1. Pick one piece of knowledge enforced inconsistently today (security standard, API design convention, brand rule).
2. Write it as a skill: a folder with a `SKILL.md` whose frontmatter says when it triggers and whose body says what to do. An engineer writes it from the policy owner's source of truth, using Claude to help.
3. Put it at `.claude/skills/<name>/` so it ships with code, or distribute org-wide via a plugin.
4. Test that it triggers by asking for the task in different ways.
5. When policy changes, change the skill, and the policy owner signs off.
6. Engineers pick up the new version automatically in their next session.

Example: `.claude/skills/secure-api-review/SKILL.md`:
- Frontmatter: name `secure-api-review`; a description saying to use it when creating or modifying external-facing endpoints, reviewing API code, or generating an OpenAPI spec.
- Four rules: (1) authentication, with every endpoint requiring the gateway JWT and no anonymous routes outside /health; (2) input validation against the OpenAPI schema, rejecting unknown fields; (3) audit, with every state-changing endpoint emitting an audit event (actor, action, entity, timestamp); (4) data classification, where fields tagged `pii` must never appear in logs or error messages.
- Finally: run `scripts/check-endpoints.sh` and include its output in the summary.

Governance:
- "A skill is a control, though an advisory one." Nothing forces a session to comply.
- A policy that must always hold needs something deterministic behind it: a hook that blocks the action, or a review pass at the PR. "The skill makes violations rare and the hook makes them close to impossible."
- The hook catches the violation at the edit. The same check on the PR catches anything that reached the branch another way.
- Skill invocations are logged in session traces. The policy owner reviews skill changes like code.

Metrics:
- **Leading**: time from the policy owner approving a change to the updated skill merging (PR on the skill folder).
- **Lagging**: PR review findings that cite the policy, which should fall toward zero. If they do not, the skill is not triggering or its text has drifted from policy.

Sub-section **Hooks as build-time guardrails**:
- A hook is "the deterministic layer behind" a skill. Most Claude actions in build are file edits and shell commands, so hooks fire most here.
- Build-phase hooks can: block edits to protected paths (generated classes, a frozen package); run the formatter and linter after edits; keep credentials out of the diff; back any skill whose policy must hold without exception.
- Hooks run on each matching action, so keep them fast and scoped to the changed file. Heavier checks (the full test suite) belong at commit or PR.
- Worked example: a `PostToolUse` hook (matcher `Edit|Write`) registered in `.claude/settings.json`, running `.claude/hooks/api-policy.sh`.
  - The script runs the same `scripts/check-endpoints.sh` the skill names, only for files in `claims-api/routes/`.
  - It exits with code 2 and prints the message "secure-api-review rule 4: a pii field reaches a log or an error message." plus the offending file:line.
  - Exit code 2 puts the message in front of Claude, which can fix the line. A post-edit hook cannot undo the edit.
  - Limitation: an `Edit|Write` hook does not fire if a shell command rewrites the file. So the same script also runs as a required CI check on every pull request (a GitHub workflow named "API policy", with job `check-endpoints`, required in branch protection).
- A hook that asks a human for approval belongs in Stage 5, because an approval prompt in build puts a person back on the critical path of all parallel sessions.

### Lesson 7: Parallel sessions and subagents (Stage 3: Build)

Key ideas:
- A **parallel session** is another full Claude Code instance working a separate task in its own Git worktree. Sessions know nothing about each other. The engineer is the only thing they share.
- A **subagent** runs inside one session as a scoped helper with its own context window and tool limits. It suits recurring jobs such as verifying the app runs.
- Parallel sessions raise the number of tasks in flight. Subagents keep each session focused. "The engineer's job is steering and reviewing all of them."

What changes:
- **Traditional**: one engineer, one task at a time, much time on builds, tests, and reviews. Switching while waiting is "tiring enough that few people choose to".
- **AI-native**: one engineer runs several sessions at once, each in its own worktree. Repeated jobs become subagents. The job shifts to orchestrating and "eventually, to building and monitoring loops".

Getting started:
- Prerequisites: `CLAUDE.md` (all sessions read it). The feedback loop (Stage 4) also helps, since less supervision is needed when a session can verify its own work.
- Infrastructure: a Git repo (isolation comes from worktrees), and permission settings tuned so sessions are not stuck on approval prompts for commands the org considers safe.

Steps (4):
1. Split work into tasks that touch different files, using the plan from plan mode to find independence. Tasks that share files run in one session, sequentially.
2. Give each parallel task its own worktree, for example `claude --worktree feature-auth` and `claude --worktree fix-rate-limit` in separate terminals. A worktree is a separate checkout on its own branch.
3. Start with two or three sessions. The ceiling is how many streams one person can review properly. "Add sessions only while review is keeping up."
4. Turn repeated jobs into subagents, as Markdown files in `.claude/agents/`, each with a name, a description of when to use it, and allowed tools. Example subagents: a code simplifier, a verifier, a researcher. Check them into Git.

Example `.claude/agents/verifier.md`: name `verifier`; description "Runs the app and checks the change works before the session reports done"; tools `Bash, Read`. The body says to start the app with `make run`, exercise the changed behavior and the two nearest neighboring flows, report what it ran and saw and any behavior that does not match `plan.md`, and "Do not fix anything; report only."

Governance:
- More sessions means more output, so controls must come from repo configuration. Hooks and permission settings there apply to all sessions. Activity is logged and attributed to the engineer who ran it.

Metrics:
- **Leading**: concurrent sessions per engineer while review quality holds (counted from the OpenTelemetry export), and the share of the day spent steering rather than waiting.
- **Lagging**: changes merged per engineer per week, read alongside the rework rate (PR history).

### Lesson 8: Give Claude a feedback loop (Stage 4: Test)

Key ideas:
- "Always give Claude a way to verify its own work": tests, a build, or a screenshot diff. A session checks and fixes its own work before an engineer sees it.
- Do not confuse the feedback loop with the **verifier subagent** (Stage 3). The loop runs through the whole task as many times as needed. The verifier is one way to package the final check, run in a fresh context window once the session believes it is done, so the verdict is not colored by the assumptions that produced the code.

What changes:
- **Traditional**: the "does it work" signal comes late (CI minutes later, a tester days later, production weeks later). With an agent producing the code, a late signal means a person must check all output and becomes the bottleneck.
- **AI-native**: the session can check its own work (run tests, run the build, take the screenshot) and iterate until the check passes. What reaches the engineer has already passed it. The engineer running the session sets up the loop.

Getting started:
- Prerequisites: none.
- Infrastructure: a test suite and a build that each run locally with one command. For UI work, a browser tool or a screenshot utility wired in via MCP.

Steps (7):
1. Wrap the checks in one target (for example `make test` or `npm test`) that exits non-zero on failure.
2. List each command in `CLAUDE.md`'s Commands section with an example of healthy output.
3. State a quantifiable target, for example "All tests in test_status.py pass", "the screenshot matches the attached mock", "the endpoint returns 200 with the new field".
4. For bug fixes, write the failing test first: reproduce the bug as a test, confirm it fails for the expected reason, commit it, then ask Claude to make it pass without editing the test, with a test-file hook enforcing that. "A test that existed before the fix, and that the agent couldn't rewrite, is proof the bug is gone."
5. For UI work, close the loop visually: implement, screenshot, compare, adjust. Two or three rounds is normal.
6. Make verification part of "done" in `CLAUDE.md`: "Run the tests before reporting a task complete, and show the output."
7. Protect the loop, because an agent fixing code must not weaken its own check. Use a hook that blocks edits to test files during a fix task, or reject any diff that touches a test in review.

Example `CLAUDE.md` "Verifying your work" block: Build `make build` (must finish with "Build succeeded"); Test `make test` (all green; never skip or delete a failing test); Lint `make lint` (zero warnings); run all three before reporting any task complete and paste the output; "If a test fails, fix the code, not the test."

Governance (the course's four items):
- What is enforced: verification before done, and a block on editing test files during a fix, both as hooks where guarantees are wanted.
- Evidence: literal output of `make test`, the build log, or the screenshot diff pasted by Claude.
- Where logged: the session transcript (forwarded by the OpenTelemetry export), and the PR check run.
- Who approves: the code owner reviewing the PR, who can focus on intent and risk because the mechanical evidence is attached.

Metrics:
- **Leading**: first-pass CI success rate for agent-written changes.
- **Lagging**: review time per PR (PR metadata), which should fall, and change failure rate (incident tracker).

### Lesson 9: Continuous evals in CI (Stage 4: Test)

Key ideas:
- "Evals are the AI-native equivalent of stage-gate QA." They are a suite that runs whenever the agent's configuration changes (new model swapped in, prompt rewritten) and says whether the agent still does the work to the same standard.
- The suite is "live": as models improve, cases stop discriminating, and new cases arise from monitoring.
- Some teams may prefer to run evals offline on a set cadence. The steps given are for continuous evals.

Getting started:
- Prerequisites: `CLAUDE.md` and the feedback loop (Stage 4).
- Infrastructure: CI that can run Claude Code non-interactively, and an API key with budget for eval runs.

Steps (5):
1. The platform engineer collects **20 to 50 real tasks** from recent work, each with its expected or accepted outcome.
2. Write each task as an eval: the prompt plus the checks that define acceptable (tests pass, lint clean, behavior unchanged, policy followed).
3. Run the suite non-interactively in CI on a schedule and on any change to `CLAUDE.md`, skills, or hooks, because that configuration steers the agent and "deserves the regression testing that code gets".
4. Gate configuration changes on results. A skill change that drops the pass rate is reviewed before merge.
5. Each production incident gets an eval, written by the team that owned the incident, and stays as a regression test.

Example artifacts:
- `evals/status-no-pii-in-logs.json`, with these fields:
  - name
  - source (a merged PR for debug logging of the status endpoint)
  - `from` (the last commit before that PR, so each run starts from the code as it was)
  - prompt (asks Claude to add debug logging showing which claim was asked for and what was returned, and to run tests)
  - `may_change` (folders a run may change)
  - checks, five in all: tests pass (`make test`), lint clean (`make lint`), no line removed from existing tests, no pii in logs (`scripts/check-endpoints.sh`), no response body in logs (`evals/log_bodies.py`)
- `.github/workflows/agent-evals.yml` ("Agent evals"):
  - Triggers on pull requests touching `CLAUDE.md`, `.claude/**`, or `evals/**`, plus a nightly cron (`0 2 * * *`).
  - For each eval it creates a scratch checkout at the eval's `from` commit, removes `evals/` from it, and copies in the branch's `CLAUDE.md` and `.claude/` (the configuration under test).
  - It runs `claude -p` with the prompt and an allowed-tools list, then runs `check.sh`.
  - Grading uses a copy of the evals made before any run.
  - It prints the failed count and passes only if zero failed.
- Notes:
  - The threshold in the example is every eval passing. A 20-50 eval suite "may set a lower one".
  - Do not add `--bare` here, because it skips `CLAUDE.md`, skills, and hooks, which are exactly what is under test.
- `evals/check.sh`: runs each check on the files Claude left behind. It fails any run that changed files outside the allowed paths (git-ignored files excepted), so the agent cannot pass by rewriting the Makefile or the checks.
- `evals/log_bodies.py`: calls the endpoint with a made-up claim, captures log lines, and fails if a line holds the whole response. It tests behavior, not code style.
- Worked story: a PR trims `CLAUDE.md` and drops the line about not logging request/response bodies. The suite runs, and `status-no-pii-in-logs` fails 4/5 checks ("no response body in logs"), because `next_step` is free text that can hold personal data and the policy script still passed. The line goes back into `CLAUDE.md` before merge.
- Sample output lines: `PASS portal-stays-off-claims-core (4/4 checks)`, `FAIL status-no-pii-in-logs (4/5 checks)`.

Governance: evals give QA "a gate that keeps up with agent output". The pass-rate threshold is enforced as a merge check. Runs are logged for comparison over time. The team that owns the configuration change approves it.

Metrics:
- **Leading**: eval pass rate over time, and how long a production incident takes to become a permanent eval.
- **Lagging**: regressions caught in CI versus regressions found in production (incident tracker).

### Lesson 10: AI in the PR review loop (Stage 5: Deploy)

Key ideas:
- Claude both gives and receives reviews. It reviews incoming PRs against org policies and addresses review comments on its own PRs.
- Engineers focus on behavior: "judging intent and risk".

What changes:
- **Traditional**: review capacity is planned around human output. A PR waits for a reviewer to read all of it, quality varies with reviewer load, and the author chases while the backlog grows.
- **AI-native**: all PRs get an identical set of review passes, with findings ranked by severity. Human attention moves up a level, to whether the change does what the plan intended and whether the risk is acceptable.

Getting started:
- Prerequisites: an updated `CLAUDE.md` from Stage 3, skills (if review passes are to enforce written policies), and defined subagents.
- Infrastructure: a repo with the Claude integration installed, either the managed **Code Review** service (enabled by an Owner of the Claude organization) or `claude-code-action` in your own CI. Model calls can go through Amazon Bedrock, Google Cloud's Vertex AI, or Microsoft Foundry where needed. Branch protection requiring a code owner's approval is also "worthwhile".

Steps (6):
1. The managed Code Review service is the fastest start. Use `claude-code-action` in your own CI when you need pipeline control or want API calls routed via your own cloud agreement.
2. The tech lead writes the review policy as `REVIEW.md` at the repo root, divided into passes: bugs and logical errors; security and vulnerabilities; compliance against `spec.md`, `plan.md`, and design principles. `REVIEW.md` also defines what counts as Important versus a Nit, and what to skip.
3. The tech lead sets the human threshold. "Findings do not approve or block a PR on their own." Branch protection still requires a code owner's approval. A platform engineer who wants to gate merges on findings can read the severity counts the check run publishes as a machine-readable tally.
4. When a reviewer or author tags `@claude` on a review comment, Claude addresses it and pushes the fix. The fix loop runs through `claude-code-action`. In the managed service, `@claude review` requests a fresh review. For PRs Claude opened, let Claude "babysit" the PR to merge via a custom slash command that sweeps unresolved comments and failing checks, until the PR is green and waiting only on code owner approval.
5. Review findings feed back into `CLAUDE.md`. When a review flags a mistake a second time, the correction goes into `CLAUDE.md` in that review. Review also flags when a change made `CLAUDE.md` outdated.
6. Monthly, the tech lead tunes the setup by rating findings and capping Nit volume in `REVIEW.md`. Generated paths and anything CI already enforces are excluded.

Example `REVIEW.md`: titled "Review instructions". Contents:
- Passes: three passes, each finding tagged with its pass. Bugs (logic errors, broken edge cases, subtle regressions). Security (injection risks, authentication gaps, PII in logs). Compliance (the change matches spec.md, plan.md, and design principles).
- "What Important means here": Important is reserved for findings that break behavior, leak data, or breach policy. Style and naming are nits.
- Cap the nits: at most five nits per review, with the rest summarised as a count.
- Do not report: generated files under src/gen/ and anything CI already enforces.

Example check-run output (insurer status panel PR), table columns Severity / File:Line / Issue:
- Important, `portal/src/claims/StatusPanel.tsx:22`. Compliance: the panel fetches on every render, but `plan.md` says it must cache.
- Important, `claims-api/routes/status.py:31`. Security: the error path logs the whole claims-core response, which includes `policy_holder_name`.
- Nit, `claims-api/tests/test_status.py:8`. Bugs: no test covers a `paid` claim with no expected date.
- The first finding exists only because the compliance pass reads the committed `plan.md`.

Governance:
- Separation of duties: "the agent that wrote the code has no way to approve it."
- `REVIEW.md` applies to all PRs.
- Findings, fixes, ratings, and approvals are logged in PR history, so the PR is the audit record. Approval comes from a human via branch protection, informed by the findings.

Metrics:
- **Leading**: time to first review (should fall to minutes), and the share of review comments resolved without a human touching the branch.
- **Lagging**: defects and vulnerabilities caught before merge versus those escaping to production (PR history and incident tracker).

Which code people still review by hand (the learning goal): code owners approve every PR, per branch protection. The Deploy-stage shift table says human review is "reserved for regulated and critical code". The academy lessons I read do not give a precise definition of what "regulated and critical" covers. Mark as unclear.

### Lesson 11: Hooks as approval gates (Stage 5: Deploy)

Key ideas:
- The build phase used hooks as guardrails that allow or block with no human. A hook can also **ask**, pausing until the person running the session confirms. When the approver is someone else (for example a release manager), the hook looks for their recorded approval and blocks until it exists.
- The play is in Stage 5 because the release gate is the clearest case, but hooks run wherever Claude acts. For example, they can block edits to migrations and infra without a change ticket (Stage 3), and stop the agent editing test files during a fix (Stage 4).

Getting started:
- Prerequisites: none.
- Infrastructure: a written list of the approvals the change process requires.

Steps (4):
1. Engineering leadership, with change management and compliance, lists the human approval gates that must survive (change management sign-off, release authorization, edits to protected paths).
2. The platform engineer expresses each gate as a hook, a script that runs before Claude acts and can allow, ask, or block.
3. Team hooks go in `.claude/settings.json` in Git. Non-negotiable hooks go in managed settings owned by the platform or IT admin, where engineers cannot switch them off.
4. A block must explain itself: the reason and route to approval appear in Claude's output.

Example (insurer portal, released to dev, staging, production; deployment via MCP tools, one server per environment, each with a `release` tool):
- A `PreToolUse` hook with matcher `mcp__deploy-.*__release` runs `.claude/hooks/release-gate.sh`.
- The gate decides per environment:
  - Dev: allow.
  - Staging: if `GITHUB_REF` is `refs/heads/main` (pipeline) then allow, otherwise ask the person ("This ships $version to staging. Approve only if you own this release.").
  - Production: requires a ticket matching `CHG-<number>` and a version that looks like a commit hash. It queries the change system (a `change-ticket` CLI) for an approved state for that version. If approved, allow ("$ticket approved by $approver"). Otherwise deny with a message naming the route (open a change ticket, wait for the release manager's approval, call release again with the ticket number).
  - Any other tool: deny ("No release rule for $tool...").
- Details the course states:
  - In a non-interactive run nobody can answer an `ask`, so Claude Code denies it. That is why staging is allowed from the pipeline on `main` ("the approved merge is the approval").
  - Limit: an engineer could set `GITHUB_REF` by hand, though that skips only a prompt they would have answered themselves.
  - The reason on `ask` is shown to the person. The reason on `deny` is shown to Claude, so the block message names the route to approval.
  - The gate relies on the agent having no way to write to the records it reads.

Governance: "Hooks are the approval gates." The condition is enforced every time, for everyone. Allow and block decisions are logged with a timestamp. The gate defines what counts as approval (an approved change ticket or the release manager's sign-off).

Sub-section **Managed settings for a regulated enterprise** (deployed by the platform team via MDM or the admin console; engineers cannot edit or override). Treat as "a starting point to customize". Keys and the control each provides:
- `permissions.deny` keeps secrets out of context (`Read(.env*)`, `Read(./secrets/**)`) and blocks network egress via tools (WebFetch, curl, wget). `permissions.allow` pre-approves a safe inner loop (git, make build/test/lint) to avoid prompt fatigue.
- `disableBypassPermissionsMode` plus `allowManagedPermissionRulesOnly`: nobody can widen the rules.
- `sandbox` (`enabled`, `failIfUnavailable`, `allowUnsandboxedCommands: false`, a network `allowedDomains` list): OS-level enforcement that complements tool-level rules. If the sandbox cannot start, Claude Code refuses to start.
- `credentials`: denies reads of `~/.ssh` and `~/.aws/credentials` and strips listed env vars such as `GITHUB_TOKEN` from sandboxed commands.
- `allowManagedHooksOnly`: only managed hooks run. This means the standalone project-level hook example above is blocked, so define the approval gate in the managed file's own `hooks` block.
- `disableSideloadFlags` and `strictKnownMarketplaces`: skills, agents, hooks, and MCP servers must come via the org's approved plugin marketplace.
- `allowManagedMcpServersOnly`: the agent's tool surface is an allowlist owned by the platform team.
- `requiredMinimumVersion` (example "2.1.193"): refuses to start below the approved version floor.
- Caveat: "Each deny rule removes some capability", so balance against the repo's data classification.

Metrics:
- **Leading**: time spent waiting on each approval gate (OpenTelemetry export records every hook decision with timestamp and allow/block verdict).
- **Lagging**: gate violations reaching production before and after hooks (incident tracker).

### Lesson 12: CI/CD integration and deployment (Stage 5: Deploy)

Key ideas:
- Run Claude Code non-interactively inside the pipeline, sandbox execution, expose deployment through MCP integrations, and "rehearse the rollback paths before the agent ever needs them".

What changes:
- **Traditional**: pipelines run deterministic scripts, and anything needing judgment (triaging a flaky test, writing the changelog, diagnosing a broken build) waits for a human. Deployment and rollback are runbooks followed under pressure.
- **AI-native**: Claude runs non-interactively in the pipeline for judgment steps, in a sandbox with scoped credentials. Deployment tooling is exposed via MCP, so the workflow that wrote and tested the change can also ship and roll it back, inside gates the org defines per environment.

Getting started:
- Prerequisites: AI in the PR review loop and hooks as approval gates, "because the gates must exist before automation accelerates anything through them".
- Infrastructure:
  - A CI platform with `claude-code-action`, or any runner that can call `claude -p`.
  - Model access via API, Bedrock, Foundry, or Vertex where traffic must stay on the org's cloud agreement.
  - MCP servers for deployment targets.
  - A sandbox profile for agent jobs with no standing production credentials.

Steps (6):
1. The platform engineer starts with read-only judgment steps via `claude -p`: triage a failed build, summarize a flaky test, draft the changelog.
2. Add write steps behind existing gates: fix lint, update generated docs, address review comments via `@claude`. Everything the agent writes arrives as a PR through branch protection. "The agent has no route to push to main."
3. Sandbox execution: containers under a network policy, short-lived scoped tokens, no production credentials by default.
4. Expose deployment through MCP: deploy, status, and rollback become tools scoped per environment, an allowlist rather than a shell script with credentials.
5. Tier autonomy by environment: dev deploys freely, production has the agent prepare the release while the release manager authorizes it (enforced by a hook), staging is in the middle.
6. Rollback should be "the most rehearsed path in the pipeline": a single command the agent can run, exercised regularly in staging. The Stage 6 loop calls it when a band is breached.

Example artifacts:
- A pipeline step "Triage failed build", with `if: failure()`, that uses `claude -p` to read the build log, name the likely cause, say whether it looks flaky or real, and write a three-line summary for the PR thread.
- `.mcp.json` with three HTTP MCP servers, `deploy-dev`, `deploy-staging`, `deploy-prod`, each with its own bearer token env var.
  - A rule that allows an MCP tool names the server and tool, not the arguments, so a separate server per environment is what lets an allowlist tell staging from production.
- Three tools per server:

| Tool | Input | Returns |
|---|---|---|
| `release` | `version`, and in production a `ticket` | the release ID once the rollout finishes |
| `status` | none | waits until five minutes after the last release, then returns each endpoint's 5xx rate over that time |
| `rollback` | none | the version that is live again |

- A staging job that runs on push to `main`. It holds only the staging token and pre-approves only the three staging tools, with `--permission-mode dontAsk`. It releases the commit SHA, calls status, rolls back if any endpoint's 5xx rate is over 1%, and writes three release-notes lines.
- In `dontAsk` mode, any call that would prompt is denied, so a tool not on the list is refused and the job never waits.

Autonomy tiers table:

| Env | Tools on allowlist | What happens to `release` | Who approves |
|---|---|---|---|
| Dev | release, status, rollback | hook allows | nobody |
| Staging | release, status, rollback | hook asks, or allows from pipeline on main | the engineer, or the approved merge |
| Production | status, rollback | denied unless the hook allows | release manager, via change ticket |

- In production, `release` is off the allowlist, so the hook's `allow` is the only way through. Production "fails closed" (a release is denied if the hook fails to run). `rollback` stays allowed because it is "a runbook approved in advance".
- Managed settings interplay: with `allowManagedHooksOnly` the hook must be in managed settings. With `allowManagedMcpServersOnly` the servers must be on the managed allowlist.

Governance: "The agent may act up to the production gate and cannot pass it." Controls:
- Branch protection: everything the agent writes becomes a PR.
- Production deploy hook: blocks release until a named release manager authorizes. Each non-interactive run acts under the agent's own identity, so logs separate agent actions from the triggering engineer's.
- Per-environment permission tiers.

Metrics:
- **Leading**: share of pipeline failures triaged without paging a human (CI/CD logs).
- **Lagging**: DORA (DevOps Research and Assessment) measures, already emitted by CI and deployment tooling.

### Lesson 13: Closing the loop on metrics (Stage 6: Maintain)

Key ideas:
- Every earlier stage needs a person to start it. Stage 6 "shifts the focus to autonomous running of Claude to close the loop". For example, a monitoring agent, off the back of a raised bug ticket, creates an `intent.md` and flows through requirements, plan, build, test, and review.
- Stage 6 "runs headless, with an independent confidence gate between stages", either a deterministic check or an adversarial reviewing agent. The gate decides whether the previous stage's output continues or escalates to a human.

What changes:
- **Traditional**: maintenance is reactive. Alerts at 3 a.m. can be missed, tickets sit in the backlog, and post-mortem actions may never reach the codebase.
- **AI-native**: a trigger (control-band breach, ticket, channel message, schedule) invokes Claude with no person in the path. Claude diagnoses, acts only through gated routes, and writes findings as `intent.md`, which goes through the stages. "People triage and review that work, and no longer have to start it."
- A deterministic script watches production and invokes Claude when a band is breached.

What a control band is (the course's definition):
- A range around a metric's normal level. The detection script takes the baseline as the mean of the last **30 days of hourly readings**, and computes sigma (σ), the standard deviation. The 1σ band ends at mean plus one σ, 2σ at mean plus two, and so on.
- For a steady, bell-curve metric: about 1 in 6 readings lands above 1σ, 1 in 44 above 2σ, and 1 in 740 above 3σ. At 720 readings a month, that is about 4 per day above 1σ, 16 per month above 2σ, and 1 per month above 3σ by chance alone. That is why 1σ only logs, and why even 3σ is held to gated routes.
- Western Electric rules (from a 1956 quality control handbook) catch slow drift that may never cross 3σ: four of the last five readings above 1σ, or eight in a row above the mean.

Getting started:
- Prerequisites: `intent.md` (a structured output to restart the loop), Claude-accelerated PR reviews, hooks as an action boundary, and a rollback path for CI/CD (used by the highest autonomy tier).
- Infrastructure: a metrics store the detection script can query (Prometheus, CI system API, or equivalent), read access to the repo, a way to run Claude Code non-interactively in CI, or the Agent SDK for a service receiving webhooks.

Steps (7):
1. The service owner or platform engineer picks one metric with a stable rolling baseline (CI test failure rate, post-deploy 5xx rate, PR cycle time).
2. Write the detection script: mean and standard deviation over a rolling window, with rules (Western Electric or similar) so it catches slow drift as well as spikes. It is version controlled and unit tested. "Detection stays entirely deterministic, with no model involved."
3. Define response tiers in version-controlled config (`bands.yaml`). **1σ: only log. 2σ: invoke Claude read-only to diagnose. 3σ: Claude may act, only by opening a PR into the review gate or triggering a pre-approved runbook.** A drift rule counts as 2σ.
4. The trigger layer can be a scheduled GitHub or GitLab workflow, a webhook from existing monitoring, or a cron job in-network. Claude runs stateless, either as a non-interactive CI step or as an Agent SDK service in a sandboxed container.
5. The agent writes its diagnosis as `intent.md` in the Stage 1 format: the anomaly and evidence, a proposed outcome, affected systems, and open questions.
6. The service owner or on-call engineer triages the queue and routes product-facing findings to the product owner: fix now, schedule, or dismiss. Dismissals tune the bands and reduce noise.
7. When a fix ships, add an eval for the incident (the evals play).

Example `bands.yaml` (monitoring CI test failure rate):
- `metric: ci_test_failure_rate`, `baseline: rolling_30d`, `rules: western_electric`.
- Tiers: `1sigma: { action: log }`; `2sigma: { action: diagnose, tools: "Read,Grep,Bash(gh run view *)" }`; `3sigma: { action: propose, routes: [pull_request, runbook:rollback-deploy] }`.
- The same file is applied to a production metric by changing only the first line to `metric: status_5xx_rate` (5xx rate on the claim status endpoint).

Detection script: about 33 lines of Python, standard library only.
- It takes 30 days of hourly readings on stdin and prints the worst tier that the newest reading lands in.
- Rules in order: above 3σ (tier 3σ); above 2σ (2σ); drift of 4 of 5 above 1σ (2σ); drift of 8 in a row above the mean (2σ); above 1σ (1σ).
- It uses a minimum sigma floor so a flat baseline does not make every blip a breach. It requires at least a day of baseline readings.
- A scheduled job runs it hourly, looks up the tier in `bands.yaml`, and starts Claude with that tier's tools or routes. For `propose` the allowlist holds `gh pr create` plus the one command that triggers the runbook.

Worked incident (insurer):
- A release at 13:52 sets the status panel's cache to zero. Every page view then hits `claims-core`, which allows 50 req/s and starts refusing.
- At 14:00 the script prints a 3σ tier: reading 1.9, mean 0.2, sigma 0.02.
- 3σ maps to `propose`, and a release went out minutes earlier, so the agent runs the pre-approved `rollback-deploy` runbook. It then writes an `intent.md` ("status endpoint 5xx after release 4f2c9e1").
  - Header: "Author: monitoring agent (status_5xx_rate, 3 sigma). Status: draft."
  - Sections: Problem, Proposed outcome, Affected users and systems, Constraints, **Action already taken** (an extra section here: rollback ran at 14:02, version 8c41d07 live again at 14:04), Open questions (who asked for live status, and is 60 seconds too slow).
- Afterwards an eval `status-panel-keeps-its-cache` is added: it uses `from` set to the commit before the bad release, the prompt "make it feel live", and a check that `CACHE_SECONDS` is still non-zero.

Governance: tier boundaries are enforced from version-controlled config, with permissions and managed settings denying production access. Invocations, findings, and triage decisions are timestamped. A service owner triages and approves findings. Resulting changes go through the normal PR gate. Runbooks the agent may trigger are approved in advance.

Metrics:
- **Leading**: time from band breach to an `intent.md` in the triage queue, versus the old time from incident to post-mortem action (the detection script's log has the breach timestamp and tier).
- **Lagging**: the share of findings that become merged fixes, and repeat incidents of the same class (which should fall as the evals grow).

Examples listed in the lesson:
- When CI test failure rate breaches 3σ: the agent quarantines the flaky test or opens a revert PR, and the review gate decides.
- When post-deploy 5xx rate breaches 3σ with a deployment in the window: the agent triggers the existing rollback pipeline.
- When PR cycle time trips a drift rule: the agent writes a report for engineering leadership. This shows the harness works for process metrics as well as production metrics.

Sub-section **Claude on call with Claude Tag** (public beta, currently in Slack; the lesson also mentions Microsoft Teams as an example of workplace apps where incidents can arrive):
- Claude becomes a member of incident channels under its own identity, so each incident gets a first responder, and the response becomes part of the loop and memory.
- The conversation and institutional knowledge stay in the channel. Anyone in the channel can guide the response, and channel history adds to auditability.
- Via MCP, Claude verifies the metric is back at baseline and confirms it in the thread. It writes the post-mortem to a version-controlled lessons file that future investigations read.
- It also takes on non-incident work. Tagged on a ticket over MCP or asked in the channel, Claude triages: a small, well-bounded fix arrives as a PR through the review gate, and anything larger becomes an `intent.md` for Stage 1. "At which point the loop starts feeding itself."

### Lesson 14: Closing thoughts and resources

- Closing: models and harnesses now allow transforming the entire SDLC, not just code production. The transformation keeps "human judgment central" and respects the governance and regulation needs of large enterprises. The guide consolidates best practices of Anthropic's Applied AI team.
- Resources, "in roughly the order you would roll them out" (all docs.claude.com-family links, all opened as links only, not fetched):
  1. Set up Claude Code for your organization (admin decision map; start here): https://code.claude.com/docs/en/admin-setup
  2. Settings reference and precedence, including managed-only keys: https://code.claude.com/docs/en/settings
  3. Server-managed settings from the admin console: https://code.claude.com/docs/en/server-managed-settings
  4. Permissions: https://code.claude.com/docs/en/permissions
  5. Sandboxing: https://code.claude.com/docs/en/sandboxing
  6. Hooks guide https://code.claude.com/docs/en/hooks-guide and hooks reference https://code.claude.com/docs/en/hooks
  7. Skills: https://code.claude.com/docs/en/skills
  8. Plugins and private marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
  9. Managed MCP: https://code.claude.com/docs/en/managed-mcp
  10. Enterprise deployment overview (Bedrock, Vertex AI, Foundry): https://code.claude.com/docs/en/third-party-integrations
  11. Enterprise network configuration: https://code.claude.com/docs/en/network-config
  12. Monitoring (OpenTelemetry) https://code.claude.com/docs/en/monitoring-usage and analytics dashboard https://code.claude.com/docs/en/analytics
  13. Compliance API: https://platform.claude.com/docs/en/manage-claude/compliance-api
  14. Security model: https://code.claude.com/docs/en/security

### Page 15: Course complete

Empty. Nothing to report.

## 4. Roles ("who does what"), consolidated

| Role | Does |
|---|---|
| Originator (any employee) | Brainstorms with Claude and corrects the draft `intent.md`. |
| Product owner | Reviews and corrects `intent.md`. Accepts or closes it. Reviews `spec.md` (does not write it). Resolves flagged concerns with policy owners. Decides whether spec and intent go to build. Triages product-facing findings from Stage 6. Mocks up front-end designs in Claude Design. |
| Claude (agent) | Interviews the originator and drafts `intent.md`. Writes `spec.md` with skills applied. Drafts `plan.md` in plan mode. Implements. Verifies its own work. Reviews PRs. Addresses `@claude` comments. Triages builds. Diagnoses breaches and writes `intent.md`. Acts only via gated routes. |
| Policy owners | Own the source of truth for each skill. Sign off skill changes. Receive flagged concerns. |
| Tech lead / architect | Signs off the template skill (lead). Approves higher-risk plans and specs. Writes `REVIEW.md`. Sets the human threshold. Tunes review monthly. |
| Engineer | Corrects and accepts `plan.md`. Runs plan mode and sessions. Sets up the feedback loop. Runs parallel sessions and steers or reviews them. Writes skills from the policy owner's source. Owns CLAUDE.md corrections. |
| Platform engineer / platform team | Stands up the intent home. Collects 20-50 evals and runs CI. Expresses approval gates as hooks. Deploys managed settings. Builds the CI/CD, MCP, and sandbox setup. Writes the detection script. |
| Engineering leadership + change management + compliance | List the human approval gates that must survive. |
| Release manager | Authorizes production release via change ticket. |
| Code owner | Approves PRs through branch protection. |
| Service owner / on-call | Triages the Stage 6 intent queue (fix now, schedule, or dismiss). |
| Org Owner (Claude org) | Enables the managed Code Review service. |

## 5. Blog-only content **[blog summary]** (not on the academy pages; summarised by the fetch tool, so treat as lower confidence)

- Blog metadata: published August 21, 2026, by Louis Claxton, with a downloadable PDF version ("the same six stages, plays, and worked examples").
- Blog Test section: a verifier subagent as a final check in a fresh context; use a one-command check such as `make test`; failing test first for bugs; screenshot compare for UI. The blog says evals are a suite of 20 to 50 real tasks run on a schedule and on config changes, and "Each production incident becomes a new eval". This matches the academy.
- Blog Deploy section: `REVIEW.md` with passes, severities, and a nit cap. Managed settings example for regulated enterprises. CI/CD with autonomy tiered by environment and rehearsed rollback. All match the academy text.
- **Blog-only (not in the academy lessons I read): "Recurring security scans".** Scheduled scanning of connected repos through **Claude Security**, with validated findings and confidence ratings. Small fixes go through the review gate and larger issues become `intent.md`. The product list in the blog nav includes Claude Security, but I have not verified this section against verbatim text.
- Blog closing line (as summarised): "The loop keeps running. Human judgement stays above it."
- Blog sidebar "Legacy systems and the source of truth" appears in the blog's Build section, but in the academy it is inside the plan-mode lesson.
- The blog marks Claude Design as "beta" and Claude Tag as "public beta".

## 6. The transition path from traditional to AI-native SDLC (as the course lays it out)

There is no single fixed sequence. The course says explicitly that the plays are "modular", the six stages are "non-linear", and organizations "may choose to prioritize transforming different stages at different times". The ordering comes from the dependency graph. The only fixed pieces are the prerequisites and the end-state description.

Phases, derived directly from the dependency graph rows (my labelling, "phase" is not the course's word; the course uses "rows"):

1. **Start anywhere in Row 1 (no prerequisites)**: Capture as intent.md; Claude Code plan mode; CLAUDE.md; Skills (CLAUDE.md helps but is not required); Feedback loop; Hooks as approval gates. In practice the course suggests:
   - Foundational knowledge files first: `CLAUDE.md`, skills.
   - Guardrails: hooks, feedback loop.
   - Workflow artifacts: `intent.md`, plan mode.
2. **Row 2**: Parallel sessions and subagents (needs `CLAUDE.md`; feedback loop helps). Continuous evals (needs `CLAUDE.md` and the feedback loop).
3. **Row 3**: Requirements and design (needs Capture intent and Skills). AI in the PR review loop (needs Evals and Subagents; Skills help).
4. **Row 4**: CI/CD integration and deployment (needs PR review and Hooks).
5. **Row 5**: Closing the loop on metrics (needs CI/CD and Capture intent).

Course-stated principles for the transition:
- Prompt each step by hand first. The end state is a loop where each accepted artifact fires the next gate, and human attention concentrates at the gates.
- Run first as a manual prompt, then codify as an org-level slash command, then trigger on merge of the previous artifact (the Requirements and design lesson).
- CI/CD: start with read-only judgment steps, then add write steps behind existing gates, then expose deployment through MCP, then tier autonomy by environment. The gates must exist before automation accelerates anything through them (hence the prerequisite of PR review and hooks).
- Auto mode becomes the default for routine work only once guardrails mature: a tuned `CLAUDE.md`, skills that encode policy, hooks that block unsafe actions, and a test suite Claude can run.
- Parallel sessions: start with 2-3 sessions and add more only while review keeps up.
- Legacy tools: start with linkage as the minimum bar (artifacts note the record ID, legacy records carry the commit SHA). Then pick one source of truth per artifact (repo or legacy system).
- Skills first target one inconsistently enforced policy with a named owner.
- Stage 6 first targets one metric with a stable rolling baseline.
- The resources lesson gives docs "in roughly the order you would roll them out" for the admin controls (listed above), starting with admin-setup.
- "Most organizations sit somewhere between the two columns" of the shift table.

**Gaps and unclear items to be aware of:**
- The course has **no named maturity levels**, no numbered adoption phases, and no formal checklist of its own. The "phases" above come from the dependency graph. No explicit timeframes or targets are given. The only numeric guidance is: 20-50 evals, 2-3 parallel sessions to start, the CLAUDE.md "under a page", at most 5 nits per review, a 30-day rolling baseline, 1σ/2σ/3σ tiers, a 60-second cache in the example, and the 1% 5xx threshold in the staging job.
- Metrics are all expressed as leading/lagging pairs per play. There are no benchmark numbers beyond the qualitative expectations "from multi-week to hours" (intent capture) and "fall to minutes" (time to first review).
- Whether the course has a final checklist or maturity model was not visible. The /complete page is empty. The dependency graph itself is an image and I have only its alt text.
- I could not see images (diagrams on the blog page). Treat the stage diagram as unviewed.
- The "regulated and critical code" that still gets human review is not defined in the lessons I read.
- A few minor wording differences exist between the blog and academy versions (for example, the blog has "Stage 6: Maintenance" in places, the academy "Maintain"). Names in this report follow the academy.

## Final URLs read

- https://academy.claude.com/courses/ai-native-sdlc-playbook (and each lesson slug above)
- https://claude.com/blog/the-ai-native-sdlc-playbook (partial verbatim, rest summarised)

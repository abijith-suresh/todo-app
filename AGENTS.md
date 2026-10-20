# todo-app — agent brief

A lightweight, browser-based capture tool for small things you need to remember at work. Not a task manager: you add something, get back to what you were doing, and old items fade out on their own after 7 days. Built as a portfolio project, entirely client-side.

## The Project

Core promise: capture fast and keep the view small. This is a short-term holding area, not a system of record; a full task manager is the wrong tool for these items.

Non-negotiables:

- Aging is automatic after 7 days. The window is fixed, not a setting.
- Fading never destroys anything: older items remain searchable and recoverable.
- No counts, dashboards, streaks, or scores. The interface stays calm.
- No backend, accounts, sync, or analytics. Data stays in the browser.
- Out of scope by design: projects, tags, priorities, due dates, reminders, recurring items, notes, attachments, collaboration.

Status: dormant — portfolio project; no active feature work, but keep it building.

## How I Work Here

- Verification: run `bun run verify` before handoff and add focused tests for behavior you change. CI is the backstop.
- Commits: Conventional Commits; types live in `commitlint.config.ts`. Squash merges; never commit to main.
- Pull requests: one focused change per PR. Open it and leave merging to the owner.
- Package manager: Bun. Do not add npm or pnpm lockfiles.
- Releases: release-please owns versions and `CHANGELOG.md`; do not hand-edit either.

## Sources of Truth

| Fact | Where |
|---|---|
| Product intent | § The Project (this file) |
| Runtime behavior | code + tests |
| Commands & deps | `package.json` |
| Commit rules | `commitlint.config.ts` |

Code and tests are the authority; this file never overrides executable truth.

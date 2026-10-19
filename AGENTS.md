# todo-app — agent brief

A one-keystroke capture tool for small work to-dos: static Astro marketing pages plus one Solid island, entirely client-side.

## The Project

Core promise: capture a small work item in seconds — add it, get back to what you were doing, and let it fade into a searchable archive after 7 days. The tool should never feel like a graveyard of unfinished tasks.

Non-goals: task-manager structure (projects, tags, priorities, due dates, reminders, recurring items), notes/attachments/rich text, accounts/teams/sync, and metrics, streaks, or counts.

Status: dormant — portfolio project, no active feature work; keep the build green.

Behavioral contract:

- Tasks have status `active | dormant | completed` and timestamps `createdAt`, `activatedAt`, `updatedAt`, `completedAt`, `dormantAt`. The UI exposes only title and completion.
- Active tasks become dormant at local midnight once 7 days have passed since `activatedAt` (Monday activation → dormant the following Monday at 00:00). The window is fixed, not a setting.
- Aging runs on app load and on `visibilitychange` when the tab becomes visible. It only moves `active` → `dormant`; it never deletes.
- Recovery (`dormant` → `active`) resets `activatedAt`, clears `dormantAt`, keeps `createdAt`, and needs no confirmation.
- Completed tasks show under "Done today" only when `completedAt` is on the current local calendar day. Older completions leave the main view but stay searchable.
- Capture trims input; empty or whitespace-only submissions are no-ops; the input clears and refocuses. Inline edit: Enter saves, Escape cancels, an empty title cancels and reverts.
- Search opens with `Cmd/Ctrl + K`; matching is a case-insensitive substring on title. Groups appear only when non-empty, labeled "Active", "Earlier", "Completed". Selecting "Earlier" recovers; "Active" closes search; "Completed" is display-only.
- No task counts, dashboards, charts, streaks, or scores in the UI. Keep labels exactly "Done today", "Active", "Earlier", "Completed", and the interface calm and lightweight.

## How I Work Here

- Quality gate: `verify` — run `bun run verify` before handoff. It chains type-check, lint, format check, tests, and build.
- Commits: Conventional Commits; types live in `commitlint.config.ts`. Squash merges; never commit to main. Hooks run commitlint and lint-staged (Biome); headers max 72 chars, no trailing period.
- Package manager is Bun (`bun.lock`, `packageManager`); do not introduce npm or pnpm lockfiles.
- Persistence is IndexedDB — database `todo-app-db`, object store `tasks` keyed by `id` — behind the `TodoStorage` interface. Do not describe it as localStorage.
- All task mutations go through `src/state/app-store.tsx`; updates are optimistic and roll back on a failed write. Do not add a second state path or storage wrapper.
- No network calls, backend, accounts, analytics, or sync. Astro `output` is `"static"`; `/app` is mounted with `client:only="solid-js"`.
- Tests are colocated `*.test.ts` files run by Vitest in a node environment; storage tests fake IndexedDB with `fake-indexeddb`. `passWithNoTests` is on, so a green test run alone does not prove coverage.
- Releases come from Conventional Commits through release-please; do not hand-edit versions or `CHANGELOG.md`.
- `@/` maps to `src/` in Astro, TypeScript, and Vitest.

## Sources of Truth

| Fact | Where |
|---|---|
| Product intent | § The Project (this file) |
| Runtime behavior | code + colocated tests |
| Commands & deps | `package.json` |
| Commit rules | `commitlint.config.ts` |
| Storage schema | `src/storage/database.ts` |

Code and tests are the authority; this file never overrides executable truth.

## Getting Around

- `src/pages/` — Astro routes: `/`, `/about`, `/features` (static marketing) and `/app` (island host).
- `src/islands/TodoIsland.tsx` — mounts `AppProvider` + `TodoApp` as the client-only app entry.
- `src/features/todo/` — app UI: quick add, main list, "Done today", search, task rows.
- `src/state/app-store.tsx` — Solid signals and context: all task mutations, search state, hydration, aging checks.
- `src/lib/` — task model (`types.ts`), aging and search helpers (`task-utils.ts`), local-date math (`date.ts`), ids, exit animation.
- `src/storage/` — `TodoStorage` implementation over IndexedDB, plus its test.
- `src/components/` — shared UI: Astro marketing sections and Solid controls. `src/layouts/` has the page shells; `src/styles/` holds the Tailwind entry and design tokens.

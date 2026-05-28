# todo-app

A local-first work todo app built with Astro, SolidJS, TypeScript, Tailwind CSS, Bun, IndexedDB, `@thisbeyond/solid-dnd`, and `fuse.js`.

## Features

- Inbox, Today, Upcoming, and project views
- Independent **When** and **Due** dates
- IndexedDB-backed tasks and projects with a clean storage wrapper
- Quick add with context-aware defaults
- Task detail panel with inline editing
- Drag-and-drop task and project ordering with persisted `sortOrder`
- Keyboard shortcuts inspired by Things 3
- Fuzzy search command palette (`Cmd+K` / `Ctrl+K`)
- Theme toggle, JSON export/import, and shortcuts reference
- Astro landing pages at `/`, `/about`, and `/features`
- Existing Solid app preserved as a client-only island at `/app`
- Bun-based CI, Husky hooks, release-please, PR title checks, and Dependabot

## Scripts

```bash
bun install
bun run dev
bun run verify
```

`bun run dev` starts the Astro site. The interactive todo app is available at `http://localhost:4321/app`.

## Deployment

- Static output via Astro
- `vercel.json` is configured for Bun + static hosting
- The repository is linked to Vercel and live at `https://todo-app-tau-red-68.vercel.app`
- The GitHub repository homepage now points at the live deployment

## Releases

- `release-please` now uses `googleapis/release-please-action@v5`
- The workflow uses `RELEASE_PLEASE_TOKEN` when present and falls back to the default GitHub token
- If your repository disables pull request creation for GitHub Actions, a maintainer still needs to enable that repository setting or provide a token with pull request permissions

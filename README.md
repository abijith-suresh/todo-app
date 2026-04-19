# todo-app

A local-first work todo app built with SolidJS, TypeScript, Tailwind CSS, Bun, IndexedDB, `@thisbeyond/solid-dnd`, and `fuse.js`.

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
- Bun-based CI, Husky hooks, release-please, PR title checks, and Dependabot

## Scripts

```bash
bun install
bun run dev
bun run verify
```

## Deployment

- Static output via Vite
- `vercel.json` is configured for Bun + static hosting

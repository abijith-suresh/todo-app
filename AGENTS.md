# Agent Context

This is a client-side web app built with Astro.js, Solid.js, and Tailwind CSS.
There is no backend, no server, no database, and no accounts. All data is stored in localStorage.

## Stack

| Tool         | Role                          |
| ------------ | ----------------------------- |
| Astro.js     | Framework and routing         |
| Solid.js     | Interactive UI (`/app` route) |
| Tailwind CSS | Styling                       |
| localStorage | All persistent data           |

## Repo structure

```
src/
  pages/        — Astro pages (marketing routes + /app)
  components/   — Shared Astro components
  islands/      — Solid.js interactive components
  styles/       — Global styles
docs/
  PRODUCT.md    — What this is, philosophy, user stories, non-goals
  SPEC.md       — Behavioral spec: item model, states, workflows, UI rules
  DECISIONS.md  — Technical decisions and reasoning
```

## Key constraints

- No backend. No API calls. No accounts. No sync.
- All app state lives in localStorage.
- The `/app` route is a Solid.js island inside an Astro shell page.
- The marketing routes (`/`, `/about`, `/features`) are static Astro pages.

## Before making changes

- Read **[docs/SPEC.md](docs/SPEC.md)** before touching any app logic — it is the behavioral contract.
- Read **[docs/PRODUCT.md](docs/PRODUCT.md)** if a change affects product scope or philosophy.
- Read **[docs/DECISIONS.md](docs/DECISIONS.md)** if a change involves the tech stack or a previously decided design choice.

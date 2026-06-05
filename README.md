# todo-app

A lightweight, browser-based capture tool for things you need to remember at work.

Not a task manager. You add something, get back to what you were doing, and old items fade out on their own after 7 days. Nothing is permanently deleted — faded items sit in a searchable archive and can be recovered at any time.

Built as a portfolio project. Entirely client-side — no backend, no accounts, no sync.

---

## Stack

- **Astro.js** — framework and routing
- **Solid.js** — interactive app UI
- **Tailwind CSS** — styling
- **IndexedDB** — all data lives in the browser

## Running locally

```bash
bun install
bun run dev
```

Open `http://localhost:4321` in your browser.

## Docs

- [Product](docs/PRODUCT.md) — what this is and why it exists
- [Spec](docs/SPEC.md) — how the app behaves
- [Decisions](docs/DECISIONS.md) — technical choices and reasoning

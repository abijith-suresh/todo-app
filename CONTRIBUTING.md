# Contributing to todo-app

## Setup

Install dependencies and start the Astro dev server with Bun:

```sh
bun install
bun run dev
```

The app runs at `http://localhost:4321`.

## Quality gate

Run `bun run verify` before handoff; add focused tests for what you touched and
leave the full suite to CI.

## Commits and pull requests

- Branch from the latest `main`; never commit directly to `main`.
- Use Conventional Commits. Allowed types live in `commitlint.config.ts`.
- Keep each PR focused and leave merging to the owner. The expected merge strategy
  is squash.
- Use Bun. Do not add npm or pnpm lockfiles.

## Changelog and releases

Release Please owns versions and `CHANGELOG.md`; do not hand-edit either and do
not add changelog entries by hand.

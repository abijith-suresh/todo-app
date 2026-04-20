# Plan — Sixth-Pass UI Polish

## Goal

Fix five categories of visual and UX issues across the project header, completed
tasks section, task completion interaction, and animation smoothness. Raise the
app to Things 3 / Todoist quality.

## Constraints

- Design language: warm notebook turned digital — cream/beige backgrounds, warm
  typography, royal-blue accent (`--color-*` tokens everywhere).
- No data model changes.
- Use `lucide-solid` for icons.
- No hardcoded colours — only CSS variables.
- Commit all prior uncommitted work first, then new changes in logical commits.

## Issues Being Fixed

| #   | Area                         | Problem                                                      | Fix                                                                 |
| --- | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | Project header               | Circle checkbox not aligned to title; border too thin        | `mt-[5px]` on checkbox; 2 px border via `.task-checkbox`            |
| 2   | Task checkboxes              | Border too thin, looks insubstantial                         | `.task-checkbox` border → 2 px                                      |
| 3   | Completed section header     | Dashed border box; green circle icon — both wrong aesthetic  | Remove dashed border; new inline "Completed ──── 3 ▾" divider row   |
| 4   | Completed task rows          | Filled green checkbox makes rows feel active, not ghost      | Remove checkbox; make row a button with hover undo (↩) icon         |
| 5   | Completion cancel            | Can't undo a checked task during the 720 ms animation        | Store timeout IDs; expose `cancelComplete`; checkbox toggles cancel |
| 6   | Animation jank (empty state) | Empty message + completed section both pop in simultaneously | Two separate `Show` blocks; empty message fades-in-up with delay    |
| 7   | Animation jank (reopen)      | Reopened task appears instantly in list                      | Exit animation on completed row before calling `reopenTask`         |
| 8   | Completed section visibility | Shows in Inbox / Today — should be project-only              | Restrict `completedViewTasks` and `Show` condition to project view  |

## Architecture Decisions

### Cancel during animation

`completeTask` stores the `setTimeout` ID in a `Map<string, number>` (non-reactive,
lives inside `AppProvider`). A new `cancelComplete(taskId)` clears the timer and
removes the task from `completingTaskIds`. `TaskRow` checkbox: if task is completing
→ call `cancelComplete`; else → call `completeTask`.  
`pointer-events: none` is removed from `.task-row-completing` so the checkbox is
clickable during the animation.

### Completed section header — inline divider

```
Completed  ──────────────────────  3  ▾
```

No border around the button. "Completed" is muted text. A `flex:1` `<span>` has
`border-top:1px solid var(--color-border-subtle)` to act as the ruler. Count and
chevron on the right.

### Completed task rows — ghost buttons

No checkbox. The row is a `<button>` that calls `onReopen` (after a 200 ms exit
animation). On hover, a small `Undo2` icon appears at the right edge.

### Empty state animation

Uses two sibling `<Show>` blocks so the task list and the empty state are
independent. The empty state `<div>` has class `empty-state-message` which applies
`animation: empty-fade-up 380ms 120ms both ease` — 120 ms delay ensures the
completing row's own animation finishes visually before the message arrives.

### Completed section — project view only

`completedViewTasks` in the store returns `[]` for every view except `project`.
The `Show` in `App.tsx` also checks `activeView().type === "project"` as a belt-
and-suspenders guard.

## Phases

### Phase 0 — Commit existing uncommitted work

Eight commits covering fifth-pass changes already in the working tree.

### Phase 1 — Checkbox alignment & boldness

Files: `App.tsx`, `index.css`

### Phase 2 — Completed section redesign

Files: `icons.tsx`, `CompletedTasksSection.tsx`, `index.css`

### Phase 3 — Instant cancel during completion animation

Files: `app-store.tsx`, `TaskRow.tsx`, `index.css`

### Phase 4 — Smooth empty-state & reopen transitions

Files: `App.tsx`, `CompletedTasksSection.tsx`, `index.css`

### Phase 5 — Restrict completed section to project views

Files: `app-store.tsx`, `App.tsx`

## Files Changed

| File                                       | Changes                                                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `src/components/icons.tsx`                 | Add `Undo2Icon`                                                                              |
| `src/App.tsx`                              | Fix header checkbox mt; split `Show` blocks; restrict completed section                      |
| `src/state/app-store.tsx`                  | `completionTimers` map; `cancelComplete`; restrict `completedViewTasks`                      |
| `src/components/TaskRow.tsx`               | `checked={isCompleting()}`; toggle cancel/complete                                           |
| `src/components/CompletedTasksSection.tsx` | New header; ghost rows; exit animation                                                       |
| `src/index.css`                            | 2 px checkbox border; completed section styles; empty-state animation; remove pointer-events |

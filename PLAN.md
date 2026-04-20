# PLAN.md

## Goal

Fourth-pass UI polish — strip text date labels from task rows (icon-only urgency), auto-roll
stale `whenDate` values to today on app load, replace all `window.confirm()` with a custom
modal, move project completion to a round checkbox beside the title, rebuild the detail panel
project selector as a custom dropdown, improve the detail panel layout, and bring the dark mode
up to Things 3 / Todoist quality.

## Design Reference

**Things 3 and Todoist** — benchmarks for clarity and restraint:

- **Date indicators on rows**: No text chips. Todoist and Things 3 both use compact icons /
  colored badges, never "Due Tomorrow" prose on a list row. In the Upcoming view the group
  header already states the date — a chip on every row is redundant noise.
- **Urgency without backgrounds**: Things 3 and Todoist signal overdue/due-today via icon color
  alone. Red icon on a neutral row is far less intrusive than a red tinted row background.
- **Confirm dialogs**: Both apps use custom in-app modals for destructive actions — never the
  browser's native alert which breaks the visual contract.
- **Project completion**: Things 3 shows a project as a list item with a completion circle on
  the left, consistent with task rows. A small ghost button in the corner reads as "edit action"
  not "primary action."
- **Dark mode**: Things 3 uses clean near-black with clear surface separation, higher text
  contrast, and vivid (not muted) accents. Todoist dark is similar. Our current dark palette is
  too muddy — insufficient contrast between layers, urgency backgrounds nearly invisible.

## Design Tokens (always use — never hardcode)

`--color-accent`, `--color-accent-subtle`, `--color-bg-surface`, `--color-bg-input`,
`--color-bg-base`, `--color-border-subtle`, `--color-border-default`, `--color-border-focus`,
`--color-text-primary/secondary/tertiary`, `--color-success`, `--color-urgency-*`, `--color-star`

---

## Steps

### 1. `src/components/icons.tsx` — Add ChevronDownIcon

- Import `ChevronDown` from `lucide-solid`. Export as `ChevronDownIcon`.
- Used in the custom project dropdown in DetailPanel.

---

### 2. `src/index.css` — Dark mode token revision + new component styles

#### 2a. Revise `[data-theme="dark"]` tokens

Current dark palette is too muddy: surfaces are barely distinguishable, urgency backgrounds are
near-invisible, text contrast is weak, accent is too dim. Revise every token:

```css
[data-theme="dark"] {
  color-scheme: dark;

  /* Backgrounds — clear 3-layer separation */
  --color-bg-base: #1a1917; /* warm near-black (was #1b1916) */
  --color-bg-surface: #242220; /* sidebar / card surface (was #242119) */
  --color-bg-elevated: #2d2a27; /* elevated cards (was #2d2a26) */
  --color-bg-input: #201f1c; /* inputs / subtle fills (was #1f1d1a) */

  /* Text — stronger contrast */
  --color-text-primary: #f2ede6; /* warm white (was #f4f1ec) */
  --color-text-secondary: #b0a89e; /* clearer mid-tone (was #9e9892) */
  --color-text-tertiary: #746b62; /* more visible (was #6e6862) */

  /* Borders — slightly more visible */
  --color-border-subtle: #2c2a26; /* (was #2e2b27) */
  --color-border-default: #3e3b36; /* (was #3d3a35) */
  --color-border-focus: #6699ff; /* brighter focus ring for dark bg (was #5590ff) */

  /* Accent — brighter for dark bg */
  --color-accent: #5b8fff; /* (was #4d83ff) */
  --color-accent-hover: #4d84f5; /* (was #3d76f5) */
  --color-accent-subtle: #1e2f4a; /* more visible blue tint (was #1a2640) */

  /* Urgency — far more visible than before */
  --color-urgency-amber: #f59e0b; /* keep */
  --color-urgency-amber-bg: #2a1e00; /* more amber (was #1c1800) */
  --color-urgency-red: #ff7070; /* more vivid (was #f87171) */
  --color-urgency-red-bg: #2d1010; /* more visible (was #1f0c0c) */

  /* Success & star */
  --color-success: #4ade80; /* brighter green (was #34d399) */
  --color-star: #fbbf24; /* keep */

  /* Scrollbar */
  --scrollbar-thumb: rgba(116, 107, 98, 0.45);
  --scrollbar-thumb-hover: rgba(116, 107, 98, 0.7);
}
```

#### 2b. Add `.confirm-overlay` and `.confirm-card` styles

```css
/* ────────────────────────────────────────────────────────────
   CONFIRM MODAL
──────────────────────────────────────────────────────────── */

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.45);
  animation: confirm-fade-in 120ms ease;
}

.confirm-card {
  position: relative;
  z-index: 61;
  width: 100%;
  max-width: 22rem;
  border-radius: 16px;
  padding: 1.5rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.22),
    0 4px 12px rgba(0, 0, 0, 0.1);
  animation: confirm-slide-up 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes confirm-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes confirm-slide-up {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

#### 2c. Add `.project-dropdown` styles

```css
/* ────────────────────────────────────────────────────────────
   CUSTOM PROJECT DROPDOWN (Detail Panel)
──────────────────────────────────────────────────────────── */

.project-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  z-index: 50;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.06);
  animation: confirm-slide-up 150ms cubic-bezier(0.22, 1, 0.36, 1);
}

.project-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  font-size: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition:
    background-color 100ms ease,
    color 100ms ease;
}

.project-dropdown-item:hover,
.project-dropdown-item.active {
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
}

.project-dropdown-item.active {
  color: var(--color-accent);
}
```

---

### 3. `src/state/app-store.tsx` — `whenDate` rollover + confirm dialog state

#### 3a. Auto-rollover stale `whenDate` on load

In `loadData()`, after fetching tasks from storage, find all open tasks whose `whenDate` is
before today and advance them to today:

```typescript
const today = getTodayIso();
const rolled = loadedTasks.map((task) => {
  if (task.status === "open" && task.whenDate && compareIsoDate(task.whenDate, today) < 0) {
    return { ...task, whenDate: today, updatedAt: getNowIso() };
  }
  return task;
});

// Persist any tasks that were rolled
const changed = rolled.filter((t, i) => t !== loadedTasks[i]);
if (changed.length > 0) {
  await Promise.all(changed.map((t) => todoStorage.saveTask(t)));
}

setTasks(sortTasks(rolled));
```

> This mirrors Things 3 behaviour: tasks set for a past date automatically carry forward to
> Today when you open the app. The `whenDate` is visibly updated so it reads "Today" not
> "Yesterday / 3 days ago."

#### 3b. Add confirm dialog state to the store

Add to `AppStore` interface:

```typescript
confirmState: Accessor<ConfirmState | null>;
showConfirm: (state: ConfirmState) => void;
dismissConfirm: () => void;
```

Where `ConfirmState = { title: string; message: string; confirmLabel?: string; onConfirm: () => void }`.

Add a `createSignal<ConfirmState | null>(null)` and wire `showConfirm`/`dismissConfirm` into the
store object. Add `<ConfirmModal />` to the JSX tree in `App.tsx` (alongside `<DetailPanel />`).

---

### 4. `src/components/ConfirmModal.tsx` — New custom confirm modal

New component. Uses `app.confirmState()` to know when to render.

Layout:

```
┌─────────────────────────────────────┐
│  Title (e.g. "Delete task")         │
│  Message body (e.g. "Delete …?")    │
│                                     │
│  [Cancel]          [Delete ▸]       │
└─────────────────────────────────────┘
```

- Backdrop click → `dismissConfirm()`
- Cancel button → `dismissConfirm()`
- Confirm button → `onConfirm(); dismissConfirm()`
- Confirm button uses `--color-urgency-red` background (destructive action)
- Focus trap: auto-focus the Cancel button (safer default — avoids accidental destructive action)
- Keyboard: Escape → cancel; Enter → confirm
- Uses `.confirm-overlay` / `.confirm-card` CSS classes from step 2b

---

### 5. `src/App.tsx` — Project header checkbox + use ConfirmModal

#### 5a. Project completion → round checkbox left of title

**Replace** the current header layout for project views:

```
Old: [Title + count]               [CheckIcon btn] [TrashIcon btn]
New: [○ checkbox] [Title + count]                  [TrashIcon btn]
```

- The `<input type="checkbox" class="task-checkbox" />` goes in a `flex items-start gap-3`
  wrapper around the title div.
- `onChange` calls `void app.completeProject(project.id)` — no confirmation needed (matches
  Things 3: completing a project is not destructive; it can be viewed in a "completed" area).
- Remove the `CheckIcon` ghost button entirely from the header.
- `TrashIcon` ghost button remains (delete is still destructive).

#### 5b. Replace keyboard-shortcut `window.confirm()` with `app.showConfirm()`

In the `onKeyDown` handler:

```typescript
// Old:
if (task && window.confirm(`Delete "${task.title}"?`)) {
  void app.deleteTask(activeTaskId);
}

// New:
app.showConfirm({
  title: "Delete task",
  message: `"${task.title}" will be permanently deleted.`,
  confirmLabel: "Delete",
  onConfirm: () => void app.deleteTask(activeTaskId),
});
```

#### 5c. Replace project delete `window.confirm()` with `app.showConfirm()`

```typescript
app.showConfirm({
  title: "Delete project",
  message: `"${project.title}" and all its tasks will be moved to Inbox.`,
  confirmLabel: "Delete",
  onConfirm: () => void app.deleteProject(project.id),
});
```

#### 5d. Add `<ConfirmModal />` to the App JSX

Alongside `<DetailPanel />`, `<SettingsModal />`, `<CommandPalette />`.

---

### 6. `src/components/TaskRow.tsx` — Icon-only due indicators, no row urgency backgrounds

#### 6a. Remove row urgency background coloring

`rowBg` currently returns `--color-urgency-red-bg` for overdue and `--color-urgency-amber-bg`
for due-today. Change it to return only the selected state background:

```typescript
const rowBg = createMemo(() => {
  if (isSelected()) return "var(--color-accent-subtle)";
  return "transparent";
});
```

The hover style stays as `--color-bg-input` on `onMouseEnter` / reverts on `onMouseLeave`.

#### 6b. Replace date chip section with compact icon indicator

**Remove** the entire `{/* date chips */}` block (the `<div class="hidden shrink-0 ...">` with
`whenDate` chip and `dueDate` chip).

**Replace** with a single compact icon shown only for urgency states:

```tsx
{
  /* Due-date urgency indicator */
}
{
  urgency() === "due-today" || urgency() === "overdue" ? (
    <span
      class="shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: "20px",
        height: "20px",
        "background-color": "var(--color-urgency-red-bg)",
        color: "var(--color-urgency-red)",
      }}
      title={urgency() === "overdue" ? "Overdue" : "Due today"}
      aria-label={urgency() === "overdue" ? "Overdue" : "Due today"}
    >
      <FlagIcon class="size-3" />
    </span>
  ) : null;
}
```

Import `FlagIcon` from `"./icons"`.

> **Why only for `due-today` and `overdue`?** Future due dates don't need an urgency indicator —
> they're visible in the detail panel and the Upcoming view groups. Showing an icon for every task
> with a due date would create visual noise.

---

### 7. `src/components/DetailPanel.tsx` — Custom project dropdown + layout improvements

#### 7a. Replace native `<select>` with custom project dropdown

**Remove** the `<select>` element and its wrapper.

**Add** a new `isProjectDropdownOpen` signal (`createSignal(false)`).

**Replace** with a custom dropdown trigger button + dropdown list:

```tsx
const [isProjectDropdownOpen, setIsProjectDropdownOpen] = createSignal(false);

const currentProjectName = createMemo(() => {
  if (!task.projectId) return "Inbox";
  return app.openProjects().find((p) => p.id === task.projectId)?.title ?? "Inbox";
});
```

**Trigger button** (same visual style as `detail-date-pill`):

```tsx
<div class="relative">
  <button
    type="button"
    class={`detail-date-pill${task.projectId ? " has-value" : ""}`}
    onClick={() => setIsProjectDropdownOpen((o) => !o)}
  >
    <FolderIcon class="size-3.5 shrink-0" />
    <span class="flex-1 text-left text-xs">{currentProjectName()}</span>
    <ChevronDownIcon class="size-3 shrink-0 opacity-40" />
  </button>

  <Show when={isProjectDropdownOpen()}>
    <div class="project-dropdown" onMouseDown={(e) => e.preventDefault()}>
      {/* Inbox option */}
      <button
        type="button"
        class={`project-dropdown-item${!task.projectId ? " active" : ""}`}
        onClick={() => {
          void app.updateTask(task.id, { projectId: null });
          setIsProjectDropdownOpen(false);
        }}
      >
        <InboxIcon class="size-3.5 shrink-0" />
        <span>Inbox</span>
      </button>
      {/* Project options */}
      <For each={app.openProjects()}>
        {(project) => (
          <button
            type="button"
            class={`project-dropdown-item${task.projectId === project.id ? " active" : ""}`}
            onClick={() => {
              void app.updateTask(task.id, { projectId: project.id });
              setIsProjectDropdownOpen(false);
            }}
          >
            <FolderIcon class="size-3.5 shrink-0" />
            <span>{project.title}</span>
          </button>
        )}
      </For>
    </div>
  </Show>
</div>
```

Close the dropdown on outside click: wrap with an `onBlur` on the trigger button (with the
`onMouseDown` on the dropdown preventing blur before option selection).

#### 7b. Replace task/project delete `window.confirm()` with `app.showConfirm()`

In DetailPanel the delete button currently calls `window.confirm(...)`. Replace:

```typescript
app.showConfirm({
  title: "Delete task",
  message: `"${task.title}" will be permanently deleted.`,
  confirmLabel: "Delete",
  onConfirm: () => void app.deleteTask(task.id),
});
```

#### 7c. Layout redesign

**Problems with current layout**:

- Two separate sections (dates and project) with two separate dividers create unnecessary chop
- The notes area is cramped (5 rows fixed)
- No visual grouping of related metadata
- Metadata (dates + project) could read as one unified block

**New layout** (all within `<div class="min-h-0 flex-1 overflow-y-auto">`):

```
┌─────────────────────────────────────────┐
│ [○] Task title input (large, flex-1)    │  ← pt-4 pb-2 px-5, flex gap-3
│                                          │
│ Notes textarea                           │  ← px-5 pb-4, min 6 rows, grows
│                                          │
│ ──────────── (single divider) ────────── │  ← mx-5
│                                          │
│  Metadata section (bg-input, rounded)   │
│  ┌───────────────────────────────────┐  │  ← px-5 py-3
│  │ 🕐  When — enters Today on date  │  │
│  │ 🚩  Due — hard deadline          │  │
│  │ 📁  Project name              ⌄  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

Concretely:

- **Title row**: keep as-is (checkbox + input, `flex items-start gap-3 px-5 pt-4 pb-3`)
- **Notes**: increase to `rows="7"` min, give `min-height: 7rem`; use `py-1` on top for breathing
- **Single divider** replaces the previous two dividers
- **Metadata block**: a rounded container with `background-color: var(--color-bg-input)`,
  `border: 1px solid var(--color-border-subtle)`, `border-radius: 10px`, `margin: 0 1.25rem 1rem`,
  `padding: 4px 0` — contains When pill, Due pill, Project pill as a vertical stack without
  their own borders (the block itself provides the visual container):
  - Each pill inside: `display: flex`, `align-items: center`, `gap: 8px`, `padding: 9px 12px`,
    `width: 100%`, no individual border/bg
  - `border-top: 1px solid var(--color-border-subtle)` on the 2nd and 3rd items only (inner dividers)
  - Hover state: `background-color: color-mix(in srgb, var(--color-border-subtle) 60%, transparent)`

This collapses the three separate full-width bordered pills into one cohesive metadata card.

---

### 8. `src/state/app-store.tsx` — Remove `window.confirm()` from `importData`

The `importData` function also has a `window.confirm()`:

```typescript
// Old:
if (!window.confirm("Importing will replace all current tasks…")) return;

// New: use showConfirm
```

But `importData` is `async` and is called from `SettingsModal.tsx`. The cleanest approach here
is to split the confirmation out of `importData` and handle it in the caller
(`SettingsModal.tsx`) using `app.showConfirm()`:

- Remove the `window.confirm` from `importData`
- In `SettingsModal.tsx`, when the file is selected, call `app.showConfirm(...)` with
  `onConfirm: () => void app.importData(file)`

---

## Files Changed

| File                               | Change                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/components/icons.tsx`         | Add `ChevronDownIcon`                                                                                   |
| `src/index.css`                    | Revise dark mode tokens; add confirm modal, dropdown styles                                             |
| `src/state/app-store.tsx`          | `whenDate` rollover on load; confirm dialog state; remove `window.confirm` from `importData`            |
| `src/components/ConfirmModal.tsx`  | New — custom confirm modal component                                                                    |
| `src/App.tsx`                      | Project completion as checkbox; replace all `window.confirm` with `showConfirm`; add `<ConfirmModal />` |
| `src/components/TaskRow.tsx`       | Remove date chips and row urgency backgrounds; add compact flag icon for due urgency                    |
| `src/components/DetailPanel.tsx`   | Custom project dropdown; use `showConfirm`; layout redesign                                             |
| `src/components/SettingsModal.tsx` | Move `importData` confirm out of the store call; use `showConfirm`                                      |

## Not Changing

- `src/types.ts` — no data model changes
- `src/components/Sidebar.tsx` — no changes requested
- `src/components/SortableTaskList.tsx` — no changes
- `src/components/QuickAdd.tsx` — no changes

## Current Step

Not started.

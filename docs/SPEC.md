# Spec

## Routes

| Route       | Purpose           |
| ----------- | ----------------- |
| `/`         | Marketing home    |
| `/about`    | About the product |
| `/features` | Feature overview  |
| `/app`      | The application   |

---

## Task model

### Visible to the user

| Field            | Description              |
| ---------------- | ------------------------ |
| Title            | The task text            |
| Completion state | Whether the task is done |

That is all the user ever sees. Everything else is internal.

### Internal fields

| Field         | Type                      | Description                                                                                                                  |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`          | string (UUID)             | Unique identifier. Never changes.                                                                                            |
| `title`       | string                    | The task text.                                                                                                               |
| `status`      | enum                      | `active` \| `dormant` \| `completed`                                                                                         |
| `createdAt`   | ISO 8601 datetime         | When the task was first created. Never changes.                                                                              |
| `activatedAt` | ISO 8601 datetime         | When the task last became active — set on creation, reset on recovery. The 7-day aging window is calculated from this field. |
| `updatedAt`   | ISO 8601 datetime         | When the task was last modified.                                                                                             |
| `completedAt` | ISO 8601 datetime \| null | When the task was completed. Null if not completed.                                                                          |
| `dormantAt`   | ISO 8601 datetime \| null | When the task became dormant. Null if never dormant, or cleared on recovery.                                                 |

---

## Task states

### Active

- Visible in the main view.
- Can be completed or edited.
- Becomes dormant at midnight on the 7th day after `activatedAt`.

### Dormant

- Was active but reached the 7-day limit without being completed.
- Not visible in the main view.
- Searchable and recoverable.
- Recovery returns the task to active and resets `activatedAt`.

### Completed

- Marked done by the user.
- If completed today: visible in the main view below active tasks, under a "Done today" divider.
- At midnight (device local time), completed tasks from previous days leave the main view entirely.
- Searchable at any time via the "Completed" section in search results.

"Completed today" vs "completed previously" is derived from `completedAt` — no separate status value is needed.

---

## Aging

- Active tasks become dormant at midnight (device local time) on the 7th day after `activatedAt`.
- Example: a task activated at any time on a Monday becomes dormant at 00:00 the following Monday night.
- Nothing is deleted. Aging only moves tasks from `active` to `dormant`.
- The app checks for tasks needing a state transition on load and whenever the browser tab regains focus (via the `visibilitychange` event).

---

## Workflows

### Capture

1. User types in the capture input (auto-focused on app load).
2. User presses Enter.
3. A new task is created with `status: active`, `createdAt` and `activatedAt` set to now.
4. The input clears and refocuses immediately.
5. The task appears at the top of the active list.

Empty or whitespace-only input does nothing on Enter.

---

### Complete

1. User clicks the completion control on an active task.
2. Task `status` changes to `completed`. `completedAt` is set to now.
3. Task moves to the "Done today" section below the active list.
4. At midnight it disappears from the main view. It remains searchable.

---

### Edit

1. User clicks a task's title text.
2. The title becomes an inline editable input, pre-filled with current text.
3. **Enter** saves the change. `updatedAt` is set to now. Editing does not affect `activatedAt`.
4. **Escape** cancels with no changes.
5. Saving an empty or whitespace-only title cancels the edit and reverts to the previous value.

---

### Search

1. User opens search via `Cmd/Ctrl + K` or a visible search control.
2. Results update as the user types (case-insensitive substring match on `title`).
3. Results are grouped into sections (see Search results below).
4. Selecting a dormant result triggers recovery.
5. Selecting an active result closes search and scrolls to or highlights that task in the main view.
6. Completed results are display-only — no action on select.
7. **Escape** or clicking outside closes search.

---

### Recovery

1. User selects a dormant task in search results.
2. `status` changes from `dormant` to `active`.
3. `activatedAt` is reset to now. `dormantAt` is cleared.
4. `createdAt` is never changed.
5. Search closes.
6. Task appears at the top of the active list in the main view.
7. No confirmation required.

---

## Search results

Results are returned in this order:

| Section label | Contents                         |
| ------------- | -------------------------------- |
| Active        | Tasks currently in the main view |
| Earlier       | Dormant tasks                    |
| Completed     | Tasks the user has finished      |

- Sections only appear when there are matching results. Empty sections are never shown.
- Match: case-insensitive substring on `title`.

---

## Keyboard

| Action              | Shortcut                 |
| ------------------- | ------------------------ |
| Focus capture input | Auto-focused on app load |
| Submit new task     | `Enter`                  |
| Open search         | `Cmd/Ctrl + K`           |
| Close search        | `Escape`                 |
| Save inline edit    | `Enter`                  |
| Cancel inline edit  | `Escape`                 |

Both keyboard-first and mouse-first users should be fully supported.

---

## UI rules

- No task counts anywhere in the interface.
- No dashboards, charts, or statistics.
- No streaks, achievements, or scores.
- Completing a task should feel satisfying.
- The interface should feel calm and lightweight overall.
- Section label for completed tasks in the main view: **"Done today"**.
- Section labels in search results: **"Active"**, **"Earlier"**, **"Completed"**.

---

## Edge cases

| Scenario                                   | Expected behaviour                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Enter on empty capture input               | No-op                                                                                         |
| Enter on whitespace-only input             | No-op                                                                                         |
| Saving an edit with empty/whitespace title | Revert to previous title, cancel the edit                                                     |
| Tab regains focus after midnight           | Run state transitions before rendering                                                        |
| App loaded after midnight                  | Run state transitions before rendering                                                        |
| Task recovered and immediately re-faded    | Treated as any other active task; `activatedAt` is the recovery date, a full 7 days from then |

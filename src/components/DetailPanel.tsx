import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { formatDateLabel } from "../lib/date";
import { useAppStore } from "../state/app-store";
import {
  CalendarClockIcon,
  CloseIcon,
  FlagIcon,
  FolderIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from "./icons";

export const DetailPanel: Component = () => {
  const app = useAppStore();
  const [title, setTitle] = createSignal("");
  const [notes, setNotes] = createSignal("");

  // Sync local edit state whenever the selected task changes
  createEffect(() => {
    const task = app.selectedTask();
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
  });

  // Hidden native date input refs
  let whenInputRef: HTMLInputElement | undefined;
  let dueInputRef: HTMLInputElement | undefined;

  const saveTitle = async (): Promise<void> => {
    const task = app.selectedTask();
    if (!task) return;
    if (!title().trim()) {
      setTitle(task.title);
      return;
    }
    if (title().trim() !== task.title) await app.updateTask(task.id, { title: title().trim() });
  };

  const saveNotes = async (): Promise<void> => {
    const task = app.selectedTask();
    if (!task) return;
    if (notes() !== task.notes) await app.updateTask(task.id, { notes: notes() });
  };

  const triggerWhenPicker = (e: MouseEvent, taskId: string, currentDate: string | null): void => {
    e.stopPropagation();
    if (currentDate) {
      void app.updateTask(taskId, { whenDate: null });
      return;
    }
    whenInputRef?.showPicker?.();
    whenInputRef?.click();
  };

  const triggerDuePicker = (e: MouseEvent, taskId: string, currentDate: string | null): void => {
    e.stopPropagation();
    if (currentDate) {
      void app.updateTask(taskId, { dueDate: null });
      return;
    }
    dueInputRef?.showPicker?.();
    dueInputRef?.click();
  };

  return (
    <aside
      classList={{
        "translate-x-full": !app.selectedTask(),
        "translate-x-0": Boolean(app.selectedTask()),
      }}
      class="fixed inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col shadow-2xl transition-transform duration-300 lg:w-96"
      style={{
        "background-color": "var(--color-bg-surface)",
        "border-left": "1px solid var(--color-border-subtle)",
      }}
    >
      <Show when={app.selectedTask()}>
        {(taskAccessor) => {
          const task = taskAccessor();

          return (
            <>
              {/* ── Header row: close · star · delete ── */}
              <div class="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-lg transition-colors"
                  style={{
                    "background-color": "var(--color-bg-input)",
                    color: "var(--color-text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--color-border-default)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--color-bg-input)";
                  }}
                  onClick={() => app.closeTask()}
                >
                  <CloseIcon class="size-3.5" />
                </button>

                <div class="flex items-center gap-1.5">
                  {/* Star toggle */}
                  <button
                    type="button"
                    class="flex size-7 items-center justify-center rounded-lg transition-colors"
                    style={{
                      color: task.starred ? "var(--color-star)" : "var(--color-text-tertiary)",
                      "background-color": task.starred
                        ? "var(--color-urgency-amber-bg)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!task.starred) {
                        (e.currentTarget as HTMLElement).style.color = "var(--color-star)";
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "var(--color-urgency-amber-bg)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!task.starred) {
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-tertiary)";
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      }
                    }}
                    onClick={() => void app.toggleTaskStar(task.id)}
                    aria-label={task.starred ? "Unstar task" : "Star task"}
                  >
                    {task.starred ? (
                      <StarFilledIcon class="size-3.5" />
                    ) : (
                      <StarIcon class="size-3.5" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    class="flex size-7 items-center justify-center rounded-lg transition-colors"
                    style={{
                      color: "var(--color-text-tertiary)",
                      "background-color": "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--color-urgency-red)";
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--color-urgency-red-bg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-tertiary)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                    onClick={() => {
                      if (window.confirm(`Delete "${task.title}"?`)) {
                        void app.deleteTask(task.id);
                      }
                    }}
                    aria-label="Delete task"
                  >
                    <TrashIcon class="size-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Editable body ── */}
              <div class="min-h-0 flex-1 overflow-y-auto">
                {/* Title row — checkbox + editor-style input */}
                <div class="flex items-start gap-3 px-5 pt-3 pb-2">
                  <input
                    type="checkbox"
                    aria-label={`Complete ${task.title}`}
                    class="task-checkbox mt-[3px] shrink-0"
                    checked={false}
                    onChange={() => {
                      void app.completeTask(task.id);
                    }}
                  />
                  <input
                    value={title()}
                    onInput={(e) => setTitle(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void saveTitle();
                      }
                    }}
                    onBlur={() => void saveTitle()}
                    placeholder="Task title"
                    class="detail-title-input min-w-0 flex-1 bg-transparent text-[1.1rem] font-semibold leading-snug outline-none"
                    style={{ color: "var(--color-text-primary)" }}
                  />
                </div>

                {/* Notes — borderless until focused */}
                <div class="px-5 pb-4">
                  <textarea
                    rows="5"
                    value={notes()}
                    onInput={(e) => setNotes(e.currentTarget.value)}
                    onBlur={() => void saveNotes()}
                    placeholder="Add notes, links, or context…"
                    class="detail-notes-textarea w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
                    style={{ color: "var(--color-text-secondary)" }}
                  />
                </div>

                {/* ── Divider ── */}
                <div
                  class="mx-5"
                  style={{ "border-top": "1px solid var(--color-border-subtle)" }}
                />

                {/* ── Date pills ── */}
                <div class="px-5 py-4 flex flex-col gap-2">
                  {/* When pill */}
                  <button
                    type="button"
                    class={`detail-date-pill${task.whenDate ? " has-value" : ""}`}
                    onClick={(e) => triggerWhenPicker(e, task.id, task.whenDate)}
                    aria-label={
                      task.whenDate
                        ? `When: ${formatDateLabel(task.whenDate)} — click to clear`
                        : "Set when date"
                    }
                  >
                    <CalendarClockIcon class="size-3.5 shrink-0" />
                    <span class="flex-1 text-left text-xs">
                      {task.whenDate ? (
                        <>
                          <span class="mr-1 opacity-60">When</span>
                          {formatDateLabel(task.whenDate)}
                        </>
                      ) : (
                        <span class="opacity-50">When — enters Today on this date</span>
                      )}
                    </span>
                    {task.whenDate && (
                      <span class="pill-clear text-xs opacity-40" aria-hidden="true">
                        ×
                      </span>
                    )}
                  </button>

                  {/* Due pill */}
                  <button
                    type="button"
                    class={`detail-date-pill${task.dueDate ? " has-value due" : ""}`}
                    onClick={(e) => triggerDuePicker(e, task.id, task.dueDate)}
                    aria-label={
                      task.dueDate
                        ? `Due: ${formatDateLabel(task.dueDate)} — click to clear`
                        : "Set due date"
                    }
                  >
                    <FlagIcon class="size-3.5 shrink-0" />
                    <span class="flex-1 text-left text-xs">
                      {task.dueDate ? (
                        <>
                          <span class="mr-1 opacity-60">Due</span>
                          {formatDateLabel(task.dueDate)}
                        </>
                      ) : (
                        <span class="opacity-50">Due — hard deadline</span>
                      )}
                    </span>
                    {task.dueDate && (
                      <span class="pill-clear text-xs opacity-40" aria-hidden="true">
                        ×
                      </span>
                    )}
                  </button>
                </div>

                {/* ── Divider ── */}
                <div
                  class="mx-5"
                  style={{ "border-top": "1px solid var(--color-border-subtle)" }}
                />

                {/* ── Project ── */}
                <div class="px-5 py-4">
                  <div
                    class="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      "background-color": "var(--color-bg-input)",
                      border: "1px solid var(--color-border-default)",
                    }}
                  >
                    <span
                      style={{ color: "var(--color-text-tertiary)" }}
                      class="shrink-0 flex items-center"
                    >
                      <FolderIcon class="size-3.5" />
                    </span>
                    <select
                      value={task.projectId ?? ""}
                      onChange={(event) =>
                        void app.updateTask(task.id, {
                          projectId: event.currentTarget.value || null,
                        })
                      }
                      class="min-w-0 flex-1 bg-transparent text-xs outline-none"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <option value="">Inbox</option>
                      <For each={app.openProjects()}>
                        {(project) => <option value={project.id}>{project.title}</option>}
                      </For>
                    </select>
                  </div>
                </div>

                {/* Hidden native date inputs */}
                <input
                  ref={(el) => {
                    whenInputRef = el;
                  }}
                  type="date"
                  value={task.whenDate ?? ""}
                  onInput={(event) =>
                    void app.updateTask(task.id, {
                      whenDate: event.currentTarget.value || null,
                    })
                  }
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    opacity: "0",
                    "pointer-events": "none",
                    width: "1px",
                    height: "1px",
                    top: "0",
                    left: "0",
                  }}
                />
                <input
                  ref={(el) => {
                    dueInputRef = el;
                  }}
                  type="date"
                  value={task.dueDate ?? ""}
                  onInput={(event) =>
                    void app.updateTask(task.id, {
                      dueDate: event.currentTarget.value || null,
                    })
                  }
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    opacity: "0",
                    "pointer-events": "none",
                    width: "1px",
                    height: "1px",
                    top: "0",
                    left: "0",
                  }}
                />
              </div>
            </>
          );
        }}
      </Show>
    </aside>
  );
};

import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { compareIsoDate, formatDateLabel, getTodayIso } from "../lib/date";
import { useAppStore } from "../state/app-store";
import {
  CalendarClockIcon,
  ChevronDownIcon,
  CloseIcon,
  FlagIcon,
  FolderIcon,
  InboxIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from "./icons";

export const DetailPanel: Component = () => {
  const app = useAppStore();
  const [title, setTitle] = createSignal("");
  const [notes, setNotes] = createSignal("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = createSignal(false);

  // Sync local state whenever the selected task changes; close stale dropdown
  createEffect(() => {
    const task = app.selectedTask();
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setIsProjectDropdownOpen(false);
  });

  // Hidden native date input refs — triggered programmatically by the pill buttons
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
      <Show when={app.selectedTask()} keyed>
        {(task) => {
          const today = getTodayIso();

          // Inline urgency for due date color — recomputed on each render
          const dueIsUrgent = task.dueDate != null && compareIsoDate(task.dueDate, today) <= 0;
          const dueIsFuture = task.dueDate != null && compareIsoDate(task.dueDate, today) > 0;
          const dueIconColor = dueIsUrgent
            ? "var(--color-urgency-red)"
            : dueIsFuture
              ? "var(--color-urgency-amber)"
              : "var(--color-text-tertiary)";

          const currentProjectName = task.projectId
            ? (app.openProjects().find((p) => p.id === task.projectId)?.title ?? "Inbox")
            : "Inbox";

          const rowHoverEnter = (e: MouseEvent): void => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "color-mix(in srgb, var(--color-border-subtle) 120%, transparent)";
          };
          const rowHoverLeave = (e: MouseEvent): void => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          };

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
                      app.showConfirm({
                        title: "Delete task",
                        message: `"${task.title}" will be permanently deleted.`,
                        confirmLabel: "Delete",
                        onConfirm: () => void app.deleteTask(task.id),
                      });
                    }}
                    aria-label="Delete task"
                  >
                    <TrashIcon class="size-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Editable body ── */}
              <div class="min-h-0 flex-1 overflow-y-auto">
                {/* Title row — completion circle + large editor input */}
                <div class="flex items-start gap-3 px-5 pt-3 pb-2">
                  <input
                    type="checkbox"
                    aria-label={`Complete ${task.title}`}
                    class="task-checkbox mt-[3px] shrink-0"
                    checked={false}
                    onChange={() => void app.completeTask(task.id)}
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

                {/* Notes — borderless, grows to fill space */}
                <div class="px-5 pb-4">
                  <textarea
                    rows="7"
                    value={notes()}
                    onInput={(e) => setNotes(e.currentTarget.value)}
                    onBlur={() => void saveNotes()}
                    placeholder="Add notes, links, or context…"
                    class="detail-notes-textarea w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
                    style={{ color: "var(--color-text-secondary)", "min-height": "7rem" }}
                  />
                </div>

                {/* ── Divider ── */}
                <div
                  class="mx-5 mb-3"
                  style={{ "border-top": "1px solid var(--color-border-subtle)" }}
                />

                {/* ── Metadata card: When · Due · Project ── */}
                <div
                  class="mx-5 mb-4 overflow-hidden"
                  style={{
                    "border-radius": "10px",
                    border: "1px solid var(--color-border-subtle)",
                    "background-color": "var(--color-bg-input)",
                  }}
                >
                  {/* When row */}
                  <button
                    type="button"
                    class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={rowHoverEnter}
                    onMouseLeave={rowHoverLeave}
                    onClick={(e) => triggerWhenPicker(e, task.id, task.whenDate)}
                    aria-label={
                      task.whenDate
                        ? `When: ${formatDateLabel(task.whenDate)} — click to clear`
                        : "Set when date"
                    }
                  >
                    <CalendarClockIcon
                      class="size-3.5 shrink-0"
                      style={{
                        color: task.whenDate ? "var(--color-accent)" : "var(--color-text-tertiary)",
                      }}
                    />
                    <span
                      class="flex-1"
                      style={{
                        color: task.whenDate ? "var(--color-accent)" : "var(--color-text-tertiary)",
                      }}
                    >
                      {task.whenDate ? (
                        <>
                          <span class="mr-1 opacity-60">When</span>
                          {formatDateLabel(task.whenDate)}
                        </>
                      ) : (
                        <span class="opacity-50">When — enters Today on this date</span>
                      )}
                    </span>
                    {task.whenDate ? (
                      <span class="opacity-40 text-sm" aria-hidden="true">
                        ×
                      </span>
                    ) : null}
                  </button>

                  {/* Due row */}
                  <button
                    type="button"
                    class="flex w-full items-center gap-2.5 border-t px-3 py-2.5 text-left text-xs transition-colors"
                    style={{
                      "border-color": "var(--color-border-subtle)",
                      background: "transparent",
                    }}
                    onMouseEnter={rowHoverEnter}
                    onMouseLeave={rowHoverLeave}
                    onClick={(e) => triggerDuePicker(e, task.id, task.dueDate)}
                    aria-label={
                      task.dueDate
                        ? `Due: ${formatDateLabel(task.dueDate)} — click to clear`
                        : "Set due date"
                    }
                  >
                    <FlagIcon class="size-3.5 shrink-0" style={{ color: dueIconColor }} />
                    <span class="flex-1" style={{ color: dueIconColor }}>
                      {task.dueDate ? (
                        <>
                          <span class="mr-1 opacity-60">Due</span>
                          {formatDateLabel(task.dueDate)}
                        </>
                      ) : (
                        <span class="opacity-50" style={{ color: "var(--color-text-tertiary)" }}>
                          Deadline — hard due date
                        </span>
                      )}
                    </span>
                    {task.dueDate ? (
                      <span
                        class="opacity-40 text-sm"
                        style={{ color: dueIconColor }}
                        aria-hidden="true"
                      >
                        ×
                      </span>
                    ) : null}
                  </button>

                  {/* Project row — custom dropdown */}
                  <div
                    class="relative border-t"
                    style={{ "border-color": "var(--color-border-subtle)" }}
                  >
                    <button
                      type="button"
                      class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-colors"
                      style={{ background: "transparent" }}
                      onMouseEnter={rowHoverEnter}
                      onMouseLeave={rowHoverLeave}
                      onClick={() => setIsProjectDropdownOpen((o) => !o)}
                      onBlur={() =>
                        // Delay so mousedown on dropdown items fires first
                        setTimeout(() => setIsProjectDropdownOpen(false), 150)
                      }
                      aria-label="Select project"
                      aria-haspopup="listbox"
                      aria-expanded={isProjectDropdownOpen()}
                    >
                      <FolderIcon
                        class="size-3.5 shrink-0"
                        style={{
                          color: task.projectId
                            ? "var(--color-accent)"
                            : "var(--color-text-tertiary)",
                        }}
                      />
                      <span
                        class="flex-1"
                        style={{
                          color: task.projectId
                            ? "var(--color-text-primary)"
                            : "var(--color-text-tertiary)",
                        }}
                      >
                        {currentProjectName}
                      </span>
                      <ChevronDownIcon
                        class="size-3 shrink-0 opacity-40"
                        style={{ color: "var(--color-text-tertiary)" }}
                      />
                    </button>

                    <Show when={isProjectDropdownOpen()}>
                      <div
                        class="project-dropdown"
                        role="listbox"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        onKeyDown={(e) => e.key === "Escape" && setIsProjectDropdownOpen(false)}
                      >
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
                </div>
              </div>

              {/* Hidden date inputs — direct child of aside (outside scroll container)
                  so browser showPicker() is never inside an overflow:auto context */}
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
                  position: "fixed",
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
                  position: "fixed",
                  opacity: "0",
                  "pointer-events": "none",
                  width: "1px",
                  height: "1px",
                  top: "0",
                  left: "0",
                }}
              />
            </>
          );
        }}
      </Show>
    </aside>
  );
};

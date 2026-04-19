import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { useAppStore } from "../state/app-store";
import { CloseIcon, StarFilledIcon, StarIcon, TrashIcon } from "./icons";

export const DetailPanel: Component = () => {
  const app = useAppStore();
  const [title, setTitle] = createSignal("");
  const [notes, setNotes] = createSignal("");

  createEffect(() => {
    const task = app.selectedTask();
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
  });

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

  const inputStyle = {
    "border-color": "var(--color-border-default)",
    "background-color": "var(--color-bg-input)",
    color: "var(--color-text-primary)",
  };

  const handleFocus = (e: FocusEvent) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-focus)";
  };
  const handleBlur = (e: FocusEvent) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-default)";
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
              {/* header */}
              <div
                class="flex items-center justify-between px-5 py-4"
                style={{ "border-bottom": "1px solid var(--color-border-subtle)" }}
              >
                <span
                  class="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Task details
                </span>
                <button
                  type="button"
                  class="rounded-lg p-1.5 transition-colors"
                  style={{
                    "background-color": "var(--color-bg-input)",
                    color: "var(--color-text-secondary)",
                  }}
                  onClick={() => app.closeTask()}
                >
                  <CloseIcon class="size-4" />
                </button>
              </div>

              {/* body */}
              <div class="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {/* title */}
                <label class="block">
                  <span
                    class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Title
                  </span>
                  <input
                    value={title()}
                    onInput={(event) => setTitle(event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void saveTitle();
                      }
                    }}
                    class="w-full rounded-lg border px-3 py-2.5 text-base font-semibold outline-none transition"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={(e) => {
                      handleBlur(e);
                      void saveTitle();
                    }}
                  />
                </label>

                {/* notes */}
                <label class="block">
                  <span
                    class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Notes
                  </span>
                  <textarea
                    rows="6"
                    value={notes()}
                    onInput={(event) => setNotes(event.currentTarget.value)}
                    class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition resize-none"
                    style={inputStyle}
                    placeholder="Add context, links, or follow-ups…"
                    onFocus={handleFocus}
                    onBlur={(e) => {
                      handleBlur(e);
                      void saveNotes();
                    }}
                  />
                </label>

                {/* when + due */}
                <div class="grid grid-cols-2 gap-3">
                  <label class="block">
                    <span
                      class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      When
                    </span>
                    <p class="mb-1.5 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      Enters Today on or after this date
                    </p>
                    <input
                      type="date"
                      value={task.whenDate ?? ""}
                      onInput={(event) =>
                        void app.updateTask(task.id, {
                          whenDate: event.currentTarget.value || null,
                        })
                      }
                      class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </label>

                  <label class="block">
                    <span
                      class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      Due
                    </span>
                    <p class="mb-1.5 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      Hard deadline — shows urgency when near
                    </p>
                    <input
                      type="date"
                      value={task.dueDate ?? ""}
                      onInput={(event) =>
                        void app.updateTask(task.id, {
                          dueDate: event.currentTarget.value || null,
                        })
                      }
                      class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </label>
                </div>

                {/* project */}
                <label class="block">
                  <span
                    class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Project
                  </span>
                  <select
                    value={task.projectId ?? ""}
                    onChange={(event) =>
                      void app.updateTask(task.id, {
                        projectId: event.currentTarget.value || null,
                      })
                    }
                    class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition"
                    style={{
                      ...inputStyle,
                      "background-color": "var(--color-bg-input)",
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="">Inbox</option>
                    <For each={app.openProjects()}>
                      {(project) => <option value={project.id}>{project.title}</option>}
                    </For>
                  </select>
                </label>

                {/* star toggle */}
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition"
                  style={{
                    "border-color": task.starred
                      ? "var(--color-star)"
                      : "var(--color-border-default)",
                    "background-color": task.starred
                      ? "var(--color-urgency-amber-bg)"
                      : "var(--color-bg-input)",
                    color: task.starred ? "var(--color-star)" : "var(--color-text-secondary)",
                  }}
                  onClick={() => void app.toggleTaskStar(task.id)}
                >
                  {task.starred ? <StarFilledIcon class="size-4" /> : <StarIcon class="size-4" />}
                  <span>{task.starred ? "Starred" : "Mark as starred"}</span>
                </button>
              </div>

              {/* footer actions */}
              <div
                class="grid grid-cols-2 gap-2 px-5 py-4"
                style={{ "border-top": "1px solid var(--color-border-subtle)" }}
              >
                <button
                  type="button"
                  class="rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ "background-color": "var(--color-success)" }}
                  onClick={() => void app.completeTask(task.id)}
                >
                  Complete
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition"
                  style={{
                    "border-color": "var(--color-urgency-red)",
                    color: "var(--color-urgency-red)",
                    "background-color": "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--color-urgency-red-bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                  onClick={() => {
                    if (window.confirm(`Delete "${task.title}"?`)) {
                      void app.deleteTask(task.id);
                    }
                  }}
                >
                  <TrashIcon class="size-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          );
        }}
      </Show>
    </aside>
  );
};

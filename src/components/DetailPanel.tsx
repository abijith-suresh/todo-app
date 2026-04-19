import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { formatDateLabel } from "../lib/date";
import { useAppStore } from "../state/app-store";
import { CloseIcon, StarIcon, TrashIcon } from "./icons";

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
    if (!task) {
      return;
    }

    if (!title().trim()) {
      setTitle(task.title);
      return;
    }

    if (title().trim() !== task.title) {
      await app.updateTask(task.id, { title: title().trim() });
    }
  };

  const saveNotes = async (): Promise<void> => {
    const task = app.selectedTask();
    if (!task) {
      return;
    }

    if (notes() !== task.notes) {
      await app.updateTask(task.id, { notes: notes() });
    }
  };

  return (
    <aside
      classList={{
        "translate-x-full": !app.selectedTask(),
        "translate-x-0": Boolean(app.selectedTask()),
      }}
      class="fixed inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition-transform duration-300 lg:w-[28rem]"
    >
      <Show when={app.selectedTask()}>
        {(taskAccessor) => {
          const task = taskAccessor();

          return (
            <>
              <div class="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Task details
                  </p>
                  <p class="mt-1 text-sm text-zinc-400">
                    {task.whenDate ? `When ${formatDateLabel(task.whenDate)}` : "No When date"}
                    {task.dueDate ? ` • Due ${formatDateLabel(task.dueDate)}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10"
                  onClick={() => app.closeTask()}
                >
                  <CloseIcon class="size-4" />
                </button>
              </div>

              <div class="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <label class="block">
                  <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Title
                  </span>
                  <input
                    value={title()}
                    onInput={(event) => setTitle(event.currentTarget.value)}
                    onBlur={() => void saveTitle()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void saveTitle();
                      }
                    }}
                    class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white outline-none focus:border-sky-400/60"
                  />
                </label>

                <label class="block">
                  <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Notes
                  </span>
                  <textarea
                    rows="8"
                    value={notes()}
                    onInput={(event) => setNotes(event.currentTarget.value)}
                    onBlur={() => void saveNotes()}
                    class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-sky-400/60"
                    placeholder="Add more context, links, or follow-ups"
                  />
                </label>

                <div class="grid gap-4 sm:grid-cols-2">
                  <label class="block">
                    <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      When
                    </span>
                    <input
                      type="date"
                      value={task.whenDate ?? ""}
                      onInput={(event) =>
                        void app.updateTask(task.id, {
                          whenDate: event.currentTarget.value || null,
                        })
                      }
                      class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
                    />
                  </label>

                  <label class="block">
                    <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Due
                    </span>
                    <input
                      type="date"
                      value={task.dueDate ?? ""}
                      onInput={(event) =>
                        void app.updateTask(task.id, {
                          dueDate: event.currentTarget.value || null,
                        })
                      }
                      class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
                    />
                  </label>
                </div>

                <label class="block">
                  <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Project
                  </span>
                  <select
                    value={task.projectId ?? ""}
                    onChange={(event) =>
                      void app.updateTask(task.id, {
                        projectId: event.currentTarget.value || null,
                      })
                    }
                    class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
                  >
                    <option value="">Inbox</option>
                    <For each={app.openProjects()}>
                      {(project) => <option value={project.id}>{project.title}</option>}
                    </For>
                  </select>
                </label>

                <button
                  type="button"
                  classList={{
                    "border-amber-400/40 bg-amber-500/10 text-amber-200": task.starred,
                  }}
                  class="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/10"
                  onClick={() => void app.toggleTaskStar(task.id)}
                >
                  <StarIcon class="size-4" />
                  <span>{task.starred ? "Starred" : "Mark as starred"}</span>
                </button>
              </div>

              <div class="grid gap-3 border-t border-white/10 px-6 py-5 sm:grid-cols-2">
                <button
                  type="button"
                  class="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  onClick={() => void app.completeTask(task.id)}
                >
                  Complete task
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                  onClick={() => {
                    if (window.confirm(`Delete “${task.title}”?`)) {
                      void app.deleteTask(task.id);
                    }
                  }}
                >
                  <TrashIcon class="size-4" />
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

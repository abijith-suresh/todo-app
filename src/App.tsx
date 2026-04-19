import { createMemo, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";

import { CommandPalette } from "./components/CommandPalette";
import { DetailPanel } from "./components/DetailPanel";
import { QuickAdd } from "./components/QuickAdd";
import { SettingsModal } from "./components/SettingsModal";
import { Sidebar } from "./components/Sidebar";
import { SortableTaskList } from "./components/SortableTaskList";
import { getEmptyStateMessage, getProjectTasks, getViewTitle } from "./lib/view-model";
import { useAppStore } from "./state/app-store";
import { CloseIcon, TrashIcon } from "./components/icons";

const isEditableTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element) {
    return false;
  }

  return Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
};

function App() {
  const app = useAppStore();
  const activeTasks = createMemo(() => {
    const view = app.activeView();
    if (view.type === "project") {
      return getProjectTasks(app.openTasks(), view.projectId);
    }

    if (view.type === "today") {
      return [...app.todaySections().overdue, ...app.todaySections().today];
    }

    if (view.type === "upcoming") {
      return app.upcomingGroups().flatMap((group) => group.tasks);
    }

    return app.inboxTasks();
  });

  const activeCount = createMemo(() => activeTasks().length);

  let quickAddInput: HTMLInputElement | undefined;

  onMount(() => {
    let awaitingGo = false;
    let goTimeout: number | undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        app.openCommandPalette();
        return;
      }

      if (event.key === "Escape") {
        if (app.isCommandPaletteOpen()) {
          app.closeCommandPalette();
          return;
        }

        if (app.isSettingsOpen()) {
          app.closeSettings();
          return;
        }

        if (app.selectedTaskId()) {
          app.closeTask();
        }

        return;
      }

      if (app.isCommandPaletteOpen() || app.isSettingsOpen()) {
        return;
      }

      if (awaitingGo) {
        awaitingGo = false;
        window.clearTimeout(goTimeout);

        if (key === "i") {
          event.preventDefault();
          app.setActiveView({ type: "inbox" });
          return;
        }

        if (key === "t") {
          event.preventDefault();
          app.setActiveView({ type: "today" });
          return;
        }

        if (key === "u") {
          event.preventDefault();
          app.setActiveView({ type: "upcoming" });
          return;
        }
      }

      const activeTaskId = app.focusedTaskId() ?? app.selectedTaskId();
      const isEditable = isEditableTarget(event.target);

      if (!isEditable && key === "g") {
        awaitingGo = true;
        goTimeout = window.setTimeout(() => {
          awaitingGo = false;
        }, 750);
        return;
      }

      if (isEditable) {
        return;
      }

      if (key === "n") {
        event.preventDefault();
        quickAddInput?.focus();
        return;
      }

      if (activeTaskId && key === " ") {
        event.preventDefault();
        void app.completeTask(activeTaskId);
        return;
      }

      if (activeTaskId && key === "s") {
        event.preventDefault();
        void app.toggleTaskStar(activeTaskId);
        return;
      }

      if (activeTaskId && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        const task = app.tasks().find((item) => item.id === activeTaskId);
        if (task && window.confirm(`Delete “${task.title}”?`)) {
          void app.deleteTask(activeTaskId);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => {
      window.clearTimeout(goTimeout);
      window.removeEventListener("keydown", onKeyDown);
    });
  });

  return (
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,#0b1020_0%,#090d18_100%)] text-zinc-100">
      <div class="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Sidebar />

        <main class="relative min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Show when={app.errorMessage()}>
              {(message) => (
                <div class="flex items-center justify-between gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  <span>{message()}</span>
                  <button type="button" onClick={() => app.clearError()}>
                    <CloseIcon class="size-4" />
                  </button>
                </div>
              )}
            </Show>

            <header class="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  App-first work planner
                </p>
                <h2 class="mt-2 text-3xl font-semibold text-white">
                  {getViewTitle(app.activeView(), app.projects())}
                </h2>
                <p class="mt-2 text-sm text-zinc-400">
                  {activeCount()} open {activeCount() === 1 ? "task" : "tasks"}
                </p>
              </div>

              <Show when={app.activeView().type === "project" && app.activeProject()}>
                {(projectAccessor) => (
                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      class="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                      onClick={() => void app.completeProject(projectAccessor().id)}
                    >
                      Complete project
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete project “${projectAccessor().title}”? Tasks will move to Inbox.`
                          )
                        ) {
                          void app.deleteProject(projectAccessor().id);
                        }
                      }}
                    >
                      <TrashIcon class="size-4" />
                      <span>Delete project</span>
                    </button>
                  </div>
                )}
              </Show>
            </header>

            <QuickAdd inputRef={(element) => (quickAddInput = element)} />

            <Show
              when={app.isHydrated()}
              fallback={
                <div class="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-zinc-400">
                  Loading your local task database…
                </div>
              }
            >
              <section class="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur-xl sm:p-5">
                <Show
                  when={activeCount() > 0}
                  fallback={
                    <div class="flex min-h-[16rem] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-zinc-400">
                      {getEmptyStateMessage(app.activeView())}
                    </div>
                  }
                >
                  <Switch>
                    <Match when={app.activeView().type === "today"}>
                      <div class="space-y-6">
                        <Show when={app.todaySections().overdue.length > 0}>
                          <SortableTaskList
                            sectionTitle="Overdue"
                            tasks={app.todaySections().overdue}
                            onReorder={app.reorderTasks}
                          />
                        </Show>
                        <Show when={app.todaySections().today.length > 0}>
                          <SortableTaskList
                            sectionTitle="Today"
                            mutedTitle={app.todaySections().overdue.length === 0}
                            tasks={app.todaySections().today}
                            onReorder={app.reorderTasks}
                          />
                        </Show>
                      </div>
                    </Match>

                    <Match when={app.activeView().type === "upcoming"}>
                      <div class="space-y-6">
                        <For each={app.upcomingGroups()}>
                          {(group) => (
                            <SortableTaskList
                              sectionTitle={group.label}
                              tasks={group.tasks}
                              onReorder={app.reorderTasks}
                            />
                          )}
                        </For>
                      </div>
                    </Match>

                    <Match when={app.activeView().type === "project"}>
                      <SortableTaskList tasks={activeTasks()} onReorder={app.reorderTasks} />
                    </Match>

                    <Match when={true}>
                      <SortableTaskList tasks={activeTasks()} onReorder={app.reorderTasks} />
                    </Match>
                  </Switch>
                </Show>
              </section>
            </Show>
          </div>
        </main>
      </div>

      <DetailPanel />
      <SettingsModal />
      <CommandPalette />
    </div>
  );
}

export default App;

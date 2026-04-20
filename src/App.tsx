import { createMemo, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";

import { CommandPalette } from "./components/CommandPalette";
import { ConfirmModal } from "./components/ConfirmModal";
import { DetailPanel } from "./components/DetailPanel";
import { QuickAdd } from "./components/QuickAdd";
import { SettingsModal } from "./components/SettingsModal";
import { Sidebar } from "./components/Sidebar";
import { SortableTaskList } from "./components/SortableTaskList";
import { CloseIcon, TrashIcon } from "./components/icons";
import { getEmptyStateMessage, getProjectTasks, getViewTitle } from "./lib/view-model";
import { useAppStore } from "./state/app-store";

const isEditableTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
};

function App() {
  const app = useAppStore();

  const activeTasks = createMemo(() => {
    const view = app.activeView();
    if (view.type === "project") return getProjectTasks(app.openTasks(), view.projectId);
    if (view.type === "today")
      return [...app.todaySections().overdue, ...app.todaySections().today];
    if (view.type === "upcoming") return app.upcomingGroups().flatMap((g) => g.tasks);
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
        if (app.confirmState()) {
          app.dismissConfirm();
          return;
        }
        if (app.isCommandPaletteOpen()) {
          app.closeCommandPalette();
          return;
        }
        if (app.isSettingsOpen()) {
          app.closeSettings();
          return;
        }
        if (app.selectedTaskId()) app.closeTask();
        return;
      }

      if (app.confirmState() || app.isCommandPaletteOpen() || app.isSettingsOpen()) return;

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

      if (isEditable) return;

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
        const task = app.tasks().find((t) => t.id === activeTaskId);
        if (task) {
          app.showConfirm({
            title: "Delete task",
            message: `"${task.title}" will be permanently deleted.`,
            confirmLabel: "Delete",
            onConfirm: () => void app.deleteTask(activeTaskId),
          });
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
    <div
      class="min-h-screen"
      style={{ "background-color": "var(--color-bg-base)", color: "var(--color-text-primary)" }}
    >
      <div class="grid min-h-screen lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Sidebar />

        <main class="relative min-w-0 flex flex-col">
          {/* ── error banner ── */}
          <Show when={app.errorMessage()}>
            {(message) => (
              <div
                class="mx-6 mt-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
                style={{
                  "border-color": "var(--color-urgency-red)",
                  "background-color": "var(--color-urgency-red-bg)",
                  color: "var(--color-urgency-red)",
                }}
              >
                <span>{message()}</span>
                <button
                  type="button"
                  class="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                  onClick={() => app.clearError()}
                >
                  <CloseIcon class="size-4" />
                </button>
              </div>
            )}
          </Show>

          <div class="flex-1 px-6 py-6 lg:px-10">
            <div class="mx-auto flex w-full max-w-2xl flex-col gap-5">
              {/* ── view header ── */}
              <header class="flex items-start justify-between gap-4">
                {/* Left: completion checkbox (project only) + title + count */}
                <div class="flex min-w-0 items-start gap-3">
                  <Show when={app.activeView().type === "project" && app.activeProject()}>
                    {(projectAccessor) => (
                      <input
                        type="checkbox"
                        class="task-checkbox mt-[5px] shrink-0"
                        checked={false}
                        onChange={() => void app.completeProject(projectAccessor().id)}
                        aria-label={`Complete project ${projectAccessor().title}`}
                        title="Complete project"
                      />
                    )}
                  </Show>
                  <div class="min-w-0">
                    <h2
                      class="text-2xl font-semibold leading-tight"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {getViewTitle(app.activeView(), app.projects())}
                    </h2>
                    <p class="mt-0.5 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                      {activeCount()} open {activeCount() === 1 ? "task" : "tasks"}
                    </p>
                  </div>
                </div>

                {/* Right: delete button (project only) */}
                <Show when={app.activeView().type === "project" && app.activeProject()}>
                  {(projectAccessor) => (
                    <div class="shrink-0 pt-1">
                      <button
                        type="button"
                        aria-label="Delete project"
                        title="Delete project"
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
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--color-text-tertiary)";
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        }}
                        onClick={() => {
                          app.showConfirm({
                            title: "Delete project",
                            message: `"${projectAccessor().title}" will be deleted. Its tasks will move to Inbox.`,
                            confirmLabel: "Delete",
                            onConfirm: () => void app.deleteProject(projectAccessor().id),
                          });
                        }}
                      >
                        <TrashIcon class="size-4" />
                      </button>
                    </div>
                  )}
                </Show>
              </header>

              {/* ── quick add ── */}
              <QuickAdd inputRef={(el) => (quickAddInput = el)} />

              {/* ── task list ── */}
              <Show
                when={app.isHydrated()}
                fallback={
                  <p class="py-8 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                    Loading your local task database…
                  </p>
                }
              >
                <Show
                  when={activeCount() > 0}
                  fallback={
                    <div
                      class="flex min-h-48 items-center justify-center py-12 text-center text-sm"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {getEmptyStateMessage(app.activeView())}
                    </div>
                  }
                >
                  <Switch>
                    <Match when={app.activeView().type === "today"}>
                      <div class="space-y-8">
                        <Show when={app.todaySections().overdue.length > 0}>
                          <SortableTaskList
                            sectionTitle="Overdue"
                            sectionUrgency="overdue"
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
                      <div class="space-y-8">
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
              </Show>
            </div>
          </div>
        </main>
      </div>

      <DetailPanel />
      <SettingsModal />
      <CommandPalette />
      <ConfirmModal />
    </div>
  );
}

export default App;

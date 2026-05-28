import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";

import { getProjectTasks } from "@/lib/view-model";
import { useAppStore } from "@/state/app-store";

import { AppErrorBanner } from "../components/app-shell/AppErrorBanner";
import { AppFrame } from "../components/app-shell/AppFrame";
import { AppTaskContent } from "../components/app-shell/AppTaskContent";
import { AppViewHeader } from "../components/app-shell/AppViewHeader";
import { QuickAdd } from "../components/tasks/QuickAdd";
import { Sidebar } from "../components/navigation/Sidebar";
import { CommandPalette } from "../components/overlays/CommandPalette";
import { ConfirmModal } from "../components/overlays/ConfirmModal";
import { DetailPanel } from "../components/overlays/DetailPanel";
import { SettingsModal } from "../components/overlays/SettingsModal";

const isEditableTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
};

export default function TodoApp() {
  const app = useAppStore();

  const activeTasks = createMemo(() => {
    const view = app.activeView();
    if (view.type === "project") return getProjectTasks(app.openTasks(), view.projectId);
    if (view.type === "today")
      return [...app.todaySections().overdue, ...app.todaySections().today];
    if (view.type === "upcoming") return app.upcomingGroups().flatMap((group) => group.tasks);
    return app.inboxTasks();
  });
  const activeCount = createMemo(() => activeTasks().length);

  const [showCompleted, setShowCompleted] = createSignal(false);
  createEffect(() => {
    void app.activeView();
    setShowCompleted(false);
  });

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
        const task = app.tasks().find((item) => item.id === activeTaskId);
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
    <AppFrame>
      <div class="grid min-h-screen lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Sidebar />

        <main class="relative flex min-w-0 flex-col">
          <AppErrorBanner />

          <div class="flex-1 px-6 py-6 lg:px-10">
            <div class="mx-auto flex w-full max-w-2xl flex-col gap-5">
              <AppViewHeader activeCount={activeCount()} />
              <QuickAdd inputRef={(element) => (quickAddInput = element)} />
              <AppTaskContent
                activeCount={activeCount()}
                activeTasks={activeTasks()}
                showCompleted={showCompleted()}
                onToggleCompleted={() => setShowCompleted((value) => !value)}
              />
            </div>
          </div>
        </main>
      </div>

      <Show when={app.selectedTaskId()}>
        <div class="detail-backdrop" onClick={() => app.closeTask()} aria-hidden="true" />
      </Show>

      <DetailPanel />
      <SettingsModal />
      <CommandPalette />
      <ConfirmModal />
    </AppFrame>
  );
}

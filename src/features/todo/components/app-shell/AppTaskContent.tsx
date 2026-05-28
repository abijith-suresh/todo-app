import { For, Match, Show, Switch } from "solid-js";

import { getEmptyStateMessage } from "@/lib/view-model";
import { useAppStore } from "@/state/app-store";
import type { Task } from "@/types";

import { CompletedTasksSection } from "../completed/CompletedTasksSection";
import { SortableTaskList } from "../tasks/SortableTaskList";

interface AppTaskContentProps {
  activeCount: number;
  activeTasks: Task[];
  showCompleted: boolean;
  onToggleCompleted: () => void;
}

export const AppTaskContent = (props: AppTaskContentProps) => {
  const app = useAppStore();

  return (
    <Show
      when={app.isHydrated()}
      fallback={
        <p class="py-8 text-sm text-[var(--color-text-tertiary)]">
          Loading your local task database...
        </p>
      }
    >
      <Show when={props.activeCount > 0}>
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

          <Match when={true}>
            <SortableTaskList tasks={props.activeTasks} onReorder={app.reorderTasks} />
          </Match>
        </Switch>
      </Show>

      <Show when={props.activeCount === 0}>
        <div class="empty-state-message flex min-h-48 items-center justify-center py-12 text-center text-sm text-[var(--color-text-tertiary)]">
          {getEmptyStateMessage(app.activeView())}
        </div>
      </Show>

      <Show when={app.activeView().type === "project" && app.completedViewTasks().length > 0}>
        <CompletedTasksSection
          tasks={app.completedViewTasks()}
          show={props.showCompleted}
          onToggle={props.onToggleCompleted}
          onReopen={(taskId) => void app.reopenTask(taskId)}
        />
      </Show>
    </Show>
  );
};

import { Show } from "solid-js";

import { useAppStore } from "@/state/app-store";

import { DoneTodaySection } from "../completed/DoneTodaySection";
import { TaskList } from "../tasks/TaskList";

export const AppTaskContent = () => {
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
      <Show
        when={app.activeTasks().length > 0}
        fallback={
          <div class="flex min-h-48 items-center justify-center py-12 text-center text-sm text-[var(--color-text-tertiary)]">
            <p>Nothing here yet. Type above to add a task.</p>
          </div>
        }
      >
        <TaskList tasks={app.activeTasks()} />
      </Show>

      <Show when={app.doneTodayTasks().length > 0}>
        <DoneTodaySection tasks={app.doneTodayTasks()} onReopen={(id) => void app.reopenTask(id)} />
      </Show>
    </Show>
  );
};

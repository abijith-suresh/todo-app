import { Show } from "solid-js";

import { useAppStore } from "@/state/app-store";

import { DoneTodaySection } from "./DoneTodaySection";
import { TaskList } from "./TaskList";

export const AppTaskContent = () => {
  const app = useAppStore();

  return (
    <Show
      when={app.isHydrated()}
      fallback={
        <p class="py-8 text-base italic text-ink-tertiary">Loading your local task database...</p>
      }
    >
      <TaskList tasks={app.activeTasks()} />

      <Show when={app.doneTodayTasks().length > 0}>
        <DoneTodaySection tasks={app.doneTodayTasks()} onReopen={(id) => void app.reopenTask(id)} />
      </Show>
    </Show>
  );
};

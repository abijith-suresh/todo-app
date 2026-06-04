import { type Component, For, Show } from "solid-js";

import type { Task } from "@/types";

import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks: Task[];
}

export const TaskList: Component<TaskListProps> = (props) => (
  <div>
    <Show
      when={props.tasks.length > 0}
      fallback={
        <div class="flex min-h-48 flex-col items-center justify-center py-12 text-center">
          <p
            class="text-lg font-light italic leading-relaxed"
            style={{
              color: "var(--color-text-tertiary)",
              "font-family": '"Source Serif 4", Georgia, serif',
              "max-width": "20rem",
            }}
          >
            What needs your attention today?
          </p>
        </div>
      }
    >
      <For each={props.tasks}>{(task) => <TaskRow task={task} />}</For>
    </Show>
  </div>
);

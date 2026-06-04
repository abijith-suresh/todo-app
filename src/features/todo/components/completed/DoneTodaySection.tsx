import { type Component, For } from "solid-js";

import { TrashIcon } from "@/components/icons/TrashIcon";

import { useExitAnimation } from "@/lib/use-exit-animation";
import { useAppStore } from "@/state/app-store";
import type { Task } from "@/types";

interface DoneTodaySectionProps {
  tasks: Task[];
  onReopen: (taskId: string) => void;
}

interface DoneTodayRowProps {
  task: Task;
  onReopen: (taskId: string) => void;
}

const DoneTodayRow: Component<DoneTodayRowProps> = (props) => {
  const app = useAppStore();
  const { exitType, isExiting, startExit } = useExitAnimation();

  const handleReopen = (): void => {
    startExit(
      "reopen",
      () => {
        props.onReopen(props.task.id);
      },
      900
    );
  };

  const handleDelete = (event: MouseEvent): void => {
    event.stopPropagation();
    startExit(
      "delete",
      () => {
        void app.deleteTask(props.task.id);
      },
      300
    );
  };

  return (
    <div
      class="task-wrapper"
      classList={{
        "task-reopening": exitType() === "reopen",
        "task-deleting": exitType() === "delete",
      }}
    >
      <div class="task-inner">
        <div
          class="group flex items-center gap-3 py-3"
          classList={{ "task-enter": !exitType() }}
          style={{ "border-bottom": "1px solid var(--color-border-subtle)" }}
        >
          <button
            type="button"
            aria-label={`Reopen ${props.task.title}`}
            class="task-checkbox-done shrink-0"
            onClick={handleReopen}
            disabled={isExiting()}
          />
          <span
            class="task-text min-w-0 flex-1 truncate text-base line-through"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {props.task.title}
          </span>
          <button
            type="button"
            aria-label={`Delete ${props.task.title}`}
            class="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: "var(--color-text-tertiary)" }}
            onClick={handleDelete}
            disabled={isExiting()}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DoneTodaySection: Component<DoneTodaySectionProps> = (props) => (
  <div class="mt-16 sm:mt-20">
    <div
      class="mx-auto mb-8 w-24"
      style={{ "border-top": "1px solid var(--color-border-default)" }}
    />
    <p
      class="mb-6 text-xs italic tracking-wide"
      style={{
        color: "var(--color-text-tertiary)",
        "font-family": '"Source Serif 4", Georgia, serif',
      }}
    >
      Done today
    </p>
    <div>
      <For each={props.tasks}>
        {(task) => <DoneTodayRow task={task} onReopen={props.onReopen} />}
      </For>
    </div>
  </div>
);

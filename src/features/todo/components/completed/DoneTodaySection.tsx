import { type Component, createSignal, For, onCleanup } from "solid-js";

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
  const [exitType, setExitType] = createSignal<null | "reopen" | "delete">(null);

  let exitTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleReopen = (): void => {
    setExitType("reopen");
    exitTimeout = setTimeout(() => {
      exitTimeout = null;
      props.onReopen(props.task.id);
    }, 900);
  };

  const handleDelete = (event: MouseEvent): void => {
    event.stopPropagation();
    setExitType("delete");
    exitTimeout = setTimeout(() => {
      exitTimeout = null;
      void app.deleteTask(props.task.id);
    }, 300);
  };

  onCleanup(() => {
    if (exitTimeout) clearTimeout(exitTimeout);
  });

  const isExiting = () => exitType() !== null;

  return (
    <div
      class="group flex items-center gap-3 py-3"
      classList={{
        "task-reopening": exitType() === "reopen",
        "task-deleting": exitType() === "delete",
        "task-enter": !exitType(),
      }}
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-3.5"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
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

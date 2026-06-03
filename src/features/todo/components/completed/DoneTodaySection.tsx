import { type Component, createSignal, For, onCleanup } from "solid-js";

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
  const [isExiting, setIsExiting] = createSignal(false);

  let exitTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleReopen = (): void => {
    setIsExiting(true);
    exitTimeout = setTimeout(() => {
      exitTimeout = null;
      props.onReopen(props.task.id);
    }, 200);
  };

  onCleanup(() => {
    if (exitTimeout) clearTimeout(exitTimeout);
  });

  return (
    <div
      class="group flex items-center gap-3 py-3"
      classList={{
        "task-exit-reopen": isExiting(),
        "task-enter": !isExiting(),
      }}
      style={{ "border-bottom": "1px solid var(--color-border-subtle)" }}
    >
      <span
        class="shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: "16px",
          height: "16px",
          "background-color": "var(--color-accent)",
        }}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span
        class="min-w-0 flex-1 truncate text-base line-through"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {props.task.title}
      </span>
      <button
        type="button"
        aria-label={`Reopen ${props.task.title}`}
        class="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: "var(--color-text-tertiary)" }}
        onClick={handleReopen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-3"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
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

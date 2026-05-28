import { type Component, createSignal, For } from "solid-js";

import { formatDateLabel } from "@/lib/date";
import type { Task } from "@/types";

import { ChevronDownIcon, Undo2Icon } from "../icons";

interface CompletedTasksSectionProps {
  tasks: Task[];
  show: boolean;
  onToggle: () => void;
  onReopen: (taskId: string) => void;
}

export const CompletedTasksSection: Component<CompletedTasksSectionProps> = (props) => {
  // Track which row is animating out before reopen
  const [exitingId, setExitingId] = createSignal<string | null>(null);

  const handleReopen = (taskId: string): void => {
    setExitingId(taskId);
    setTimeout(() => {
      setExitingId(null);
      props.onReopen(taskId);
    }, 200);
  };

  return (
    <div class="completed-section mt-6">
      {/* ── Inline divider header: "Completed ────── 3 ▾" ── */}
      <button
        type="button"
        class="completed-section-header"
        onClick={() => props.onToggle()}
        aria-expanded={props.show}
      >
        <span class="shrink-0 text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>
          Completed
        </span>

        {/* Flex-grow ruler line */}
        <span class="completed-divider-line" aria-hidden="true" />

        {/* Count badge */}
        <span
          class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
          style={{
            color: "var(--color-text-tertiary)",
            "background-color": "var(--color-bg-elevated)",
          }}
        >
          {props.tasks.length}
        </span>

        {/* Chevron */}
        <ChevronDownIcon
          class="size-3.5 shrink-0 transition-transform duration-200"
          style={{
            color: "var(--color-text-tertiary)",
            transform: props.show ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* ── Expandable body ── */}
      <div class={`completed-section-body${props.show ? " is-open" : ""}`}>
        <div class="completed-section-inner pt-1">
          <For each={props.tasks}>
            {(task) => (
              <button
                type="button"
                class="completed-task-row group"
                classList={{ "is-exiting": exitingId() === task.id }}
                onClick={() => handleReopen(task.id)}
                aria-label={`Reopen: ${task.title}`}
                title="Click to reopen"
              >
                {/* Ghost title */}
                <span
                  class="min-w-0 flex-1 truncate text-left text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {task.title}
                </span>

                {/* Completed-at date */}
                {task.completedAt ? (
                  <span
                    class="shrink-0 text-xs"
                    style={{ color: "var(--color-text-tertiary)", opacity: "0.45" }}
                  >
                    {formatDateLabel(task.completedAt.slice(0, 10))}
                  </span>
                ) : null}

                {/* Undo icon — visible on hover */}
                <span class="completed-row-undo" aria-hidden="true">
                  <Undo2Icon class="size-3" />
                </span>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

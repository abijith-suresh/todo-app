import { type Component, For } from "solid-js";

import { formatDateLabel } from "../lib/date";
import type { Task } from "../types";
import { CheckIcon, ChevronDownIcon } from "./icons";

interface CompletedTasksSectionProps {
  tasks: Task[];
  show: boolean;
  onToggle: () => void;
  onReopen: (taskId: string) => void;
}

export const CompletedTasksSection: Component<CompletedTasksSectionProps> = (props) => {
  return (
    <div class="completed-section mt-6">
      {/* Section header toggle */}
      <button
        type="button"
        class="completed-section-header"
        onClick={() => props.onToggle()}
        aria-expanded={props.show}
      >
        <span class="completed-section-check" aria-hidden="true">
          <CheckIcon class="size-3" />
        </span>
        <span
          class="flex-1 text-left text-xs font-medium"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Completed
        </span>
        <span
          class="text-xs font-medium mr-2"
          style={{ color: "var(--color-text-tertiary)", opacity: "0.6" }}
        >
          {props.tasks.length}
        </span>
        <ChevronDownIcon
          class="size-3.5 transition-transform duration-200"
          style={{
            color: "var(--color-text-tertiary)",
            transform: props.show ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Expandable body */}
      <div class={`completed-section-body${props.show ? " is-open" : ""}`}>
        <div class="completed-section-inner">
          <For each={props.tasks}>
            {(task) => (
              <div class="completed-task-row group">
                {/* Re-open checkbox */}
                <button
                  type="button"
                  class="completed-task-checkbox"
                  onClick={() => props.onReopen(task.id)}
                  aria-label={`Reopen: ${task.title}`}
                  title="Mark as open"
                >
                  <CheckIcon class="size-2.5" />
                </button>

                <div class="min-w-0 flex-1">
                  <span
                    class="block truncate text-sm"
                    style={{
                      color: "var(--color-text-tertiary)",
                      "text-decoration": "line-through",
                      "text-decoration-color": "var(--color-border-default)",
                    }}
                  >
                    {task.title}
                  </span>
                </div>

                {task.completedAt ? (
                  <span
                    class="shrink-0 text-xs ml-2"
                    style={{ color: "var(--color-text-tertiary)", opacity: "0.5" }}
                  >
                    {formatDateLabel(task.completedAt.slice(0, 10))}
                  </span>
                ) : null}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

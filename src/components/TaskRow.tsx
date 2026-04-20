import { createSortable, transformStyle } from "@thisbeyond/solid-dnd";
import { type Component, createMemo } from "solid-js";

import { getTaskUrgency } from "../lib/view-model";
import { useAppStore } from "../state/app-store";
import type { Task } from "../types";
import { FlagIcon, StarFilledIcon, StarIcon } from "./icons";

interface TaskRowProps {
  task: Task;
}

export const TaskRow: Component<TaskRowProps> = (props) => {
  const app = useAppStore();
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.task.id);
  const isSelected = createMemo(() => app.selectedTaskId() === props.task.id);
  const isCompleting = createMemo(() => app.completingTaskIds().includes(props.task.id));
  const urgency = createMemo(() => getTaskUrgency(props.task));
  const isDragging = () => sortable.isActiveDraggable;

  const rowBg = createMemo(() => {
    if (isSelected()) return "var(--color-accent-subtle)";
    return "transparent";
  });

  const style = createMemo(() => ({
    ...transformStyle(sortable.transform),
    transition:
      "transform 250ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease, background-color 150ms ease",
    "background-color": rowBg(),
    opacity: isDragging() ? 0.25 : 1,
    "border-left": isSelected() ? "3px solid var(--color-accent)" : "3px solid transparent",
    "padding-left": isSelected() ? "calc(0.75rem - 3px)" : "0.75rem",
  }));

  return (
    <div
      use:sortable
      ref={sortable.ref}
      style={style()}
      role="button"
      tabindex="0"
      aria-label={props.task.title}
      classList={{
        "task-row-completing": isCompleting(),
      }}
      class="task-row group flex items-center gap-2.5 py-2.5 pr-2 text-left outline-none transition-colors"
      onClick={() => app.openTask(props.task.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          app.openTask(props.task.id);
        }
      }}
      onFocus={() => app.setFocusedTaskId(props.task.id)}
      onMouseEnter={(e) => {
        if (!isSelected()) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-input)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = rowBg();
      }}
    >
      {/* custom checkbox */}
      <input
        type="checkbox"
        aria-label={`Complete ${props.task.title}`}
        class="task-checkbox shrink-0"
        checked={false}
        onClick={(event) => event.stopPropagation()}
        onChange={() => void app.completeTask(props.task.id)}
      />

      {/* title + notes */}
      <div class="min-w-0 flex-1">
        <span
          class="task-title-text block truncate text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {props.task.title}
        </span>
        {props.task.notes ? (
          <p class="mt-0.5 line-clamp-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {props.task.notes}
          </p>
        ) : null}
      </div>

      {/* due-date urgency indicator — compact flag icon, only when urgent */}
      {urgency() === "due-today" || urgency() === "overdue" ? (
        <span
          class="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: "20px",
            height: "20px",
            "background-color": "var(--color-urgency-red-bg)",
            color: "var(--color-urgency-red)",
          }}
          title={urgency() === "overdue" ? "Overdue" : "Due today"}
          aria-label={urgency() === "overdue" ? "Overdue" : "Due today"}
        >
          <FlagIcon class="size-3" />
        </span>
      ) : null}

      {/* star */}
      <button
        type="button"
        aria-label={props.task.starred ? "Unstar task" : "Star task"}
        class="shrink-0 rounded p-1 opacity-0 transition-[color,opacity] group-hover:opacity-100"
        style={{
          color: props.task.starred ? "var(--color-star)" : "var(--color-text-tertiary)",
          opacity: props.task.starred ? "1" : undefined,
        }}
        onMouseEnter={(e) => {
          if (!props.task.starred) {
            (e.currentTarget as HTMLElement).style.color = "var(--color-star)";
          }
        }}
        onMouseLeave={(e) => {
          if (!props.task.starred) {
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-tertiary)";
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          void app.toggleTaskStar(props.task.id);
        }}
      >
        {props.task.starred ? <StarFilledIcon class="size-3.5" /> : <StarIcon class="size-3.5" />}
      </button>
    </div>
  );
};

import { type Component } from "solid-js";

interface TaskTitleProps {
  title: string;
  strikethrough?: boolean;
  muted?: boolean;
}

export const TaskTitle: Component<TaskTitleProps> = (props) => (
  <span
    class="task-text min-w-0 flex-1 truncate text-base"
    classList={{ "line-through": props.strikethrough }}
    style={{
      color: props.muted ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
    }}
  >
    {props.title}
  </span>
);

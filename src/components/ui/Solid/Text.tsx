import { type Component } from "solid-js";

interface TextProps {
  title: string;
  strikethrough?: boolean;
  muted?: boolean;
}

export const Text: Component<TextProps> = (props) => (
  <span
    class="task-text min-w-0 flex-1 truncate text-base"
    classList={{ "line-through": props.strikethrough }}
    style={{
      color: props.muted ? "var(--color-ink-tertiary)" : "var(--color-ink)",
    }}
  >
    {props.title}
  </span>
);
